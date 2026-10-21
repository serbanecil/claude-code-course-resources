'use client';

import { useState, useSyncExternalStore } from 'react';

const subscribeNoop = () => () => {};

export function ShareLink({ slug, compact = false }: { slug: string; compact?: boolean }) {
  const origin = useSyncExternalStore(
    subscribeNoop,
    () => window.location.origin,
    () => '',
  );
  const [copied, setCopied] = useState(false);
  const url = `${origin}/p/${slug}`;

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      {!compact && (
        <a href={url} className='text-sm break-all underline'>
          {url}
        </a>
      )}
      <button
        type='button'
        onClick={copy}
        className='rounded-md border border-foreground/20 px-2 py-1 text-xs'
      >
        {copied ? 'Copied!' : compact ? 'Copy public link' : 'Copy link'}
      </button>
    </>
  );
}
