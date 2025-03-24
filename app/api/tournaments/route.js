import { PrismaClient } from '@prisma/client';

let prisma;

try {
  prisma = new PrismaClient();
} catch (error) {
  console.error('Erreur lors de l\'initialisation de Prisma:', error);
  throw error;
}

export async function GET() {
  try {
    console.log('Début de la récupération des tournois...');

    // Vérifier la connexion à la base de données
    try {
      await prisma.$connect();
    } catch (error) {
      console.error('Erreur de connexion à la base de données:', error);
      throw new Error('Erreur de connexion à la base de données');
    }
    
    // Récupérer les tournois avec leurs équipes inscrites et les détails des équipes
    const tournaments = await prisma.tournament.findMany({
      include: {
        teams: {
          include: {
            team: {
              include: {
                captain: true,
                members: true
              }
            }
          }
        }
      }
    });
    
    return new Response(JSON.stringify({ tournaments }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des tournois:', error);
    return new Response(JSON.stringify({ error: 'Erreur lors de la récupération des tournois' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}
