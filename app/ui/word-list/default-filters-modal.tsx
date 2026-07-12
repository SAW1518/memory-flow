'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { SOURCE_FILTERS, type SourceKey } from './source-filters';
import { ModalOverlay } from '@/app/ui/modal/modal-overlay';

export function DefaultFiltersModal({
  initial,
  onSave,
  onClose,
}: {
  initial: SourceKey[];
  onSave: (keys: SourceKey[]) => void;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<SourceKey[]>(initial);

  const toggle = (key: SourceKey | 'all') => {
    setSelected((prev) =>
      key === 'all'
        ? []
        : prev.includes(key)
          ? prev.filter((k) => k !== key)
          : [...prev, key]
    );
  };

  return (
    <ModalOverlay onClose={onClose}>
      <p className="text-xs font-bold uppercase text-neutral-600">
        default filters
      </p>
        <p className="mt-2 text-sm text-neutral-500">
          Choose which filters are selected when the page loads.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {SOURCE_FILTERS.map(({ key, label, Icon, text }) => {
            const active =
              key === 'all' ? selected.length === 0 : selected.includes(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggle(key)}
                className={clsx(
                  'flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-sm transition-colors',
                  text,
                  active
                    ? 'border-neutral-500 bg-neutral-800'
                    : 'border-neutral-800 bg-neutral-950 hover:bg-neutral-800'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </div>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => onSave(selected)}
            className="flex flex-1 items-center justify-center rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-neutral-800 px-4 py-2 text-sm text-neutral-500 transition-colors hover:border-neutral-700 hover:text-neutral-300"
          >
            Cancel
          </button>
        </div>
    </ModalOverlay>
  );
}
