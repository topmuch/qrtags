import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Création des utilisateurs de test...');

  // Créer une agence de test
  const agency = await prisma.agency.upsert({
    where: { slug: 'diop' },
    update: {},
    create: {
      name: 'FRANCINE MAKELA',
      slug: 'diop',
      email: 'contact@francine-makela.com',
      phone: '+221 77 123 45 67',
      address: 'Dakar, Sénégal',
      active: true,
      agencyType: 'travel',
      plan: 'free',
      onboardingCompleted: true,
      maxTags: 5,
      tagsUsed: 0,
    },
  });

  console.log('✅ Agence créée:', agency.name);

  // Hasher les mots de passe
  const adminPassword = await bcrypt.hash('admin123', 10);
  const agencyPassword = await bcrypt.hash('agence123', 10);

  // Créer l'utilisateur SuperAdmin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@qrtag.com' },
    update: {
      password: adminPassword,
      role: 'superadmin',
    },
    create: {
      email: 'admin@qrtag.com',
      name: 'Super Admin',
      password: adminPassword,
      role: 'superadmin',
    },
  });

  console.log('✅ SuperAdmin créé:', admin.email);

  // Créer l'utilisateur Agence
  const agencyUser = await prisma.user.upsert({
    where: { email: 'agence@qrtag.com' },
    update: {
      password: agencyPassword,
      role: 'agency',
      agencyId: agency.id,
    },
    create: {
      email: 'agence@qrtag.com',
      name: 'FRANCINE MAKELA',
      password: agencyPassword,
      role: 'agency',
      agencyId: agency.id,
    },
  });

  console.log('✅ Utilisateur Agence créé:', agencyUser.email);

  console.log('\n🎉 Comptes de test prêts !');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔐 Admin: admin@qrtag.com / admin123');
  console.log('🏢 Agence: agence@qrtag.com / agence123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
