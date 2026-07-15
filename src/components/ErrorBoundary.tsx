'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

// Track if we already auto-cleared cache to avoid infinite loops
const CACHE_CLEAR_KEY = 'qrtag_cache_cleared_v2';

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, retryCount: 0 };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error.message, errorInfo.componentStack);

    // Auto-clear cache on first error (only once per session)
    const alreadyCleared = sessionStorage.getItem(CACHE_CLEAR_KEY);
    if (!alreadyCleared) {
      sessionStorage.setItem(CACHE_CLEAR_KEY, 'true');
      this.clearAllCaches().then(() => {
        console.log('[ErrorBoundary] Caches cleared, reloading...');
        window.location.reload();
      });
    }
  }

  clearAllCaches = async (): Promise<void> => {
    // 1. Clear all Cache API caches
    if ('caches' in window) {
      try {
        const names = await caches.keys();
        await Promise.all(names.map((name) => caches.delete(name)));
      } catch (e) {
        console.warn('[ErrorBoundary] Failed to clear caches:', e);
      }
    }

    // 2. Unregister all Service Workers
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((reg) => reg.unregister()));
      } catch (e) {
        console.warn('[ErrorBoundary] Failed to unregister SW:', e);
      }
    }
  };

  handleReload = async () => {
    await this.clearAllCaches();
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8 text-amber-500" />
              </div>

              <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Une erreur est survenue
              </h1>

              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                Un problème inattendu s&apos;est produit lors du chargement de la page.
              </p>

              {this.state.error && (
                <details className="mb-6 text-left">
                  <summary className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer mb-2">
                    Détails techniques
                  </summary>
                  <pre className="text-[11px] text-red-500 bg-red-50 dark:bg-red-500/5 rounded-lg p-3 overflow-auto max-h-32 font-mono">
                    {this.state.error.message}
                  </pre>
                </details>
              )}

              <div className="flex flex-col gap-3">
                <button
                  onClick={this.handleReload}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Vider le cache et recharger
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Retour à l&apos;accueil
                </button>
              </div>

              <p className="text-[10px] text-slate-400 mt-4">
                Si le problème persiste, essayez Ctrl+Shift+R (ou Cmd+Shift+R sur Mac)
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}