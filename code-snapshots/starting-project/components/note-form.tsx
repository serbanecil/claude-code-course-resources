'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import type { JSONContent } from '@tiptap/react';
import type { NoteFormState } from '@/app/notes/new/actions';
import { NoteEditor } from './note-editor';

export function NoteForm({
  action: formAction,
  initialTitle,
  initialContent,
  initialIsPublic = false,
  submitLabel,
  cancelHref,
}: {
  action: (prev: NoteFormState, formData: FormData) => Promise<NoteFormState>;
  initialTitle?: string;
  initialContent?: JSONContent;
  initialIsPublic?: boolean;
  submitLabel: string;
  cancelHref?: string;
}) {
  const [state, action, isPending] = useActionState(formAction, null);

  return (
    <form action={action} className='flex flex-col gap-4'>
      <div className='flex flex-col gap-1'>
        <label htmlFor='title' className='text-sm font-medium'>
          Title
        </label>
        <input
          id='title'
          name='title'
          type='text'
          maxLength={200}
          placeholder='Untitled note'
          defaultValue={state?.title ?? initialTitle}
          className='rounded-md border border-foreground/20 bg-transparent px-3 py-2'
        />
      </div>
      <div className='flex flex-col gap-1'>
        <label htmlFor='content' className='text-sm font-medium'>
          Content
        </label>
        <NoteEditor initialContent={initialContent} />
      </div>
      <label className='flex items-center gap-2 text-sm font-medium'>
        <input
          type='checkbox'
          name='isPublic'
          defaultChecked={initialIsPublic}
          className='size-4'
        />
        Share publicly (anyone with the link can view)
      </label>
      {state?.error && (
        <p role='alert' className='text-sm text-red-600 dark:text-red-400'>
          {state.error}
        </p>
      )}
      <div className='flex items-center gap-3'>
        <button
          type='submit'
          disabled={isPending}
          className='rounded-md bg-foreground px-3 py-2 font-medium text-background disabled:opacity-50'
        >
          {isPending ? 'Saving…' : submitLabel}
        </button>
        {cancelHref && (
          <Link href={cancelHref} className='text-sm underline'>
            Cancel
          </Link>
        )}
      </div>
    </form>
  );
}
