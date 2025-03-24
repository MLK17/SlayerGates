import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = cookies();
  
  // Supprime le cookie de token
  cookieStore.delete('token');
  
  return Response.json({ success: true });
}
