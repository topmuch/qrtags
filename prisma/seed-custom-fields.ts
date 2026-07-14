import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Default custom fields per agency type
const CUSTOM_FIELDS = [
  // HÔTEL
  { agencyType: 'hotel', fieldName: 'guest_name', fieldLabel: 'Nom du client', fieldType: 'text', isRequired: true, sortOrder: 1 },
  { agencyType: 'hotel', fieldName: 'room_number', fieldLabel: 'N° chambre', fieldType: 'text', isRequired: true, sortOrder: 2 },
  { agencyType: 'hotel', fieldName: 'check_in_date', fieldLabel: 'Date arrivée', fieldType: 'date', isRequired: true, sortOrder: 3 },
  { agencyType: 'hotel', fieldName: 'check_out_date', fieldLabel: 'Date départ', fieldType: 'date', isRequired: true, sortOrder: 4 },
  { agencyType: 'hotel', fieldName: 'phone', fieldLabel: 'Téléphone', fieldType: 'tel', isRequired: true, sortOrder: 5 },
  { agencyType: 'hotel', fieldName: 'email', fieldLabel: 'Email', fieldType: 'email', isRequired: false, sortOrder: 6 },
  { agencyType: 'hotel', fieldName: 'reservation_id', fieldLabel: 'N° réservation', fieldType: 'text', isRequired: false, sortOrder: 7 },

  // BUS
  { agencyType: 'bus', fieldName: 'passenger_name', fieldLabel: 'Nom passager', fieldType: 'text', isRequired: true, sortOrder: 1 },
  { agencyType: 'bus', fieldName: 'ticket_id', fieldLabel: 'N° billet', fieldType: 'text', isRequired: true, sortOrder: 2 },
  { agencyType: 'bus', fieldName: 'seat_number', fieldLabel: 'N° siège', fieldType: 'text', isRequired: false, sortOrder: 3 },
  { agencyType: 'bus', fieldName: 'departure_city', fieldLabel: 'Ville départ', fieldType: 'text', isRequired: true, sortOrder: 4 },
  { agencyType: 'bus', fieldName: 'arrival_city', fieldLabel: 'Ville arrivée', fieldType: 'text', isRequired: true, sortOrder: 5 },
  { agencyType: 'bus', fieldName: 'travel_date', fieldLabel: 'Date voyage', fieldType: 'date', isRequired: true, sortOrder: 6 },
  { agencyType: 'bus', fieldName: 'bus_number', fieldLabel: 'N° bus', fieldType: 'text', isRequired: true, sortOrder: 7 },
  { agencyType: 'bus', fieldName: 'phone', fieldLabel: 'Téléphone', fieldType: 'tel', isRequired: true, sortOrder: 8 },

  // ÉCOLE
  { agencyType: 'school', fieldName: 'student_name', fieldLabel: 'Nom élève', fieldType: 'text', isRequired: true, sortOrder: 1 },
  { agencyType: 'school', fieldName: 'student_id', fieldLabel: 'Matricule', fieldType: 'text', isRequired: true, sortOrder: 2 },
  { agencyType: 'school', fieldName: 'class', fieldLabel: 'Classe', fieldType: 'text', isRequired: true, sortOrder: 3 },
  { agencyType: 'school', fieldName: 'parent_name', fieldLabel: 'Nom parent', fieldType: 'text', isRequired: true, sortOrder: 4 },
  { agencyType: 'school', fieldName: 'parent_phone', fieldLabel: 'Téléphone parent', fieldType: 'tel', isRequired: true, sortOrder: 5 },
  { agencyType: 'school', fieldName: 'emergency_contact', fieldLabel: 'Contact urgence', fieldType: 'tel', isRequired: false, sortOrder: 6 },
  { agencyType: 'school', fieldName: 'school_year', fieldLabel: 'Année scolaire', fieldType: 'text', isRequired: true, sortOrder: 7 },

  // MÉDICAL
  { agencyType: 'medical', fieldName: 'patient_name', fieldLabel: 'Nom patient', fieldType: 'text', isRequired: true, sortOrder: 1 },
  { agencyType: 'medical', fieldName: 'patient_id', fieldLabel: 'N° dossier', fieldType: 'text', isRequired: true, sortOrder: 2 },
  { agencyType: 'medical', fieldName: 'room_number', fieldLabel: 'Chambre', fieldType: 'text', isRequired: true, sortOrder: 3 },
  { agencyType: 'medical', fieldName: 'admission_date', fieldLabel: 'Date admission', fieldType: 'date', isRequired: true, sortOrder: 4 },
  { agencyType: 'medical', fieldName: 'doctor_name', fieldLabel: 'Médecin traitant', fieldType: 'text', isRequired: false, sortOrder: 5 },
  { agencyType: 'medical', fieldName: 'emergency_contact', fieldLabel: 'Contact urgence', fieldType: 'tel', isRequired: true, sortOrder: 6 },
  { agencyType: 'medical', fieldName: 'blood_type', fieldLabel: 'Groupe sanguin', fieldType: 'text', isRequired: false, sortOrder: 7 },
  { agencyType: 'medical', fieldName: 'allergies', fieldLabel: 'Allergies', fieldType: 'text', isRequired: false, sortOrder: 8 },

  // ENTREPRISE
  { agencyType: 'company', fieldName: 'employee_name', fieldLabel: 'Nom employé', fieldType: 'text', isRequired: true, sortOrder: 1 },
  { agencyType: 'company', fieldName: 'employee_id', fieldLabel: 'Matricule', fieldType: 'text', isRequired: true, sortOrder: 2 },
  { agencyType: 'company', fieldName: 'department', fieldLabel: 'Département', fieldType: 'text', isRequired: true, sortOrder: 3 },
  { agencyType: 'company', fieldName: 'position', fieldLabel: 'Poste', fieldType: 'text', isRequired: false, sortOrder: 4 },
  { agencyType: 'company', fieldName: 'manager_name', fieldLabel: 'Nom responsable', fieldType: 'text', isRequired: false, sortOrder: 5 },
  { agencyType: 'company', fieldName: 'manager_phone', fieldLabel: 'Téléphone responsable', fieldType: 'tel', isRequired: false, sortOrder: 6 },

  // ÉVÉNEMENTIEL
  { agencyType: 'event', fieldName: 'participant_name', fieldLabel: 'Nom participant', fieldType: 'text', isRequired: true, sortOrder: 1 },
  { agencyType: 'event', fieldName: 'ticket_id', fieldLabel: 'N° billet', fieldType: 'text', isRequired: true, sortOrder: 2 },
  { agencyType: 'event', fieldName: 'event_name', fieldLabel: 'Nom événement', fieldType: 'text', isRequired: true, sortOrder: 3 },
  { agencyType: 'event', fieldName: 'event_date', fieldLabel: 'Date événement', fieldType: 'date', isRequired: true, sortOrder: 4 },
  { agencyType: 'event', fieldName: 'badge_type', fieldLabel: 'Type badge', fieldType: 'text', isRequired: false, sortOrder: 5 },
  { agencyType: 'event', fieldName: 'phone', fieldLabel: 'Téléphone', fieldType: 'tel', isRequired: false, sortOrder: 6 },
  { agencyType: 'event', fieldName: 'email', fieldLabel: 'Email', fieldType: 'email', isRequired: false, sortOrder: 7 },
];

async function main() {
  console.log('🌱 Seeding custom fields...');

  // Clear existing global custom fields (agencyId = null)
  const deleted = await prisma.agencyCustomField.deleteMany({
    where: { agencyId: null }
  });
  console.log(`  Cleared ${deleted.count} existing global custom fields`);

  // Insert all default custom fields
  for (const field of CUSTOM_FIELDS) {
    await prisma.agencyCustomField.create({
      data: {
        agencyType: field.agencyType,
        fieldName: field.fieldName,
        fieldLabel: field.fieldLabel,
        fieldType: field.fieldType,
        isRequired: field.isRequired,
        sortOrder: field.sortOrder,
      }
    });
  }

  console.log(`  ✅ Inserted ${CUSTOM_FIELDS.length} custom fields across 6 agency types`);
  console.log('');
  console.log('Agency types:');
  const types = [...new Set(CUSTOM_FIELDS.map(f => f.agencyType))];
  for (const type of types) {
    const count = CUSTOM_FIELDS.filter(f => f.agencyType === type).length;
    console.log(`  ${type}: ${count} fields`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });