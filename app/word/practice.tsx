'use client';
import { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { Cursor } from '../ui/cursor/cursor';
import { PlusIcon } from '../ui/icons/plus';
import { WifiOffIcon } from '../ui/icons/wifi-off';
import { addOfflineWord, hasOfflineWord } from '../lib/offline-db';
import { registerWord } from '../lib/actions';
import { DbStatusBanner } from '../ui/db-status/db-status-banner';

const OFFLINE_LABELS = {
  idle: 'Register Offline',
  saving: 'Saving...',
  saved: 'Saved Offline',
  exists: 'Already Saved',
  error: 'Error — Retry',
}

const REGISTER_LABELS = {
  idle: 'Register Word',
  saving: 'Saving...',
  saved: 'Registered',
  exists: 'Already Registered',
  unauthenticated: 'Sign In to Register',
  error: 'Error — Retry',
}

// Returns the color class for a letter based on its typing state
function getLetterColorClass(typedChar: string | undefined, letter: string) {
  // Not yet typed — shown dimmed
  if (typedChar === undefined) return 'text-neutral-600';
  // Correct keystroke
  if (typedChar === letter) return 'text-green-400';
  // Wrong keystroke
  return 'text-red-400';
}

export function Practice({ word, dbOk }: { word: string; dbOk: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [typed, setTyped] = useState('');
  const [repetitions, setRepetitions] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [maxRepetitions, setMaxRepetitions] = useState(5);
  const [offlineStatus, setOfflineStatus] = useState<
    'idle' | 'saving' | 'saved' | 'exists' | 'error'
  >('idle');
  const [registerStatus, setRegisterStatus] = useState<
    keyof typeof REGISTER_LABELS
  >('idle');

  async function handleRegisterWord() {
    if (!word) return;
    setRegisterStatus('saving');
    try {
      const result = await registerWord(word);
      setRegisterStatus(result);
    } catch {
      setRegisterStatus('error');
    }
  }

  async function handleRegisterOffline() {
    if (!word) return;
    setOfflineStatus('saving');
    try {
      await addOfflineWord(word);
      setOfflineStatus('saved');
    } catch (err) {
      const name = (err as { name?: string })?.name;
      setOfflineStatus(name === 'ConstraintError' ? 'exists' : 'error');
    }
  }

  // Auto-focus the hidden input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Reset register status during render when the practiced word changes
  const [prevWord, setPrevWord] = useState(word);
  if (prevWord !== word) {
    setPrevWord(word);
    setRegisterStatus('idle');
  }

  // Reflect persisted offline state on mount / when word changes
  useEffect(() => {
    if (!word) return;
    let cancelled = false;
    hasOfflineWord(word)
      .then((exists) => {
        if (!cancelled && exists) setOfflineStatus('saved');
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [word]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (completed) return;
    const value = e.target.value;

    // Prevent typing beyond word length
    if (value.length > word.length) return;

    setTyped(value);

    if (value === word) {
      const newReps = repetitions + 1;
      if (newReps >= maxRepetitions) {
        setCompleted(true);
      } else {
        setRepetitions(newReps);
        setTyped('');
      }
    }
  }

  function changeMax(delta: number) {
    const next = maxRepetitions + delta;
    if (next < 1) return;
    setMaxRepetitions(next);
    // Reset progress if the new max is now <= completed reps
    if (repetitions >= next) {
      setRepetitions(0);
      setTyped('');
      setCompleted(false);
    }
  }

  if (!word) return null;

  return (
    // Clicking anywhere re-focuses the hidden input
    <div
      className="font-mono text-neutral-200"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Hidden input — captures all keystrokes, invisible to the user */}
      <input
        ref={inputRef}
        value={typed}
        onChange={handleChange}
        className="pointer-events-none absolute opacity-0"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />

      <div className="mx-6">
        <DbStatusBanner dbOk={dbOk} syncing={false} pendingCount={0} />
      </div>

      {/* Header */}
      <div className="flex items-start justify-between p-6">
        <div>
          <h1 className="text-lg font-bold text-neutral-200">Practice Mode</h1>
          <p className="text-sm text-neutral-500">
            Type the word correctly {maxRepetitions} times to complete.
          </p>
        </div>
        <div
          className="flex flex-col gap-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => changeMax(-1)}
              disabled={maxRepetitions <= 1}
              className="flex h-6 w-6 items-center justify-center rounded text-neutral-400 hover:text-neutral-200 disabled:opacity-30"
            >
              {'<'}
            </button>
            <p className="text-sm text-neutral-500">
              Repetition: {repetitions}/{maxRepetitions}
            </p>
            <button
              onClick={() => changeMax(1)}
              className="flex h-6 w-6 items-center justify-center rounded text-neutral-400 hover:text-neutral-200"
            >
              {'>'}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRegisterWord}
              disabled={
                !dbOk ||
                registerStatus === 'saving' ||
                registerStatus === 'saved' ||
                registerStatus === 'exists'
              }
              title={!dbOk ? 'Database unreachable — use Register Offline' : undefined}
              className="flex items-center gap-2 rounded-lg bg-emerald-400 px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-emerald-300 disabled:opacity-50"
            >
              <PlusIcon className="h-4 w-4" />
              {!dbOk ? 'DB Offline' : REGISTER_LABELS[registerStatus]}
            </button>
            <button
              type="button"
              onClick={handleRegisterOffline}
              disabled={offlineStatus === 'saving' || offlineStatus === 'saved'}
              className="flex items-center gap-2 rounded-lg border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-200 transition-colors hover:bg-neutral-800 disabled:opacity-50"
            >
              <WifiOffIcon className="h-4 w-4" />
              {OFFLINE_LABELS[offlineStatus]}
            </button>
          </div>
        </div>
      </div>

      {/* Word display */}
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex items-center text-5xl tracking-widest">
          {/* Cursor before first letter */}
          {typed.length === 0 && <Cursor position="before" />}
          {word.split('').map((letter, index) => (
            <span
              key={index}
              className={clsx(
                'relative',
                getLetterColorClass(typed[index], letter)
              )}
            >
              {/* Cursor between letters */}
              {index === typed.length && typed.length > 0 && (
                <Cursor position="between" />
              )}
              {letter}
            </span>
          ))}
          {/* Cursor after last letter */}
          {typed.length === word.length && !completed && (
            <Cursor position="after" />
          )}
        </div>
      </div>
    </div>
  );
}
