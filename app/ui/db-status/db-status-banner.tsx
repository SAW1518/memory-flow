'use client';

import { WifiOffIcon } from '@/app/ui/icons/wifi-off';

export function DbStatusBanner({
  dbOk,
  syncing,
  pendingCount,
}: {
  dbOk: boolean;
  syncing: boolean;
  pendingCount: number;
}) {
  if (dbOk && pendingCount === 0 && !syncing) return null;

  if (!dbOk) {
    return (
      <div className="mt-4 flex items-center gap-2 rounded-lg border border-amber-800 bg-amber-950/40 px-4 py-2 text-sm text-amber-300">
        <WifiOffIcon className="h-4 w-4 shrink-0" />
        <span>
          Database unreachable. Working offline — new words save locally and
          sync when the database returns.
        </span>
      </div>
    );
  }

  if (syncing) {
    return (
      <div className="mt-4 flex items-center gap-2 rounded-lg border border-blue-800 bg-blue-950/40 px-4 py-2 text-sm text-blue-300">
        <span>Syncing {pendingCount} offline word(s)...</span>
      </div>
    );
  }

  return (
    <div className="mt-4 flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm text-neutral-400">
      <span>{pendingCount} offline word(s) pending sync.</span>
    </div>
  );
}
