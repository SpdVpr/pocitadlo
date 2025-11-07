'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { deriveKeyFromPassword } from './encryption';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  encryptionKey: Uint8Array | null;
  setEncryptionKey: (key: Uint8Array | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [encryptionKey, setEncryptionKey] = useState<Uint8Array | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        // Clear encryption key when user logs out
        setEncryptionKey(null);
        setLoading(false);
      } else {
        // Check if we need to derive encryption key
        const storedKeyType = localStorage.getItem('encryptionKeyType');

        if (!encryptionKey) {
          // Check if this is a Google user (providerData contains google.com)
          const isGoogleUser = currentUser.providerData.some(
            provider => provider.providerId === 'google.com'
          );

          if (isGoogleUser || storedKeyType === 'google') {
            // Derive key from UID for Google users
            const key = await deriveKeyFromPassword(currentUser.uid, currentUser.uid);
            setEncryptionKey(key);
            localStorage.setItem('encryptionKeyType', 'google');
          } else if (storedKeyType === 'password') {
            // For email/password users, try to get password from sessionStorage
            const storedPassword = sessionStorage.getItem('userPassword');
            if (storedPassword) {
              const key = await deriveKeyFromPassword(storedPassword, currentUser.uid);
              setEncryptionKey(key);
            }
            // If no password in sessionStorage, user will need to re-login
          }
        }

        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [encryptionKey]);

  const logout = async () => {
    setEncryptionKey(null);
    localStorage.removeItem('encryptionKeyType');
    sessionStorage.removeItem('userPassword');
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, encryptionKey, setEncryptionKey, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Derives encryption key from password and stores it in context
 */
export async function deriveAndSetEncryptionKey(password: string, userId: string) {
  const key = await deriveKeyFromPassword(password, userId);
  return key;
}

