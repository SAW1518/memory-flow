import Link from 'next/link';
import { ArrowLeftIcon } from '../ui/icons/arrow-left';

export default function WordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="mx-24 mt-16 bg-neutral-900">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex cursor-pointer items-center font-mono text-sm font-normal text-neutral-500 font-stretch-condensed transition-colors hover:text-white"
        >
          <ArrowLeftIcon size={20} className="mr-2" />
          ESC to exit
        </Link>
        <p className="font-mono text-sm text-neutral-700 uppercase">
          126 WPM Accuracy: 100% dsdds
        </p>
      </div>
      {children}
    </main>
  );
}
