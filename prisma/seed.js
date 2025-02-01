const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  // Création des écoles
  const schools = [
    { name: 'EPITECH', city: 'Paris' },
    { name: '42', city: 'Paris' },
    { name: 'EPITA', city: 'Paris' },
    { name: 'Supinfo', city: 'Paris' },
    { name: 'ETNA', city: 'Paris' }
  ];

  for (const school of schools) {
    await prisma.school.upsert({
      where: { name: school.name },
      update: {},
      create: school,
    });
  }

  // Création de l'utilisateur admin
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  
  await prisma.user.upsert({
    where: { email: 'melchior.a2r@gmail.com' },
    update: {},
    create: {
      email: 'melchior.a2r@gmail.com',
      pseudo: 'AdminSlayer',
      password: hashedPassword,
      role: 'admin'
    },
  });

  console.log('Base de données initialisée avec succès');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 