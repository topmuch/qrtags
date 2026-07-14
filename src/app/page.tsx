'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { motion, useInView, AnimatePresence } from 'framer-motion';

const LandingChatbotWidget = dynamic(
  () => import('@/components/finder/LandingChatbotWidget'),
  { ssr: false, loading: () => null }
);

import {
  QrCode,
  Smartphone,
  MapPin,
  MessageCircle,
  Star,
  Menu,
  X,
  Mail,
  ArrowRight,
  Facebook,
  Twitter,
  Instagram,
  Lock,
  Zap,
  Users,
  Headphones,
  Shield,
  Globe,
  CheckCircle2,
  ScanLine,
  PackageSearch,
  Tag,
  Luggage,
  CreditCard,
  Laptop,
  KeyRound,
} from "lucide-react";

/* ──────────────────────────────────────────────
   Utility: Fade-in on scroll
   ────────────────────────────────────────────── */
function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   Animated Counter
   ────────────────────────────────────────────── */
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let cur = 0;
    const step = target / (2000 / 16);
    const t = setInterval(() => {
      cur += step;
      if (cur >= target) { setVal(target); clearInterval(t); }
      else setVal(Math.floor(cur));
    }, 16);
    return () => clearInterval(t);
  }, [inView, target]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ══════════════════════════════════════════════
   NAVIGATION
   ══════════════════════════════════════════════ */
