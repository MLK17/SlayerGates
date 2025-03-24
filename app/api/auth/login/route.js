import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';
import { createToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    
    if (!body || typeof body !== 'object') {
      return Response.json(
        { error: 'Requête invalide' },
        { status: 400 }
      );
    }

    const { email, password } = body;

    if (!email || !password) {
      return Response.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur avec tous les champs nécessaires
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        pseudo: true,
        password: true,
        role: true,
        avatar: true
      }
    });

    if (!user) {
      return Response.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return Response.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Créer le token JWT avec les informations utilisateur
    const token = await createToken(user);

    // Ne pas renvoyer le mot de passe dans la réponse
    const { password: _, ...userWithoutPassword } = user;

    // Configurer les cookies avec le token
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 jours
    });

    // Renvoyer la réponse avec les informations utilisateur
    return Response.json({
      message: 'Connexion réussie',
      user: userWithoutPassword
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (err) {
    
    return Response.json(
      { error: 'Une erreur est survenue lors de la connexion' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}