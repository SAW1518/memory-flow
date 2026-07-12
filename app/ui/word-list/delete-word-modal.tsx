'use client';

import type { WordSources } from '@/app/ui/card/card';
import { ModalOverlay } from '@/app/ui/modal/modal-overlay';
import { UserCheckIcon } from '@/app/ui/icons/user-check';
import { WifiOffIcon } from '@/app/ui/icons/wifi-off';
import { TrashIcon } from '@/app/ui/icons/trash';

type SourceKey = keyof WordSources;

// General words are owner-curated and shared — never offered for deletion
const SOURCE_OPTIONS = [
  { key: 'user', label: 'Registered', Icon: UserCheckIcon, text: 'text-cyan-400' },
  { key: 'offline', label: 'Offline', Icon: WifiOffIcon, text: 'text-amber-400' },
] as const;

export function DeleteWordModal({
  content,
  sources,
  deleting,
  onDelete,
  onClose,
}: {
  content: string;
  sources: WordSources;
  deleting: boolean;
  onDelete: (keys: SourceKey[]) => void;
  onClose: () => void;
}) {
  const active = SOURCE_OPTIONS.filter((o) => sources[o.key]);

  return (
    <ModalOverlay onClose={onClose}>
      <p className="text-xs font-bold uppercase text-neutral-600">
        delete word
      </p>
        <h2 className="mt-2 text-3xl font-bold text-white">{content}</h2>
        <p className="mt-2 text-sm text-neutral-500">
          This word is in multiple lists. Delete it from…
        </p>
        <div className="mt-6 flex flex-col gap-2">
          {active.map(({ key, label, Icon, text }) => (
            <button
              key={key}
              type="button"
              disabled={deleting}
              onClick={() => onDelete([key])}
              className={`flex items-center gap-2 rounded-lg border border-neutral-800 px-4 py-2 text-sm font-medium ${text} transition-colors hover:bg-neutral-800 disabled:opacity-50`}
            >
              <Icon className="h-4 w-4" />
              {label} only
            </button>
          ))}
          <button
            type="button"
            disabled={deleting}
            onClick={() => onDelete(active.map((o) => o.key))}
            className="flex items-center gap-2 rounded-lg border border-red-900 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
          >
            <TrashIcon className="h-4 w-4" />
            {deleting ? 'Deleting...' : 'Delete from all'}
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={onClose}
            className="rounded-lg border border-neutral-800 px-4 py-2 text-sm text-neutral-500 transition-colors hover:border-neutral-700 hover:text-neutral-300"
          >
            Cancel
          </button>
        </div>
    </ModalOverlay>
  );
}
