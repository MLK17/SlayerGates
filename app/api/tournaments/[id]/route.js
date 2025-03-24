import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        teams: true,
        creator: {
          select: {
            id: true,
            pseudo: true,
            avatar: true
          }
        }
      }
    });

    if (!tournament) {
      return Response.json({ error: 'Tournoi non trouvé' }, { status: 404 });
    }

    return Response.json(tournament);
  } catch (error) {
    console.error('Erreur lors de la récupération du tournoi:', error);
    return Response.json(
      { error: 'Une erreur est survenue lors de la récupération du tournoi' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
