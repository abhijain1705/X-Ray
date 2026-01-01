'use client';

export default function ExecutionsTable({ data }: { data: any[] }) {
  if (!data) return null;

  return (
    <div className='rounded-xl border'>
      <div className='p-3 font-semibold'>Recent Executions</div>
      <table className='w-full text-sm'>
        <thead className='border-b'>
          <tr>
            <th className='p-2 text-left'>Pipeline</th>
            <th className='p-2'>Started</th>
            <th className='p-2'>Duration</th>
          </tr>
        </thead>
        <tbody>
          {data.map((e) => (
            <tr key={e.id} className='border-b'>
              <td className='p-2'>{e.pipeline}</td>
              <td className='p-2'>{new Date(e.started_at).toLocaleString()}</td>
              <td className='p-2'>
                {e.ended_at
                  ? (
                      (+new Date(e.ended_at) - +new Date(e.started_at)) /
                      1000
                    ).toFixed(2) + 's'
                  : 'Running'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
