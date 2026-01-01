const API = process.env.NEXT_PUBLIC_SERVER_API_URL!;

export async function apiGet<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(`${API}${url}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch (e) {
    console.error('API failed:', url, e);
    return null;
  }
}
