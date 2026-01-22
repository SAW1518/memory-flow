'use client';

import { useSearchParams } from 'next/navigation';

export default function WordPage() {
  const searchParams = useSearchParams();
  const practice = searchParams.get('practice');
  return (
    <>
      <p>{practice}</p>
    </>
  );
}
