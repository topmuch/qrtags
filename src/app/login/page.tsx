'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Inner component that uses useSearchParams
function LoginRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'agency';

  useEffect(() => {
    // Redirect to the appropriate login page
    if (role === 'admin') {
      router.replace('/admin/connexion');
    } else {
      router.replace('/agence/connexion');
    }
  }, [router, role]);

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        <span className="text-white/50">Redirection...</span>
      </div>
    </div>
  );
}

// Loading fallback
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        <span className="text-white/50">Chargement...</span>
      </div>
    </div>
  );
}

// Main page with Suspense wrapper
export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LoginRedirect />
    </Suspense>
  );
}