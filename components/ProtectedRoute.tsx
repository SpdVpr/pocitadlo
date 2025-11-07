'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading, encryptionKey } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }

    // If user is logged in but no encryption key after loading, redirect to login
    if (!loading && user && !encryptionKey) {
      // Wait a bit for key derivation
      const timeout = setTimeout(() => {
        if (!encryptionKey) {
          // Key derivation failed, redirect to login
          router.push('/auth');
        }
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [user, loading, encryptionKey, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Načítání...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!encryptionKey) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-4">Inicializace šifrování...</p>
          <p className="text-sm text-gray-500">Pokud se nic nestane, budete přesměrováni na přihlášení</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

