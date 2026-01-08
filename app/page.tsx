
import Form from 'next/form'
import { createInvoice } from '@/app/lib/actions'

export default function Home() {


  return (
    <main className="flex w-full flex-col items-center justify-between sm:items-start" >
      <section className="flex w-full flex-col mt-16">
        <h1 className="text-4xl font-bold text-white" >Register new vocabulary.</h1>
        <p className="mt-6 text-neutral-500">Register new vocabulary to improve your memory.</p>
        <Form action={createInvoice} className="flex gap-4 mt-8 relative" >
          <input
            className="w-full bg-neutral-900 text-neutral-500 border  px-4 py-2 rounded-lg"
            placeholder="Type a word or topic (e.g., 'Science')..." type="text" name="word"/>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 border border-neutral-800 rounded-lg px-2 py-1 font-mono text-xs text-neutral-500">ENTER</div>
        </Form>
      </section>
      <section className="mt-16 w-full" >
        <div className="flex items-center justify-between w-full " >
          <h2 className="text-sm font-bold uppercase text-neutral-500" >Your Collection</h2>
          <p className="text-sm uppercase text-neutral-700 font-mono text-xs">0 WORDS</p>
        </div>
      </section>
    </main>
  );
}

