'use client'

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  FileText,
  Sparkles,
  Globe,
  AlertCircle,
} from 'lucide-react';
import PhoneInput from '@/components/ui/PhoneInput';

// OBJECT-CATEGORIES-FEATURE: Import object category utilities
import { useTranslation } from '@/hooks/useTranslation';
import { Language, LANGUAGE_NAMES } from '@/lib/i18n';
import ObjectCategorySelector from '@/components/inscrire/ObjectCategorySelector';
import type { ObjectCategory } from '@/lib/object-categories';
import { OBJECT_ICONS, getObjectLabel } from '@/lib/object-categories';

// ─── Brand constants ───
const BRAND = '#FFDE21';
const INK = '#000000';

// ─── Language Selector Component ───
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
        <div
          role="listbox"
          aria-label="Language"
          className="absolute top-full right-0 mt-1 sm:mt-2 bg-[#0147d5] border-2 border-white/30 rounded-xl shadow-lg overflow-hidden z-50 min-w-[140px] sm:min-w-[160px]"
        >
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
                lang === l ? 'bg-[#FFDE21] text-black' : 'text-white hover:bg-white/10'
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

// ─── Dashed Encart Helper (bordure noire pointillée) ───
function DashedEncart({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`border-2 border-dashed border-black rounded-xl p-4 mb-3 last:mb-0 bg-white/30 ${className}`}>
      {children}
    </div>
  );
}

function InscrireContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qrFromUrl = searchParams.get('qr') || '';

  // Translation hook + object category + step state
  const { t, lang, setLang, dir, countryCode } = useTranslation();
  const [objectCategory, setObjectCategory] = useState<ObjectCategory | ''>('');
  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState<'manual' | 'scan'>('manual');

  const [loading, setLoading] = useState(false);
  const [phoneCountry, setPhoneCountry] = useState(countryCode);
  const [formData, setFormData] = useState({
    reference: qrFromUrl.toUpperCase(), // caché UI, conservé pour l'API
    firstName: '',
    lastName: '',
    destination: '',
    whatsapp: '',
  });

  // Sync phoneCountry when countryCode is detected
  useEffect(() => {
    if ((countryCode && countryCode !== 'FR') || !phoneCountry) {
      setPhoneCountry(countryCode);
    }
  }, [countryCode]);

  // Handle object category selection → advance to step 2
  const handleCategorySelect = (category: ObjectCategory) => {
    setObjectCategory(category);
    setStep(2);
  };

  const handleBackToCategory = () => {
    setStep(1);
  };

  // 🔒 Référence absente → activation impossible
  const missingReference = !formData.reference;

  const doSubmit = async () => {
    if (!objectCategory || missingReference) return;
    setLoading(true);

    try {
      const response = await fetch('/api/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: formData.reference,
          travelerFirstName: formData.firstName,
          travelerLastName: formData.lastName,
          whatsappOwner: formData.whatsapp,
          objectCategory: objectCategory,
          destination: formData.destination,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem(
          'activationData',
          JSON.stringify({
            reference: formData.reference,
            firstName: formData.firstName,
            lastName: formData.lastName,
            whatsapp: formData.whatsapp,
            destination: formData.destination,
            objectCategory: objectCategory,
            type: 'voyageur',
            activatedAt: new Date().toISOString(),
            expiresAt: data.baggage?.expiresAt,
          })
        );
        router.push('/success?type=voyageur');
      } else {
        const error = await response.json();
        alert(error.message || t('inscrire.error_activation'));
      }
    } catch (error) {
      console.error('Activation error:', error);
      alert(t('inscrire.error_activation'));
    } finally {
      setLoading(false);
    }
  };

  // Object category display
  const CategoryIcon = objectCategory ? OBJECT_ICONS[objectCategory] : '🏷️';
  const CategoryLabel = objectCategory ? getObjectLabel(objectCategory, lang) : '';

  return (
    <main
      className="min-h-[100dvh] min-h-screen bg-[#0147d5] flex flex-col px-4 sm:px-5 md:px-8 pb-[env(safe-area-inset-bottom,0px)]"
      dir={dir}
    >
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-40 flex items-center justify-between pt-[env(safe-area-inset-top,0px)] px-0 py-2 sm:py-3 md:py-4 bg-[#0147d5]">
        <Link
          href="/"
          className="flex items-center gap-2 text-white hover:text-[#FFDE21] transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm md:text-base font-medium">{t('inscrire.back')}</span>
        </Link>
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="QRTags" className="h-12 w-auto object-contain" />
        </div>
        <LanguageSelector lang={lang} setLang={setLang} />
      </header>

      {/* ─── Container ─── */}
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col py-4 sm:py-6 md:py-0">
        {/* ═══ BADGE DE STATUT ═══ */}
        <div className="mt-2 sm:mt-4 md:mt-6 mb-4 sm:mb-6 text-center">
          <span
            className="inline-flex items-center justify-center px-6 py-3 rounded-full font-bold text-lg shadow-lg text-black"
            style={{ backgroundColor: BRAND, boxShadow: `0 10px 25px ${BRAND}40` }}
          >
            {qrFromUrl ? `✨ ${t('inscrire.voyageur_badge')}` : `🏷️ ${t('inscrire.title')}`}
          </span>
          <p className="mt-3 text-white text-base md:text-lg leading-relaxed max-w-md mx-auto">
            {qrFromUrl ? t('inscrire.welcome_desc') : t('inscrire.subtitle')}
          </p>
        </div>

        {/* ─── Status Indicator ─── */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: BRAND }} />
          <span className="text-sm font-bold uppercase tracking-widest text-white">
            {step === 1 ? t('objects.select_category') : t('inscrire.step_2_subtitle')}
          </span>
        </div>

        {/* ═══ BLOC PRINCIPAL — Formulaire Activation (jaune moutarde) ═══ */}
        <div
          className="w-full rounded-2xl p-5 md:p-6 mb-5 shadow-xl"
          style={{ backgroundColor: BRAND, boxShadow: `0 20px 40px ${INK}15` }}
        >
          {/* ─── Step 1: Object Category Selector ─── */}
          {step === 1 && (
            <>
              <h2 className="text-xs uppercase tracking-widest text-black font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" style={{ color: INK }} />
                {t('objects.select_category')}
              </h2>

              {/* Tab Toggle — Manual / Scan (selected = #c5a643) */}
              <div className="flex gap-2 mb-5">
                <button
                  onClick={() => setActiveTab('manual')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all min-h-[44px] border-2 border-black ${
                    activeTab === 'manual'
                      ? 'bg-[#FFDE21] text-black shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  {t('inscrire.manual_tab')}
                </button>
                <button
                  onClick={() => setActiveTab('scan')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all min-h-[44px] border-2 border-black ${
                    activeTab === 'scan'
                      ? 'bg-[#FFDE21] text-black shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  {t('inscrire.scan_tab')}
                </button>
              </div>

              {activeTab === 'scan' ? (
                <div className="text-center py-6">
                  <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-white/30">
                    <Camera className="w-10 h-10 text-white/60" />
                  </div>
                  <h3 className="text-black font-semibold text-lg mb-2">{t('inscrire.scan_title')}</h3>
                  <p className="text-black/70 text-sm mb-5">{t('inscrire.scan_desc')}</p>
                  <button className="w-full py-4 px-6 bg-[#FFDE21] hover:bg-[#FFDE21]/80 text-black rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 min-h-[56px] shadow-lg">
                    <Camera className="w-5 h-5" />
                    {t('inscrire.scan_button')}
                  </button>
                </div>
              ) : (
                <>
                  <ObjectCategorySelector
                    selectedCategory={objectCategory}
                    onSelect={handleCategorySelect}
                    t={t}
                    lang={lang}
                  />
                  <button
                    type="button"
                    disabled={!objectCategory}
                    onClick={() => objectCategory && setStep(2)}
                    className="w-full mt-5 py-4 px-6 bg-black hover:bg-black/80 disabled:bg-black/30 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 min-h-[56px] shadow-lg"
                  >
                    {t('inscrire.next_step')}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </>
          )}

          {/* ─── Step 2: Activation Form ─── */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Back button */}
              <button
                type="button"
                onClick={handleBackToCategory}
                className="flex items-center gap-1.5 text-black/70 hover:text-black transition-colors text-sm mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('inscrire.back_step')}
              </button>

              {/* Category indicator — emoji + label */}
              <DashedEncart>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{CategoryIcon}</span>
                  <div>
                    <p className="text-sm text-black/70 font-medium">{t('common.baggage_type')}</p>
                    <p className="text-lg font-bold text-black">{CategoryLabel}</p>
                  </div>
                </div>
              </DashedEncart>

              <h2 className="text-xs uppercase tracking-widest text-black font-bold flex items-center gap-2">
                <span>{CategoryIcon}</span>
                {t('objects.owner_info')}
              </h2>

              {/* 🔒 Référence absente — warning + bouton désactivé */}
              {missingReference && (
                <div className="border-2 border-dashed border-black bg-white/60 rounded-xl p-4 mb-3 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-black">
                    <p className="font-bold mb-1">⚠️ Aucun code QR détecté</p>
                    <p className="text-black/70">
                      Scannez le QR code collé sur votre objet pour activer votre protection. Si vous
                      n&apos;avez pas encore de QR,{' '}
                      <Link href="/#pricing" className="underline font-bold text-black">
                        commandez un autocollant
                      </Link>
                      .
                    </p>
                  </div>
                </div>
              )}

              {/* Name Fields — Dashed Encart */}
              <DashedEncart>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-black/80 font-medium mb-1.5">
                      {t('inscrire.first_name_label')}
                    </p>
                    <input
                      type="text"
                      placeholder={t('inscrire.first_name_placeholder')}
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full bg-white border-2 border-black text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black focus:border-black rounded-lg px-3 py-2.5 text-base min-h-[48px]"
                      required
                    />
                  </div>
                  <div>
                    <p className="text-sm text-black/80 font-medium mb-1.5">
                      {t('inscrire.last_name_label')}
                    </p>
                    <input
                      type="text"
                      placeholder={t('inscrire.last_name_placeholder')}
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full bg-white border-2 border-black text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black focus:border-black rounded-lg px-3 py-2.5 text-base min-h-[48px]"
                      required
                    />
                  </div>
                </div>
              </DashedEncart>

              {/* Destination / Lieu habituel — Dashed Encart */}
              <DashedEncart>
                <div className="flex items-center gap-3">
                  <span className="text-xl">📍</span>
                  <div className="flex-1">
                    <p className="text-sm text-black/80 font-medium mb-1.5">
                      {t('inscrire.destination_label')}
                    </p>
                    <input
                      type="text"
                      placeholder={t('objects.destination_placeholder')}
                      value={formData.destination}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                      className="w-full bg-white border-2 border-black text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black focus:border-black rounded-lg px-3 py-2.5 text-base min-h-[48px]"
                    />
                  </div>
                </div>
              </DashedEncart>

              {/* WhatsApp — Dashed Encart */}
              <DashedEncart className="mb-0">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📱</span>
                  <div className="flex-1">
                    <PhoneInput
                      countryCode={phoneCountry}
                      onCountryChange={setPhoneCountry}
                      value={formData.whatsapp}
                      onChange={(fullNumber) => setFormData({ ...formData, whatsapp: fullNumber })}
                      placeholder="6 12 34 56 78"
                      required
                      label={t('inscrire.whatsapp_label')}
                      hint={t('inscrire.whatsapp_hint')}
                    />
                  </div>
                </div>
              </DashedEncart>
            </div>
          )}
        </div>

        {/* ═══ BOUTON SUBMIT (jaune) ═══ */}
        {step === 2 && (
          <div className="mb-6">
            <button
              onClick={doSubmit}
              disabled={loading || !objectCategory || missingReference}
              className="w-full py-4 px-6 bg-[#FFDE21] hover:bg-[#FFDE21]/80 active:bg-[#FFDE21]/90 disabled:bg-[#FFDE21]/30 disabled:cursor-not-allowed text-black font-bold text-lg rounded-xl shadow-lg transition-all duration-200 transform hover:-translate-y-1 min-h-[56px] focus:ring-2 focus:ring-[#FFDE21] focus:ring-offset-2 focus:ring-offset-[#FFDE21] flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  {t('inscrire.submit_loading')}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  {t('inscrire.submit')}
                </span>
              )}
            </button>
          </div>
        )}

        {/* ─── Help Section ─── */}
        <div className="text-center pb-6">
          <p className="text-white/60 text-sm">
            {t('inscrire.no_qr')}{' '}
            <Link href="/#pricing" className="font-bold underline" style={{ color: BRAND }}>
              {t('inscrire.order_sticker')}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function InscrirePage() {
  const { t } = useTranslation();

  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#0147d5] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-white/20 border-t-[#FFDE21] rounded-full mx-auto mb-4" />
            <p className="text-lg text-white">{t('common.loading')}</p>
          </div>
        </main>
      }
    >
      <InscrireContent />
    </Suspense>
  );
}