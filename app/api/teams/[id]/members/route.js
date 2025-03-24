import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  console.log('Début de la requête GET /api/teams/[id]/members');
  console.log('Paramètres reçus:', params);
  
  try {
    // Vérifier l'authentification
    const cookieStore = cookies();
    const token = cookieStore.get('token');
    
    console.log('Token trouvé:', !!token);

    if (!token) {
      return Response.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const user = await verifyAuth(token.value);
    console.log('Utilisateur authentifié:', !!user);
    
    if (!user) {
      return Response.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Convertir l'ID en entier car Prisma attend un nombre
    const teamId = parseInt(params.id, 10);
    console.log('ID de l\'équipe recherchée (après conversion):', teamId);

    if (isNaN(teamId)) {
      return Response.json(
        { error: 'ID d\'équipe invalide' },
        { status: 400 }
      );
    }

    // Vérifier si l'équipe existe
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        captain: {
          select: {
            id: true,
            pseudo: true,
            avatar: true
          }
        }
      }
    });

    console.log('Équipe trouvée:', !!team);
    if (team) {
      console.log('Détails de l\'équipe:', {
        id: team.id,
        name: team.name,
        captain_id: team.captain_id
      });
    }

    if (!team) {
      return Response.json(
        { error: 'Équipe non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier si l'utilisateur est le capitaine ou un membre de l'équipe
    const isMember = await prisma.teamMember.findFirst({
      where: {
        team_id: teamId,
        user_id: user.id
      }
    });

    console.log('Est membre:', !!isMember);
    console.log('Est capitaine:', team.captain_id === user.id);

    if (!isMember && team.captain_id !== user.id) {
      return Response.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    // Récupérer tous les membres de l'équipe (sauf le capitaine)
    const members = await prisma.teamMember.findMany({
      where: {
        team_id: teamId,
        user_id: {
          not: team.captain_id // Exclure le capitaine de la liste des membres
        }
      },
      include: {
        user: {
          select: {
            id: true,
            pseudo: true,
            avatar: true
          }
        }
      }
    });

    console.log('Nombre de membres trouvés:', members.length);

    const response = {
      captain: team.captain,
      members: members
    };

    console.log('Réponse finale:', JSON.stringify(response, null, 2));

    return Response.json(response);

  } catch (error) {
    console.error('Erreur détaillée lors de la récupération des membres:', error);
    return Response.json(
      { 
        error: 'Erreur lors de la récupération des membres',
        details: error.message 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
