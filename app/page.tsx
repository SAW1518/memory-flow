import Form from 'next/form';
import { createInvoice } from '@/app/lib/actions';
import { Card } from '@/app/ui/card/card';
import { getWords } from './lib/data';
import { GeneralWord } from './lib/types';

export default async function Home() {
  const words: GeneralWord[] = await getWords();
  return (
    <main className="flex w-full flex-col items-center justify-between sm:items-start">
      <section className="mt-16 flex w-full flex-col">
        <h1 className="text-4xl font-bold text-white">
          Register new vocabulary.
        </h1>
        <p className="mt-6 text-neutral-500">
          Register new vocabulary to improve your memory.
        </p>
        <Form action={createInvoice} className="relative mt-8 flex gap-4">
          <input
            className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 text-neutral-500"
            placeholder="Type a word or topic (e.g., 'Science')..."
            type="text"
            name="word"
          />
          <div className="absolute top-1/2 right-4 -translate-y-1/2 rounded-lg border border-neutral-800 px-2 py-1 font-mono text-xs text-neutral-500">
            ENTER
          </div>
        </Form>
      </section>
      <section className="mt-16 w-full border-b border-solid border-neutral-800 py-4 pb-4">
        <div className="flex w-full items-center justify-between">
          <h2 className="text-sm font-bold text-neutral-500 uppercase">
            Your Collection
          </h2>
          <p className="font-mono text-sm text-neutral-700 uppercase">
            0 WORDS
          </p>
        </div>
      </section>
      <ol className="mt-8 grid w-full grid-cols-3 gap-1">
        {words.map((word) => (
          <Card key={word.id} {...word} />
        ))}
      </ol>
    </main>
  );
}
