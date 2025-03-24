import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
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
            pseudo: true
          }
        },
        members: {
          where: { user_id: user.id }
        }
      }
    });

    if (!team) {
      return new Response(JSON.stringify({ error: 'Équipe non trouvée' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Vérifier si l'utilisateur est capitaine d'une équipe (cette équipe ou une autre)
    const existingCaptaincy = await prisma.team.findFirst({
      where: {
        captain_id: user.id
      }
    });

    if (existingCaptaincy) {
      return new Response(JSON.stringify({
        status: existingCaptaincy.id === parseInt(id) ? 'CAPTAIN' : 'CAPTAIN_OTHER_TEAM',
        message: existingCaptaincy.id === parseInt(id) 
          ? 'Vous êtes le capitaine de cette équipe'
          : 'Vous êtes déjà capitaine d\'une autre équipe',
        canRequest: false,
        isCaptain: existingCaptaincy.id === parseInt(id),
        isCaptainOfOtherTeam: existingCaptaincy.id !== parseInt(id)
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Vérifier si l'utilisateur est membre d'une équipe (cette équipe ou une autre)
    const existingMembership = await prisma.teamMember.findFirst({
      where: { user_id: user.id },
      include: {
        team: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (existingMembership) {
      return new Response(JSON.stringify({
        status: existingMembership.team.id === parseInt(id) ? 'MEMBER' : 'OTHER_TEAM',
        message: existingMembership.team.id === parseInt(id)
          ? 'Vous êtes membre de cette équipe'
          : `Vous êtes déjà membre de l'équipe ${existingMembership.team.name}`,
        canRequest: false,
        isMember: existingMembership.team.id === parseInt(id),
        isInOtherTeam: existingMembership.team.id !== parseInt(id)
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Vérifier si l'utilisateur a une demande en attente pour une équipe
    const pendingRequest = await prisma.teamJoinRequest.findFirst({
      where: {
        user_id: user.id,
        status: 'PENDING'
      },
      include: {
        team: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (pendingRequest) {
      return new Response(JSON.stringify({
        status: 'PENDING',
        request: pendingRequest,
        canRequest: false,
        message: pendingRequest.team.id === parseInt(id)
          ? 'Votre demande est en attente d\'approbation'
          : 'Vous avez déjà une demande d\'approbation sur une autre équipe'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Récupérer la dernière demande de l'utilisateur pour cette équipe
    const joinRequest = await prisma.teamJoinRequest.findFirst({
      where: {
        team_id: parseInt(id),
        user_id: user.id,
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Si aucune demande n'existe
    if (!joinRequest) {
      return new Response(JSON.stringify({
        status: 'CAN_REQUEST',
        canRequest: true,
        isNewUser: true,
        message: 'Vous pouvez faire une demande pour rejoindre cette équipe'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Si une demande existe, retourner son statut
    return new Response(JSON.stringify({
      status: joinRequest.status,
      request: joinRequest,
      canRequest: joinRequest.status === 'REJECTED',
      message: joinRequest.status === 'PENDING' 
        ? 'Votre demande est en attente d\'approbation'
        : joinRequest.status === 'REJECTED'
        ? 'Votre demande précédente a été refusée'
        : null
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Erreur lors de la vérification du statut:', error);
    return new Response(JSON.stringify({ 
      error: 'Erreur lors de la vérification du statut',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  } finally {
    await prisma.$disconnect();
  }
}
