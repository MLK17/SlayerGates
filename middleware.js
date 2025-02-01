import { NextResponse } from 'next/server';
import { verifyAuth } from './lib/auth';

export async function middleware(request) {
  // Vérifie si la route commence par /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    try {
      // Vérifie le token d'authentification
      const token = request.cookies.get('token')?.value;
      if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      // Vérifie si l'utilisateur est admin
      const user = await verifyAuth(token);
      if (!user || user.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
}; 