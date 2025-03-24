import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import path from 'path';

const prisma = new PrismaClient();

// Fonction pour valider le logo
function isValidLogo(logo) {
  if (!logo) return true; // Le logo est optionnel
  
  // Vérifier l'extension du fichier
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const extension = logo.substring(logo.lastIndexOf('.')).toLowerCase();
  return validExtensions.includes(extension);
}

export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      include: {
        school: {
          select: {
            id: true,
            name: true,
            city: true
          }
        },
        captain: {
          select: {
            id: true,
            pseudo: true,
            email: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                pseudo: true,
                email: true
              }
            }
          }
        }
      }
    });

    return new Response(
      JSON.stringify({ teams }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Erreur lors de la récupération des équipes:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur lors de la récupération des équipes' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request) {
  try {
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

    const formData = await request.formData();
    const name = formData.get('name');
    const school_id = formData.get('school_id');
    const logo = formData.get('logo');

    if (!name || !school_id) {
      return new Response(
        JSON.stringify({ error: 'Le nom de l\'équipe et l\'école sont requis' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Valider le logo si présent
    if (logo && !isValidLogo(logo.name)) {
      return new Response(
        JSON.stringify({ error: 'Format de logo invalide. Formats acceptés : JPG, JPEG, PNG, WEBP' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    let logoData = null;
    if (logo) {
      // Convertir le fichier en Buffer
      const bytes = await logo.arrayBuffer();
      logoData = Buffer.from(bytes).toString('base64');
    }

    // Vérifier si l'utilisateur appartient déjà à une équipe
    const existingMembership = await prisma.teamMember.findFirst({
      where: {
        user_id: user.id
      },
      include: {
        team: true
      }
    });

    if (existingMembership) {
      return new Response(
        JSON.stringify({ 
          error: 'Vous êtes déjà membre d\'une équipe',
          team: existingMembership.team 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Vérifier si l'utilisateur est déjà capitaine d'une équipe
    const existingCaptaincy = await prisma.team.findFirst({
      where: {
        captain_id: user.id
      }
    });

    if (existingCaptaincy) {
      return new Response(
        JSON.stringify({ 
          error: 'Vous êtes déjà capitaine d\'une équipe',
          team: existingCaptaincy 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Vérifier si l'utilisateur a une demande en attente
    const pendingRequest = await prisma.teamJoinRequest.findFirst({
      where: {
        user_id: user.id,
        status: 'pending'
      }
    });

    if (pendingRequest) {
      return new Response(
        JSON.stringify({ error: 'Vous avez déjà une demande en attente' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Vérifier si l'utilisateur a déjà une équipe dans cette école
    const existingTeamInSchool = await prisma.team.findFirst({
      where: {
        school_id: parseInt(school_id),
        OR: [
          { captain_id: user.id },
          {
            members: {
              some: {
                user_id: user.id
              }
            }
          }
        ]
      }
    });

    if (existingTeamInSchool) {
      return new Response(
        JSON.stringify({ 
          error: 'Vous avez déjà une équipe dans cette école',
          team: existingTeamInSchool 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Créer l'équipe
    const team = await prisma.team.create({
      data: {
        name,
        school_id: parseInt(school_id),
        captain_id: user.id,
        logo: logoData, // Stockage du logo en base64 dans la BDD
        created_at: new Date()
      },
      include: {
        school: true,
        captain: true
      }
    });

    // Ajouter automatiquement le créateur comme membre de l'équipe
    await prisma.teamMember.create({
      data: {
        team_id: team.id,
        user_id: user.id,
        role: 'captain',
        joined_at: new Date()
      }
    });

    return new Response(
      JSON.stringify({ 
        message: 'Équipe créée avec succès',
        team 
      }),
      { 
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Erreur lors de la création de l\'équipe:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur lors de la création de l\'équipe' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}