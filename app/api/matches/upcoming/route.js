import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('Récupération des matchs à venir...');

    const currentDate = new Date();
    console.log('Date actuelle:', currentDate);

    // Vérifier d'abord que les tables existent
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('Tables disponibles:', tables);

    // Récupérer un seul match pour tester
    const testMatch = await prisma.match.findFirst();
    console.log('Test match:', testMatch);

    const upcomingMatches = await prisma.match.findMany({
      where: {
        OR: [
          { status: 'pending' },
          { status: 'in_progress' }
        ],
        scheduled_time: {
          gte: currentDate
        }
      },
      include: {
        tournament: true,
        team1: {
          include: {
            school: true
          }
        },
        team2: {
          include: {
            school: true
          }
        }
      },
      orderBy: {
        scheduled_time: 'asc'
      },
      take: 10 // Limiter à 10 matchs
    });

    console.log('Matchs trouvés:', upcomingMatches.length);

    return Response.json({ matches: upcomingMatches });
  } catch (error) {
    console.error('Erreur détaillée:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code,
      meta: error.meta
    });

    return new Response(JSON.stringify({ 
      error: 'Erreur serveur',
      details: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } finally {
    await prisma.$disconnect();
  }
}
