import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';
import { createToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    
    if (!body || typeof body !== 'object') {
      return Response.json({ error: 'Requête invalide' }, { status: 400 });
    }

    const { pseudo, email, password, role } = body;
    
    // Validation des données
    if (!pseudo || !email || !password) {
      return Response.json({ error: 'Tous les champs sont requis' }, { status: 400 });
    }

    // Vérification des contraintes de longueur
    if (pseudo.length > 50) {
      return Response.json({ error: 'Le pseudo ne doit pas dépasser 50 caractères' }, { status: 400 });
    }
    if (email.length > 255) {
      return Response.json({ error: 'L\'email ne doit pas dépasser 255 caractères' }, { status: 400 });
    }

    // Vérification si l'utilisateur existe déjà
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { pseudo }
        ]
      }
    });

    if (existingUser) {
      return Response.json({ 
        error: existingUser.email === email ? 'Cet email est déjà utilisé' : 'Ce pseudo est déjà utilisé' 
      }, { status: 400 });
    }

    // Hashage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Création de l'utilisateur avec le rôle par défaut
    const user = await prisma.user.create({
      data: {
        pseudo,
        email,
        password: hashedPassword,
        role: role || 'user', // Rôle par défaut si non spécifié
        created_at: new Date(),
      },
      select: {
        id: true,
        pseudo: true,
        email: true,
        role: true,
        avatar: true,
        created_at: true
      }
    });

    // Créer un token JWT pour la connexion automatique
    const token = await createToken(user);

    // Configurer le cookie avec le token
    const cookieStore = cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 jours
    });

    return Response.json({ 
      message: 'Inscription réussie',
      user: user
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);

    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0];
      return Response.json({ 
        error: `${field === 'pseudo' ? 'Ce pseudo' : 'Cet email'} est déjà utilisé` 
      }, { status: 400 });
    }

    return Response.json({ 
      error: 'Une erreur est survenue lors de l\'inscription' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}