function Navigation() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const links = [
    { label: 'Fonctionnement', href: '#fonctionnement' },
    { label: 'Protéger', href: '#objets' },
    { label: 'Tarifs', href: '#tarifs' },
    { label: 'Témoignages', href: '#temoignages' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-black/5' : 'bg-white'}`}>
      <div className="max-w-[1600px] mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="QRTags" className="h-12 w-auto object-contain" />
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <a key={l.href} href={l.href} className="px-4 py-2 text-[13px] font-medium text-slate-600 hover:text-slate-900 transition-colors duration-300 rounded-lg hover:bg-slate-50">
                {l.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-600 hover:text-slate-900 font-medium text-[13px] hover:bg-slate-50">
                Connexion
              </Button>
            </Link>
            <Link href="/devenir-partenaire">
              <Button className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-[13px] rounded-full px-6 h-10 transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-amber-500/20">
                Devenir Partenaire
              </Button>
            </Link>
          </div>

          <button className="md:hidden text-slate-700 p-2" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden overflow-hidden">
              <div className="py-4 border-t border-slate-100 space-y-1">
                {links.map(l => (
                  <a key={l.href} href={l.href} className="block text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium py-3 px-3 rounded-xl text-base transition-colors" onClick={() => setOpen(false)}>
                    {l.label}
                  </a>
                ))}
                <hr className="border-slate-100 my-3" />
                <Link href="/login" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full text-slate-700 font-medium justify-start hover:bg-slate-50">Connexion</Button>
                </Link>
                <Link href="/devenir-partenaire" onClick={() => setOpen(false)}>
                  <Button className="w-full bg-amber-500 text-black font-bold rounded-full mt-1">Devenir Partenaire</Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}

/* ══════════════════════════════════════════════
   HERO — Dark, bold, single message
   ══════════════════════════════════════════════ */
function Hero() {
  return (
    <section className="relative w-full min-h-[700px] sm:min-h-[750px] lg:aspect-video lg:max-h-screen flex items-center bg-black overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <Image src="/images/hero-qr-bag.png" alt="" fill className="object-cover opacity-40" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />
      </div>

      {/* Amber glow */}
      <div className="absolute top-1/3 right-1/4 w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] lg:w-[500px] lg:h-[500px] bg-amber-500/10 rounded-full blur-[100px] sm:blur-[150px]" />
      <div className="absolute bottom-0 left-0 w-[150px] h-[150px] sm:w-[250px] sm:h-[250px] lg:w-[300px] lg:h-[300px] bg-yellow-500/8 rounded-full blur-[80px] sm:blur-[100px]" />

      <div className="relative z-10 max-w-[1600px] mx-auto px-5 sm:px-8 pt-20 sm:pt-24 pb-16 w-full">
        <div className="max-w-4xl">
          {/* Tag */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 mb-8 px-4 py-2 border border-amber-500/30 rounded-full bg-amber-500/5"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            <span className="text-sm font-semibold text-amber-400">Système de protection par QR code</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white leading-[0.95] tracking-[-0.04em] mb-8"
          >
            Objets perdus,
            <br />
            <span className="text-amber-400">jamais plus.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-lg sm:text-xl text-white/60 max-w-xl leading-relaxed mb-10"
          >
            Collez un QR code sur vos objets. Si quelqu&apos;un les trouve, un scan suffit pour vous alerter sur WhatsApp — avec la localisation exacte.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 mb-16"
          >
            <Link href="/devenir-partenaire">
              <Button className="bg-amber-500 hover:bg-amber-400 text-black px-8 py-4 rounded-full font-bold text-base shadow-xl shadow-amber-500/25 hover:shadow-amber-500/35 hover:scale-[1.03] transition-all duration-300 gap-2 h-14">
                Protéger mes objets
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href="#fonctionnement">
              <Button className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white px-8 py-4 rounded-full font-semibold text-base transition-all duration-300 h-14 backdrop-blur-sm">
                Comment ça marche
              </Button>
            </a>
          </motion.div>

          {/* Micro stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-wrap gap-8 sm:gap-12"
          >
            {[
              { value: '15 000+', label: 'Objets protégés' },
              { value: '98%', label: 'Taux de récupération' },
              { value: '24/7', label: 'Disponibilité' },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-2xl sm:text-3xl font-black text-white">{s.value}</div>
                <div className="text-sm text-white/40 font-medium mt-0.5">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   MARQUEE TRUST BAR
   ══════════════════════════════════════════════ */
function TrustMarquee() {
  const items = [
    'Sans application à installer',
    'Fonctionne sans batterie',
    'Alerte WhatsApp instantanée',
    'Géolocalisation GPS',
    'Conforme RGPD',
    'Disponible 24/7',
  ];
  const doubled = [...items, ...items];
  return (
    <div className="bg-amber-500 py-3.5 overflow-hidden">
      <div className="flex animate-[marquee_20s_linear_infinite] whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={i} className="mx-8 text-sm font-bold text-black/80 flex items-center gap-2">
            <QrCode className="w-3.5 h-3.5" />
            {item}
          </span>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════
   PROBLEM SECTION — "Le problème"
   ══════════════════════════════════════════════ */
function ProblemSection() {
  const items = [
    { icon: '✈️', place: "A l'aéroport", detail: "Valises échangées, sacs oubliés au contrôle, objets laissés aux comptoirs" },
    { icon: '🚆', place: "En gare / bus", detail: "Bagages perdus en transit, téléphones glissés sur les sièges" },
    { icon: '🏨', place: "À l'hôtel", detail: "Chargeurs, clés, passeports oubliés dans les chambres" },
    { icon: '☕', place: "Au quotidien", detail: "Portefeuilles, clés, lunettes laissés au café, au restaurant, au travail" },
  ];

  return (
    <section className="py-24 lg:py-32 px-5 bg-slate-50">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.15em] uppercase text-red-500 mb-4">
              <PackageSearch className="w-3.5 h-3.5" />
              Le problème
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-[-0.03em] leading-[1.05] mb-5">
              On perd tous quelque chose,<br />
              <span className="text-red-500">partout, tout le temps</span>
            </h2>
            <p className="text-lg text-slate-500 leading-relaxed">
              25 millions d&apos;objets sont perdus chaque année dans le monde. Sans QRTags, moins de 5% sont retrouvés.
            </p>
          </div>
        </Reveal>

        {/* Bento grid — 2 big + 2 small */}
        <div className="grid md:grid-cols-2 gap-4 mb-12">
          {items.slice(0, 2).map((item, i) => (
            <Reveal key={item.place} delay={i * 0.1}>
              <div className="group relative bg-white rounded-2xl p-8 lg:p-10 border border-slate-100 hover:border-red-100 hover:shadow-xl hover:shadow-red-50/50 transition-all duration-500 h-full">
                <div className="flex items-start gap-5">
                  <div className="text-4xl flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{item.place}</h3>
                    <p className="text-slate-500 leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-16">
          {items.slice(2).map((item, i) => (
            <Reveal key={item.place} delay={(i + 2) * 0.1}>
              <div className="group bg-white rounded-2xl p-6 lg:p-8 border border-slate-100 hover:border-red-100 hover:shadow-lg hover:shadow-red-50/50 transition-all duration-500 h-full">
                <div className="flex items-start gap-4">
                  <div className="text-3xl flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1.5">{item.place}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Bottom CTA line */}
        <Reveal delay={0.35}>
          <div className="bg-black rounded-2xl p-8 lg:p-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <p className="text-white/50 text-sm font-medium mb-2">AVEC QRTAGS</p>
              <p className="text-2xl sm:text-3xl font-black text-white">
                Taux de récupération : <span className="text-amber-400">98%</span>
              </p>
            </div>
            <Link href="/devenir-partenaire">
              <Button className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm rounded-full px-8 h-12 shadow-lg shadow-amber-500/25 hover:scale-[1.03] transition-all duration-300 gap-2">
                Protéger mes objets
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   HOW IT WORKS — Horizontal timeline
   ══════════════════════════════════════════════ */
function HowItWorks() {
  const steps = [
    {
      num: '01',
      icon: QrCode,
      title: 'Collez le QR code',
      description: "Recevez votre autocollant QR et collez-le sur l'objet à protéger.",
      color: 'bg-amber-500',
    },
    {
      num: '02',
      icon: Smartphone,
      title: 'Décrivez votre objet',
      description: "Scannez le QR et ajoutez la description, couleur, marque distinctive.",
      color: 'bg-orange-500',
    },
    {
      num: '03',
      icon: ScanLine,
      title: 'Le trouveur scanne',
      description: "Quelqu'un trouve votre objet et scanne le QR avec son téléphone.",
      color: 'bg-emerald-500',
    },
    {
      num: '04',
      icon: MessageCircle,
      title: 'Alerte WhatsApp',
      description: "Vous recevez une notification avec la localisation et les coordonnées du trouveur.",
      color: 'bg-amber-400',
    },
  ];

  return (
    <section className="py-24 lg:py-32 px-5 bg-slate-50" id="fonctionnement">
      <div className="max-w-[1600px] mx-auto">
        <Reveal className="text-center mb-20">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.15em] uppercase text-amber-600 mb-4">
            <Zap className="w-3.5 h-3.5" />
            Fonctionnement
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-[-0.03em]">
            4 étapes. 30 secondes.
          </h2>
        </Reveal>

        {/* Desktop: horizontal with line */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute top-[48px] left-[60px] right-[60px] h-0.5 bg-gradient-to-r from-amber-300 via-orange-300 via-emerald-300 to-amber-200" />

            <div className="grid grid-cols-4 gap-8">
              {steps.map((s, i) => (
                <Reveal key={s.num} delay={i * 0.15}>
                  <div className="relative text-center">
                    {/* Circle */}
                    <div className={`relative z-10 w-24 h-24 mx-auto rounded-2xl ${s.color} flex items-center justify-center shadow-xl mb-6`}>
                      <s.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-xs font-black text-slate-300 mb-3">{s.num}</div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{s.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: vertical */}
        <div className="lg:hidden space-y-6">
          {steps.map((s, i) => (
            <Reveal key={s.num} delay={i * 0.1}>
              <div className="flex gap-5 items-start">
                <div className={`flex-shrink-0 w-14 h-14 rounded-xl ${s.color} flex items-center justify-center shadow-lg`}>
                  <s.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 pb-6 border-b border-slate-200 last:border-0">
                  <div className="text-xs font-black text-slate-300 mb-1">{s.num}</div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">{s.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{s.description}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   BENTO FEATURES GRID
   ══════════════════════════════════════════════ */
function BentoFeatures() {
  return (
    <section className="py-24 lg:py-32 px-5 bg-white">
      <div className="max-w-[1600px] mx-auto">
        <Reveal className="text-center mb-16">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.15em] uppercase text-amber-600 mb-4">
            <Shield className="w-3.5 h-3.5" />
            Fonctionnalités
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-[-0.03em]">
            Pourquoi <span className="text-amber-500">QRTags</span> est différent
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Large card - spans 2 cols */}
          <Reveal className="md:col-span-2">
            <div className="h-full bg-black rounded-3xl p-8 lg:p-10 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[100px] group-hover:bg-amber-500/15 transition-all duration-700" />
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-8">
                <div className="flex-1">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-5">
                    <MessageCircle className="w-6 h-6 text-amber-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Alerte WhatsApp instantanée</h3>
                  <p className="text-white/60 leading-relaxed">
                    Dès que quelqu&apos;un scanne votre QR code, vous recevez une notification WhatsApp avec la localisation GPS exacte et les coordonnées du trouveur. Pas d&apos;application à installer, pas de SMS payant.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/20 flex items-center justify-center">
                    <div className="text-center">
                      <MessageCircle className="w-12 h-12 text-amber-400 mx-auto mb-2" />
                      <span className="text-xs text-amber-400/80 font-semibold">Notification envoyée</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Tall card */}
          <Reveal className="md:row-span-2">
            <div className="h-full bg-gradient-to-b from-slate-50 to-white rounded-3xl p-8 border border-slate-100 flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-5">
                <MapPin className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Géolocalisation GPS</h3>
              <p className="text-slate-500 leading-relaxed flex-1">
                Le téléphone du trouveur envoie automatiquement sa position GPS. Vous savez exactement où se trouve votre objet, en temps réel, sur une carte interactive.
              </p>
              <div className="mt-8 flex flex-col gap-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span className="text-slate-600">Position automatique</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span className="text-slate-600">Carte interactive</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span className="text-slate-600">Temps réel</span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Regular cards row */}
          <Reveal>
            <div className="h-full bg-amber-50 rounded-3xl p-8 border border-amber-100/60 group hover:bg-amber-100/50 transition-all duration-500">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-5">
                <Smartphone className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Sans application</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Le trouveur n&apos;installe rien. Un simple scan QR avec l&apos;appareil photo suffit. Zéro friction.
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="h-full bg-slate-50 rounded-3xl p-8 border border-slate-100 group hover:bg-slate-100/70 transition-all duration-500">
              <div className="w-12 h-12 rounded-xl bg-slate-200/60 flex items-center justify-center mb-5">
                <Lock className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Sans batterie</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Le QR code est passif. Pas de pile, pas de recharge, pas de limite de temps. Il fonctionne toujours.
              </p>
            </div>
          </Reveal>

          {/* Full width security card */}
          <Reveal className="md:col-span-2 lg:col-span-3">
            <div className="rounded-3xl p-8 lg:p-10 bg-gradient-to-r from-slate-900 to-slate-800 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(245,158,11,0.1),transparent_60%)]" />
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="w-8 h-8 text-amber-400" />
                    <h3 className="text-2xl font-bold">Sécurité RGPD certifiée</h3>
                  </div>
                  <p className="text-white/60 leading-relaxed">
                    Vos données personnelles ne sont jamais stockées publiquement. Le système fonctionne avec des redirections sécurisées. Conforme aux normes européennes les plus strictes.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 flex-shrink-0">
                  {['Chiffrement AES-256', 'Hébergement UE', 'Aucune donnée publique', 'Audit de sécurité'].map(tag => (
                    <span key={tag} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-white/70">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   OBJECT CATEGORIES — What you can protect
   ══════════════════════════════════════════════ */
function ObjectCategories() {
  const categories = [
    { icon: Luggage, label: 'Valises & Sacs', count: '40%' },
    { icon: Laptop, label: 'Électronique', count: '25%' },
    { icon: CreditCard, label: 'Portefeuilles', count: '15%' },
    { icon: KeyRound, label: 'Clés & Accessoires', count: '12%' },
    { icon: Globe, label: 'Documents', count: '8%' },
  ];

  return (
    <section className="py-24 lg:py-32 px-5 bg-slate-50" id="objets">
      <div className="max-w-[1400px] mx-auto">
        <Reveal className="text-center mb-16">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.15em] uppercase text-amber-600 mb-4">
            <Tag className="w-3.5 h-3.5" />
            Ce que vous pouvez protéger
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-[-0.03em]">
            Tout ce qui compte
          </h2>
          <p className="text-lg text-slate-500 mt-4 max-w-xl mx-auto">
            Des valises aux clés, un QR code protège n&apos;importe quel objet.
          </p>
        </Reveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat, i) => (
            <Reveal key={cat.label} delay={i * 0.08}>
              <div className="group bg-white rounded-2xl p-6 border border-slate-100 hover:border-amber-200 text-center hover:shadow-lg hover:shadow-amber-100/30 transition-all duration-500 hover:-translate-y-1 cursor-pointer">
                <div className="w-14 h-14 mx-auto rounded-xl bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center mb-4 transition-colors duration-300">
                  <cat.icon className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">{cat.label}</h3>
                <span className="text-xs text-slate-400 font-medium">{cat.count} des pertes</span>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.4}>
          <div className="mt-12 text-center">
            <Link href="/inscrire">
              <Button className="bg-black hover:bg-slate-800 text-white px-8 py-3.5 rounded-full font-bold text-sm transition-all duration-300 hover:scale-[1.02] shadow-lg gap-2">
                Voir les 20 catégories
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   STATS — Dark section
   ══════════════════════════════════════════════ */
function StatsDark() {
  const stats = [
    { value: 15000, suffix: '+', label: 'Objets protégés', icon: Tag },
    { value: 9800, suffix: '+', label: 'Objets retrouvés', icon: CheckCircle2 },
    { value: 150, suffix: '+', label: 'Partenaires', icon: Users },
    { value: 50000, suffix: '+', label: 'Scans réalisés', icon: ScanLine },
  ];

  return (
    <section className="py-20 lg:py-24 px-5 bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(245,158,11,0.08),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(234,179,8,0.06),transparent_60%)]" />
      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10 lg:gap-16">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.1}>
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-amber-400" />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-white mb-1 tracking-[-0.02em]">
                  <Counter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-white/40 font-medium">{stat.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   TESTIMONIALS
   ══════════════════════════════════════════════ */
function Testimonials() {
  const testimonials = [
    {
      quote: "J'ai perdu mon sac à main à l'aéroport de Dakar. 45 minutes plus tard, une femme me contacte sur WhatsApp via le QR code. Incroyable.",
      name: 'Fatou Diallo',
      role: 'Voyageuse fréquente',
      initials: 'FD',
    },
    {
      quote: "Mon ordinateur a glissé dans le TGV. Le lendemain, un passager l'a scanné et j'ai pu le récupérer. QRTags m'a sauvé la mise.",
      name: 'Marc Dupont',
      role: 'Homme d\'affaires',
      initials: 'MD',
    },
    {
      quote: "Nous proposons QRTags à tous nos clients. Le taux de perte d'objets a chuté de 90% en 6 mois.",
      name: 'Amina Benali',
      role: 'Directrice agence',
      initials: 'AB',
    },
  ];

  return (
    <section className="py-24 lg:py-32 px-5 bg-white" id="temoignages">
      <div className="max-w-[1600px] mx-auto">
        <Reveal className="text-center mb-16">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.15em] uppercase text-amber-600 mb-4">
            <Star className="w-3.5 h-3.5" />
            Témoignages
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-[-0.03em]">
            Ils ont retrouvé leurs objets
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.12}>
              <div className="h-full bg-slate-50 rounded-2xl p-5 sm:p-8 hover:bg-slate-100/50 transition-all duration-500 flex flex-col">
                <div className="flex gap-0.5 mb-6">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 text-[15px] leading-[1.8] flex-1 mb-8">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-6 border-t border-slate-200/60">
                  <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   PRICING
   ══════════════════════════════════════════════ */
function Pricing() {
  const plans = [
    {
      name: 'QR Code',
      price: '1 500',
      period: 'CFA',
      desc: 'Protection individuelle',
      features: ['5 objets protégés', '1 an de protection', 'Activation en 30s', 'Alertes WhatsApp', 'Géolocalisation GPS'],
      popular: true,
      href: '/contact',
    },
    {
      name: 'Agence',
      price: '',
      period: '',
      desc: 'Pour les professionnels',
      features: ['QR codes illimités', 'Dashboard gestion', 'Analytics avancés', 'Support dédié', 'Branding personnalisé', 'API intégrée'],
      popular: false,
      href: '/devenir-partenaire',
    },
  ];

  return (
    <section className="py-24 lg:py-32 px-5 bg-slate-50" id="tarifs">
      <div className="max-w-[1200px] mx-auto">
        <Reveal className="text-center mb-16">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.15em] uppercase text-amber-600 mb-4">
            <Tag className="w-3.5 h-3.5" />
            Tarifs
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-[-0.03em]">
            Protégez vos objets dès <span className="text-amber-500">1 500 CFA</span>
          </h2>
          <p className="text-lg text-slate-500 mt-4">Pas de frais cachés.</p>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-6 items-start">
          {plans.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 0.12}>
              <div className={`relative h-full rounded-2xl p-6 sm:p-8 lg:p-10 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl ${
                plan.popular
                  ? 'bg-black text-white shadow-xl shadow-black/20'
                  : 'bg-white border border-slate-200'
              }`}>
                {plan.popular && (
                  <span className="absolute -top-3 left-8 bg-amber-500 text-black text-xs font-bold px-4 py-1.5 rounded-full">
                    Populaire
                  </span>
                )}
                <h3 className={`text-xl font-bold mb-1 ${plan.popular ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                <p className={`text-sm mb-6 ${plan.popular ? 'text-white/50' : 'text-slate-500'}`}>{plan.desc}</p>
                <div className="flex items-baseline gap-1 mb-8">
                  {plan.price ? (
                  <span className={`text-4xl sm:text-5xl font-black tracking-[-0.02em] ${plan.popular ? 'text-amber-400' : 'text-slate-900'}`}>
                    {plan.price}{' '}{plan.period}
                  </span>
                  ) : (
                  <span className={`text-3xl font-black tracking-[-0.02em] ${plan.popular ? 'text-amber-400' : 'text-slate-900'}`}>Nous consulter</span>
                  )}
                </div>
                <ul className="space-y-3 mb-9">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${plan.popular ? 'text-amber-400' : 'text-amber-500'}`} />
                      <span className={plan.popular ? 'text-white/80' : 'text-slate-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.href}>
                  <Button className={`w-full py-3.5 rounded-full font-bold text-sm transition-all duration-300 hover:scale-[1.02] ${
                    plan.popular
                      ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/25'
                      : 'bg-black hover:bg-slate-800 text-white shadow-lg shadow-black/20'
                  }`}>
                    Choisir {plan.name}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   FINAL CTA — Dark, impactful
   ══════════════════════════════════════════════ */
function FinalCTA() {
  return (
    <section className="py-24 lg:py-32 px-5 bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.12),transparent_60%)]" />
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />

      <div className="max-w-3xl mx-auto text-center relative z-10">
        <Reveal>
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 flex items-center justify-center mb-8">
            <QrCode className="w-8 h-8 text-amber-400" />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-[-0.03em] leading-[1.1] mb-6">
            Ne laissez plus vos objets<br />
            <span className="text-amber-400">au hasard</span>
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="text-lg text-white/50 mb-12 leading-relaxed">
            Collez, scannez, retrouvez. Rejoignez les 15 000+ personnes qui protègent déjà ce qui compte.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button className="bg-amber-500 hover:bg-amber-400 text-black px-8 py-4 rounded-full font-bold text-base shadow-xl shadow-amber-500/20 hover:shadow-amber-500/30 hover:scale-[1.03] transition-all duration-300 gap-2.5 h-14">
                Protéger mes objets
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/devenir-partenaire">
              <Button className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white px-8 py-4 rounded-full font-semibold text-base transition-all duration-300 h-14">
                Devenir partenaire
              </Button>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   CONTACT BAR
   ══════════════════════════════════════════════ */
function ContactBar() {
  return (
    <section className="py-16 px-5 bg-white">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-5 sm:p-8 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
              <Headphones className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Une question ?</h3>
              <p className="text-sm text-slate-500">Notre équipe est disponible 24/7.</p>
            </div>
          </div>
          <Link href="/contact">
            <Button className="bg-black hover:bg-slate-800 text-white rounded-full font-bold text-sm shadow-lg transition-all duration-300 hover:scale-[1.02] gap-2 px-6 h-11">
              <Mail className="w-4 h-4" />
              Nous contacter
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   FOOTER
   ══════════════════════════════════════════════ */
function Footer() {
  const columns = [
    { title: 'Produit', links: [{ label: 'Fonctionnement', href: '#fonctionnement' }, { label: 'Objets', href: '#objets' }, { label: 'Tarifs', href: '#tarifs' }, { label: 'Démo', href: '/demo' }] },
    { title: 'Entreprise', links: [{ label: 'À propos', href: '/a-propos' }, { label: 'Partenaires', href: '/devenir-partenaire' }, { label: 'Espace Agence', href: '/agence/connexion' }, { label: 'Contact', href: '/contact' }] },
    { title: 'Légal', links: [{ label: 'Mentions légales', href: '/mentions-legales' }, { label: 'Confidentialité', href: '/confidentialite' }, { label: 'CGU', href: '/cgu' }] },
  ];

  return (
    <footer className="bg-slate-950 text-white pt-12 sm:pt-16 pb-10">
      <div className="max-w-[1600px] mx-auto px-5">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <p className="text-sm leading-relaxed max-w-xs text-white/40 mb-7">
              Protection intelligente par QR code. Retrouvez tout ce que vous perdez, partout dans le monde.
            </p>
            <div className="flex items-center gap-2.5">
              {[
                { icon: Facebook, href: 'https://facebook.com/qrtags', label: 'Facebook' },
                { icon: Instagram, href: 'https://instagram.com/qrtags', label: 'Instagram' },
                { icon: Twitter, href: 'https://twitter.com/qrtags', label: 'Twitter' },
              ].map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-white/5 hover:bg-amber-500/20 rounded-lg flex items-center justify-center transition-all duration-300"
                  aria-label={s.label}
                >
                  <s.icon className="w-4 h-4 text-white/40 hover:text-amber-400 transition-colors" />
                </a>
              ))}
            </div>
          </div>
          {columns.map(col => (
            <div key={col.title}>
              <h4 className="text-xs font-bold tracking-[0.1em] uppercase text-white/60 mb-5">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map(link => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-white/40 hover:text-amber-400 transition-colors duration-300">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/30">&copy; {new Date().getFullYear()} QRTags. Tous droits réservés.</p>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/mentions-legales" className="text-white/30 hover:text-amber-400 transition-colors">Mentions légales</Link>
            <span className="text-white/10">·</span>
            <Link href="/confidentialite" className="text-white/30 hover:text-amber-400 transition-colors">Confidentialité</Link>
            <span className="text-white/10">·</span>
            <Link href="/cgu" className="text-white/30 hover:text-amber-400 transition-colors">CGU</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════
   TRACKING WIDGET (inline, amber/black themed)
   ══════════════════════════════════════════════ */
function InlineTracker() {
  const router = useRouter();
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    const v = value.trim();
    if (!v) { setError('Entrez votre référence'); return; }
    router.push(`/suivi/${v.toUpperCase()}`);
  };

  return (
    <section className="py-10 px-5 bg-gradient-to-r from-amber-500 to-yellow-500">
      <div className="max-w-lg mx-auto">
        <p className="text-black/60 text-sm font-semibold text-center mb-3">Suivez votre objet en temps réel</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={e => { setValue(e.target.value.toUpperCase()); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="Ex: BAG26-XXXXXX"
            maxLength={15}
            className="flex-1 px-5 py-3.5 rounded-xl bg-black/10 border border-black/10 text-black placeholder:text-black/30 font-mono tracking-wider text-sm outline-none focus:ring-2 focus:ring-black/20 focus:border-black/20 transition-all"
          />
          <button
            onClick={submit}
            className="px-6 py-3.5 rounded-xl bg-black text-amber-400 font-bold text-sm hover:bg-slate-900 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
          >
            <ScanLine className="w-4 h-4" />
            Suivre
          </button>
        </div>
        {error && <p className="text-black/70 text-xs mt-2 text-center font-medium">{error}</p>}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════ */
export default function HomePage() {
  return (
    <main className="bg-white">
      <Navigation />
      <Hero />
      <TrustMarquee />
      <InlineTracker />
      <ProblemSection />
      <HowItWorks />
      <BentoFeatures />
      <ObjectCategories />
      <StatsDark />
      <Testimonials />
      <Pricing />
      <FinalCTA />
      <ContactBar />
      <Footer />
      <LandingChatbotWidget />
    </main>
  );
}