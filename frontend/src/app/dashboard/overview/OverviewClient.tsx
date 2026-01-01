'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';

import SummaryCards from './SummaryCards';
import ExecutionsArea from './ExecutionsArea';
import PipelineBar from './PipelineBar';
import StepsPie from './StepsPie';
import ExecutionsTable from './ExecutionsTable';
import { useAuth } from '@clerk/nextjs';

type App = {
  id: string;
  name: string;
};

export default function OverviewClient() {
  const [apps, setApps] = useState<App[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const { userId } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [executions, setExecutions] = useState<any>(null);
  const [pipelines, setPipelines] = useState<any>(null);
  const [steps, setSteps] = useState<any>(null);

  // 🔹 fetch apps
  useEffect(() => {
    async function loadApps() {
      const data = await apiGet<App[]>(`/apps?userId=${userId}`);
      if (data?.length) {
        setApps(data);
        setSelectedAppId(data[0].id);
      }
    }
    loadApps();
  }, [userId]);

  // 🔹 fetch dashboard data when app changes
  useEffect(() => {
    if (!selectedAppId) return;

    async function loadDashboard() {
      const [s, e, p, st] = await Promise.all([
        apiGet(`/executions/summary?appId=${selectedAppId}`),
        apiGet(`/executions?appId=${selectedAppId}&limit=100`),
        apiGet(`/analytics/pipelines?appId=${selectedAppId}`),
        apiGet(`/analytics/steps?appId=${selectedAppId}`)
      ]);

      setSummary(s);
      setExecutions(e);
      setPipelines(p);
      setSteps(st);
    }

    loadDashboard();
  }, [selectedAppId]);

  if (!apps.length) {
    return <div className='text-muted-foreground p-6'>Loading apps…</div>;
  }

  return (
    <div className='h-screen space-y-6 overflow-auto p-4 pb-24'>
      {/* App selector */}
      <div className='flex items-center gap-3'>
        <label className='text-sm font-medium'>App</label>
        <select
          value={selectedAppId ?? ''}
          onChange={(e) => setSelectedAppId(e.target.value)}
          className='rounded-md border px-3 py-1.5 text-sm'
        >
          {apps.map((app) => (
            <option key={app.id} value={app.id}>
              {app.name}
            </option>
          ))}
        </select>
      </div>

      {/* Metrics */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <SummaryCards data={summary} />
      </div>

      {/* Charts */}
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
        <div className='lg:col-span-4'>
          <ExecutionsArea data={groupByDate(executions?.data)} />
        </div>
        <div className='lg:col-span-3'>
          <PipelineBar data={pipelines ?? []} />
        </div>
      </div>

      {/* Table + pie */}
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
        <div className='lg:col-span-4'>
          <ExecutionsTable data={executions?.data} />
        </div>
        <div className='lg:col-span-3'>
          <StepsPie data={steps} />
        </div>
      </div>
    </div>
  );
}

function groupByDate(rows: any[] = []) {
  const map: Record<string, number> = {};

  rows.forEach((r) => {
    const date = new Date(r.started_at).toISOString().slice(0, 10);
    map[date] = (map[date] || 0) + 1;
  });

  return Object.entries(map).map(([date, count]) => ({ date, count }));
}
