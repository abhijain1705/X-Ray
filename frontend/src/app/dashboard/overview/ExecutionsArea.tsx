'use client';

import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function ExecutionsArea({ data }: { data: any[] }) {
  return (
    <CardWrap title='Executions over time'>
      <ResponsiveContainer width='100%' height={250}>
        <AreaChart data={data}>
          <XAxis dataKey='date' />
          <Tooltip />
          <Area dataKey='count' stroke='#8884d8' fill='#8884d8' />
        </AreaChart>
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
