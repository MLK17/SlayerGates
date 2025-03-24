const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Nettoyer la base de données dans l'ordre pour respecter les contraintes de clé étrangère
  await prisma.match.deleteMany();
  await prisma.tournamentTeam.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.teamJoinRequest.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();
  await prisma.school.deleteMany();

  // Créer l'utilisateur admin
  const admin = await prisma.user.create({
    data: {
      pseudo: 'admin',
      email: 'melchior.a2r@gmail.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin'
    }
  });

  // Créer les écoles
  const schools = [
    { name: 'Universite Paris-Saclay', city: 'Saclay' },
    { name: 'Telecom Paris', city: 'Paris' },
    { name: 'ESSEC Business School', city: 'Cergy' },
    { name: 'HEC Paris', city: 'Jouy-en-Josas' },
    { name: 'INSA Centre Val de Loire', city: 'Blois' },
    { name: 'EPITA', city: 'Paris' },
    { name: 'Efrei Paris', city: 'Villejuif' }
  ];

  // Créer les écoles dans la base de données
  const createdSchools = [];
  for (const school of schools) {
    const createdSchool = await prisma.school.create({
      data: school
    });
    createdSchools.push(createdSchool);
  }

  // Créer deux utilisateurs pour les équipes
  const user1 = await prisma.user.create({
    data: {
      email: 'player1@example.com',
      password: await bcrypt.hash('player123', 10),
      pseudo: 'Player1',
      role: 'user'
    }
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'player2@example.com',
      password: await bcrypt.hash('player123', 10),
      pseudo: 'Player2',
      role: 'user'
    }
  });

  // Créer deux équipes
  const team1 = await prisma.team.create({
    data: {
      name: 'Team Saclay',
      description: 'L\'équipe de l\'Université Paris-Saclay',
      school: {
        connect: { id: createdSchools[0].id }
      },
      captain: {
        connect: { id: user1.id }
      },
      members: {
        create: {
          user_id: user1.id,
          role: 'captain'
        }
      },
      leaderboard: {
        create: {
          points: 0,
          wins: 0,
          losses: 0
        }
      }
    }
  });

  const team2 = await prisma.team.create({
    data: {
      name: 'Team Telecom',
      description: 'L\'équipe de Telecom Paris',
      school: {
        connect: { id: createdSchools[1].id }
      },
      captain: {
        connect: { id: user2.id }
      },
      members: {
        create: {
          user_id: user2.id,
          role: 'captain'
        }
      },
      leaderboard: {
        create: {
          points: 0,
          wins: 0,
          losses: 0
        }
      }
    }
  });

  // Créer les tournois
  const tournament1 = await prisma.tournament.create({
    data: {
      title: 'League of Legends Championship',
      game: 'League of Legends',
      description: 'Tournoi 5v5 de League of Legends',
      format: 'elimination',
      max_players: 8,
      players_per_team: 5,
      is_online: true,
      start_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Dans 14 jours
      creator_id: admin.id,
      teams: {
        create: [
          { team_id: team1.id },
          { team_id: team2.id }
        ]
      }
    }
  });

  const tournament2 = await prisma.tournament.create({
    data: {
      title: 'Valorant Cup',
      game: 'Valorant',
      description: 'Tournoi 5v5 de Valorant',
      format: 'elimination',
      max_players: 8,
      players_per_team: 5,
      is_online: true,
      start_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // Dans 21 jours
      creator_id: admin.id,
      teams: {
        create: [
          { team_id: team1.id },
          { team_id: team2.id }
        ]
      }
    }
  });

  const tournament3 = await prisma.tournament.create({
    data: {
      title: 'Street Fighter 6 Championship',
      game: 'Street Fighter 6',
      description: 'Tournoi 1v1 de Street Fighter 6 - Que le meilleur combattant gagne !',
      format: 'elimination',
      max_players: 2,
      players_per_team: 1,
      is_online: true,
      start_date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), // Dans 28 jours
      creator_id: admin.id,
      teams: {
        create: [
          { team_id: team1.id },
          { team_id: team2.id }
        ]
      }
    }
  });

  // Créer les matchs
  await prisma.match.create({
    data: {
      tournament_id: tournament1.id,
      round: 1,
      team1_id: team1.id,
      team2_id: team2.id,
      status: 'pending',
      scheduled_time: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // Dans 15 jours
    }
  });

  await prisma.match.create({
    data: {
      tournament_id: tournament2.id,
      round: 1,
      team1_id: team1.id,
      team2_id: team2.id,
      status: 'pending',
      scheduled_time: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000), // Dans 22 jours
    }
  });

  await prisma.match.create({
    data: {
      tournament_id: tournament3.id,
      round: 1,
      team1_id: team1.id,
      team2_id: team2.id,
      status: 'pending',
      scheduled_time: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000), // Dans 29 jours
    }
  });

  // Créer un match complété avec une victoire pour Team Telecom
  const match = await prisma.match.create({
    data: {
      status: 'COMPLETED',
      winner_id: team2.id,
      team1: {
        connect: { id: team1.id }
      },
      team2: {
        connect: { id: team2.id }
      },
      score: '15-10',
      scheduled_time: new Date(),
      completed_time: new Date(),
      created_at: new Date(),
      tournament: {
        connect: { id: tournament1.id }
      },
      round: 1
    }
  });

  // Mettre à jour les statistiques de Team Telecom
  await prisma.leaderboard.update({
    where: { team_id: team2.id },
    data: {
      points: 3,
      wins: 1,
      losses: 0
    }
  });

  // Mettre à jour les statistiques de l'autre équipe
  await prisma.leaderboard.update({
    where: { team_id: team1.id },
    data: {
      points: 0,
      wins: 0,
      losses: 1
    }
  });

  console.log('Base de données réinitialisée avec succès !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });