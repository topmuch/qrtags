'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  QrCode,
  Eye,
  EyeOff,
  Loader2,
  Shield,
  Building2,
  ArrowRight,
  CheckCircle,
  Fingerprint,
  Mail,
  Lock,
  Search,
  MapPin,
  Bell,
  PackageSearch,
  ScanLine,
  RotateCcw,
  Users,
  Globe,
  Sparkles,
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

/* ══════════════════════════════════════════════
   CONFIG PER VARIANT
   ══════════════════════════════════════════════ */
type LoginVariant = 'agence' | 'superadmin';

interface LoginConfig {
  type: LoginVariant;
  title: string;
  subtitle: string;
  demoEmail: string;
  demoPassword: string;
  demoLabel: string;
  role: string;
  redirectPath: string;
  accentColor: string;
  accentHover: string;
  badgeText: string;
  badgeIcon: typeof QrCode;
  switchText: string;
  switchLink: string;
  switchHref: string;
}

const CONFIGS: Record<LoginVariant, LoginConfig> = {
  agence: {
    type: 'agence',
    title: 'Connexion Agence',
    subtitle: 'Accédez à votre espace de gestion des objets et QR codes',
    demoEmail: 'agence@qrtag.com',
    demoPassword: 'agence123',
    demoLabel: 'Agence',
    role: 'agency',
    redirectPath: '/agence/tableau-de-bord',
    accentColor: '#F59E0B',
    accentHover: '#D97706',
    badgeText: 'Espace Agence',
    badgeIcon: Building2,
    switchText: 'Vous êtes administrateur ?',
    switchLink: 'Connexion Admin',
    switchHref: '/admin/connexion',
  },
  superadmin: {
    type: 'superadmin',
    title: 'Administration',
    subtitle: 'Accès réservé aux administrateurs de la plateforme QRTags',
    demoEmail: 'admin@qrtag.com',
    demoPassword: 'admin123',
    demoLabel: 'SuperAdmin',
    role: 'superadmin',
    redirectPath: '/admin/tableau-de-bord',
    accentColor: '#0F172A',
    accentHover: '#1E293B',
    badgeText: 'SuperAdmin',
    badgeIcon: Shield,
    switchText: 'Vous êtes une agence ?',
    switchLink: 'Connexion Agence',
    switchHref: '/agence/connexion',
  },
};

/* ══════════════════════════════════════════════
   FOUND OBJECTS DATA
   ══════════════════════════════════════════════ */
interface FoundEvent {
  id: string;
  type: string;
  description: string;
  location: string;
  time: string;
  status: 'found' | 'returned' | 'scanning';
}

const FOUND_EVENTS: FoundEvent[] = [
  { id: '1', type: 'Sac à dos', description: 'Sac noir trouvé à la porte d\'embarquement T3', location: 'Aéroport CDG, Paris', time: 'il y a 2 min', status: 'found' },
  { id: '2', type: 'Passeport', description: 'Passeport signalé comme retrouvé', location: 'Gare de Lyon, Paris', time: 'il y a 8 min', status: 'returned' },
  { id: '3', type: 'Valise cabine', description: 'QR code scanné — localisation envoyée', location: 'Aéroport ML, Casablanca', time: 'il y a 15 min', status: 'scanning' },
  { id: '4', type: 'Tablette', description: 'Tablette retrouvée et rendue au propriétaire', location: 'Hôtel Hilton, Djeddah', time: 'il y a 22 min', status: 'returned' },
  { id: '5', type: 'Parapluie', description: 'Objet trouvé dans le bus Casablanca-Rabat', location: 'Gare CTM, Rabat', time: 'il y a 30 min', status: 'found' },
  { id: '6', type: 'Téléphone', description: 'Scan effectué — notification WhatsApp envoyée', location: 'Médine, Arabie Saoudite', time: 'il y a 35 min', status: 'scanning' },
  { id: '7', type: 'Ordinateur', description: 'PC portable retrouvé au bureau des objets trouvés', location: 'Aéroport DKR, Dakar', time: 'il y a 42 min', status: 'returned' },
  { id: '8', type: 'Lunettes', description: 'Lunettes de soleil trouvées au salon VIP', location: 'Aéroport CMN, Casablanca', time: 'il y a 1h', status: 'found' },
];

/* ══════════════════════════════════════════════
   ANIMATED EVENT CARD
   ══════════════════════════════════════════════ */
