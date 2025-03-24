import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Using a secure default for development, but should be overridden in production
const JWT_SECRET = process.env.JWT_SECRET || 'slayergates-secure-jwt-secret-key-2024';

export async function createToken(user) {
  try {
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        pseudo: user.pseudo,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    return token;
  } catch (error) {
    console.error('Erreur lors de la création du token:', error);
    throw error;
  }
}

export async function verifyAuth(token) {
  if (!token) {
    console.log('Token manquant');
    return null;
  }

  try {
    // Vérifier et décoder le token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Vérifier que l'utilisateur existe toujours en base
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        pseudo: true,
        role: true,
        avatar: true
      }
    });

    if (!user) {
      console.log('Utilisateur non trouvé en base');
      return null;
    }

    return user;
  } catch (error) {
    console.error('Erreur de vérification du token:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}