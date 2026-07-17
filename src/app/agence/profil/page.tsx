'use client';

import { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Save,
  CheckCircle,
  Key,
  Loader2
} from "lucide-react";
import { useAgency } from '../layout';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfilPage() {
  const { agencyData, userName, userEmail, refreshAgency } = useAgency();
  const { refreshSession } = useAuth();
  const [form, setForm] = useState({
    name: agencyData?.name || '',
    email: agencyData?.email || userEmail || '',
    phone: agencyData?.phone || '',
    address: agencyData?.address || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/agency/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email || null,
          phone: form.phone || null,
          address: form.address || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erreur lors de la sauvegarde');
        return;
      }

      setSuccess(true);
      // Refresh agency data in the layout
      if (refreshAgency) await refreshAgency();
      await refreshSession();
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Erreur réseau — vérifiez votre connexion');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError('Tous les champs de mot de passe sont requis');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (form.newPassword.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/agency/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erreur lors du changement de mot de passe');
        return;
      }

      setSuccess(true);
      setForm(f => ({ ...f, currentPassword: '', newPassword: '', confirmPassword: '' }));
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Erreur réseau');
    } finally {
      setSaving(false);
    }
  };

  const planLabel = agencyData?.plan === 'pro' ? 'Pro' : agencyData?.plan === 'enterprise' ? 'Enterprise' : 'Gratuit';
  const planColor = agencyData?.plan === 'enterprise' ? 'kpi-card-purple' : agencyData?.plan === 'pro' ? 'kpi-card-blue' : 'kpi-card-green';
  const memberSince = agencyData?.createdAt
    ? new Date(agencyData.createdAt).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
    : 'N/A';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Profil de l&apos;agence</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Gérez les informations de votre agence</p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-emerald-700 dark:text-emerald-400">Modifications enregistrées avec succès !</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
          <span className="text-red-700 dark:text-red-400">{error}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Agency Info */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
              <Building className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Informations de l&apos;agence</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Ces informations apparaîtront sur vos documents</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Nom de l&apos;agence
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Adresse
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-amber-500 hover:bg-amber-600 text-white py-3 px-6 rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Enregistrer les modifications
                </>
              )}
            </button>
          </form>
        </div>

        {/* Password Change */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Key className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Changer le mot de passe</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Mettez à jour votre mot de passe régulièrement</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Mot de passe actuel</label>
              <input
                type="password"
                value={form.currentPassword}
                onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-slate-500/20 focus:border-slate-400 transition-all"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nouveau mot de passe</label>
                <input
                  type="password"
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-slate-500/20 focus:border-slate-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Confirmer le mot de passe</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-slate-500/20 focus:border-slate-400 transition-all"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handlePasswordChange}
              disabled={saving}
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 px-6 rounded-xl font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Changer le mot de passe
            </button>
          </div>
        </div>

        {/* Account Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="kpi-card kpi-card-green p-5">
            <p className="text-white/80 text-sm mb-1">Statut du compte</p>
            <p className="text-xl font-bold text-white">Actif</p>
          </div>
          <div className="kpi-card kpi-card-blue p-5">
            <p className="text-white/80 text-sm mb-1">Membre depuis</p>
            <p className="text-xl font-bold text-white">{memberSince}</p>
          </div>
          <div className={`kpi-card ${planColor} p-5`}>
            <p className="text-white/80 text-sm mb-1">Abonnement</p>
            <p className="text-xl font-bold text-white">{planLabel}</p>
          </div>
        </div>
      </div>
    </div>
  );
}