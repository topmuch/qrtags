const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
  const prisma = new PrismaClient();
  try {
    const hash = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
      where: { email: 'admin@qrtags.com' },
      update: { password: hash },
      create: {
        email: 'admin@qrtags.com',
        name: 'SuperAdmin',
        password: hash,
        role: 'superadmin',
      },
    });
    console.log('SuperAdmin created: admin@qrtags.com / admin123');
  } catch (e) {
    console.error('Failed to create admin:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();