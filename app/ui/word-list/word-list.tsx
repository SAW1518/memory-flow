'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Form from 'next/form';
import { createInvoice } from '@/app/lib/actions';
import { Card } from '@/app/ui/card/card';
import type { GeneralWord } from '@prisma/client';

export function WordList({ words }: { words: GeneralWord[] }) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const filtered = useMemo(
    () =>
      query
        ? words?.filter((filterWord) => filterWord.content?.includes(query))
        : words,
    [words, query]
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
      const match = words?.find((w) => w.content?.toLowerCase() === query);
      router.push(`/word?practice=${match?.content ?? query}`);
    },
    [words, query, router]
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
          <Card key={word.id} {...word} />
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
