'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  AlertCircle,
  Clock,
  Shield,
  CheckCircle,
  RefreshCw,
  Phone,
  MessageCircle,
  MapPin,
  Globe,
  ArrowRight,
  ChevronDown,
  X,
  AlertTriangle,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { Language, LANGUAGE_NAMES } from '@/lib/i18n';
import { OBJECT_ICONS, safeObjectCategory, getObjectLabel } from '@/lib/object-categories';
import type { ObjectCategory } from '@/lib/object-categories';
import { generatePreFilledMessage, buildWhatsAppUrl } from '@/lib/whatsapp-message';
import { useAudioAlert, POLL_INTERVAL_MS } from '@/hooks/useAudioAlert';

// ─── Brand constants (unified with /inscrire, /success, /scan) ───
const BRAND = '#F97316'; // jaune vif
const INK = '#000000';   // ink black
const CREAM = '#000000'; // blue background
const URGENT_RED = '#EF4444';
const URGENT_BG = '#FEF2F2';
const QRBAG_SUPPORT_PHONE = '+33745349339';

// ═══════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════

interface ScanEntry {
  id: string;
  location: string | null;
  city: string | null;
  country: string | null;
  finderName: string | null;
  finderPhone: string | null;
  message: string | null;
  hasMap: boolean;
  scannedAt: string;
  whatsappStatus: string | null;
}

interface LastPosition {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  hasCoordinates: boolean;
}

interface BaggageInfo {
  reference: string;
  type: string;
  travelerName: string;
  baggageIndex: number;
  baggageType: string;
  status: string;
  destination: string | null;
  departureDate: string | null;
  departureTime: string | null;
  agency: string | null;
  createdAt: string | null;
  lastScanDate: string | null;
  lastLocation: string | null;
  declaredLostAt: string | null;
  foundAt: string | null;
  expiresAt: string | null;
  // Lost baggage description fields
  objectCategory: string | null;
  itemDescription: string | null;
  itemColor: string | null;
  itemBrand: string | null;
  identificationMark: string | null;
}

interface SuiviData {
  status: string;
  baggage: BaggageInfo;
  lastFinder: { name: string | null; phone: string | null } | null;
  scans: ScanEntry[];
  lastPosition: LastPosition | null;
}

// Type for beforeinstallprompt event (not in standard TS DOM lib)
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// ═══════════════════════════════════════════════════════
//  HOOK: PWA Install Prompt (local, with iOS detection)
// ═══════════════════════════════════════════════════════

function usePWAInstallPrompt() {
  // Detect iOS up-front (no setState-in-effect needed: navigator is stable on client)
  // Default to false for SSR; useEffect below sets the real value via lazy init.
  const [isIOS, setIsIOS] = useState(false);

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showButton, setShowButton] = useState(false);

  // iOS detection runs once on mount — we use a ref-less pattern:
  //   - setState is allowed here because this is reading a non-React external value
  //   - The lint rule complains because setState happens synchronously, but this is
  //     a legitimate pattern for reading navigator.userAgent at mount time.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect iOS (no beforeinstallprompt event on iOS Safari)
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsIOS(iOS);

    // Already installed? (standalone mode)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (isStandalone) return;

    // On iOS, show the "Add to Home Screen" instruction button
    if (iOS) {
      setShowButton(true);
      return;
    }

    // On Android/Chrome: capture beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowButton(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (isIOS) {
      // Caller opens the instructions modal
      return;
    }
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setShowButton(false);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt, isIOS]);

  return { showButton, isIOS, handleInstall };
}

// ═══════════════════════════════════════════════════════
//  LANGUAGE SELECTOR (recoloré — light theme, brand-aware)
// ═══════════════════════════════════════════════════════

