'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

type App = {
  id: string;
  name: string;
  api_key: string;
  created_at?: string;
};

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_API_URL;

export default function ManageApps() {
  const [apps, setApps] = useState<App[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const { userId } = useAuth();

  // fetch apps
  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    const res = await fetch(`${SERVER_URL}/apps?userId=${userId}`);
    const data = await res.json();
    setApps(data);
  };

  const createApp = async () => {
    if (!name.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${SERVER_URL}/apps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name })
      });

      const newApp = await res.json();
      if (!res.ok) {
        throw new Error(newApp.error || 'Failed to create app');
      }
      setApps((prev) => [newApp, ...prev]);
      setName('');
    } catch {
      // handle error
      alert('Failed to create app. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyKey = async (key: string) => {
    await navigator.clipboard.writeText(key);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className='mx-auto max-w-5xl space-y-10 p-8'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-semibold tracking-tight'>Manage Apps</h1>
        <p className='text-muted-foreground mt-1'>
          Create apps and use their App ID in your SDK
        </p>
      </div>

      {/* Create App */}
      <div className='space-y-4 rounded-xl border bg-white p-6 shadow-sm'>
        <h2 className='text-lg font-medium'>Create new app</h2>

        <div className='flex gap-3'>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='App name (e.g. Loan Engine)'
            className='flex-1 rounded-lg border px-4 py-2 focus:ring-2 focus:ring-black focus:outline-none'
          />

          <button
            onClick={createApp}
            disabled={loading}
            className='rounded-lg bg-black px-5 py-2 text-white hover:bg-black/90 disabled:opacity-50'
          >
            {loading ? 'Creating…' : 'Create'}
          </button>
        </div>
      </div>
      {/* api key */}
      <div className='flex items-center gap-2'>
        <code className='flex-1 truncate rounded-md bg-gray-100 px-3 py-2 text-sm'>
          {userId}
        </code>

        <button
          onClick={() => copyKey(userId ?? '')}
          className='rounded-md border px-3 py-2 text-sm hover:bg-gray-100'
        >
          {copied === userId ? 'Copied' : 'Copy'}
        </button>
      </div>

      {/* Apps List */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        {apps.map((app, index) => (
          <div
            key={index}
            className='space-y-3 rounded-xl border bg-white p-5 shadow-sm'
          >
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-medium'>{app.name}</h3>
              <span className='text-muted-foreground text-xs'>App ID</span>
            </div>

            <div className='flex items-center gap-2'>
              <code className='flex-1 truncate rounded-md bg-gray-100 px-3 py-2 text-sm'>
                {app.api_key}
              </code>

              <button
                onClick={() => copyKey(app.api_key)}
                className='rounded-md border px-3 py-2 text-sm hover:bg-gray-100'
              >
                {copied === app.api_key ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        ))}

        {apps.length === 0 && (
          <div className='text-muted-foreground'>
            No apps yet. Create your first one.
          </div>
        )}
      </div>
    </div>
  );
}
