import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    // console.log('ID reçu:', id, 'Type:', typeof id);
    
    if (!id || isNaN(parseInt(id))) {
      // console.log('ID invalide détecté');
      return new Response(JSON.stringify({ error: 'ID d\'équipe invalide' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const teamId = parseInt(id);
    // console.log('ID parsé:', teamId);

    // Vérifier si l'équipe existe avant de faire la requête complète
    const teamExists = await prisma.team.findUnique({
      where: { id: teamId },
      select: { id: true }
    });

    // console.log('Vérification initiale de l\'équipe:', teamExists ? 'existe' : 'n\'existe pas');

    if (!teamExists) {
      // console.log('Équipe non trouvée lors de la vérification initiale');
      return new Response(JSON.stringify({ error: 'Équipe non trouvée' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // console.log('Fetching team data for ID:', teamId);

    // Récupérer les informations complètes de l'équipe
    // console.log('Tentative de récupération des détails de l\'équipe');
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        school: true,
        captain: {
          select: {
            id: true,
            pseudo: true,
            avatar: true,
            email: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                pseudo: true,
                avatar: true,
                email: true
              }
            }
          }
        },
        tournaments: {
          include: {
            tournament: {
              select: {
                id: true,
                title: true,
                start_date: true,
                end_date: true
              }
            }
          }
        },
        join_requests: {
          where: {
            status: 'PENDING'
          },
          include: {
            user: {
              select: {
                id: true,
                pseudo: true,
                avatar: true,
                email: true
              }
            }
          }
        }
      }
    });

    // console.log('Team data fetched successfully:', team);

    // console.log('Détails de l\'équipe récupérés:', {
    //   id: team.id,
    //   name: team.name,
    //   schoolId: team.school?.id,
    //   captainId: team.captain?.id,
    //   membersCount: team.members?.length,
    //   tournamentsCount: team.tournaments?.length
    // });

    // Vérifier si l'utilisateur est authentifié pour inclure des informations supplémentaires
    let userInfo = {
      isCaptain: false,
      isMember: false,
      hasPendingRequest: false
    };

    const cookiesInstance = await cookies();
    const token = cookiesInstance.get('token');
    
    if (token?.value) {
      try {
        const user = await verifyAuth(token.value);
        if (user) {
          userInfo = {
            isCaptain: team.captain?.id === user.id,
            isMember: team.members?.some(member => member.user?.id === user.id) || false,
            hasPendingRequest: team.join_requests?.some(request => request.user?.id === user.id) || false
          };
          // console.log('Informations utilisateur:', userInfo);
        }
      } catch (error) {
        // console.error('Erreur lors de la vérification de l\'authentification:', error);
      }
    }

    // Construire la réponse avec uniquement les données nécessaires
    const cleanTeam = {
      id: team.id,
      name: team.name,
      logo: team.logo || null,
      created_at: team.created_at,
      school: team.school ? {
        id: team.school.id,
        name: team.school.name
      } : null,
      captain: team.captain ? {
        id: team.captain.id,
        pseudo: team.captain.pseudo,
        avatar: team.captain.avatar
      } : null,
      members: (team.members || []).map(member => ({
        id: member.id,
        user: member.user ? {
          id: member.user.id,
          pseudo: member.user.pseudo,
          avatar: member.user.avatar
        } : null
      })),
      tournaments: (team.tournaments || []).map(tt => ({
        id: tt.tournament.id,
        name: tt.tournament.title,
        start_date: tt.tournament.start_date,
        end_date: tt.tournament.end_date,
        registered_at: tt.registered_at
      })),
      join_requests: (team.join_requests || []).map(request => ({
        id: request.id,
        created_at: request.created_at,
        user: request.user ? {
          id: request.user.id,
          pseudo: request.user.pseudo,
          avatar: request.user.avatar
        } : null
      })),
      userInfo
    };

    // console.log('Réponse préparée avec succès');
    return new Response(JSON.stringify(cleanTeam), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    // console.error('Erreur détaillée:', {
    //   message: error.message,
    //   stack: error.stack,
    //   code: error.code,
    //   meta: error.meta
    // });
    return new Response(JSON.stringify({ 
      error: 'Erreur lors de la récupération de l\'équipe',
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        code: error.code,
        meta: error.meta
      } : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    
    // Vérifier l'authentification
    const cookieStore = cookies();
    const token = cookieStore.get('token');
    
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const user = await verifyAuth(token.value);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Vérifier si l'équipe existe et si l'utilisateur est le capitaine
    const team = await prisma.team.findUnique({
      where: { id: parseInt(id) }
    });

    if (!team) {
      return new Response(
        JSON.stringify({ error: 'Équipe non trouvée' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (team.captain_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Seul le capitaine peut modifier le logo de l\'équipe' }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const formData = await request.formData();
    const logo = formData.get('logo');

    let logoData = null;
    if (logo) {
      // Convertir le fichier en Buffer
      const bytes = await logo.arrayBuffer();
      logoData = Buffer.from(bytes).toString('base64');
    }

    // Mettre à jour le logo
    const updatedTeam = await prisma.team.update({
      where: { id: parseInt(id) },
      data: { 
        logo: logoData
      },
      include: {
        school: true,
        captain: true
      }
    });

    return new Response(
      JSON.stringify({ 
        message: 'Logo mis à jour avec succès',
        team: updatedTeam 
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Erreur lors de la mise à jour du logo:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur lors de la mise à jour du logo' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
