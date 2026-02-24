'use client';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { Cursor } from '../ui/cursor/cursor';

// Returns the color class for a letter based on its typing state
function getLetterColorClass(typedChar: string | undefined, letter: string) {
  // Not yet typed — shown dimmed
  if (typedChar === undefined) return 'text-neutral-600';
  // Correct keystroke
  if (typedChar === letter) return 'text-green-400';
  // Wrong keystroke
  return 'text-red-400';
}

export default function WordPage() {
  const searchParams = useSearchParams();
  const word = searchParams.get('practice') || '';
  const inputRef = useRef<HTMLInputElement>(null);

  const [typed, setTyped] = useState('');
  const [repetitions, setRepetitions] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [maxRepetitions, setMaxRepetitions] = useState(5);

  // Auto-focus the hidden input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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

      {/* Header */}
      <div className="flex items-start justify-between p-6">
        <div>
          <h1 className="text-lg font-bold text-neutral-200">Practice Mode</h1>
          <p className="text-sm text-neutral-500">
            Type the word correctly {maxRepetitions} times to complete.
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
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
