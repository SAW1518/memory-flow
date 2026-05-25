import { getWords } from './lib/data';
import { WordList } from '@/app/ui/word-list/word-list';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const wordsResult = await getWords();
  return (
    <main className="flex w-full flex-col items-center justify-between sm:items-start">
      <section className="mt-16 flex w-full flex-col">
        <h1 className="text-4xl font-bold text-white">
          register new vocabulary.
        </h1>
        <p className="mt-6 text-neutral-500">
          register new vocabulary to improve your memory.
        </p>
        <WordList
          words={wordsResult.words}
          userWordContents={[]}
          dbOk={wordsResult.dbOk}
        />
      </section>
    </main>
  );
}
