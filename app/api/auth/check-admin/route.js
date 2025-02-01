import { verifyAuth } from '../../../../lib/auth';

export async function GET(request) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return Response.json({ isAdmin: false });
    }

    const user = await verifyAuth(token);
    return Response.json({ isAdmin: user?.role === 'admin' });
  } catch (error) {
    return Response.json({ isAdmin: false });
  }
} 