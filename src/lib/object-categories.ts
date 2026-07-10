/**
 * OBJECT-CATEGORIES-FEATURE: Object Category Utilities
 *
 * Central definitions for the object category system (20 categories).
 * Used by:
 *   - Form /inscrire (category selector)
 *   - Pages /scan & /suivi (conditional rendering)
 *   - API activate, scan, suivi (validation + response)
 *
 * Types:
 *   - ObjectCategory: union type for all 20 object categories
 *
 * Helpers:
 *   - OBJECT_CATEGORIES: full list with metadata
 *   - OBJECT_ICONS: emoji per category
 *   - OBJECT_LABELS: i18n label per category × language
 *   - OBJECT_DESCRIPTIONS: i18n description per category × language
 *   - safeObjectCategory(): fallback for legacy/null values
 *   - getObjectLabel(): get localized label
 *   - getObjectIcon(): get emoji icon
 */

import type { Language } from './i18n';

// ═══════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════

/** All 20 object categories */
export type ObjectCategory =
  | 'ordinateur'
  | 'telephone'
  | 'ecouteurs'
  | 'passeport'
  | 'carte_identite'
  | 'cles'
  | 'portefeuille'
  | 'montre'
  | 'tablette'
  | 'appareil_photo'
  | 'lunettes'
  | 'sac_a_dos'
  | 'parapluie'
  | 'chargeur'
  | 'livre'
  | 'cle_usb'
  | 'bouteille'
  | 'medicaments'
  | 'jouet'
  | 'documents';

/** All valid categories (for validation) */
export const OBJECT_CATEGORY_LIST: ObjectCategory[] = [
  'ordinateur',
  'telephone',
  'ecouteurs',
  'passeport',
  'carte_identite',
  'cles',
  'portefeuille',
  'montre',
  'tablette',
  'appareil_photo',
  'lunettes',
  'sac_a_dos',
  'parapluie',
  'chargeur',
  'livre',
  'cle_usb',
  'bouteille',
  'medicaments',
  'jouet',
  'documents',
];

/** Top 5 featured categories (shown prominently) */
export const FEATURED_CATEGORIES: ObjectCategory[] = [
  'ordinateur',
  'telephone',
  'ecouteurs',
  'passeport',
  'carte_identite',
];

// ═══════════════════════════════════════════════════════
//  ICONS (Emojis)
// ═══════════════════════════════════════════════════════

/** Emoji icon for each category */
export const OBJECT_ICONS: Record<ObjectCategory, string> = {
  ordinateur: '💻',
  telephone: '📱',
  ecouteurs: '🎧',
  passeport: '🛂',
  carte_identite: '🪪',
  cles: '🔑',
  portefeuille: '👛',
  montre: '⌚',
  tablette: '📲',
  appareil_photo: '📷',
  lunettes: '👓',
  sac_a_dos: '🎒',
  parapluie: '☂️',
  chargeur: '🔌',
  livre: '📚',
  cle_usb: '💾',
  bouteille: '💧',
  medicaments: '💊',
  jouet: '🧸',
  documents: '📄',
};

// ═══════════════════════════════════════════════════════
//  LABELS i18n
// ═══════════════════════════════════════════════════════

/** Short labels for each category × language */
export const OBJECT_LABELS: Record<ObjectCategory, Record<Language, string>> = {
  ordinateur:    { fr: 'Ordinateur', en: 'Laptop', ar: 'حاسوب محمول' },
  telephone:     { fr: 'Téléphone', en: 'Phone', ar: 'هاتف' },
  ecouteurs:     { fr: 'Écouteurs', en: 'Headphones', ar: 'سماعات' },
  passeport:     { fr: 'Passeport', en: 'Passport', ar: 'جواز سفر' },
  carte_identite:{ fr: "Carte d'identité", en: 'ID Card', ar: 'بطاقة هوية' },
  cles:          { fr: 'Clés', en: 'Keys', ar: 'مفاتيح' },
  portefeuille:  { fr: 'Portefeuille', en: 'Wallet', ar: 'محفظة' },
  montre:        { fr: 'Montre', en: 'Watch', ar: 'ساعة' },
  tablette:      { fr: 'Tablette', en: 'Tablet', ar: 'جهاز لوحي' },
  appareil_photo:{ fr: 'Appareil photo', en: 'Camera', ar: 'كاميرا' },
  lunettes:      { fr: 'Lunettes', en: 'Glasses', ar: 'نظارات' },
  sac_a_dos:     { fr: 'Sac à dos', en: 'Backpack', ar: 'حقيبة ظهر' },
  parapluie:     { fr: 'Parapluie', en: 'Umbrella', ar: 'مظلة' },
  chargeur:      { fr: 'Chargeur', en: 'Charger', ar: 'شاحن' },
  livre:         { fr: 'Livre', en: 'Book', ar: 'كتاب' },
  cle_usb:       { fr: 'Clé USB', en: 'USB Drive', ar: 'فلاشة USB' },
  bouteille:     { fr: 'Bouteille', en: 'Bottle', ar: 'زجاجة' },
  medicaments:   { fr: 'Médicaments', en: 'Medication', ar: 'أدوية' },
  jouet:         { fr: 'Jouet', en: 'Toy', ar: 'لعبة' },
  documents:     { fr: 'Documents', en: 'Documents', ar: 'وثائق' },
};

