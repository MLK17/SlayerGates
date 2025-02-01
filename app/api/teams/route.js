import { PrismaClient } from '@prisma/client';
import { writeFile } from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      include: {
        school: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                pseudo: true,
                avatar: true
              }
            }
          }
        },
        tournaments: true,
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return new Response(JSON.stringify(teams), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des équipes:', error);
    return new Response(JSON.stringify({ error: 'Erreur lors de la récupération des équipes' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const name = formData.get('name');
    const school_id = parseInt(formData.get('school_id'));
    const logo = formData.get('logo');

    if (!name || !school_id) {
      return Response.json({ error: 'Nom de l\'équipe et école requis' }, { status: 400 });
    }

    let logoPath = null;
    if (logo) {
      const bytes = await logo.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `team-${Date.now()}-${logo.name}`;
      const filePath = path.join(process.cwd(), 'public', 'uploads', 'teams', fileName);
      await writeFile(filePath, buffer);
      logoPath = `/uploads/teams/${fileName}`;
    }

    const team = await prisma.team.create({
      data: {
        name,
        school_id,
        captain_id: 1, // À remplacer par l'ID de l'utilisateur connecté
        logo: logoPath,
      },
      include: {
        school: true,
      },
    });

    return Response.json(team);
  } catch (error) {
    console.error('Erreur lors de la création de l\'équipe:', error);
    return Response.json({ error: 'Erreur lors de la création de l\'équipe' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 