function EventCard({ event, isVisible }: { event: FoundEvent; isVisible: boolean }) {
  const statusConfig = {
    found: { icon: Search, color: 'text-amber-400', bg: 'bg-amber-500/15', label: 'Trouvé' },
    returned: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/15', label: 'Rendu' },
    scanning: { icon: ScanLine, color: 'text-cyan-400', bg: 'bg-cyan-500/15', label: 'Scan' },
  };
  const cfg = statusConfig[event.status];
  const StatusIcon = cfg.icon;

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-xl bg-white/[0.06] border border-white/[0.06] backdrop-blur-sm transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      }`}
    >
      <div className={`w-9 h-9 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
        <StatusIcon className={`w-4 h-4 ${cfg.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-white text-xs font-semibold truncate">{event.type}</span>
          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
            {cfg.label}
          </span>
        </div>
        <p className="text-white/40 text-[11px] leading-snug line-clamp-1">{event.description}</p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <MapPin className="w-3 h-3 text-white/25" />
          <span className="text-white/30 text-[10px]">{event.location}</span>
          <span className="text-white/15 text-[10px] ml-auto">{event.time}</span>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   LOGIN PAGE COMPONENT
   ══════════════════════════════════════════════ */
export default function LoginPage({ variant }: { variant: LoginVariant }) {
  const config = CONFIGS[variant];
  const router = useRouter();
  const { user, login, loading: authLoading, isAgency, isSuperAdmin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [visibleEvents, setVisibleEvents] = useState<Set<string>>(new Set());
  const [eventIndex, setEventIndex] = useState(0);

  // Redirect if already logged in
  useEffect(() => {
    if (authLoading) return;
    if (user && ((variant === 'agence' && isAgency) || (variant === 'superadmin' && isSuperAdmin))) {
      router.replace(config.redirectPath);
    }
  }, [user, authLoading, isAgency, isSuperAdmin, variant, router, config.redirectPath]);

  // Animate events appearing one by one
  useEffect(() => {
    const currentEvents = FOUND_EVENTS.slice(0, 4);
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    // Initial stagger
    currentEvents.forEach((event, i) => {
      const t = setTimeout(() => {
        setVisibleEvents(prev => new Set([...prev, event.id]));
      }, i * 600);
      timeouts.push(t);
    });

    // Cycle: every 4s, replace the oldest with the next
    const cycleInterval = setInterval(() => {
      setEventIndex(prev => {
        const next = prev + 1;
        const displayEvents = FOUND_EVENTS.slice(next, next + 4).length === 4
          ? FOUND_EVENTS.slice(next, next + 4)
          : FOUND_EVENTS.slice(0, 4);

        setVisibleEvents(new Set());
        displayEvents.forEach((event, i) => {
          const t = setTimeout(() => {
            setVisibleEvents(p => new Set([...p, event.id]));
          }, i * 200);
          timeouts.push(t);
        });

        return next % FOUND_EVENTS.length;
      });
    }, 6000);

    return () => {
      clearInterval(cycleInterval);
      timeouts.forEach(clearTimeout);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: config.role }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        login(data.user);
        router.push(config.redirectPath);
      } else {
        setError(data.error || 'Identifiants incorrects');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail(config.demoEmail);
    setPassword(config.demoPassword);
  };

  const isAgence = variant === 'agence';
  const BadgeIcon = config.badgeIcon;

  const displayEvents = eventIndex === 0
    ? FOUND_EVENTS.slice(0, 4)
    : FOUND_EVENTS.slice(eventIndex, eventIndex + 4).length === 4
      ? FOUND_EVENTS.slice(eventIndex, eventIndex + 4)
      : FOUND_EVENTS.slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#0a0e1a]">
      {/* ─── LEFT: Dark Panel — Objets Trouvés Live Feed ─── */}
      <div className="relative hidden lg:flex lg:w-[55%] min-h-screen flex-col overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e1a] via-[#111827] to-[#0a0e1a]" />
          {/* Amber glow orbs */}
          <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-amber-500/8 blur-[100px] animate-pulse" />
          <div className="absolute bottom-1/4 right-10 w-96 h-96 rounded-full bg-yellow-500/6 blur-[120px] animate-pulse" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-amber-600/4 blur-[150px]" />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-10 xl:p-14">
          {/* Top: Logo + Live indicator */}
          <div className="flex items-center justify-between">
            <Link href="/" className="group">
              <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm p-2 border border-white/10 flex items-center justify-center group-hover:bg-white/15 transition-all">
                <img src="/logo.png" alt="QRTags" className="w-full h-full object-contain" />
              </div>
            </Link>
            {/* Live badge */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-emerald-500/15 border border-emerald-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="text-emerald-400 text-xs font-bold tracking-wide">LIVE</span>
            </div>
          </div>

          {/* Middle: Hero Content */}
          <div className="flex-1 flex flex-col justify-center max-w-lg">
            {/* QR Icon with glow */}
            <div className="relative mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-2xl shadow-amber-500/25">
                <PackageSearch className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/40">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
            </div>

            <h2 className="text-4xl xl:text-5xl font-bold text-white mb-4 leading-[1.1]">
              Objets trouvés,
              <br />
              <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
                retrouvés en
              </span>
              <br />
              un scan.
            </h2>
            <p className="text-white/45 text-lg leading-relaxed mb-8 max-w-md">
              Chaque minute, des objets perdus sont signalés et retrouvés grâce aux QR codes QRTags dans le monde entier.
            </p>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white/[0.05] border border-white/[0.06] rounded-xl p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                    <ScanLine className="w-4 h-4 text-amber-400" />
                  </div>
                </div>
                <p className="text-white font-bold text-2xl">98%</p>
                <p className="text-white/30 text-[10px] mt-0.5 uppercase tracking-wider">Taux de retour</p>
              </div>
              <div className="bg-white/[0.05] border border-white/[0.06] rounded-xl p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                    <RotateCcw className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
                <p className="text-white font-bold text-2xl">15K+</p>
                <p className="text-white/30 text-[10px] mt-0.5 uppercase tracking-wider">Objets rendus</p>
              </div>
              <div className="bg-white/[0.05] border border-white/[0.06] rounded-xl p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-cyan-400" />
                  </div>
                </div>
                <p className="text-white font-bold text-2xl">15+</p>
                <p className="text-white/30 text-[10px] mt-0.5 uppercase tracking-wider">Pays couverts</p>
              </div>
            </div>
          </div>

          {/* Bottom: Live Feed */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4 text-amber-400" />
              <span className="text-white/60 text-xs font-semibold uppercase tracking-widest">Signalements en temps réel</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {displayEvents.map((event) => (
                <EventCard
                  key={event.id + '-' + eventIndex}
                  event={event}
                  isVisible={visibleEvents.has(event.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── RIGHT: Clean Form Panel ─── */}
      <div className="w-full lg:w-[45%] min-h-screen flex items-center justify-center bg-white px-6 py-12 sm:px-10 relative">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500" />

        <div className="w-full max-w-[400px] relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-10">
            <div className="w-20 h-20 rounded-2xl bg-slate-900 p-2.5 flex items-center justify-center">
              <img src="/logo.png" alt="QRTags" className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Mobile: Found objects mini banner */}
          <div className="lg:hidden mb-8 p-4 rounded-2xl bg-slate-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[40px]" />
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <PackageSearch className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-bold">Objets trouvés en temps réel</p>
                <p className="text-xs text-white/50">98% de taux de retour • 15+ pays</p>
              </div>
            </div>
          </div>

          {/* Badge */}
          <div className="flex items-center gap-2 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-900 text-white">
              <BadgeIcon className="w-3 h-3" />
              {config.badgeText}
            </span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
              {config.title}
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed">{config.subtitle}</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Email
              </label>
              <div className={`relative flex items-center rounded-xl border transition-all duration-200 ${
                focusedField === 'email'
                  ? 'border-amber-500 bg-white ring-4 ring-amber-500/5'
                  : 'border-slate-200 bg-slate-50 hover:border-slate-300'
              }`}>
                <div className={`pl-4 transition-colors ${focusedField === 'email' ? 'text-amber-500' : 'text-slate-400'}`}>
                  <Mail className="w-[18px] h-[18px]" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full bg-transparent border-none outline-none text-slate-900 placeholder-slate-400 py-3.5 px-3 text-sm"
                  placeholder={variant === 'agence' ? 'vous@agence.com' : 'admin@qrtag.com'}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Mot de passe
              </label>
              <div className={`relative flex items-center rounded-xl border transition-all duration-200 ${
                focusedField === 'password'
                  ? 'border-amber-500 bg-white ring-4 ring-amber-500/5'
                  : 'border-slate-200 bg-slate-50 hover:border-slate-300'
              }`}>
                <div className={`pl-4 transition-colors ${focusedField === 'password' ? 'text-amber-500' : 'text-slate-400'}`}>
                  <Lock className="w-[18px] h-[18px]" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full bg-transparent border-none outline-none text-slate-900 placeholder-slate-400 py-3.5 px-3 text-sm"
                  placeholder="Entrez votre mot de passe"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="pr-4 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
            </div>

            {/* Remember / Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer gap-2 group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500/20 cursor-pointer"
                />
                <span className="text-sm text-slate-500 group-hover:text-slate-700 transition-colors">Se souvenir de moi</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-amber-600 hover:text-amber-700 hover:underline transition-colors"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 active:scale-[0.98] shadow-xl shadow-amber-500/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo Account Card */}
          <div className="mt-6 p-4 rounded-xl bg-amber-50/60 border border-amber-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
                  <Fingerprint className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700">Compte démo</p>
                  <p className="text-[10px] text-slate-400 font-mono">{config.demoEmail} / {config.demoPassword}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={fillDemo}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors"
              >
                Remplir
              </button>
            </div>
          </div>

          {/* Switch */}
          <div className="mt-8 text-center text-sm text-slate-500">
            {config.switchText}{' '}
            <Link
              href={config.switchHref}
              className="font-semibold text-amber-600 hover:text-amber-700 hover:underline transition-colors"
            >
              {config.switchLink}
            </Link>
          </div>

          {/* Bottom links */}
          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-400">
            <Link href="/cgu" className="hover:text-amber-600 transition-colors">CGU</Link>
            <span>·</span>
            <Link href="/confidentialite" className="hover:text-amber-600 transition-colors">Confidentialité</Link>
            <span>·</span>
            <Link href="/contact" className="hover:text-amber-600 transition-colors">Aide</Link>
          </div>
        </div>
      </div>
    </div>
  );
}