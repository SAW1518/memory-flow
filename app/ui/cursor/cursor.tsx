const cursorClass = {
  before: 'mr-1 inline-block h-12 w-0.5 animate-pulse bg-yellow-400',
  between: 'absolute top-0 bottom-0 -left-0.5 w-0.5 animate-pulse bg-yellow-400',
  after: 'ml-1 inline-block h-12 w-0.5 animate-pulse bg-yellow-400',
};

export function Cursor({ position }: { position: keyof typeof cursorClass }) {
  return <span className={cursorClass[position]} />;
}
