'use client';

import { PieChart, Pie, Tooltip, ResponsiveContainer } from 'recharts';

export default function StepsPie({ data }: { data: any[] }) {
  return (
    <CardWrap title='Step frequency'>
      <ResponsiveContainer width='100%' height={250}>
        <PieChart>
          <Pie
            data={data}
            dataKey='count'
            nameKey='step'
            outerRadius={90}
            fill='#3b82f6'
          />
          <Tooltip />
        </PieChart>
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
