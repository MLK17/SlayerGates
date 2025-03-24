import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Vérifier l'authentification
    const cookieStore = cookies();
    const token = cookieStore.get('token');
    
    console.log('Token from cookie:', token?.value);

    if (!token) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userData = await verifyAuth(token.value);
    console.log('User data from token:', userData);

    if (!userData) {
      return Response.json({ error: 'Token invalide' }, { status: 401 });
    }

    console.log('Recherche des équipes pour le capitaine:', userData.id);
    
    const teams = await prisma.team.findMany({
      where: {
        captain_id: userData.id
      },
      include: {
        school: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                pseudo: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    console.log('Équipes trouvées:', teams);
    return Response.json(teams);
  } catch (error) {
    console.error('Erreur détaillée lors de la récupération des équipes:', error);
    return Response.json(
      { error: 'Une erreur est survenue lors de la récupération des équipes: ' + error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
