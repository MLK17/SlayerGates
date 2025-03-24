import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request, { params }) {
  try {
    const { id } = params;
    
    // Vérifier l'authentification
    const cookieStore = cookies();
    const token = cookieStore.get('token');
    
    if (!token) {
      return new Response(JSON.stringify({ error: 'Non autorisé' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const user = await verifyAuth(token.value);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Non autorisé' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Vérifier si l'équipe existe
    const team = await prisma.team.findUnique({
      where: { id: parseInt(id) },
      include: {
        captain: {
          select: {
            id: true,
            email: true,
            pseudo: true
          }
        },
        members: {
          select: {
            user_id: true
          }
        }
      }
    });

    if (!team) {
      return new Response(JSON.stringify({ error: 'Équipe non trouvée' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Vérifier si l'utilisateur n'est pas le capitaine
    if (team.captain.id === user.id) {
      return new Response(JSON.stringify({ error: 'Vous êtes le capitaine de cette équipe' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Vérifier si l'utilisateur n'est pas déjà membre de l'équipe
    const isAlreadyMember = team.members.some(member => member.user_id === user.id);
    if (isAlreadyMember) {
      return new Response(JSON.stringify({ error: 'Vous êtes déjà membre de cette équipe' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Vérifier si l'utilisateur n'est pas déjà dans une autre équipe
    const existingMembership = await prisma.teamMember.findFirst({
      where: { user_id: user.id },
      include: {
        team: {
          select: {
            name: true
          }
        }
      }
    });

    if (existingMembership) {
      return new Response(JSON.stringify({ 
        error: `Vous êtes déjà membre de l'équipe "${existingMembership.team.name}". Vous ne pouvez appartenir qu'à une seule équipe.`
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Vérifier si l'utilisateur n'est pas capitaine d'une autre équipe
    const existingCaptaincy = await prisma.team.findFirst({
      where: { captain_id: user.id }
    });

    if (existingCaptaincy) {
      return new Response(JSON.stringify({ 
        error: `Vous êtes déjà capitaine de l'équipe "${existingCaptaincy.name}". Vous ne pouvez pas rejoindre une autre équipe.`
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Vérifier si l'utilisateur n'a pas déjà des demandes en attente
    const pendingRequests = await prisma.teamJoinRequest.findMany({
      where: {
        user_id: user.id,
        status: 'PENDING'
      },
      include: {
        team: {
          select: {
            name: true
          }
        }
      }
    });

    if (pendingRequests.length > 0) {
      const teamNames = pendingRequests.map(req => `"${req.team.name}"`).join(', ');
      return new Response(JSON.stringify({ 
        error: `Vous avez déjà des demandes en attente pour les équipes : ${teamNames}. Veuillez attendre leur réponse ou les annuler avant d'en faire une nouvelle.`
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Créer la demande
    const joinRequest = await prisma.teamJoinRequest.create({
      data: {
        team_id: parseInt(id),
        user_id: user.id,
        status: 'PENDING',
        created_at: new Date(),
        updated_at: new Date()
      },
      include: {
        user: {
          select: {
            pseudo: true,
            email: true
          }
        },
        team: {
          select: {
            name: true
          }
        }
      }
    });

    return new Response(JSON.stringify({
      message: 'Demande envoyée avec succès',
      request: joinRequest
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erreur lors de la demande de rejoindre l\'équipe:', error);
    return new Response(JSON.stringify({ error: 'Une erreur est survenue lors de la demande' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  } finally {
    await prisma.$disconnect();
  }
}
