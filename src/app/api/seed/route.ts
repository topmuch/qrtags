import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AGENCY_CUSTOM_FIELDS } from '@/lib/agency-types-data';

export async function POST() {
  try {
    // Clear existing custom fields
    await db.agencyCustomField.deleteMany();

    // Insert all custom fields
    const entries = Object.entries(AGENCY_CUSTOM_FIELDS);
    for (const [type, fields] of entries) {
      for (const field of fields) {
        await db.agencyCustomField.create({
          data: {
            agencyType: field.agencyType,
            fieldName: field.fieldName,
            fieldType: field.fieldType,
            label: field.label,
            placeholder: field.placeholder,
            required: field.required,
            options: field.options ? JSON.stringify(field.options) : null,
            sortOrder: field.sortOrder,
          }
        });
      }
    }

    const count = await db.agencyCustomField.count();
    return NextResponse.json({ success: true, count, message: `Seeded ${count} custom fields` });
  } catch (error) {
    return NextResponse.json({ error: 'Seed failed', details: String(error) }, { status: 500 });
  }
}