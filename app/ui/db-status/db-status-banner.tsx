'use client';

import { WifiOffIcon } from '@/app/ui/icons/wifi-off';

export function DbStatusBanner({ dbOk }: { dbOk: boolean }) {
  if (dbOk) return null;

  return (
    <div className="mt-4 flex items-center gap-2 rounded-lg border border-amber-800 bg-amber-950/40 px-4 py-2 text-sm text-amber-300">
      <WifiOffIcon className="h-4 w-4 shrink-0" />
      <span>
        Database unreachable. Working offline — words saved offline stay on
        this device.
      </span>
    </div>
  );
}
