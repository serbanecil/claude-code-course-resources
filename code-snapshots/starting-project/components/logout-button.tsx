'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { authClient } from '@/lib/auth-client';

export function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push('/');
            router.refresh();
          },
        },
      });
    });
  }

  return (
    <button
      type='button'
      onClick={handleClick}
      disabled={isPending}
      className='rounded-md border border-foreground/20 px-3 py-1.5 text-sm font-medium disabled:opacity-50'
    >
      {isPending ? 'Signing out…' : 'Log out'}
    </button>
  );
}
