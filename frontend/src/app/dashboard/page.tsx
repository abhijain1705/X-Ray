import PostAuthClient from '@/components/PostAuthClient';

export default async function Dashboard() {
  return (
    <>
      <PostAuthClient />
      <div>Loading dashboard...</div>
    </>
  );
}
