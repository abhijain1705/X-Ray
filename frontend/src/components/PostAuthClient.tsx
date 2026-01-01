'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function PostAuthClient() {
  const { isLoaded, isSignedIn, getToken, userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const calledRef = useRef(false);

  useEffect(() => {
    console.log('PostAuth state:', { isLoaded, isSignedIn });

    // ⛔ WAIT for Clerk to fully load
    if (!isLoaded) return;

    // ⛔ If loaded AND not signed in → go to login
    if (!isSignedIn) {
      router.replace('/auth/sign-in');
      return;
    }

    // ⛔ Prevent double execution
    if (calledRef.current) return;
    calledRef.current = true;

    (async () => {
      try {
        const token = await getToken();

        await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_API_URL}/auth/sync-user`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              clerkUserId: userId,
              email: user?.primaryEmailAddress?.emailAddress
            })
          }
        );

        router.replace('/dashboard/overview');
      } catch (err) {
        console.error('Post-auth failed', err);
        router.replace('/auth/sign-in');
      }
    })();
  }, [isLoaded, isSignedIn, getToken, router]);

  return <div>Finalizing sign-in…</div>;
}
