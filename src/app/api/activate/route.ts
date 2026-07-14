import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateExpirationDate } from '@/lib/qr';
import { z } from 'zod';

// Validation schema for activation - oriented lost baggage
const activateSchema = z.object({
  reference: z.string().min(1, 'Reference is required'),
  travelerFirstName: z.string().min(1, 'First name is required'),
  travelerLastName: z.string().min(1, 'Last name is required'),
  whatsappOwner: z.string().min(1, 'WhatsApp number is required'),
  objectCategory: z.string().optional(),
  // Lost baggage description fields
  itemDescription: z.string().optional(),
  itemColor: z.string().optional(),
  itemBrand: z.string().optional(),
  identificationMark: z.string().optional(),
  // Legacy fields (kept for backward compatibility)
  destination: z.string().optional(),
  airlineName: z.string().optional(),
  flightNumber: z.string().optional(),
  departureDate: z.string().date().optional(),
  departureTime: z.string().optional(),
  transportMode: z.string().optional(),
  trainCompany: z.string().optional(),
  trainNumber: z.string().optional(),
  shipName: z.string().optional(),
  shipCabin: z.string().optional(),
  busCompany: z.string().optional(),
  busLineNumber: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = activateSchema.parse(body);

    // Find the baggage by reference
    const baggage = await db.baggage.findUnique({
      where: { reference: validatedData.reference },
      include: { agency: true }
    });

    if (!baggage) {
      return NextResponse.json(
        { error: 'Baggage not found', message: 'Code QR non valide' },
        { status: 404 }
      );
    }

    if (baggage.status !== 'pending_activation') {
      return NextResponse.json(
        { error: 'Already activated', message: 'Cet objet a déjà été activé' },
        { status: 400 }
      );
    }

    // Calculate expiration date (365 days for standard)
    const expiresAt = calculateExpirationDate(baggage.type);

    // Update baggage with owner info
    const updatedBaggage = await db.baggage.update({
      where: { id: baggage.id },
      data: {
        travelerFirstName: validatedData.travelerFirstName,
        travelerLastName: validatedData.travelerLastName,
        whatsappOwner: validatedData.whatsappOwner,
        objectCategory: validatedData.objectCategory || null,
        // New lost baggage fields
        itemDescription: validatedData.itemDescription || null,
        itemColor: validatedData.itemColor || null,
        itemBrand: validatedData.itemBrand || null,
        identificationMark: validatedData.identificationMark || null,
        // Legacy fields
        destination: validatedData.destination || null,
        departureDate: validatedData.departureDate ? new Date(validatedData.departureDate + 'T00:00:00') : null,
        departureTime: validatedData.departureTime || null,
        transportMode: validatedData.transportMode || null,
        airlineName: validatedData.airlineName || null,
        flightNumber: validatedData.flightNumber || null,
        trainCompany: validatedData.trainCompany || null,
        trainNumber: validatedData.trainNumber || null,
        shipName: validatedData.shipName || null,
        shipCabin: validatedData.shipCabin || null,
        busCompany: validatedData.busCompany || null,
        busLineNumber: validatedData.busLineNumber || null,
        status: 'active',
        expiresAt,
      }
    });

    // If this is part of a group (legacy hajj has 3 bags), activate all related baggages
    if (baggage.type === 'hajj' && baggage.agencyId) {
      const prefix = baggage.reference.substring(0, 6);
      const relatedBaggages = await db.baggage.findMany({
        where: {
          reference: { startsWith: prefix },
          agencyId: baggage.agencyId,
          status: 'pending_activation'
        }
      });

      for (const related of relatedBaggages) {
        if (related.id !== baggage.id) {
          await db.baggage.update({
            where: { id: related.id },
            data: {
              travelerFirstName: validatedData.travelerFirstName,
              travelerLastName: validatedData.travelerLastName,
              whatsappOwner: validatedData.whatsappOwner,
              objectCategory: validatedData.objectCategory || null,
              itemDescription: validatedData.itemDescription || null,
              itemColor: validatedData.itemColor || null,
              itemBrand: validatedData.itemBrand || null,
              identificationMark: validatedData.identificationMark || null,
              departureDate: validatedData.departureDate ? new Date(validatedData.departureDate + 'T00:00:00') : null,
              departureTime: validatedData.departureTime || null,
              airlineName: validatedData.airlineName || null,
              flightNumber: validatedData.flightNumber || null,
              destination: validatedData.destination || null,
              transportMode: 'flight',
              trainCompany: null,
              trainNumber: null,
              shipName: null,
              shipCabin: null,
              busCompany: null,
              busLineNumber: null,
              status: 'active',
              expiresAt,
            }
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      baggage: {
        id: updatedBaggage.id,
        reference: updatedBaggage.reference,
        type: updatedBaggage.type,
        status: updatedBaggage.status,
        expiresAt: updatedBaggage.expiresAt,
      }
    });

  } catch (error) {
    console.error('Activation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}