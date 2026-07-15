import { AgencyTypeConfig, AgencyCustomField } from './qrtags-types';

type AgencyCustomFieldInput = Omit<AgencyCustomField, 'id'>;

export const AGENCY_TYPES: AgencyTypeConfig[] = [
  {
    type: 'travel',
    label: 'Voyage & Tourisme',
    emoji: '✈️',
    description: 'Étiquettes QR pour bagages de voyageurs, valises et effets personnels',
    badgeColor: 'bg-blue-100 text-blue-800',
    icon: 'Plane',
    features: ['Suivi de bagages en temps réel', 'Notification WhatsApp automatique', 'Géolocalisation des scans', 'Rapports de perte'],
    useCases: ['Bagages aéroport', 'Valises de croisière', 'Sacs de voyage groupe']
  },
  {
    type: 'hotel',
    label: 'Hôtellerie',
    emoji: '🏨',
    description: 'Gestion des effets des clients, clés et objets trouvés',
    badgeColor: 'bg-purple-100 text-purple-800',
    icon: 'Hotel',
    features: ['Gestion des objets trouvés', 'Étiquettes chambre / coffre', 'Suivi du personnel', 'Service client amélioré'],
    useCases: ['Objets trouvés', 'Étiquettes bagages VIP', 'Gestion clés']
  },
  {
    type: 'bus',
    label: 'Transport & Bus',
    emoji: '🚌',
    description: 'Suivi des bagages en bus, autocars et transports en commun',
    badgeColor: 'bg-green-100 text-green-800',
    icon: 'Bus',
    features: ['Suivi bagages soute', 'Gestion des correspondances', 'Preuve de remise', 'Statistiques de transport'],
    useCases: ['Bagages bus intercity', 'Colis transportés', 'Équipements sportifs']
  },
  {
    type: 'school',
    label: 'Éducation',
    emoji: '🎓',
    description: 'Étiquettes pour cartables, fournitures et effets scolaires',
    badgeColor: 'bg-amber-100 text-amber-800',
    icon: 'GraduationCap',
    features: ['Identification des effets', 'Gestion des pertes', 'Communication parents', 'Inventaire scolaire'],
    useCases: ['Cartables', 'Fournitures', 'Tenues sportives', 'Manuels']
  },
  {
    type: 'medical',
    label: 'Santé & Médical',
    emoji: '🏥',
    description: 'Traçabilité du matériel médical, dossiers et équipements',
    badgeColor: 'bg-red-100 text-red-800',
    icon: 'Stethoscope',
    features: ['Traçabilité matériel', 'Gestion des dossiers', 'Suivi des équipements', 'Conformité sanitaire'],
    useCases: ['Équipements médicaux', 'Dossiers patients', 'Matériel de labo']
  },
  {
    type: 'company',
    label: 'Entreprise',
    emoji: '🏢',
    description: 'Étiquettes pour matériel informatique, clés et biens de l\'entreprise',
    badgeColor: 'bg-slate-100 text-slate-800',
    icon: 'Building2',
    features: ['Inventaire matériel', 'Gestion des clés', 'Suivi des actifs', 'Attribution employés'],
    useCases: ['Matériel IT', 'Clés bureaux', 'Véhicules', 'Outils']
  },
  {
    type: 'event',
    label: 'Événements',
    emoji: '🎪',
    description: 'Badges, accréditations et gestion du matériel événementiel',
    badgeColor: 'bg-pink-100 text-pink-800',
    icon: 'PartyPopper',
    features: ['Badges participants', 'Gestion du matériel', 'Contrôle d\'accès', 'Suivi des équipements'],
    useCases: ['Festivals', 'Conférences', 'Salons', 'Événements sportifs']
  }
];

