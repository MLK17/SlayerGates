import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const schools = await prisma.school.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return new Response(JSON.stringify(schools), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des écoles:', error);
    return new Response(JSON.stringify({ error: 'Erreur lors de la récupération des écoles' }), {
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
    const { name, city } = await request.json();

    if (!name || !city) {
      return Response.json({ error: 'Nom et ville requis' }, { status: 400 });
    }

    const school = await prisma.school.create({
      data: {
        name,
        city,
      },
    });

    return Response.json(school);
  } catch (error) {
    console.error('Erreur lors de la création de l\'école:', error);
    return Response.json({ error: 'Erreur lors de la création de l\'école' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 