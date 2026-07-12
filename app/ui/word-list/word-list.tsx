'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Form from 'next/form';
import clsx from 'clsx';
import { createInvoice, deleteUserWord } from '@/app/lib/actions';
import { Card, type WordSources } from '@/app/ui/card/card';
import {
  getOfflineWords,
  deleteOfflineWord,
} from '@/app/lib/offline-db';
import { DbStatusBanner } from '@/app/ui/db-status/db-status-banner';
import { DeleteWordModal } from '@/app/ui/word-list/delete-word-modal';
import { DefaultFiltersModal } from '@/app/ui/word-list/default-filters-modal';
import { SlidersIcon } from '@/app/ui/icons/sliders';
import {
  SOURCE_FILTERS,
  type SourceKey,
  loadDefaultFilters,
  saveDefaultFilters,
} from '@/app/ui/word-list/source-filters';
import type { GeneralWord } from '@prisma/client';

type MergedWord = GeneralWord & { sources: WordSources };

const readOfflineContents = () =>
  getOfflineWords().then((rows) => rows.map((r) => r.content));

export function WordList({
  words,
  userWordContents,
  dbOk,
}: {
  words: GeneralWord[];
  userWordContents: string[];
  dbOk: boolean;
}) {
  const [query, setQuery] = useState('');
  // Selected source filters; empty = "all" (no filtering)
  const [sourceFilters, setSourceFilters] = useState<SourceKey[]>([]);

  const toggleSourceFilter = useCallback((key: SourceKey | 'all') => {
    setSourceFilters((prev) =>
      key === 'all'
        ? []
        : prev.includes(key)
          ? prev.filter((k) => k !== key)
          : [...prev, key]
    );
  }, []);
  
  const [offlineContents, setOfflineContents] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<MergedWord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [defaultFilters, setDefaultFilters] = useState<SourceKey[]>([]);
  const [defaultsOpen, setDefaultsOpen] = useState(false);
  const router = useRouter();

  // General words are owner-curated and shared — only user/offline copies are deletable
  const performDelete = useCallback(
    async (word: MergedWord, keys: SourceKey[]) => {
      setDeleting(true);
      try {
        await Promise.all(
          keys
            .filter((k) => k !== 'general')
            .map((k) =>
              k === 'user'
                ? deleteUserWord(word.content)
                : deleteOfflineWord(word.content).catch(() => {})
            )
        );
        if (keys.includes('offline')) {
          readOfflineContents()
            .then(setOfflineContents)
            .catch(() => {});
        }
        router.refresh();
      } finally {
        setDeleting(false);
        setDeleteTarget(null);
      }
    },
    [router]
  );

  // Single deletable source deletes directly; multiple open the modal
  const handleDeleteRequest = useCallback(
    (word: MergedWord) => {
      const deletable = (['user', 'offline'] as SourceKey[]).filter(
        (k) => word.sources[k]
      );
      if (deletable.length === 0) return;
      if (deletable.length === 1) performDelete(word, deletable);
      else setDeleteTarget(word);
    },
    [performDelete]
  );

  // Load persisted offline words + saved default filters once on mount
  useEffect(() => {
    readOfflineContents()
      .then(setOfflineContents)
      .catch(() => {});
    loadDefaultFilters()
      .then((keys) => {
        setDefaultFilters(keys);
        if (keys.length > 0) setSourceFilters(keys);
      })
      .catch(() => {});
  }, []);

  const handleSaveDefaults = useCallback((keys: SourceKey[]) => {
    try {
      saveDefaultFilters(keys);
    } catch {
      // localStorage unavailable — apply for this session only
    }
    setDefaultFilters(keys);
    setSourceFilters(keys);
    setDefaultsOpen(false);
  }, []);

  const merged: MergedWord[] = useMemo(() => {
    const userSet = new Set(userWordContents);
    const offlineSet = new Set(offlineContents);
    const byContent = new Map<string, MergedWord>();

    for (const w of words ?? []) {
      byContent.set(w.content, {
        ...w,
        sources: {
          general: true,
          user: userSet.has(w.content),
          offline: offlineSet.has(w.content),
        },
      });
    }

    const now = new Date();
    let syntheticId = -1;
    for (const content of userWordContents) {
      if (byContent.has(content)) continue;
      byContent.set(content, {
        id: syntheticId--,
        content,
        created_at: now,
        updated_at: now,
        sources: {
          general: false,
          user: true,
          offline: offlineSet.has(content),
        },
      });
    }
    for (const content of offlineContents) {
      if (byContent.has(content)) continue;
      byContent.set(content, {
        id: syntheticId--,
        content,
        created_at: now,
        updated_at: now,
        sources: { general: false, user: false, offline: true },
      });
    }

    return Array.from(byContent.values());
  }, [words, userWordContents, offlineContents]);

  const counts = useMemo(
    () => ({
      all: merged.length,
      general: merged.filter((w) => w.sources.general).length,
      user: merged.filter((w) => w.sources.user).length,
      offline: merged.filter((w) => w.sources.offline).length,
    }),
    [merged]
  );

  const filtered = useMemo(() => {
    let list =
      sourceFilters.length === 0
        ? merged
        : merged.filter((w) => sourceFilters.some((k) => w.sources[k]));
    if (query) {
      list = list.filter((filterWord) => filterWord.content?.includes(query));
    }
    return list;
  }, [merged, query, sourceFilters]);

  const setQueryQueried = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value.trim().toLowerCase());
    },
    []
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const match = merged.find((w) => w.content?.toLowerCase() === query);
      router.push(`/word?practice=${match?.content ?? query}`);
    },
    [merged, query, router]
  );

  return (
    <>
      <DbStatusBanner dbOk={dbOk} />
      <Form
        action={createInvoice}
        className="relative mt-8 flex gap-4"
        onSubmit={handleSubmit}
      >
        <input
          className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 text-neutral-500"
          placeholder="type a word or topic (e.g., 'science')..."
          type="text"
          name="word"
          value={query}
          onChange={setQueryQueried}
        />
        <div className="absolute top-1/2 right-4 -translate-y-1/2 rounded-lg border border-neutral-800 px-2 py-1 font-mono text-xs text-neutral-500">
          ENTER
        </div>
      </Form>
      <section className="mt-16 w-full border-b border-solid border-neutral-800 py-4 pb-4">
        <div className="flex w-full items-center justify-between">
          <h2 className="text-sm font-bold text-neutral-500 uppercase">
            Your Collection
          </h2>
          <p className="font-mono text-sm text-neutral-700 uppercase">
            {filtered?.length} WORDS
          </p>
        </div>
      </section>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {SOURCE_FILTERS.map(({ key, label, Icon, text }) => {
          const active =
            key === 'all'
              ? sourceFilters.length === 0
              : sourceFilters.includes(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggleSourceFilter(key)}
              className={clsx(
                'flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-sm transition-colors',
                text,
                active
                  ? 'border-neutral-500 bg-neutral-800'
                  : 'border-neutral-800 bg-neutral-900 hover:bg-neutral-800'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
              <span className="opacity-70">{counts[key]}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setDefaultsOpen(true)}
          title="Set default filters"
          className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 font-mono text-sm text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-200"
        >
          <SlidersIcon className="h-4 w-4" />
          default
        </button>
      </div>
      <ol className="mt-8 grid w-full grid-cols-1 gap-2 sm:grid-cols-2 md:gap-3 lg:grid-cols-3">
        {filtered?.map((word) => (
          <Card
            key={word.id}
            id={word.id}
            content={word.content}
            created_at={word.created_at}
            updated_at={word.updated_at}
            sources={word.sources}
            onDelete={
              word.sources.user || word.sources.offline
                ? () => handleDeleteRequest(word)
                : undefined
            }
          />
        ))}
        {filtered?.length === 0 && (query || sourceFilters.length > 0) && (
          <li className="col-span-full text-sm text-neutral-600">
            {query
              ? `no words match “${query}”`
              : `no ${sourceFilters
                  .map((k) => (k === 'user' ? 'registered' : k))
                  .join(' / ')} words yet`}
          </li>
        )}
      </ol>
      {defaultsOpen && (
        <DefaultFiltersModal
          initial={defaultFilters}
          onSave={handleSaveDefaults}
          onClose={() => setDefaultsOpen(false)}
        />
      )}
      {deleteTarget && (
        <DeleteWordModal
          content={deleteTarget.content}
          sources={deleteTarget.sources}
          deleting={deleting}
          onDelete={(keys) => performDelete(deleteTarget, keys)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
