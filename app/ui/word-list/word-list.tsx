'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Form from 'next/form';
import clsx from 'clsx';
import { createInvoice, syncOfflineWords } from '@/app/lib/actions';
import { Card, type WordSources } from '@/app/ui/card/card';
import {
  getOfflineWords,
  deleteOfflineWord,
} from '@/app/lib/offline-db';
import { DbStatusBanner } from '@/app/ui/db-status/db-status-banner';
import { ListIcon } from '@/app/ui/icons/list';
import { GlobeIcon } from '@/app/ui/icons/globe';
import { UserCheckIcon } from '@/app/ui/icons/user-check';
import { WifiOffIcon } from '@/app/ui/icons/wifi-off';
import type { GeneralWord } from '@prisma/client';

type MergedWord = GeneralWord & { sources: WordSources };

type SourceFilter = 'all' | 'general' | 'user' | 'offline';

const SOURCE_FILTERS = [
  { key: 'all', label: 'all', Icon: ListIcon, text: 'text-neutral-200' },
  { key: 'general', label: 'general', Icon: GlobeIcon, text: 'text-emerald-400' },
  { key: 'user', label: 'registered', Icon: UserCheckIcon, text: 'text-cyan-400' },
  { key: 'offline', label: 'offline', Icon: WifiOffIcon, text: 'text-amber-400' },
] as const;

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
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [offlineContents, setOfflineContents] = useState<string[]>([]);
  const [syncing, setSyncing] = useState(false);
  const syncAttemptedRef = useRef(false);
  const router = useRouter();

  const loadOffline = useCallback(() => {
    getOfflineWords()
      .then((rows) => setOfflineContents(rows.map((r) => r.content)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadOffline();
  }, [loadOffline]);

  // Sync runs once per page load (mount / full refresh), never retries.
  useEffect(() => {
    if (!dbOk) return;
    if (offlineContents.length === 0) return;
    if (syncAttemptedRef.current) return;

    syncAttemptedRef.current = true;
    let cancelled = false;

    (async () => {
      setSyncing(true);
      try {
        const result = await syncOfflineWords(offlineContents);
        if (cancelled) return;
        if (!result.dbOk) return;
        if (result.synced.length === 0) return;
        await Promise.all(
          result.synced.map((c) => deleteOfflineWord(c).catch(() => {}))
        );
        loadOffline();
        router.refresh();
      } catch {
        // swallow
      } finally {
        if (!cancelled) setSyncing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dbOk, offlineContents, loadOffline, router]);

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
      sourceFilter === 'all'
        ? merged
        : merged.filter((w) => w.sources[sourceFilter]);
    if (query) {
      list = list.filter((filterWord) => filterWord.content?.includes(query));
    }
    return list;
  }, [merged, query, sourceFilter]);

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
      <DbStatusBanner
        dbOk={dbOk}
        syncing={syncing}
        pendingCount={offlineContents.length}
      />
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
        {SOURCE_FILTERS.map(({ key, label, Icon, text }) => (
          <button
            key={key}
            type="button"
            onClick={() => setSourceFilter(key)}
            className={clsx(
              'flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-sm transition-colors',
              text,
              sourceFilter === key
                ? 'border-neutral-500 bg-neutral-800'
                : 'border-neutral-800 bg-neutral-900 hover:bg-neutral-800'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
            <span className="opacity-70">{counts[key]}</span>
          </button>
        ))}
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
          />
        ))}
        {filtered?.length === 0 && (query || sourceFilter !== 'all') && (
          <li className="col-span-full text-sm text-neutral-600">
            {query
              ? `no words match “${query}”`
              : `no ${sourceFilter === 'user' ? 'registered' : sourceFilter} words yet`}
          </li>
        )}
      </ol>
    </>
  );
}
