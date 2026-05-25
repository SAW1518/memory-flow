'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Form from 'next/form';
import { createInvoice } from '@/app/lib/actions';
import { Card, type WordSources } from '@/app/ui/card/card';
import { getOfflineWords } from '@/app/lib/offline-db';
import type { GeneralWord } from '@prisma/client';

type MergedWord = GeneralWord & { sources: WordSources };

export function WordList({
  words,
  userWordContents,
}: {
  words: GeneralWord[];
  userWordContents: string[];
}) {
  const [query, setQuery] = useState('');
  const [offlineContents, setOfflineContents] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    getOfflineWords()
      .then((rows) => setOfflineContents(rows.map((r) => r.content)))
      .catch(() => {});
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

  const filtered = useMemo(
    () =>
      query
        ? merged.filter((filterWord) => filterWord.content?.includes(query))
        : merged,
    [merged, query]
  );

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
        {filtered?.length === 0 && query && (
          <li className="col-span-full text-sm text-neutral-600">
            no words match &ldquo;{query}&rdquo;
          </li>
        )}
      </ol>
    </>
  );
}
