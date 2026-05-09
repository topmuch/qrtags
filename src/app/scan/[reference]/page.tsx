'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Luggage,
  AlertCircle,
  Clock,
  Shield,
  Navigation,
  CheckCircle,
  Plane,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Globe,
  Phone,
  MessageCircle,
} from "lucide-react";
import { useTranslation } from '@/hooks/useTranslation';
import { Language, LANGUAGE_NAMES } from '@/lib/i18n';

const FALLBACK_PHONE = '33745349339';

interface BaggageData {
  status: string;
  message?: string;
  theme?: string;
  type?: string;
  expiredAt?: string;
  agency?: string;
  baggage?: {
    reference: string;
    type: string;
    travelerName: string;
    baggageIndex: number;
    baggageType: string;
    status: string;
    flightNumber?: string;
    destination?: string;
    agency?: string;
    whatsappOwner?: string;
    declaredLostAt?: string | null;
    foundAt?: string | null;
    createdAt?: string | null;
    departureDate?: string | null;
    departureTime?: string | null;
  };
}

// Language Selector Component
function LanguageSelector({ lang, setLang }: { lang: Language; setLang: (l: Language) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* FIX: Taille réduite mobile, normale desktop */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2.5 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors text-xs sm:text-sm md:text-base font-medium backdrop-blur-sm border border-white/20 min-h-[36px] sm:min-h-[40px] md:min-h-[48px]"
      >
        <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>{LANGUAGE_NAMES[lang]}</span>
      </button>

      {isOpen && (
        <div /* FIX: Dropdown adapté mobile */ className="absolute top-full right-0 mt-1 sm:mt-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-xl overflow-hidden z-50 min-w-[140px] sm:min-w-[160px]">
          {(['fr', 'en', 'ar'] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => {
                setLang(l);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2.5 sm:px-5 sm:py-3.5 text-left text-xs sm:text-sm md:text-base font-medium transition-colors ${
                lang === l 
                  ? 'bg-orange-500 text-white' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
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

// Activation Redirect Component
function ActivationRedirect({ type, reference, t, lang, setLang }: {
  type: string;
  reference: string;
  t: (key: string, params?: Record<string, string>) => string;
  lang: Language;
  setLang: (l: Language) => void;
}) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          const url = type === 'hajj'
            ? `/hajj/activate?qr=${reference}`
            : `/inscrire?qr=${reference}`;
          router.push(url);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [type, reference, router]);

  const isHajj = type === 'hajj';
  const bgClass = isHajj ? 'bg-[#0d5e34]' : 'bg-[#6613e3]';

  return (
    <main className={`min-h-screen ${bgClass} flex items-center justify-center p-5 md:p-8`}>
      <div className="relative max-w-md w-full bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 text-center border border-white/20 shadow-xl">
        <div className="absolute top-4 right-4">
          <LanguageSelector lang={lang} setLang={setLang} />
        </div>

        <div className="relative inline-block mb-6">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center animate-pulse border border-white/20">
            {isHajj ? (
              <Plane className="w-10 h-10 text-white" />
            ) : (
              <Luggage className="w-10 h-10 text-white" />
            )}
          </div>
          <div className="absolute -top-1 -right-1 w-8 h-8 bg-[#ffd700] rounded-full flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#080c1a]" />
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          {t('common.welcome')}
        </h1>
        <p className="text-white/70 text-base md:text-lg mb-4">
          {t('common.activate_in')}
        </p>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 md:p-5 mb-6">
          <p className="text-white/60 text-base mb-2">{t('common.baggage_type')}</p>
          <Badge className={`${isHajj ? 'bg-[#1e3a2e] text-green-300' : 'bg-[#f59e0b]/20 text-[#fbbf24]'} text-base md:text-lg px-5 py-1.5`}>
            {isHajj ? t('common.hajj_label') : t('common.voyageur_label')}
          </Badge>
        </div>

        <p className="text-white/50 text-base mb-5">
          {t('common.auto_redirect')} <span className="text-white font-bold text-lg">{countdown}s</span>
        </p>

        <button
          className="w-full py-4 px-6 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 min-h-[56px]"
          onClick={() => {
            const url = isHajj
              ? `/hajj/activate?qr=${reference}`
              : `/inscrire?qr=${reference}`;
            router.push(url);
          }}
        >
          {t('common.start_activation')}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </main>
  );
}

// Loading Component
function LoadingScreen({ t }: { t: (key: string) => string }) {
  return (
    <main className="min-h-screen bg-[#6613e3] flex items-center justify-center">
      <div className="text-center text-white">
        <div className="animate-spin w-12 h-12 border-4 border-white/30 border-t-white rounded-full mx-auto mb-4"></div>
        <p className="text-lg">{t('common.loading')}</p>
      </div>
    </main>
  );
}

// Error Screen
function ErrorScreen({
  type,
  t,
  lang,
  setLang
}: {
  type: string;
  t: (key: string) => string;
  lang: Language;
  setLang: (l: Language) => void;
}) {
  const router = useRouter();

  const errorConfig = {
    not_found: {
      icon: <AlertCircle className="w-12 h-12 text-red-400" />,
      title: t('errors.qr_not_valid'),
      message: t('errors.qr_not_valid_desc')
    },
    blocked: {
      icon: <Shield className="w-12 h-12 text-gray-400" />,
      title: t('errors.baggage_blocked'),
      message: t('errors.baggage_blocked_desc')
    },
    expired: {
      icon: <Clock className="w-12 h-12 text-gray-400" />,
      title: t('errors.protection_expired'),
      message: t('errors.protection_expired_desc')
    }
  };

  const config = errorConfig[type as keyof typeof errorConfig] || errorConfig.not_found;

  return (
    <main className="min-h-screen bg-[#6613e3] flex items-center justify-center p-5 md:p-8 relative">
      <div className="absolute top-4 right-4">
        <LanguageSelector lang={lang} setLang={setLang} />
      </div>

      <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 text-center border border-white/20 shadow-xl">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          {config.icon}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">{config.title}</h1>
        <p className="text-white/70 text-base md:text-lg mb-6">{config.message}</p>
        <button
          className="px-8 py-4 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-colors text-base font-medium min-h-[56px]"
          onClick={() => router.push('/')}
        >
          {t('common.back_home')}
        </button>
      </div>
    </main>
  );
}

// Success Toast Component
function SuccessToast({ show, message, successTitle }: { show: boolean; message: string; successTitle: string }) {
  if (!show) return null;
  
  return (
    <div className="fixed top-[calc(3.5rem+env(safe-area-inset-top,0px))] sm:top-[calc(4rem+env(safe-area-inset-top,0px))] right-3 sm:right-5 bg-orange-500 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-lg z-50 animate-in slide-in-from-right duration-300 max-w-[calc(100vw-2rem)] sm:max-w-sm">
      <div className="flex items-center gap-3">
        <CheckCircle className="w-6 h-6" />
        <div>
          <div className="font-bold text-lg">{successTitle} 🎉</div>
          <div className="text-base opacity-90">{message}</div>
        </div>
      </div>
    </div>
  );
}

// Main Scan Page
export default function ScanPage() {
  const params = useParams();
  const reference = params.reference as string;

  const { t, lang, setLang, dir } = useTranslation();

  const [baggageData, setBaggageData] = useState<BaggageData | null>(null);
  const [loading, setLoading] = useState(true);

  // Finder form state
  const [finderName, setFinderName] = useState('');
  const [finderPhone, setFinderPhone] = useState('');
  const [otherLocation, setOtherLocation] = useState('');
  const [sharedPosition, setSharedPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // UI State
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [locationText, setLocationText] = useState('');
  const [geoError, setGeoError] = useState<string | null>(null);
  const [showManualLocation, setShowManualLocation] = useState(false);

  useEffect(() => {
    const fetchBaggage = async () => {
      try {
        const response = await fetch(`/api/scan/${reference}`);
        const data = await response.json();
        setBaggageData(data);
      } catch (error) {
        console.error('Error fetching baggage:', error);
        setBaggageData({ status: 'error', message: t('errors.server_error') });
      } finally {
        setLoading(false);
      }
    };

    fetchBaggage();
  }, [reference]);

  // GPS Location Handler - iOS Optimized
  const handleShareLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setGeoError(t('errors.geolocation_not_supported'));
      setShowManualLocation(true);
      return;
    }

    setIsLoadingLocation(true);
    setGeoError(null);

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          (error) => {
            console.error('Geolocation error:', error.code, error.message);
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      });

      setSharedPosition({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      });
      setLocationText(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
      setGeoError(null);
      setShowManualLocation(false);
    } catch (error) {
      const geoErr = error as GeolocationPositionError;
      let errorMessage = '';

      if (geoErr.code === 1) {
        errorMessage = t('errors.location_permission_denied');
      } else if (geoErr.code === 2) {
        errorMessage = t('errors.location_unavailable');
      } else if (geoErr.code === 3) {
        errorMessage = t('errors.location_timeout');
      } else {
        errorMessage = t('errors.location_failed');
      }

      setGeoError(errorMessage);
      setShowManualLocation(true);
    } finally {
      setIsLoadingLocation(false);
    }
  }, [t]);

  // Generate WhatsApp message (i18n-ready)
  const generateWhatsAppMessage = useCallback((finderName: string, finderPhone: string, locationText: string, mapLink: string) => {
    return encodeURIComponent(
      `${t('whatsapp.baggage_found')}\n\n` +
      `${t('whatsapp.reference')} ${reference}\n` +
      `${t('whatsapp.location')} ${locationText}\n` +
      `${t('whatsapp.map')} ${mapLink}\n\n` +
      `${t('whatsapp.found_by')} ${finderName}\n` +
      `${t('whatsapp.contact')} ${finderPhone}\n\n` +
      `${t('whatsapp.pickup_message')}\n` +
      `${t('whatsapp.signature')}`
    );
  }, [reference, t]);

  // Handle WhatsApp contact
  const handleWhatsApp = useCallback(async () => {
    setIsSubmitting(true);

    try {
      // Log the scan
      await fetch(`/api/scan/${reference}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: otherLocation.trim() || locationText || t('finder.not_specified'),
          finderName: finderName.trim(),
          finderPhone: finderPhone.trim(),
          message: '',
          latitude: sharedPosition?.lat,
          longitude: sharedPosition?.lng,
        }),
      });

      const finalLocationText = otherLocation.trim() || locationText || t('finder.not_specified');
      const mapLink = sharedPosition
        ? `https://maps.app.goo.gl/?link=https://www.google.com/maps?q=${sharedPosition.lat},${sharedPosition.lng}`
        : t('whatsapp.location_not_shared');

      const message = generateWhatsAppMessage(finderName, finderPhone, finalLocationText, mapLink);
      const ownerNumber = baggageData?.baggage?.whatsappOwner?.replace(/\D/g, '') || FALLBACK_PHONE;
      const url = `https://wa.me/${ownerNumber}?text=${message}`;

      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      if (isIOS) {
        window.location.href = url;
      } else {
        const newWindow = window.open(url, '_blank');
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          window.location.href = url;
        }
      }

      // Show success
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);

    } catch (error) {
      console.error('Error:', error);
      alert(t('errors.error_occurred'));
    } finally {
      setIsSubmitting(false);
    }
  }, [reference, otherLocation, locationText, finderName, finderPhone, sharedPosition, baggageData, t, generateWhatsAppMessage]);

  // Handle phone call
  const handlePhoneCall = useCallback(async () => {
    // Log the scan before calling (same as WhatsApp)
    try {
      await fetch(`/api/scan/${reference}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: otherLocation.trim() || locationText || t('finder.not_specified'),
          finderName: finderName.trim(),
          finderPhone: finderPhone.trim(),
          message: '',
          latitude: sharedPosition?.lat,
          longitude: sharedPosition?.lng,
        }),
      });
    } catch (e) {
      // Continue with call even if logging fails
    }

    const phoneNumber = baggageData?.baggage?.whatsappOwner || FALLBACK_PHONE;
    window.location.href = `tel:${phoneNumber}`;
  }, [reference, otherLocation, locationText, finderName, finderPhone, sharedPosition, baggageData]);

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

  // Validate finder form before contacting
  const validateFinderForm = (): boolean => {
    if (!sharedPosition && !otherLocation.trim()) {
      setGeoError(t('finder.please_enter_location'));
      return false;
    }
    if (!finderName.trim() || !finderPhone.trim()) {
      alert(t('finder.fill_info'));
      return false;
    }
    return true;
  };

  // Loading state
  if (loading) {
    return <LoadingScreen t={t} />;
  }

  // Redirect to activation if pending
  if (baggageData?.status === 'pending_activation' && baggageData?.type) {
    return (
      <ActivationRedirect
        type={baggageData.type}
        reference={reference}
        t={t}
        lang={lang}
        setLang={setLang}
      />
    );
  }

  // Error states
  if (baggageData?.status === 'not_found') {
    return <ErrorScreen type="not_found" t={t} lang={lang} setLang={setLang} />;
  }

  if (baggageData?.status === 'blocked') {
    return <ErrorScreen type="blocked" t={t} lang={lang} setLang={setLang} />;
  }

  if (baggageData?.status === 'expired') {
    const expiredAt = baggageData.expiredAt || '';
    const agencyName = baggageData.agency || '';
    const urlParams = new URLSearchParams({
      ref: reference,
      ...(expiredAt && { expired: expiredAt }),
      ...(agencyName && { agency: agencyName })
    });
    if (typeof window !== 'undefined') {
      window.location.href = `/expired?${urlParams.toString()}`;
    }
    return <LoadingScreen t={t} />;
  }

  const baggage = baggageData?.baggage;

  // Lost baggage alert
  const isDeclaredLost = baggage?.declaredLostAt && !baggage?.foundAt;

  // ─── Main Render — Purple Theme with Enlarged Fonts ───
  return (
    <main 
      /* FIX: min-h-[100dvh] iOS Safari + px anti-débordement + pb safe-area-bottom */
      className="min-h-[100dvh] min-h-screen bg-[#6613e3] flex flex-col px-4 sm:px-5 md:px-8 pb-[env(safe-area-inset-bottom,0px)]" 
      dir={dir}
    >
      {/* FIX: Header sticky + safe-area-top + bg blur pour empêcher l'overlap */}
      <header className="sticky top-0 z-40 flex items-center justify-end pt-[env(safe-area-inset-top,0px)] px-0 py-2 sm:py-3 md:py-4 bg-[#6613e3]/95 backdrop-blur-md">
        <LanguageSelector lang={lang} setLang={setLang} />
      </header>

      {/* Success Toast */}
      <SuccessToast show={showSuccess} message={t('finder.message_sent')} successTitle={t('finder.success_title')} />

      {/* FIX: Container avec mt-auto centrage vertical uniquement desktop, padding-top mobile */}
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-center sm:justify-center py-4 sm:py-6 md:py-0">
        {/* ─── BADGE DE STATUT (Premium Unifié) ─── */}
        {/* FIX: mt-2 mobile pour éviter le chevauchement avec le header */}
        <div className="mt-2 sm:mt-4 md:mt-6 mb-4 sm:mb-6 text-center">
          <span className={`inline-flex items-center justify-center px-6 py-3 rounded-full font-bold text-lg shadow-lg transform transition-transform duration-300 ${
            isDeclaredLost
              ? 'bg-red-600 text-white shadow-red-500/30 animate-pulse'
              : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-orange-500/30 hover:scale-105'
          }`}>
            {isDeclaredLost ? `🚨 ${t('finder.lost_badge')}` : `${t('finder.success_badge')} ✈️`}
          </span>
          <p className="mt-3 text-white/90 text-base md:text-lg leading-relaxed max-w-md mx-auto">
            {isDeclaredLost
              ? t('finder.lost_description')
              : t('finder.found_description')}
          </p>
        </div>

        {/* Main Card — Glassmorphism */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-b-2xl rounded-t-2xl p-5 md:p-6 shadow-xl">
          
          {/* ─── CARTE 1 : IDENTITÉ PROPRIÉTAIRE (Premium) ─── */}
          {baggage && (
            <div className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-4 shadow-xl relative overflow-hidden">
              {/* Ligne décorative supérieure */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-50"></div>

              <h2 className="text-xs uppercase tracking-widest text-white/70 font-semibold mb-5 border-b border-white/10 pb-2 flex items-center gap-2">
                <span>👤</span> {t('finder.owner_info')}
              </h2>

              <div className="space-y-5">
                {/* Nom du propriétaire */}
                <div className="flex items-start gap-4">
                  <div className="bg-white/10 p-2 rounded-lg">
                    <span className="text-2xl">👤</span>
                  </div>
                  <div>
                    <p className="text-sm text-white/60 font-medium">{t('finder.fullName')}</p>
                    <p className="text-xl font-bold text-white tracking-tight">{baggage.travelerName}</p>
                  </div>
                </div>

                {/* Agence + WhatsApp en grille */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-1">🏢</span>
                    <div>
                      <p className="text-sm text-white/60">{t('finder.agency')}</p>
                      <p className="text-base font-semibold text-white">{baggage.agency || t('finder.noAgency')}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-1">📱</span>
                    <div>
                      <p className="text-sm text-white/60">WhatsApp</p>
                      <p className="text-base font-mono text-orange-300">{baggage.whatsappOwner || '-'}</p>
                    </div>
                  </div>
                </div>

                {baggage.baggageType && (
                  <div className="flex items-start gap-3 pt-2 border-t border-white/10 mt-2">
                    <span className="text-xl">🧳</span>
                    <div>
                      <p className="text-sm text-white/60">{t('finder.bagType')}</p>
                      <p className="text-base font-medium capitalize text-white">{baggage.baggageType}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── CARTE 2 : DÉTAILS DU VOYAGE (Style Billet Premium) ─── */}
          {baggage && (
            <div className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-8 shadow-xl relative">
              {/* Halo décoratif orange style billet */}
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <h2 className="text-xs uppercase tracking-widest text-white/70 font-semibold mb-5 border-b border-white/10 pb-2 flex items-center gap-2">
                <span>✈️</span> {t('finder.travel_details')}
              </h2>

              <div className="space-y-6">
                {/* Numéro de vol — Bloc mis en avant style tableau d'aéroport */}
                {baggage.flightNumber && (
                  <div className="flex items-center justify-between bg-black/20 p-4 rounded-xl border border-white/5">
                    <div className="flex flex-col">
                      <span className="text-xs text-white/50 uppercase tracking-wide">{t('finder.flightNum')}</span>
                      <span className="text-2xl font-bold tracking-widest text-white font-mono">{baggage.flightNumber}</span>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                      <Plane className="w-6 h-6 text-orange-400" />
                    </div>
                  </div>
                )}

                {/* Destination + Date en grille */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {baggage.destination && (
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">📍</span>
                      <div>
                        <p className="text-sm text-white/60">{t('finder.destination')}</p>
                        <p className="text-lg font-bold text-orange-300">{baggage.destination}</p>
                      </div>
                    </div>
                  )}
                  {(baggage.departureDate || baggage.createdAt) && (
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">📅</span>
                      <div>
                        <p className="text-sm text-white/60">{baggage.departureDate ? t('finder.departureDate') : t('finder.activation_date')}</p>
                        <p className="text-base font-medium text-white">
                          {formatDate(baggage.departureDate || baggage.createdAt)}{baggage.departureTime ? ` – ${baggage.departureTime}` : ''}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ─── ACTION : PARTAGER POSITION GPS (Premium) ─── */}
          {!showForm && (
            <div className="mb-4">
              <button
                onClick={() => {
                  setShowForm(true);
                  handleShareLocation();
                }}
                disabled={isLoadingLocation}
                className="w-full group relative flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold text-lg py-5 px-6 rounded-2xl shadow-lg shadow-orange-500/40 transition-all duration-200 transform hover:-translate-y-1 min-h-[56px] focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-[#6613e3]"
              >
                {isLoadingLocation ? (
                  <>
                    <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{t('finder.locating')}</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{t('finder.share_gps')}</span>
                  </>
                )}
              </button>
              <p className="text-center text-white/50 text-xs mt-3">
                {t('finder.gps_security_note')}
              </p>
            </div>
          )}

          {/* ─── Step 2: Finder Form ─── */}
          {showForm && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* GPS Success */}
              {sharedPosition && !geoError && (
                <div className="p-4 bg-green-500/15 border border-green-500/30 rounded-xl flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <span className="text-white text-base md:text-lg font-medium">
                    ✓ {locationText}
                  </span>
                </div>
              )}

              {/* GPS Error */}
              {geoError && (
                <div className="p-4 bg-orange-500/15 border border-orange-500/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-orange-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[#FFFFFF] text-base font-medium">{t('finder.gps_unavailable')}</p>
                      <p className="text-[#FFFFFF] text-base mt-1">{geoError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Manual Location Input */}
              <div className={sharedPosition ? 'opacity-75' : ''}>
                <label className="text-base font-medium text-[#FFFFFF] mb-1.5 block">
                  {sharedPosition ? t('finder.location_optional') : t('finder.location_label')}
                </label>
                <input
                  type="text"
                  placeholder={sharedPosition ? t('finder.location_optional_placeholder') : t('finder.location_placeholder')}
                  value={otherLocation}
                  onChange={(e) => setOtherLocation(e.target.value)}
                  className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white text-base md:text-lg placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all min-h-[56px]"
                />
              </div>

              {/* Name Input */}
              <input
                type="text"
                placeholder={t('finder.first_name')}
                value={finderName}
                onChange={(e) => setFinderName(e.target.value)}
                className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white text-base md:text-lg placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all min-h-[56px]"
              />

              {/* WhatsApp Input */}
              <input
                type="tel"
                placeholder={`${t('finder.whatsapp')} (+33612345678)`}
                value={finderPhone}
                onChange={(e) => setFinderPhone(e.target.value)}
                className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white text-base md:text-lg placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all min-h-[56px]"
              />

              {/* ─── Contact The Owner — Two Buttons ─── */}
              <div className="pt-2">
                <h3 className="text-[#FFFFFF] text-sm font-bold uppercase tracking-widest text-center mb-4">
                  {t('finder.contact_the_owner_title')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* WhatsApp Button */}
                  <button
                    onClick={() => {
                      if (!validateFinderForm()) return;
                      handleWhatsApp();
                    }}
                    disabled={isSubmitting}
                    className="py-4 px-5 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-lg min-h-[56px] disabled:opacity-70 shadow-lg focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-[#6613e3]"
                  >
                    <MessageCircle className="w-5 h-5" />
                    {t('finder.by_whatsapp')}
                  </button>
                  {/* Phone Button */}
                  <button
                    onClick={() => {
                      if (!validateFinderForm()) return;
                      handlePhoneCall();
                    }}
                    disabled={isSubmitting}
                    className="py-4 px-5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-lg min-h-[56px] disabled:opacity-70 shadow-lg focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-[#6613e3]"
                  >
                    <Phone className="w-5 h-5" />
                    {t('finder.by_phone')}
                  </button>
                </div>
              </div>

              {/* Retry GPS */}
              {geoError && !sharedPosition && (
                <button
                  onClick={handleShareLocation}
                  disabled={isLoadingLocation}
                  className="w-full py-3 text-base text-[#FFFFFF] hover:text-white flex items-center justify-center gap-2 transition-colors min-h-[48px]"
                >
                  <Navigation className="w-5 h-5" />
                  {isLoadingLocation ? t('finder.locating') : t('finder.retry_gps')}
                </button>
              )}
            </div>
          )}

          {/* ─── Trust Note ─── */}
          <div className="mt-6 text-center text-base text-[#FFFFFF] tracking-wide">
            <Shield className="w-5 h-5 inline mr-1.5 text-[#FFFFFF]" />
            {t('finder.trust_note')}
          </div>
        </div>
      </div>
    </main>
  );
}
