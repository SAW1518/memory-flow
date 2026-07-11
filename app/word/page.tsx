import { getDbStatus } from '../lib/data';
import { Practice } from './practice';

export default async function WordPage({
  searchParams,
}: {
  searchParams: Promise<{ practice?: string }>;
}) {
  const { practice } = await searchParams;
  const word = practice ?? '';
  if (!word) return null;

  const dbOk = await getDbStatus();

  return <Practice word={word} dbOk={dbOk} />;
}
