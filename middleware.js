import { NextResponse } from 'next/server';
import { verifyAuth } from './lib/auth';

export async function middleware(request) {
  // Routes publiques qui ne nécessitent pas d'authentification
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/tournaments',
    '/teams',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/check',
    '/api/auth/logout',
    '/api/tournaments',
    '/api/teams',
    '/api/schools'
  ];

  // Vérifier si c'est une route publique
  if (publicRoutes.some(route => request.nextUrl.pathname === route)) {
    return NextResponse.next();
  }

  // Autoriser l'accès aux pages de détails des tournois et des équipes
  if (request.nextUrl.pathname.match(/^\/tournaments\/[\w-]+$/) ||
      request.nextUrl.pathname.match(/^\/teams\/[\w-]+$/)) {
    return NextResponse.next();
  }

  // Vérifier si c'est une ressource statique
  if (request.nextUrl.pathname.startsWith('/_next') || 
      request.nextUrl.pathname.startsWith('/static') ||
      request.nextUrl.pathname.startsWith('/images') ||
      request.nextUrl.pathname.includes('.')) {
    return NextResponse.next();
  }

  // Vérifier l'authentification pour les routes protégées
  const protectedRoutes = [
    '/teams/create',
    '/tournaments/create',
    '/profile'
  ];

  if (protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    try {
      const token = request.cookies.get('token')?.value;
      const user = await verifyAuth(token);

      if (!user) {
        // Si c'est une route API, renvoyer une erreur JSON
        if (request.nextUrl.pathname.startsWith('/api')) {
          return NextResponse.json(
            { error: 'Non autorisé' },
            { status: 401 }
          );
        }

        // Sinon, rediriger vers la page de connexion
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
      }

      return NextResponse.next();
    } catch (error) {
      console.error('Erreur d\'authentification:', error);
      
      if (request.nextUrl.pathname.startsWith('/api')) {
        return NextResponse.json(
          { error: 'Erreur d\'authentification' },
          { status: 401 }
        );
      }

      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Pour toutes les autres routes, autoriser l'accès
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /_next (Next.js internals)
     * 2. /static (static files)
     * 3. /images (images)
     * 4. /_vercel (Vercel internals)
     * 5. /favicon.ico, /robots.txt (static files)
     */
    '/((?!_next|static|images|_vercel|favicon.ico|robots.txt).*)',
  ],
};