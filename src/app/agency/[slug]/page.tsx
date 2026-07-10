import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { isActive } from '@/lib/status';
import { Tag, MapPin, Clock, CheckCircle, QrCode, Phone, Mail, Globe, Search, ArrowLeft, Shield } from 'lucide-react';

// ─── Brand constants (unifié avec /inscrire, /success, /scan) ───
const BRAND = '#FFDE21';
const INK = '#000000';
const BLUE = '#0147d5';

// Page params type
interface PageProps {
  params: Promise<{ slug: string }>;
}

// Force dynamic rendering - no database available during Docker build
export const dynamic = 'force-dynamic';

// Public Agency Page - Shows active/scanned/found baggages for an agency
export default async function PublicAgencyPage({ params }: PageProps) {
  const { slug } = await params;

  // Fetch agency with protected baggages (active, scanned, found - but NOT lost, pending_activation, blocked)
  // 'found' means the baggage was lost and then found, so it's still protected
  const agency = await prisma.agency.findUnique({
    where: { slug },
    include: {
      baggages: {
        where: {
          status: { in: ['active', 'scanned', 'found'] },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      },
      users: {
        where: { role: 'agency' },
        take: 1,
      },
    },
  });

  if (!agency) {
    notFound();
  }

  // Stats - include all protected baggages
  const totalBaggages = agency.baggages.length;
  const activeBaggages = agency.baggages.filter(b => isActive(b.status)).length;
  const foundBaggages = agency.baggages.filter(b => b.status === 'found').length;
  const scannedBaggages = agency.baggages.filter(b => b.status === 'scanned').length;

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: BLUE }}>
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-40 px-4 sm:px-5 md:px-8 py-3 sm:py-4" style={{ backgroundColor: BLUE }}>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-white hover:text-[#FFDE21] transition-colors min-h-[44px]"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm md:text-base font-medium">Retour</span>
          </Link>
          <img src="/logo.png" alt="QRTags" className="h-10 sm:h-12 w-auto object-contain" />
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </header>

      <div className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-5 md:px-8 pb-[env(safe-area-inset-bottom,0px)]">

        {/* ═══ Agency Header Card (yellow) ═══ */}
        <div
          className="rounded-2xl p-5 sm:p-6 mt-4 sm:mt-6 mb-5 shadow-xl"
          style={{ backgroundColor: BRAND, boxShadow: `0 20px 40px ${INK}15` }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
              style={{ backgroundColor: BLUE }}
            >
              <QrCode className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold" style={{ color: INK }}>
                {agency.name}
              </h1>
              <p className="text-sm flex items-center gap-1 mt-1" style={{ color: INK, opacity: 0.7 }}>
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{agency.address || 'Adresse non renseignée'}</span>
              </p>
            </div>
          </div>

          {/* Partenaire badge */}
          <div className="mt-4">
            <span
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-bold shadow-sm"
              style={{ backgroundColor: BLUE, color: '#FFFFFF' }}
            >
              <Shield className="w-3.5 h-3.5" />
              Partenaire QRTags vérifié
            </span>
          </div>
        </div>

        {/* ═══ Stats Cards (yellow cards on blue bg) ═══ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-5">
          <div
            className="rounded-2xl p-4 shadow-lg text-center"
            style={{ backgroundColor: BRAND, boxShadow: `0 10px 25px ${INK}10` }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: BLUE }}>
              <Tag className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold" style={{ color: INK }}>{totalBaggages}</p>
            <p className="text-xs sm:text-sm font-medium" style={{ color: INK, opacity: 0.7 }}>Protégés</p>
          </div>

          <div
            className="rounded-2xl p-4 shadow-lg text-center"
            style={{ backgroundColor: BRAND, boxShadow: `0 10px 25px ${INK}10` }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: BLUE }}>
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold" style={{ color: INK }}>{activeBaggages}</p>
            <p className="text-xs sm:text-sm font-medium" style={{ color: INK, opacity: 0.7 }}>Actifs</p>
          </div>

          <div
            className="rounded-2xl p-4 shadow-lg text-center"
            style={{ backgroundColor: BRAND, boxShadow: `0 10px 25px ${INK}10` }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: BLUE }}>
              <Clock className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold" style={{ color: INK }}>{scannedBaggages}</p>
            <p className="text-xs sm:text-sm font-medium" style={{ color: INK, opacity: 0.7 }}>Scannés</p>
          </div>

          <div
            className="rounded-2xl p-4 shadow-lg text-center"
            style={{ backgroundColor: BRAND, boxShadow: `0 10px 25px ${INK}10` }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: BLUE }}>
              <Search className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold" style={{ color: INK }}>{foundBaggages}</p>
            <p className="text-xs sm:text-sm font-medium" style={{ color: INK, opacity: 0.7 }}>Retrouvés</p>
          </div>
        </div>

        {/* ═══ Baggages List (yellow card) ═══ */}
        <div
          className="rounded-2xl shadow-xl overflow-hidden mb-5"
          style={{ backgroundColor: BRAND, boxShadow: `0 20px 40px ${INK}15` }}
        >
          {/* List Header */}
          <div className="px-5 sm:px-6 py-4 flex justify-between items-center" style={{ borderBottom: `2px dashed ${INK}30` }}>
            <h2 className="text-base sm:text-lg font-bold" style={{ color: INK }}>
              🏷️ Objets protégés
            </h2>
            <span className="text-xs sm:text-sm font-medium" style={{ color: INK, opacity: 0.6 }}>
              {totalBaggages} objet{totalBaggages > 1 ? 's' : ''}
            </span>
          </div>

          {agency.baggages.length === 0 ? (
            <div className="p-10 sm:p-12 text-center">
              <div className="w-16 h-16 bg-white/40 rounded-full flex items-center justify-center mx-auto mb-4">
                <Tag className="w-8 h-8" style={{ color: INK, opacity: 0.4 }} />
              </div>
              <p className="font-medium" style={{ color: INK, opacity: 0.6 }}>Aucun objet actif</p>
              <p className="text-sm mt-1" style={{ color: INK, opacity: 0.4 }}>
                Les objets protégés apparaîtront ici
              </p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {agency.baggages.map((baggage) => (
                <div
                  key={baggage.id}
                  className="px-5 sm:px-6 py-3.5 sm:py-4 transition-colors hover:bg-white/30"
                  style={{ borderBottom: `1px dashed ${INK}20` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: BLUE }}>
                        <QrCode className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-mono font-bold text-sm sm:text-base truncate" style={{ color: INK }}>
                          {baggage.reference}
                        </p>
                        <p className="text-xs sm:text-sm truncate" style={{ color: INK, opacity: 0.7 }}>
                          {baggage.travelerFirstName} {baggage.travelerLastName}
                          {baggage.type === 'hajj' && (
                            <span
                              className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold inline-block"
                              style={{ backgroundColor: BLUE, color: '#FFFFFF' }}
                            >
                              Hajj
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-2">
                      <span
                        className="px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold"
                        style={{
                          backgroundColor: baggage.status === 'found' ? '#22c55e' : BLUE,
                          color: '#FFFFFF',
                        }}
                      >
                        {baggage.status === 'active' ? 'Actif' : baggage.status === 'found' ? 'Retrouvé' : 'Scanné'}
                      </span>
                      {baggage.objectCategory && (
                        <span className="text-xs hidden sm:block" style={{ color: INK, opacity: 0.5 }}>
                          {baggage.objectCategory}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ═══ Contact Section (yellow card) ═══ */}
        <div
          className="rounded-2xl p-5 sm:p-6 shadow-xl mb-6"
          style={{ backgroundColor: BRAND, boxShadow: `0 20px 40px ${INK}15` }}
        >
          <h2 className="text-base sm:text-lg font-bold mb-4" style={{ color: INK }}>
            📞 Contacter l&apos;agence
          </h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {agency.phone && (
              <a
                href={`tel:${agency.phone}`}
                className="flex items-center gap-3 p-3 sm:p-4 bg-white/40 rounded-xl hover:bg-white/60 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: BLUE }}>
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium" style={{ color: INK, opacity: 0.6 }}>Téléphone</p>
                  <p className="font-medium text-sm truncate" style={{ color: INK }}>{agency.phone}</p>
                </div>
              </a>
            )}
            {agency.email && (
              <a
                href={`mailto:${agency.email}`}
                className="flex items-center gap-3 p-3 sm:p-4 bg-white/40 rounded-xl hover:bg-white/60 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: BLUE }}>
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium" style={{ color: INK, opacity: 0.6 }}>Email</p>
                  <p className="font-medium text-sm truncate" style={{ color: INK }}>{agency.email}</p>
                </div>
              </a>
            )}
            <div className="flex items-center gap-3 p-3 sm:p-4 bg-white/40 rounded-xl">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: BLUE }}>
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: INK, opacity: 0.6 }}>Statut</p>
                <p className="font-bold text-sm" style={{ color: INK }}>Partenaire vérifié</p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Footer ─── */}
        <footer className="text-center pb-8">
          <p className="flex items-center justify-center gap-2 text-white/60 text-sm">
            <QrCode className="w-4 h-4" />
            Propulsé par{' '}
            <span className="font-bold" style={{ color: BRAND }}>QRTags</span>
          </p>
          <p className="mt-1 text-xs text-white/40">
            Protection intelligente des objets
          </p>
        </footer>
      </div>
    </main>
  );
}