'use client';

import { useOptimistic, useTransition } from 'react';
import { setNotePublicAction } from '@/app/notes/[id]/actions';
import { ShareLink } from './share-link';

export function ShareToggle({
  id,
  isPublic,
  publicSlug,
  compact = false,
  hideLink = false,
}: {
  id: string;
  isPublic: boolean;
  publicSlug: string | null;
  compact?: boolean;
  hideLink?: boolean;
}) {
  const [, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(isPublic);

  return (
    <div className='flex flex-wrap items-center gap-3'>
      <button
        type='button'
        role='switch'
        aria-checked={optimistic}
        aria-label='Shared publicly'
        onClick={() =>
          startTransition(async () => {
            setOptimistic(!optimistic);
            await setNotePublicAction(id, !optimistic);
          })
        }
        className='flex items-center gap-2 text-sm'
      >
        <span
          className={`relative h-5 w-9 rounded-full transition-colors ${optimistic ? 'bg-green-600' : 'bg-foreground/25'}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-white transition-transform ${optimistic ? 'translate-x-4' : ''}`}
          />
        </span>
        {optimistic ? 'Shared' : 'Private'}
      </button>
      {!hideLink && isPublic && publicSlug && <ShareLink slug={publicSlug} compact={compact} />}
    </div>
  );
}
