import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request, { params }) {
  let client;
  try {
    client = await prisma.$connect();
    console.log('Début de l\'inscription au tournoi');

    // Vérifier l'authentification
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    console.log('Token trouvé:', !!token);

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }), 
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const userData = await verifyAuth(token.value);
    console.log('Utilisateur authentifié:', !!userData);
    
    if (!userData) {
      return new Response(
        JSON.stringify({ error: 'Token invalide' }), 
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const body = await request.json();
    console.log('Corps de la requête reçu:', body);
    
    const { teamId, playerIds } = body;
    console.log('Données extraites:', { teamId, playerIds });

    if (!teamId || !playerIds || !Array.isArray(playerIds) || playerIds.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Données invalides',
          received: { teamId, playerIds }
        }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const tournamentId = parseInt(params.id, 10);
    console.log('ID du tournoi:', tournamentId);

    // Vérifier si l'utilisateur est le capitaine de l'équipe
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { 
        captain: true,
        members: true
      }
    });

    console.log('Équipe trouvée:', team ? {
      id: team.id,
      name: team.name,
      captain_id: team.captain_id,
      members_count: team.members.length
    } : null);

    if (!team) {
      return new Response(
        JSON.stringify({ error: 'Équipe non trouvée' }), 
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (team.captain.id !== userData.id) {
      return new Response(
        JSON.stringify({ error: 'Seul le capitaine peut inscrire l\'équipe' }), 
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Vérifier si le tournoi existe et n'est pas complet
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: { teams: true }
    });

    if (!tournament) {
      return new Response(
        JSON.stringify({ error: 'Tournoi non trouvé' }), 
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Vérifier le nombre de joueurs requis
    if (playerIds.length !== tournament.players_per_team) {
      return new Response(
        JSON.stringify({ 
          error: `Le nombre de joueurs sélectionnés (${playerIds.length}) ne correspond pas au nombre requis (${tournament.players_per_team})`,
          required: tournament.players_per_team,
          selected: playerIds.length
        }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Vérifier que tous les joueurs sont membres de l'équipe
    const allPlayersAreMembersOfTeam = playerIds.every(playerId => 
      team.members.some(member => member.user_id === playerId)
    );

    if (!allPlayersAreMembersOfTeam) {
      return new Response(
        JSON.stringify({ 
          error: 'Certains joueurs sélectionnés ne font pas partie de l\'équipe',
          teamMembers: team.members.map(m => m.user_id),
          selectedPlayers: playerIds
        }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (tournament.teams.length >= tournament.max_players) {
      return new Response(
        JSON.stringify({ error: 'Le tournoi est complet' }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Vérifier si l'équipe est déjà inscrite
    const existingRegistration = await prisma.tournamentTeam.findUnique({
      where: {
        tournament_id_team_id: {
          tournament_id: tournamentId,
          team_id: teamId
        }
      }
    });

    if (existingRegistration) {
      return new Response(
        JSON.stringify({ error: 'L\'équipe est déjà inscrite à ce tournoi' }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Créer l'inscription
    const registration = await prisma.tournamentTeam.create({
      data: {
        tournament_id: tournamentId,
        team_id: teamId,
        registered_at: new Date(),
        participating_players: playerIds
      }
    });

    console.log('Inscription créée:', registration);

    return new Response(
      JSON.stringify({
        message: 'Inscription réussie',
        registration
      }), 
      { 
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Une erreur est survenue lors de l\'inscription',
        details: error.message
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } finally {
    if (client) {
      await prisma.$disconnect();
    }
  }
}
