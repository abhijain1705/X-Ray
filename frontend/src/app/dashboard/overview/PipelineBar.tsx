'use client';

import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function PipelineBar({ data }: { data: any[] }) {
  return (
    <CardWrap title='Pipeline usage'>
      <ResponsiveContainer width='100%' height={250}>
        <BarChart data={data}>
          <XAxis dataKey='pipeline' />
          <Tooltip />
          <Bar dataKey='executions' fill='#22c55e' />
        </BarChart>
      </ResponsiveContainer>
    </CardWrap>
  );
}

function CardWrap({ title, children }: any) {
  return (
    <div className='rounded-xl border p-4'>
      <h3 className='mb-2 font-semibold'>{title}</h3>
      {children}
    </div>
  );
}
