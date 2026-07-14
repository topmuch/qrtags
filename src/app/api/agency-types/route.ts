import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Agency type definitions
const AGENCY_TYPE_DEFS = [
  { type: 'travel', label: 'Agence de voyage', emoji: '🧳' },
  { type: 'hotel', label: 'Hôtel', emoji: '🏨' },
  { type: 'bus', label: 'Compagnie de bus', emoji: '🚌' },
  { type: 'school', label: 'École / Université', emoji: '🎓' },
  { type: 'medical', label: 'Clinique / Hôpital', emoji: '🏥' },
  { type: 'company', label: 'Entreprise', emoji: '🏢' },
  { type: 'event', label: 'Événementiel', emoji: '🎪' },
] as const;

export type AgencyTypeKey = typeof AGENCY_TYPE_DEFS[number]['type'];

// GET - List all agency types with their custom fields
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Fetch all global (agencyId = null) custom fields
    const where = type ? { agencyType: type, agencyId: null } : { agencyId: null };

    const customFields = await db.agencyCustomField.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });

    // Group fields by agency type
    const fieldsByType = new Map<string, typeof customFields>();
    for (const field of customFields) {
      if (!fieldsByType.has(field.agencyType)) {
        fieldsByType.set(field.agencyType, []);
      }
      fieldsByType.get(field.agencyType)!.push(field);
    }

    // Build response
    const types = AGENCY_TYPE_DEFS.map(def => ({
      type: def.type,
      label: def.label,
      emoji: def.emoji,
      fields: (fieldsByType.get(def.type) || []).map(f => ({
        fieldName: f.fieldName,
        fieldLabel: f.fieldLabel,
        fieldType: f.fieldType,
        isRequired: f.isRequired,
        sortOrder: f.sortOrder,
      })),
    }));

    // If a specific type is requested, return only that one
    if (type) {
      const singleType = types.find(t => t.type === type);
      return NextResponse.json({ type: singleType || null });
    }

    return NextResponse.json({ types });

  } catch (error) {
    console.error('Get agency types error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}