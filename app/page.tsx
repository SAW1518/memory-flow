import Form from "next/form";
import { createInvoice } from "@/app/lib/actions";
import { Card } from "@/app/ui/card/card";
import { getWords } from "./lib/data";
import { GeneralWord } from "./lib/types";
import { WordPanel } from "@/app/ui/word-panel/word-panel";

export default async function Home() {
  const words: GeneralWord[] = await getWords();
  return (
    <main className="flex w-full flex-col items-center justify-between sm:items-start">
      <section className="flex w-full flex-col mt-16">
        <h1 className="text-4xl font-bold text-white">Register new vocabulary.</h1>
        <p className="mt-6 text-neutral-500">Register new vocabulary to improve your memory.</p>
        <Form action={createInvoice} className="flex gap-4 mt-8 relative">
          <input className="w-full bg-neutral-900 text-neutral-500 border border-neutral-800 px-4 py-2 rounded-lg" placeholder="Type a word or topic (e.g., 'Science')..." type="text" name="word" />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 border border-neutral-800 rounded-lg px-2 py-1 font-mono text-xs text-neutral-500">ENTER</div>
        </Form>
      </section>
      <section className="mt-16 w-full py-4 border-b border-solid border-neutral-800 pb-4">
        <div className="flex items-center justify-between w-full">
          <h2 className="text-sm font-bold uppercase text-neutral-500">Your Collection</h2>
          <p className="text-sm uppercase text-neutral-700 font-mono">0 WORDS</p>
        </div>
      </section>
      <ol className="mt-8 w-full grid grid-cols-3 gap-1">
        {words.map((word) => (
          <Card key={word.id} {...word} />
        ))}
      </ol>
    </main>
  );
}