function LanguageSelector({ lang, setLang }: { lang: Language; setLang: (l: Language) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 bg-white/10 border-2 border-white/30 rounded-full text-white hover:bg-white/20 transition-colors text-xs sm:text-sm md:text-base font-medium shadow-sm min-h-[36px] sm:min-h-[40px] md:min-h-[44px]"
      >
        <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>{LANGUAGE_NAMES[lang]}</span>
      </button>

      {isOpen && (
        <div role="listbox" aria-label="Language" className="absolute top-full right-0 mt-1 sm:mt-2 bg-black border-2 border-white/30 rounded-xl shadow-lg overflow-hidden z-50 min-w-[140px] sm:min-w-[160px]">
          {(['fr', 'en', 'ar'] as Language[]).map((l) => (
            <button
              key={l}
              role="option"
              aria-selected={lang === l}
              onClick={() => {
                setLang(l);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2.5 sm:px-5 sm:py-3 text-left text-xs sm:text-sm md:text-base font-medium transition-colors ${
                lang === l
                  ? 'bg-[#F97316] text-black'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              {LANGUAGE_NAMES[l]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  DASHED ENCART (light variant: dashed black on white)
// ═══════════════════════════════════════════════════════

function DashedEncart({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`border-2 border-dashed border-black/60 rounded-xl p-3 mb-2.5 last:mb-0 ${className}`}>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  LOST BAGGAGE DESCRIPTION CARD (yellow dashed border)
// ═══════════════════════════════════════════════════════

function LostBaggageCard({
  baggage,
  lang,
  t,
}: {
  baggage: BaggageInfo;
  lang: Language;
  t: (key: string) => string;
}) {
  const category = safeObjectCategory(baggage.objectCategory) as ObjectCategory;
  const icon = OBJECT_ICONS[category] || '📦';
  const label = getObjectLabel(category, lang);

  const hasAnyInfo = baggage.itemDescription || baggage.itemColor || baggage.itemBrand || baggage.identificationMark;

  if (!hasAnyInfo) return null;

  return (
    <div className="bg-white border-2 border-dashed border-[#F97316] rounded-2xl p-5 shadow-sm">
      <h2 className="text-xs uppercase tracking-widest text-black font-bold mb-3 flex items-center gap-2">
        <span>{icon}</span> {label}
      </h2>

      {baggage.itemColor && (
        <DashedEncart>
          <div className="flex items-center gap-3">
            <span className="text-xl">🎨</span>
            <div>
              <p className="text-xs text-black/60 font-medium">{t('tracking.item_color') || 'Couleur'}</p>
              <p className="text-base font-bold text-black">{baggage.itemColor}</p>
            </div>
          </div>
        </DashedEncart>
      )}

      {baggage.itemBrand && (
        <DashedEncart>
          <div className="flex items-center gap-3">
            <span className="text-xl">🏷️</span>
            <div>
              <p className="text-xs text-black/60 font-medium">{t('tracking.item_brand') || 'Marque'}</p>
              <p className="text-base font-bold text-black">{baggage.itemBrand}</p>
            </div>
          </div>
        </DashedEncart>
      )}

      {baggage.itemDescription && (
        <DashedEncart>
          <div className="flex items-center gap-3">
            <span className="text-xl">📝</span>
            <div>
              <p className="text-xs text-black/60 font-medium">{t('tracking.item_description') || 'Description'}</p>
              <p className="text-base font-bold text-black">{baggage.itemDescription}</p>
            </div>
          </div>
        </DashedEncart>
      )}

      {baggage.identificationMark && (
        <DashedEncart className="mb-0">
          <div className="flex items-center gap-3">
            <span className="text-xl">🔖</span>
            <div>
              <p className="text-xs text-black/60 font-medium">{t('tracking.identification_mark') || 'Marque d&apos;identification'}</p>
              <p className="text-base font-bold text-black">{baggage.identificationMark}</p>
            </div>
          </div>
        </DashedEncart>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  LOADING SCREEN (recoloré)
// ═══════════════════════════════════════════════════════

function LoadingScreen({ t }: { t: (key: string) => string }) {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-white/20 border-t-[#F97316] rounded-full mx-auto mb-4"></div>
        <p className="text-lg text-white">{t('common.loading')}</p>
      </div>
    </main>
  );
}

// ═══════════════════════════════════════════════════════
//  ERROR SCREEN (recoloré)
// ═══════════════════════════════════════════════════════

function ErrorScreen({
  type,
  t,
  lang,
  setLang,
}: {
  type: string;
  t: (key: string) => string;
  lang: Language;
  setLang: (l: Language) => void;
}) {
  const errorConfig = {
    not_found: {
      icon: <AlertCircle className="w-12 h-12 text-red-500" />,
      title: t('tracking.baggage_not_found'),
      message: t('tracking.baggage_not_found_desc'),
    },
    blocked: {
      icon: <Shield className="w-12 h-12 text-white/40" />,
      title: t('errors.baggage_blocked'),
      message: t('tracking.baggage_blocked_desc'),
    },
    expired: {
      icon: <Clock className="w-12 h-12 text-white/40" />,
      title: t('errors.protection_expired'),
      message: t('tracking.baggage_expired_desc'),
    },
    pending_activation: {
      icon: <AlertCircle className="w-12 h-12 text-[#F97316]" />,
      title: t('tracking.baggage_not_found'),
      message: t('tracking.baggage_pending_desc'),
    },
  };

  const config = errorConfig[type as keyof typeof errorConfig] || errorConfig.not_found;

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-5 md:p-8 relative">
      <div className="absolute top-4 right-4">
        <LanguageSelector lang={lang} setLang={setLang} />
      </div>

      <div className="max-w-md w-full bg-white border-2 border-dashed border-black rounded-2xl p-6 md:p-8 text-center shadow-xl">
        <div className="w-20 h-20 bg-[#F97316]/30 border-2 border-dashed border-black rounded-full flex items-center justify-center mx-auto mb-6">
          {config.icon}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-black mb-3">{config.title}</h1>
        <p className="text-black text-base md:text-lg mb-6">{config.message}</p>
        <div className="w-full py-4 px-6 bg-[#F97316]/20 border-2 border-dashed border-black text-black rounded-xl text-center text-base font-medium min-h-[56px]">
          {t('tracking.trust_note')}
        </div>
      </div>
    </main>
  );
}

// ═══════════════════════════════════════════════════════
//  GOOGLE MAPS IFRAME (recoloré fallback)
// ═══════════════════════════════════════════════════════

function MapEmbed({
  latitude,
  longitude,
  address,
  t,
}: {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  t: (key: string) => string;
}) {
  let mapSrc: string | null = null;

  if (latitude && longitude) {
    mapSrc = `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;
  } else if (address) {
    mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=13&output=embed`;
  }

  if (!mapSrc) {
    return (
      <div className="bg-[#F97316]/20 border-2 border-dashed border-black rounded-xl p-4 text-center text-black">
        <MapPin className="w-6 h-6 mx-auto mb-2" />
        <p className="text-base font-medium">{address || t('tracking.no_location')}</p>
        <p className="text-sm text-black/70 mt-1">{t('tracking.map_unavailable')}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border-2 border-black">
      <iframe
        src={mapSrc}
        width="100%"
        height="100%"
        style={{ border: 0, minHeight: '180px' }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Location"
        className="w-full h-full"
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  iOS INSTALL INSTRUCTIONS MODAL
// ═══════════════════════════════════════════════════════

function IOSInstallModal({
  show,
  onClose,
  t,
}: {
  show: boolean;
  onClose: () => void;
  t: (key: string) => string;
}) {
  if (!show) return null;
  return (
    <div
      className="fixed inset-0 bg-black/60 z-[60] flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white border-2 border-black rounded-2xl p-5 max-w-sm w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-black">📱 {t('tracking.install_app_ios')}</h3>
          <button
            onClick={onClose}
            aria-label={t('tracking.close')}
            className="w-8 h-8 rounded-full hover:bg-[#F97316]/30 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <ol className="space-y-2 text-sm text-black">
          <li className="flex gap-2"><span>1.</span><span>{t('tracking.install_ios_step1')} <span className="inline-block px-1.5 py-0.5 bg-[#F97316] rounded text-xs font-bold">⬆️</span></span></li>
          <li className="flex gap-2"><span>2.</span><span>{t('tracking.install_ios_step2')}</span></li>
          <li className="flex gap-2"><span>3.</span><span>{t('tracking.install_ios_step3')}</span></li>
        </ol>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════

export default function SuiviPage() {
  const params = useParams();
  const reference = params.reference as string;

  const { t, lang, setLang, dir } = useTranslation();

  const [data, setData] = useState<SuiviData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshToast, setRefreshToast] = useState(false);

  // Accordion/collapsible state
  const [historyOpen, setHistoryOpen] = useState(true);
  const [showAllScans, setShowAllScans] = useState(false);
  const [baggageOpen, setBaggageOpen] = useState(false);

  // PWA install state
  const { showButton: showInstallButton, isIOS, handleInstall } = usePWAInstallPrompt();
  const [showIOSModal, setShowIOSModal] = useState(false);

  // Status toggle state
  const [statusToast, setStatusToast] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  // Audio alert system
  const { audioEnabled, enableAudio, toggleAudio, checkAndNotify } = useAudioAlert(lang);

  // Fetch tracking data
  const fetchSuivi = useCallback(async (isRefresh = false, isSilent = false) => {
    if (isRefresh && !isSilent) setIsRefreshing(true);

    try {
      const response = await fetch(`/api/suivi/${reference}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching suivi:', error);
      setData({ status: 'error', baggage: null as unknown as BaggageInfo, lastFinder: null, scans: [], lastPosition: null });
    } finally {
      setLoading(false);
      if (!isSilent) setIsRefreshing(false);
    }
  }, [reference]);

  // Initial fetch
  useEffect(() => {
    fetchSuivi(false);
  }, [fetchSuivi]);

  // ─── Polling: auto-refresh when audio alerts are enabled ───
  useEffect(() => {
    if (!audioEnabled) return;

    const interval = setInterval(() => {
      fetchSuivi(false, true); // silent refresh
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [audioEnabled, fetchSuivi]);

  // ─── Audio notification: check when data changes ───
  useEffect(() => {
    if (!data || data.status === 'error' || data.status === 'not_found') return;
    checkAndNotify(data.baggage, data.scans);
  }, [data, checkAndNotify]);

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    await fetchSuivi(true);
    setRefreshToast(true);
    setTimeout(() => setRefreshToast(false), 2000);
  }, [fetchSuivi]);

  // WHATSAPP-HARMONIZED: WhatsApp handler — owner contacts finder
  const handleWhatsApp = useCallback(() => {
    if (!data?.lastFinder?.phone) return;

    const lastScan = data.scans[0];
    const message = generatePreFilledMessage({
      baggage: {
        reference: data.baggage.reference,
        bagType: data.baggage.baggageType || 'cabine',
        transportMode: 'flight' as const,
        destination: data.baggage.destination || undefined,
      },
      scanData: {
        city: data.lastPosition?.address || data.baggage?.lastLocation || '',
        address: data.lastPosition?.address || '',
        context: 'static_location',
      },
      finder: {
        name: data.lastFinder?.name || '',
        whatsapp: data.lastFinder?.phone || '',
      },
      locale: lang,
      ownerName: data.baggage?.travelerName || undefined,
    });

    const url = buildWhatsAppUrl(data.lastFinder.phone, message);

    const isIOSUA = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOSUA) {
      window.location.href = url;
    } else {
      const newWindow = window.open(url, '_blank');
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        window.location.href = url;
      }
    }
  }, [data, reference, lang]);

  // Phone call handler
  const handlePhoneCall = useCallback(() => {
    if (!data?.lastFinder?.phone) return;
    window.location.href = `tel:${data.lastFinder.phone}`;
  }, [data]);

  // ─── Status toggle handler (mark-lost / mark-found) ───
  const handleStatusToggle = useCallback(async (action: 'mark-lost' | 'mark-found') => {
    if (isTogglingStatus) return;

    if (action === 'mark-lost') {
      const confirmed = window.confirm(t('tracking.declare_lost_confirm'));
      if (!confirmed) return;
    }

    setIsTogglingStatus(true);
    try {
      const response = await fetch(`/api/baggage-status/${reference}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const result = await response.json();

      if (result.success) {
        // Refresh page data to reflect new status
        await fetchSuivi(true);
        setStatusToast(true);
        setTimeout(() => setStatusToast(false), 3000);
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    } finally {
      setIsTogglingStatus(false);
    }
  }, [reference, isTogglingStatus, t, fetchSuivi]);

  // ─── WhatsApp Support handler (emergency) ───
  const handleSupportWhatsApp = useCallback(() => {
    const message = t('tracking.urgent_support_message', { ref: reference });
    const url = buildWhatsAppUrl(QRBAG_SUPPORT_PHONE, message);
    const isIOSUA = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOSUA) {
      window.location.href = url;
    } else {
      const newWindow = window.open(url, '_blank');
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        window.location.href = url;
      }
    }
  }, [reference, t]);

  // Format date for display
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    const locale = lang === 'ar' ? 'ar-SA' : lang === 'en' ? 'en-US' : 'fr-FR';
    return new Date(dateStr).toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return null;
    const locale = lang === 'ar' ? 'ar-SA' : lang === 'en' ? 'en-US' : 'fr-FR';
    return new Date(dateStr).toLocaleString(locale, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ─── Loading ───
  if (loading) {
    return <LoadingScreen t={t} />;
  }

  // ─── Error states ───
  if (!data || data.status === 'not_found' || data.status === 'error') {
    return <ErrorScreen type="not_found" t={t} lang={lang} setLang={setLang} />;
  }
  if (data.status === 'blocked') {
    return <ErrorScreen type="blocked" t={t} lang={lang} setLang={setLang} />;
  }
  if (data.status === 'expired') {
    return <ErrorScreen type="expired" t={t} lang={lang} setLang={setLang} />;
  }
  if (data.status === 'pending_activation') {
    return <ErrorScreen type="pending_activation" t={t} lang={lang} setLang={setLang} />;
  }

  const baggage = data.baggage;
  const isDeclaredLost = !!baggage?.declaredLostAt && !baggage?.foundAt;
  const isFound = !!baggage?.foundAt;
  const isScanned = baggage?.status === 'scanned';
  const hasFinderPhone = !!(data.lastFinder?.phone);

  // ─── Dynamic status header config ───
  const statusConfig: { title: string; badgeClass: string; desc: string } = (() => {
    if (isDeclaredLost) {
      return {
        title: `🚨 ${t('tracking.badge_lost')}`,
        badgeClass: 'bg-red-600 text-white animate-pulse',
        desc: t('tracking.lost_description'),
      };
    }
    if (isFound) {
      return {
        title: `✅ ${t('tracking.badge_found')}`,
        badgeClass: 'bg-[#F97316] text-black',
        desc: t('tracking.found_description'),
      };
    }
    if (isScanned) {
      return {
        title: t('tracking.bagage_localise'),
        badgeClass: 'bg-[#F97316] text-black',
        desc: t('tracking.found_description'),
      };
    }
    return {
      title: t('tracking.bagage_protege'),
      badgeClass: 'bg-black text-[#F97316]',
      desc: t('tracking.active_description'),
    };
  })();

  // History accordion: 3 first by default if >3, all if <=3
  const INITIAL_SCAN_COUNT = 3;
  const visibleScans = showAllScans ? data.scans : data.scans.slice(0, INITIAL_SCAN_COUNT);
  const hiddenScansCount = data.scans.length - INITIAL_SCAN_COUNT;

  // Support mailto link
  const supportSubject = encodeURIComponent(`Problème bagage ${reference}`);
  const supportBody = encodeURIComponent(
    `Bonjour, je rencontre un problème avec mon bagage ${reference}.\n\nDescription du problème :\n`
  );
  const supportHref = `mailto:contact@qrtags.com?subject=${supportSubject}&body=${supportBody}`;

  // Checklist CTA link
  const checklistHref = `/checklist?ref=${encodeURIComponent(reference)}&source=tracking_page`;

  // ═══════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════

  return (
    <main
      className="min-h-screen bg-black flex flex-col"
      dir={dir}
    >
      {/* ─── Sticky Header ─── */}
      <header className="sticky top-0 z-40 bg-black border-b-2 border-white/20 pt-[env(safe-area-inset-top,0px)] px-4 sm:px-5 md:px-8 py-2 sm:py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-1 text-white hover:text-[#F97316] transition-colors text-sm font-medium min-h-[40px] px-2"
            aria-label={t('tracking.back_to_scan')}
          >
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            <span>{t('tracking.back_to_scan')}</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Audio alert toggle */}
            <button
              onClick={toggleAudio}
              className={`flex items-center justify-center w-9 h-9 rounded-full border-2 transition-colors min-h-[40px] ${
                audioEnabled
                  ? 'border-[#F97316] bg-[#F97316] text-black'
                  : 'border-white/30 text-white hover:bg-white/10'
              }`}
              aria-label={t('tracking.audio_alert_toggle_aria')}
              title={audioEnabled ? t('tracking.audio_alert_enabled') : t('tracking.audio_alert_disabled')}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center justify-center w-9 h-9 rounded-full border-2 border-white/30 text-white hover:bg-white/10 transition-colors disabled:opacity-50"
              aria-label={t('common.refresh')}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <LanguageSelector lang={lang} setLang={setLang} />
          </div>
        </div>
      </header>

      {/* ─── Refresh Toast ─── */}
      {refreshToast && (
        <div className="fixed top-[calc(3.5rem+env(safe-area-inset-top,0px))] sm:top-[calc(4rem+env(safe-area-inset-top,0px))] left-1/2 -translate-x-1/2 bg-black text-[#F97316] px-4 py-2 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-300 text-sm font-medium flex items-center gap-1.5">
          <CheckCircle className="w-4 h-4" />
          {t('tracking.refresh_success')}
        </div>
      )}

      {/* ─── Status Toast ─── */}
      {statusToast && (
        <div className="fixed top-[calc(5.5rem+env(safe-area-inset-top,0px))] sm:top-[calc(6rem+env(safe-area-inset-top,0px))] left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-300 text-sm font-medium flex items-center gap-1.5">
          <CheckCircle className="w-4 h-4" />
          {t('tracking.status_updated')}
        </div>
      )}

      {/* ─── Audio Alert Banner (show when not enabled AND baggage not yet scanned) ─── */}
      {!audioEnabled && data && data.scans.length === 0 && (
        <div className="sticky top-[52px] sm:top-[56px] z-30 bg-black px-4 sm:px-5 md:px-8 py-2">
          <div className="max-w-md mx-auto">
            <div className="bg-[#F97316] border-2 border-black rounded-2xl p-4 text-center">
              <p className="font-bold text-black text-base mb-2">
                🔔 {t('tracking.audio_alert_banner_title')}
              </p>
              <button
                onClick={enableAudio}
                className="bg-black hover:bg-black text-[#F97316] py-2.5 px-6 rounded-xl font-bold transition-colors text-sm min-h-[44px] inline-flex items-center gap-2"
              >
                <Volume2 className="w-4 h-4" />
                {t('tracking.audio_alert_activate_btn')}
              </button>
              <p className="text-xs text-black/70 mt-2">
                {t('tracking.audio_alert_keep_open')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── Scanning indicator (show when audio is enabled AND no scans yet) ─── */}
      {audioEnabled && data && data.scans.length === 0 && (
        <div className="sticky top-[52px] sm:top-[56px] z-30 bg-black px-4 sm:px-5 md:px-8 py-2">
          <div className="max-w-md mx-auto">
            <div className="bg-[#F97316]/20 border-2 border-dashed border-[#F97316] rounded-xl px-4 py-2.5 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#F97316] animate-pulse flex-shrink-0" />
              <span className="text-sm font-medium text-white">{t('tracking.audio_alert_scanning')}</span>
            </div>
          </div>
        </div>
      )}

      {/* ─── Sticky Map (h-56 mobile / h-64 tablet / h-72 desktop) ─── */}
      {data.lastPosition && (data.lastPosition.hasCoordinates || data.lastPosition.address) && (
        <section className="sticky top-[52px] sm:top-[56px] z-30 bg-black px-4 sm:px-5 md:px-8 py-3">
          <div className="max-w-md mx-auto">
            <div className="bg-white border-2 border-dashed border-black rounded-2xl p-2.5 shadow-sm">
              <div className="flex items-center justify-between mb-2 px-1">
                <h2 className="text-xs uppercase tracking-widest text-black font-bold flex items-center gap-1.5">
                  <span>🗺️</span> {t('tracking.last_location')}
                </h2>
                {baggage.lastScanDate && (
                  <span className="text-[10px] text-black/60">
                    {formatDateTime(baggage.lastScanDate)}
                  </span>
                )}
              </div>
              <div className="h-44 sm:h-48 md:h-56">
                <MapEmbed
                  latitude={data.lastPosition.latitude}
                  longitude={data.lastPosition.longitude}
                  address={data.lastPosition.address}
                  t={t}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── Scrollable Content ─── */}
      <div className="flex-1 max-w-md mx-auto w-full px-4 sm:px-5 md:px-8 py-4 pb-32 space-y-4">

        {/* ═══ EN-TÊTE DYNAMIQUE SELON STATUT ═══ */}
        <div className="text-center pt-2">
          <span className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-sm font-bold ${statusConfig.badgeClass}`}>
            {statusConfig.title}
          </span>
          <p className="mt-3 text-sm md:text-base text-white/80 leading-relaxed">
            {statusConfig.desc}
          </p>
          {data.scans.length > 0 && (
            <p className="mt-1 text-xs text-white/60">
              {t('tracking.scan_count', { count: String(data.scans.length) })}
            </p>
          )}
        </div>

        {/* ═══ LOST BAGGAGE DESCRIPTION CARD ═══ */}
        <LostBaggageCard baggage={baggage} lang={lang} t={t} />

        {/* ═══ PANNEAU URGENCE (mode perdu uniquement) ═══ */}
        {isDeclaredLost && (
          <div
            className="bg-[#FEF2F2] border-2 border-[#EF4444] rounded-2xl p-6 space-y-5"
            role="alert"
          >
            {/* Titre */}
            <div className="text-center">
              <h2 className="text-xl md:text-2xl font-bold text-[#EF4444]">
                {t('tracking.urgent_title')}
              </h2>
            </div>

            {/* Instructions numérotées */}
            <ol className="space-y-3">
              <li className="flex gap-3 items-start">
                <span className="flex-shrink-0 w-7 h-7 bg-[#EF4444] text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">1</span>
                <p className="text-sm md:text-base text-black leading-relaxed">
                  {t('tracking.urgent_step1', { company: 'QRTags' })}
                </p>
              </li>
              <li className="flex gap-3 items-start">
                <span className="flex-shrink-0 w-7 h-7 bg-[#EF4444] text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">2</span>
                <p className="text-sm md:text-base text-black leading-relaxed">
                  {t('tracking.urgent_step2')}
                </p>
              </li>
            </ol>

            {/* Boutons d'action urgence */}
            <div className="space-y-3">
              {hasFinderPhone && (
                <button
                  onClick={handleWhatsApp}
                  className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe57] text-white py-3.5 px-4 rounded-xl font-bold transition-colors text-base min-h-[48px]"
                >
                  <MessageCircle className="w-5 h-5" />
                  {t('tracking.urgent_contact_finder')}
                </button>
              )}
              <button
                onClick={handleSupportWhatsApp}
                className="w-full flex items-center justify-center gap-2 bg-[#EF4444] hover:bg-[#DC2626] text-white py-3.5 px-4 rounded-xl font-bold transition-colors text-base min-h-[48px]"
              >
                <AlertTriangle className="w-5 h-5" />
                {t('tracking.urgent_support')}
              </button>
            </div>

            {/* Bouton Retrouvé */}
            <button
              onClick={() => handleStatusToggle('mark-found')}
              disabled={isTogglingStatus}
              className="w-full flex items-center justify-center gap-2 bg-white border-2 border-green-600 text-green-700 hover:bg-green-50 py-3.5 px-4 rounded-xl font-bold transition-colors text-base min-h-[48px] disabled:opacity-50"
            >
              {isTogglingStatus ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
              {t('tracking.urgent_found_btn')}
            </button>
          </div>
        )}

        {/* ═══ CARTE TROUVEUR (white + dashed, lecture seule) ═══ */}
        {data.lastFinder && (data.lastFinder.name || data.lastFinder.phone) ? (
          <div className="bg-white border-2 border-dashed border-black rounded-2xl p-5 shadow-sm">
            <h2 className="text-xs uppercase tracking-widest text-black font-bold mb-3 flex items-center gap-2">
              <span>🔍</span> {t('tracking.finder_info')}
            </h2>

            {data.lastFinder.name && (
              <DashedEncart>
                <div className="flex items-center gap-3">
                  <span className="text-xl">👤</span>
                  <div>
                    <p className="text-xs text-black/60 font-medium">{t('finder.fullName')}</p>
                    <p className="text-base font-bold text-black">{data.lastFinder.name}</p>
                  </div>
                </div>
              </DashedEncart>
            )}

            {data.lastFinder.phone && (
              <DashedEncart className="mb-0">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📱</span>
                  <div>
                    <p className="text-xs text-black/60 font-medium">{t('finder.whatsapp')}</p>
                    <p className="text-base font-bold text-black" dir="ltr">{data.lastFinder.phone}</p>
                  </div>
                </div>
              </DashedEncart>
            )}
          </div>
        ) : (
          <div className="bg-white border-2 border-dashed border-black rounded-2xl p-5 shadow-sm text-center">
            <div className="w-14 h-14 bg-[#F97316]/20 border-2 border-dashed border-black rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-7 h-7 text-black/60" />
            </div>
            <p className="text-black/70 text-sm">{t('tracking.no_finder')}</p>
          </div>
        )}

        {/* ═══ CTA CHECKLIST (jaune #F97316 + dashed) ═══ */}
        <div className="bg-[#F97316] border-2 border-dashed border-black rounded-2xl p-4 shadow-sm">
          <h3 className="text-base font-bold text-black mb-1">{t('tracking.checklist_title')}</h3>
          <p className="text-sm text-black/80 mb-3 leading-relaxed">{t('tracking.checklist_desc')}</p>
          <a
            href={checklistHref}
            className="block w-full text-center py-3 px-4 bg-black hover:bg-black text-[#F97316] rounded-xl font-bold transition-colors min-h-[44px]"
          >
            {t('tracking.checklist_cta')}
          </a>
        </div>

        {/* ═══ HISTORIQUE (ACCORDION) ═══ */}
        {data.scans.length > 0 && (
          <div className="bg-white border-2 border-dashed border-black rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => setHistoryOpen(!historyOpen)}
              className="w-full flex items-center justify-between px-5 py-4 text-left"
              aria-expanded={historyOpen}
            >
              <h2 className="text-xs uppercase tracking-widest text-black font-bold flex items-center gap-2">
                <span>📜</span>
                {t('tracking.history_toggle', { count: String(data.scans.length) })}
              </h2>
              <ChevronDown className={`w-4 h-4 text-black transition-transform ${historyOpen ? '' : '-rotate-90'}`} />
            </button>

            {historyOpen && (
              <div className="px-5 pb-4 space-y-2.5">
                {visibleScans.map((scan, index) => (
                  <DashedEncart key={scan.id} className={index === visibleScans.length - 1 && !showAllScans ? 'mb-0' : ''}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-black/70">
                          {formatDateTime(scan.scannedAt)}
                        </span>
                        {scan.location && (
                          <p className="text-black font-medium text-sm truncate mt-1">
                            📍 {scan.location}
                          </p>
                        )}
                        {scan.finderName && (
                          <p className="text-black/70 text-xs mt-1">
                            👤 {scan.finderName}
                          </p>
                        )}
                      </div>
                      <div className="w-7 h-7 rounded-full bg-[#F97316]/20 border border-black/40 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-black">{index + 1}</span>
                      </div>
                    </div>
                  </DashedEncart>
                ))}

                {hiddenScansCount > 0 && !showAllScans && (
                  <button
                    onClick={() => setShowAllScans(true)}
                    className="w-full py-2.5 text-center text-sm font-medium text-black hover:text-[#F97316] border-2 border-dashed border-black/40 rounded-xl transition-colors min-h-[40px]"
                  >
                    {t('tracking.see_more', { count: String(hiddenScansCount) })} ▼
                  </button>
                )}
                {showAllScans && hiddenScansCount > 0 && (
                  <button
                    onClick={() => setShowAllScans(false)}
                    className="w-full py-2.5 text-center text-sm font-medium text-black/70 hover:text-[#F97316] transition-colors min-h-[40px]"
                  >
                    ▲ Réduire
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══ INFOS BAGAGE (COLLAPSIBLE, replié par défaut) ═══ */}
        <div className="bg-white border-2 border-dashed border-black rounded-2xl shadow-sm overflow-hidden">
          <button
            onClick={() => setBaggageOpen(!baggageOpen)}
            className="w-full flex items-center justify-between px-5 py-4 text-left"
            aria-expanded={baggageOpen}
          >
            <h2 className="text-xs uppercase tracking-widest text-black font-bold flex items-center gap-2">
              <span>📦</span> {t('tracking.baggage_info_toggle')}
            </h2>
            <ChevronDown className={`w-4 h-4 text-black transition-transform ${baggageOpen ? '' : '-rotate-90'}`} />
          </button>

          {baggageOpen && (
            <div className="px-5 pb-5">
              {/* Reference */}
              <DashedEncart>
                <div className="flex items-center gap-3">
                  <span className="text-xl">🏷️</span>
                  <div>
                    <p className="text-xs text-black/60 font-medium">{t('whatsapp.reference').replace(' :', '')}</p>
                    <p className="text-base font-bold text-black font-mono tracking-widest">{baggage.reference}</p>
                  </div>
                </div>
              </DashedEncart>

              {/* Traveler Name */}
              <DashedEncart>
                <div className="flex items-center gap-3">
                  <span className="text-xl">👤</span>
                  <div>
                    <p className="text-xs text-black/60 font-medium">{t('finder.fullName')}</p>
                    <p className="text-base font-bold text-black">{baggage.travelerName || t('finder.notSet')}</p>
                  </div>
                </div>
              </DashedEncart>

              {/* Destination */}
              {baggage.destination && (
                <DashedEncart>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📍</span>
                    <div>
                      <p className="text-xs text-black/60 font-medium">{t('tracking.destination') || 'Destination'}</p>
                      <p className="text-base font-bold text-black">{baggage.destination}</p>
                    </div>
                  </div>
                </DashedEncart>
              )}

              {/* Departure Date */}
              {(baggage.departureDate || baggage.createdAt) && (
                <DashedEncart className="mb-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📅</span>
                    <div>
                      <p className="text-xs text-black/60 font-medium">{t('tracking.departure_date') || 'Date de départ'}</p>
                      <p className="text-base font-bold text-black">
                        {formatDate(baggage.departureDate || baggage.createdAt)}{baggage.departureTime ? ` — ${baggage.departureTime}` : ''}
                      </p>
                    </div>
                  </div>
                </DashedEncart>
              )}
            </div>
          )}
        </div>

        {/* ═══ SUPPORT MAILTO ═══ */}
        <div className="text-center py-2">
          <a
            href={supportHref}
            className="text-sm text-[#F97316] underline hover:text-white transition-colors"
          >
            {t('tracking.support_cta')}
          </a>
        </div>

        {/* ═══ PWA INSTALL BUTTON (conditionnel) ═══ */}
        {showInstallButton && (
          <div className="text-center">
            <button
              onClick={() => {
                if (isIOS) {
                  setShowIOSModal(true);
                } else {
                  handleInstall();
                }
              }}
              className="inline-flex items-center gap-2 border-2 border-white/30 text-white hover:bg-white/10 py-2 px-4 rounded-lg text-sm font-medium transition-colors min-h-[40px]"
            >
              <span>{isIOS ? '📱' : '⬇️'}</span>
              <span>{isIOS ? t('tracking.install_app_ios') : t('tracking.install_app')}</span>
            </button>
          </div>
        )}

        {/* ═══ BOUTON DÉCLARER PERDU (mode normal uniquement) ═══ */}
        {!isDeclaredLost && (
          <button
            onClick={() => handleStatusToggle('mark-lost')}
            disabled={isTogglingStatus}
            className="w-full flex items-center justify-center gap-2 border-2 border-[#EF4444] text-[#EF4444] hover:bg-[#FEF2F2] py-3.5 px-4 rounded-xl font-bold transition-colors text-base min-h-[48px] disabled:opacity-50"
          >
            {isTogglingStatus ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            {t('tracking.declare_lost_btn')}
          </button>
        )}

        {/* ─── Trust Note (footer discret) ─── */}
        <div className="text-center text-xs text-white/60 tracking-wide flex items-center justify-center gap-1.5 pt-2">
          <Shield className="w-4 h-4 inline" />
          <span>{t('tracking.trust_note')}</span>
        </div>
      </div>

      {/* ═══ STICKY BOTTOM BAR (Appeler + WhatsApp) — only if finder phone AND NOT in lost mode ═══ */}
      {hasFinderPhone && !isDeclaredLost && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-black p-3 sm:p-4 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] sm:pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
          <div className="max-w-md mx-auto flex gap-3">
            <button
              onClick={handlePhoneCall}
              className="flex-1 bg-black hover:bg-black text-[#F97316] py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 text-base min-h-[48px]"
              aria-label={t('tracking.by_phone')}
            >
              <Phone className="w-5 h-5" />
              <span>📞 {t('tracking.by_phone')}</span>
            </button>
            <button
              onClick={handleWhatsApp}
              className="flex-1 bg-[#25D366] hover:bg-[#1ebe57] text-white py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 text-base min-h-[48px]"
              aria-label={t('tracking.by_whatsapp')}
            >
              <MessageCircle className="w-5 h-5" />
              <span>💬 {t('tracking.by_whatsapp')}</span>
            </button>
          </div>
        </div>
      )}

      {/* ═══ iOS Install Instructions Modal ═══ */}
      <IOSInstallModal show={showIOSModal} onClose={() => setShowIOSModal(false)} t={t} />
    </main>
  );
}