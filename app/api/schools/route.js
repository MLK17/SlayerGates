import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const schools = await prisma.school.findMany({
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        city: true
      }
    });

    return Response.json({ schools });
  } catch (error) {
    console.error('Erreur lors de la récupération des écoles:', error);
    return Response.json(
      { error: 'Erreur lors de la récupération des écoles' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request) {
  try {
    const { name, city } = await request.json();

    if (!name || !city) {
      return Response.json(
        { error: 'Le nom et la ville de l\'école sont requis' },
        { status: 400 }
      );
    }

    // Vérifier si une école avec ce nom existe déjà dans cette ville
    const existingSchool = await prisma.school.findFirst({
      where: {
        name,
        city
      }
    });

    if (existingSchool) {
      return Response.json(
        { error: 'Une école avec ce nom existe déjà dans cette ville' },
        { status: 400 }
      );
    }

    const school = await prisma.school.create({
      data: {
        name,
        city
      },
      select: {
        id: true,
        name: true,
        city: true
      }
    });

    return Response.json({ school });
  } catch (error) {
    console.error('Erreur lors de la création de l\'école:', error);
    return Response.json(
      { error: 'Erreur lors de la création de l\'école' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}