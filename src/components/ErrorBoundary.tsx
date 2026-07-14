'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    console.error('[ErrorBoundary] Error:', error.message);
    console.error('[ErrorBoundary] Stack:', error.stack);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
  }

  handleReload = () => {
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((reg) => reg.unregister());
      });
    }
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

      const errorMessage = this.state.error?.message || 'Erreur inconnue';
      const errorStack = this.state.error?.stack || '';
      const componentStack = this.state.errorInfo?.componentStack || '';

      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <div className="max-w-lg w-full">
            <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-6 text-center">
              {/* Icon */}
              <div className="w-14 h-14 bg-red-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-red-400" />
              </div>

              {/* Title */}
              <h1 className="text-lg font-bold text-white mb-1">
                Erreur client-side
              </h1>
              <p className="text-slate-400 text-xs mb-4">
                Page: {typeof window !== 'undefined' ? window.location.pathname : '?'}
              </p>

              {/* Error message - ALWAYS VISIBLE */}
              <div className="mb-4 text-left bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-[10px] text-red-400 uppercase tracking-wider font-bold mb-1">Message d&apos;erreur</p>
                <p className="text-sm text-red-300 font-mono break-all">{errorMessage}</p>
              </div>

              {/* Stack trace */}
              {errorStack && (
                <div className="mb-4 text-left bg-slate-900 border border-slate-600 rounded-xl p-4 max-h-40 overflow-auto">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Stack trace</p>
                  <pre className="text-[10px] text-slate-300 font-mono whitespace-pre-wrap">{errorStack}</pre>
                </div>
              )}

              {/* Component stack */}
              {componentStack && (
                <div className="mb-4 text-left bg-slate-900 border border-slate-600 rounded-xl p-4 max-h-32 overflow-auto">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Composants</p>
                  <pre className="text-[10px] text-amber-300 font-mono whitespace-pre-wrap">{componentStack}</pre>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-2 mt-4">
                <button
                  onClick={this.handleReload}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  Recharger la page
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-colors text-sm"
                >
                  <Home className="w-4 h-4" />
                  Retour à l&apos;accueil
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}