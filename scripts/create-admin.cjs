const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
  const prisma = new PrismaClient();
  try {
    // ─── 1. Create SuperAdmin ───
    const adminHash = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
      where: { email: 'admin@qrtag.com' },
      update: { password: adminHash },
      create: {
        email: 'admin@qrtag.com',
        name: 'SuperAdmin',
        password: adminHash,
        role: 'superadmin',
      },
    });
    console.log('✅ SuperAdmin: admin@qrtag.com / admin123');

    // ─── 2. Create Demo Agency + User ───
    const agencyHash = await bcrypt.hash('agence123', 10);

    const demoAgency = await prisma.agency.upsert({
      where: { slug: 'francine-makela' },
      update: {},
      create: {
        name: 'FRANCINE MAKELA',
        slug: 'francine-makela',
        email: 'contact@francine-makela.com',
        phone: '+221 77 123 45 67',
        address: 'Dakar, Sénégal',
        active: true,
      },
    });

    await prisma.user.upsert({
      where: { email: 'agence@qrtag.com' },
      update: { password: agencyHash },
      create: {
        email: 'agence@qrtag.com',
        name: 'FRANCINE MAKELA',
        password: agencyHash,
        role: 'agency',
        agencyId: demoAgency.id,
      },
    });
    console.log('✅ Agence: agence@qrtag.com / agence123');

  } catch (e) {
    console.error('❌ Failed to create users:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();