/** Descriptions under each category button × language */
export const OBJECT_DESCRIPTIONS: Record<ObjectCategory, Record<Language, string>> = {
  ordinateur:    { fr: 'Portable, PC...', en: 'Laptop, PC...', ar: 'حاسوب محمول...' },
  telephone:     { fr: 'Mobile, iPhone...', en: 'Mobile, iPhone...', ar: 'هاتف محمول...' },
  ecouteurs:     { fr: 'AirPods, Sony...', en: 'AirPods, Sony...', ar: 'سماعات...' },
  passeport:     { fr: 'Passeport biométrique', en: 'Biometric passport', ar: 'جواز سفر بيومتري' },
  carte_identite:{ fr: "CNI, permis", en: 'ID, license', ar: 'بطاقة هوية، رخصة' },
  cles:          { fr: 'Maison, voiture...', en: 'Home, car...', ar: 'منزل، سيارة...' },
  portefeuille:  { fr: 'Cartes, espèces', en: 'Cards, cash', ar: 'بطاقات، نقود' },
  montre:        { fr: 'Smartwatch...', en: 'Smartwatch...', ar: 'ساعة ذكية...' },
  tablette:      { fr: 'iPad, Android...', en: 'iPad, Android...', ar: 'آيباد، أندرويد...' },
  appareil_photo:{ fr: 'DSLR, GoPro...', en: 'DSLR, GoPro...', ar: 'كاميرا، غوبرو...' },
  lunettes:      { fr: 'Soleil, vue...', en: 'Sunglasses, rx...', ar: 'نظارات شمسية...' },
  sac_a_dos:     { fr: 'Sac, besace...', en: 'Bag, satchel...', ar: 'حقيبة ظهر...' },
  parapluie:     { fr: 'Parapluie', en: 'Umbrella', ar: 'مظلة' },
  chargeur:      { fr: 'Secteur, batterie', en: 'Wall, power bank', ar: 'شاحن، بنك طاقة' },
  livre:         { fr: 'Roman, carnet...', en: 'Novel, notebook...', ar: 'رواية، دفتر...' },
  cle_usb:       { fr: 'USB, disque dur', en: 'USB, hard drive', ar: 'فلاشة، قرص صلب' },
  bouteille:     { fr: "Gourde, bouteille", en: 'Bottle, flask', ar: 'زجاجة ماء' },
  medicaments:   { fr: 'Ordonnance, soins', en: 'Prescription, care', ar: 'وصفة طبية، علاج' },
  jouet:         { fr: "Peluche, jeu...", en: 'Plush, game...', ar: 'دمية، لعبة...' },
  documents:     { fr: 'Contrats, diplômes', en: 'Contracts, degrees', ar: 'عقود، شهادات' },
};

// ═══════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════

/**
 * Retourne une ObjectCategory sûr, avec fallback sur 'telephone'.
 */
export function safeObjectCategory(cat: string | null | undefined): ObjectCategory {
  if (cat && OBJECT_CATEGORY_LIST.includes(cat as ObjectCategory)) {
    return cat as ObjectCategory;
  }
  return 'telephone';
}

/**
 * Retourne le label localisé d'une catégorie d'objet.
 */
export function getObjectLabel(category: ObjectCategory, lang: Language): string {
  return OBJECT_LABELS[category]?.[lang] ?? OBJECT_LABELS[category].fr;
}

/**
 * Retourne l'icône emoji d'une catégorie d'objet.
 */
export function getObjectIcon(category: ObjectCategory): string {
  return OBJECT_ICONS[category] ?? '📦';
}