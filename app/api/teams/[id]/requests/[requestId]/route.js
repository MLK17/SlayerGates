import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
  try {
    const { id, requestId } = params;
    const { action } = await request.json();

    if (!['APPROVED', 'REJECTED'].includes(action)) {
      return new Response(JSON.stringify({ error: 'Action invalide' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

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

    // Vérifier si l'utilisateur est le capitaine de l'équipe
    const team = await prisma.team.findUnique({
      where: { id: parseInt(id) },
      include: {
        captain: {
          select: {
            id: true,
            pseudo: true,
            email: true
          }
        }
      }
    });

    if (!team || team.captain.id !== user.id) {
      return new Response(JSON.stringify({ error: 'Non autorisé' }), { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Mettre à jour la demande et potentiellement ajouter le membre
    const result = await prisma.$transaction(async (prisma) => {
      const joinRequest = await prisma.teamJoinRequest.findUnique({
        where: { id: parseInt(requestId) },
        include: {
          user: {
            select: {
              id: true,
              pseudo: true,
              email: true
            }
          }
        }
      });

      if (!joinRequest) {
        throw new Error('Demande non trouvée');
      }

      if (joinRequest.status !== 'PENDING') {
        throw new Error('Cette demande a déjà été traitée');
      }

      // Mettre à jour le statut de la demande
      const updatedRequest = await prisma.teamJoinRequest.update({
        where: { id: joinRequest.id },
        data: { status: action }
      });

      // Si la demande est approuvée, ajouter l'utilisateur à l'équipe
      if (action === 'APPROVED') {
        // Vérifier si l'utilisateur n'est pas déjà dans une équipe
        const existingMembership = await prisma.teamMember.findFirst({
          where: { user_id: joinRequest.user.id }
        });

        if (existingMembership) {
          throw new Error('L\'utilisateur est déjà membre d\'une équipe');
        }

        await prisma.teamMember.create({
          data: {
            team_id: parseInt(id),
            user_id: joinRequest.user.id,
            role: 'MEMBER'
          }
        });

        // TODO: Envoyer une notification à l'utilisateur
        console.log(`
          Email envoyé à ${joinRequest.user.email}:
          Votre demande d'adhésion à l'équipe ${team.name} a été acceptée.
          Vous pouvez maintenant accéder à l'espace de l'équipe.
        `);
      } else {
        // Envoyer une notification de rejet
        console.log(`
          Email envoyé à ${joinRequest.user.email}:
          Votre demande d'adhésion à l'équipe ${team.name} a été refusée.
          Vous pouvez faire une nouvelle demande ultérieurement.
        `);
      }

      return updatedRequest;
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Erreur lors du traitement de la demande:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erreur lors du traitement de la demande',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  } finally {
    await prisma.$disconnect();
  }
}