export const AGENCY_CUSTOM_FIELDS: Record<string, AgencyCustomFieldInput[]> = {
  travel: [
    { agencyType: 'travel', fieldName: 'destination', fieldType: 'text', label: 'Destination', placeholder: 'Ex: Paris, Dakar...', required: false, options: null, sortOrder: 0 },
    { agencyType: 'travel', fieldName: 'flightNumber', fieldType: 'text', label: 'Numéro de vol', placeholder: 'Ex: AF1234', required: false, options: null, sortOrder: 1 },
    { agencyType: 'travel', fieldName: 'travelDate', fieldType: 'date', label: 'Date de voyage', placeholder: null, required: false, options: null, sortOrder: 2 },
    { agencyType: 'travel', fieldName: 'luggageType', fieldType: 'select', label: 'Type de bagage', placeholder: 'Sélectionner...', required: true, options: ['Valise cabine', 'Valise soute', 'Sac à dos', 'Sac voyage', 'Pochette documents'], sortOrder: 3 },
  ],
  hotel: [
    { agencyType: 'hotel', fieldName: 'roomNumber', fieldType: 'text', label: 'Numéro de chambre', placeholder: 'Ex: 204', required: true, options: null, sortOrder: 0 },
    { agencyType: 'hotel', fieldName: 'checkInDate', fieldType: 'date', label: 'Date d\'arrivée', placeholder: null, required: true, options: null, sortOrder: 1 },
    { agencyType: 'hotel', fieldName: 'checkOutDate', fieldType: 'date', label: 'Date de départ', placeholder: null, required: true, options: null, sortOrder: 2 },
    { agencyType: 'hotel', fieldName: 'guestType', fieldType: 'select', label: 'Type de client', placeholder: 'Sélectionner...', required: false, options: ['Touriste', 'Business', 'VIP', 'Groupe'], sortOrder: 3 },
  ],
  bus: [
    { agencyType: 'bus', fieldName: 'routeNumber', fieldType: 'text', label: 'Numéro de ligne', placeholder: 'Ex: L45', required: true, options: null, sortOrder: 0 },
    { agencyType: 'bus', fieldName: 'departureCity', fieldType: 'text', label: 'Ville de départ', placeholder: 'Ex: Dakar', required: true, options: null, sortOrder: 1 },
    { agencyType: 'bus', fieldName: 'arrivalCity', fieldType: 'text', label: 'Ville d\'arrivée', placeholder: 'Ex: Saint-Louis', required: true, options: null, sortOrder: 2 },
    { agencyType: 'bus', fieldName: 'seatNumber', fieldType: 'text', label: 'Numéro de siège', placeholder: 'Ex: 12', required: false, options: null, sortOrder: 3 },
    { agencyType: 'bus', fieldName: 'travelDate', fieldType: 'date', label: 'Date de voyage', placeholder: null, required: true, options: null, sortOrder: 4 },
  ],
  school: [
    { agencyType: 'school', fieldName: 'studentName', fieldType: 'text', label: 'Nom de l\'élève', placeholder: 'Nom complet', required: true, options: null, sortOrder: 0 },
    { agencyType: 'school', fieldName: 'classRoom', fieldType: 'text', label: 'Classe', placeholder: 'Ex: CM2, 6ème...', required: true, options: null, sortOrder: 1 },
    { agencyType: 'school', fieldName: 'itemType', fieldType: 'select', label: 'Type d\'effet', placeholder: 'Sélectionner...', required: true, options: ['Cartable', 'Trousse', 'Cahier', 'Tenue sportive', 'Calculatrice', 'Manuel', 'Autre'], sortOrder: 2 },
    { agencyType: 'school', fieldName: 'parentPhone', fieldType: 'phone', label: 'Téléphone parent', placeholder: '+221 7X XXX XX XX', required: false, options: null, sortOrder: 3 },
  ],
  medical: [
    { agencyType: 'medical', fieldName: 'equipmentType', fieldType: 'select', label: 'Type d\'équipement', placeholder: 'Sélectionner...', required: true, options: ['Stéthoscope', 'Tensiomètre', 'Thermomètre', 'Oxymètre', 'Défibrillateur', 'Autre'], sortOrder: 0 },
    { agencyType: 'medical', fieldName: 'serialNumber', fieldType: 'text', label: 'Numéro de série', placeholder: 'Ex: SN-2024-001', required: false, options: null, sortOrder: 1 },
    { agencyType: 'medical', fieldName: 'department', fieldType: 'select', label: 'Département', placeholder: 'Sélectionner...', required: true, options: ['Urgences', 'Maternité', 'Pédiatrie', 'Chirurgie', 'Laboratoire', 'Radiologie', 'Pharmacie'], sortOrder: 2 },
    { agencyType: 'medical', fieldName: 'lastMaintenance', fieldType: 'date', label: 'Dernière maintenance', placeholder: null, required: false, options: null, sortOrder: 3 },
    { agencyType: 'medical', fieldName: 'patientId', fieldType: 'text', label: 'ID Patient (si applicable)', placeholder: 'Numéro de dossier', required: false, options: null, sortOrder: 4 },
  ],
  company: [
    { agencyType: 'company', fieldName: 'employeeName', fieldType: 'text', label: 'Nom de l\'employé', placeholder: 'Nom complet', required: true, options: null, sortOrder: 0 },
    { agencyType: 'company', fieldName: 'department', fieldType: 'text', label: 'Département', placeholder: 'Ex: IT, Marketing, RH...', required: true, options: null, sortOrder: 1 },
    { agencyType: 'company', fieldName: 'assetType', fieldType: 'select', label: 'Type de bien', placeholder: 'Sélectionner...', required: true, options: ['Ordinateur portable', 'Téléphone', 'Clé bureau', 'Véhicule', 'Badge accès', 'Outil', 'Autre'], sortOrder: 2 },
    { agencyType: 'company', fieldName: 'serialNumber', fieldType: 'text', label: 'Numéro de série', placeholder: 'Ex: SN-2024-001', required: false, options: null, sortOrder: 3 },
    { agencyType: 'company', fieldName: 'assignedDate', fieldType: 'date', label: 'Date d\'attribution', placeholder: null, required: false, options: null, sortOrder: 4 },
  ],
  event: [
    { agencyType: 'event', fieldName: 'eventName', fieldType: 'text', label: 'Nom de l\'événement', placeholder: 'Ex: Salon Tech 2025', required: true, options: null, sortOrder: 0 },
    { agencyType: 'event', fieldName: 'participantName', fieldType: 'text', label: 'Nom du participant', placeholder: 'Nom complet', required: true, options: null, sortOrder: 1 },
    { agencyType: 'event', fieldName: 'badgeType', fieldType: 'select', label: 'Type de badge', placeholder: 'Sélectionner...', required: true, options: ['Participant', 'Exposant', 'Speaker', 'VIP', 'Organisateur', 'Presse'], sortOrder: 2 },
    { agencyType: 'event', fieldName: 'eventDate', fieldType: 'date', label: 'Date de l\'événement', placeholder: null, required: true, options: null, sortOrder: 3 },
    { agencyType: 'event', fieldName: 'company', fieldType: 'text', label: 'Société / Organisation', placeholder: 'Nom de l\'entreprise', required: false, options: null, sortOrder: 4 },
  ]
};

export function getAgencyTypeConfig(type: string): AgencyTypeConfig | undefined {
  return AGENCY_TYPES.find(t => t.type === type);
}

export function getCustomFieldsForType(type: string): AgencyCustomFieldInput[] {
  return AGENCY_CUSTOM_FIELDS[type] || [];
}