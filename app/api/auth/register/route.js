import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

// Meilleure pratique pour Next.js : éviter les connexions multiples
const prisma = new PrismaClient();

export async function POST(request) {
  try {
    if (!request.body) {
      return Response.json({ error: 'Données manquantes' }, { status: 400 });
    }

    const { pseudo, email, password } = await request.json();
    
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
    
    // Création de l'utilisateur selon le schéma actuel
    const user = await prisma.user.create({
      data: {
        pseudo,
        email,
        password: hashedPassword,
        created_at: new Date(),
      },
    });

    // Ne pas renvoyer le mot de passe dans la réponse
    const { password: _, ...userWithoutPassword } = user;

    return Response.json({ 
      message: 'Utilisateur créé avec succès',
      user: userWithoutPassword 
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
    // Fermeture de la connexion
    await prisma.$disconnect();
  }
} 