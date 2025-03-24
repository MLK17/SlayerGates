import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Récupérer toutes les équipes avec leurs statistiques
    const teams = await prisma.team.findMany({
      include: {
        team1_matches: {
          where: {
            status: 'COMPLETED'
          },
          select: {
            winner_id: true
          }
        },
        team2_matches: {
          where: {
            status: 'COMPLETED'
          },
          select: {
            winner_id: true
          }
        }
      }
    });

    // Calculer les statistiques pour chaque équipe
    const leaderboardData = teams.map(team => {
      const wins = team.team1_matches.filter(m => m.winner_id === team.id).length +
                  team.team2_matches.filter(m => m.winner_id === team.id).length;
      
      const totalMatches = team.team1_matches.length + team.team2_matches.length;
      const losses = totalMatches - wins;
      
      // 1 point par victoire, 0 point par défaite
      const points = wins;
      
      const winRate = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(1) : '0.0';

      return {
        id: team.id,
        name: team.name,
        points: points,
        wins: wins,
        losses: losses,
        winRate: winRate
      };
    });

    // Trier par points puis par winRate
    const sortedLeaderboard = leaderboardData.sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      return parseFloat(b.winRate) - parseFloat(a.winRate);
    });

    return NextResponse.json(sortedLeaderboard);
  } catch (error) {
    console.error('Erreur lors de la récupération du leaderboard:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
