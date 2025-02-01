import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function verifyAuth(token) {
  try {
    // Vérifie le token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Récupère l'utilisateur depuis la base de données
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId
      },
      select: {
        id: true,
        email: true,
        pseudo: true,
        role: true
      }
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    return user;
  } catch (error) {
    console.error('Erreur de vérification du token:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

export async function createToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
} 