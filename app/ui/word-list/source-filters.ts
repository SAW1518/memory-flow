import { ListIcon } from '@/app/ui/icons/list';
import { GlobeIcon } from '@/app/ui/icons/globe';
import { UserCheckIcon } from '@/app/ui/icons/user-check';
import { WifiOffIcon } from '@/app/ui/icons/wifi-off';

export type SourceKey = 'general' | 'user' | 'offline';

export const SOURCE_FILTERS = [
  { key: 'all', label: 'all', Icon: ListIcon, text: 'text-neutral-200' },
  { key: 'general', label: 'general', Icon: GlobeIcon, text: 'text-emerald-400' },
  { key: 'user', label: 'registered', Icon: UserCheckIcon, text: 'text-cyan-400' },
  { key: 'offline', label: 'offline', Icon: WifiOffIcon, text: 'text-amber-400' },
] as const;

const STORAGE_KEY = 'mf-default-filters';
const VALID_KEYS: SourceKey[] = ['general', 'user', 'offline'];

// Async so callers can hydrate from effects without synchronous setState
export const loadDefaultFilters = async (): Promise<SourceKey[]> => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed)
    ? parsed.filter((k): k is SourceKey => VALID_KEYS.includes(k))
    : [];
};

export const saveDefaultFilters = (keys: SourceKey[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
};
