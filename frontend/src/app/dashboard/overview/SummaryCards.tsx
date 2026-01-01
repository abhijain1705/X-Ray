'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';

export default function SummaryCards({ data }: { data: any }) {
  if (!data) return null;

  return (
    <>
      <Metric title='Total Executions' value={data.totalExecutions} />
      <Metric title='Running' value={data.running} />
      <Metric title='Completed' value={data.completed} />
      <Metric
        title='Avg Duration'
        value={(data.avgDurationMs / 1000).toFixed(2)}
      />
    </>
  );
}

function Metric({ title, value }: { title: string; value: any }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className='text-2xl'>{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}
