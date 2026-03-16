'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
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
  const lastProcessedUserIdRef = useRef<string | null>(null);
  const processingRef = useRef<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('[AUTH_CONTEXT] Auth state changed, user:', currentUser?.uid);
      console.log('[AUTH_CONTEXT] Processing:', processingRef.current, 'Last processed:', lastProcessedUserIdRef.current);
      
      setUser(currentUser);

      if (!currentUser) {
        // Clear encryption key when user logs out
        console.log('[AUTH_CONTEXT] No user, clearing encryption key');
        setEncryptionKey(null);
        lastProcessedUserIdRef.current = null;
        processingRef.current = false;
        setLoading(false);
      } else {
        // Skip if we're already processing this user
        if (processingRef.current && lastProcessedUserIdRef.current === currentUser.uid) {
          console.log('[AUTH_CONTEXT] Already processing this user, skipping duplicate call');
          return;
        }
        
        // Skip if we already successfully processed this user
        if (lastProcessedUserIdRef.current === currentUser.uid && encryptionKey) {
          console.log('[AUTH_CONTEXT] Already processed this user, skipping');
          setLoading(false);
          return;
        }
        
        processingRef.current = true;
        
        // Check if this is a Google user (providerData contains google.com)
        const isGoogleUser = currentUser.providerData.some(
          provider => provider.providerId === 'google.com'
        );
        console.log('[AUTH_CONTEXT] isGoogleUser:', isGoogleUser);

        if (isGoogleUser) {
          // Derive key from UID for Google users (always, regardless of localStorage)
          console.log('[AUTH_CONTEXT] Deriving encryption key from UID for Google user...');
          console.log('[AUTH_CONTEXT] User UID:', currentUser.uid);
          console.log('[AUTH_CONTEXT] Time:', new Date().toISOString());
          try {
            const derivationPromise = deriveKeyFromPassword(currentUser.uid, currentUser.uid);
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Key derivation timeout')), 15000)
            );
            
            const key = await Promise.race([derivationPromise, timeoutPromise]) as Uint8Array;
            console.log('[AUTH_CONTEXT] ✅ Key derived successfully, length:', key.length);
            console.log('[AUTH_CONTEXT] Key preview:', Array.from(key.slice(0, 8)));
            setEncryptionKey(key);
            lastProcessedUserIdRef.current = currentUser.uid;
            try {
              localStorage.setItem('encryptionKeyType', 'google');
              console.log('[AUTH_CONTEXT] localStorage.setItem successful');
            } catch (storageError) {
              console.error('[AUTH_CONTEXT] localStorage not available:', storageError);
            }
            console.log('[AUTH_CONTEXT] ✅ Encryption key SET for user:', currentUser.uid);
            console.log('[AUTH_CONTEXT] Time after set:', new Date().toISOString());
          } catch (error) {
            console.error('[AUTH_CONTEXT] ❌ Failed to derive encryption key:', error);
            console.error('[AUTH_CONTEXT] Error type:', error instanceof Error ? error.constructor.name : typeof error);
            console.error('[AUTH_CONTEXT] Error message:', error instanceof Error ? error.message : String(error));
          } finally {
            processingRef.current = false;
            console.log('[AUTH_CONTEXT] Setting loading to false (Google user)');
            setLoading(false);
          }
        } else {
          // Check if we need to derive encryption key for email/password users
          let storedKeyType = null;
          try {
            storedKeyType = localStorage.getItem('encryptionKeyType');
          } catch (e) {
            console.error('[AUTH_CONTEXT] localStorage.getItem failed:', e);
          }
          console.log('[AUTH_CONTEXT] User logged in, storedKeyType:', storedKeyType);

          if (storedKeyType === 'password') {
            // For email/password users, try to get password from sessionStorage
            const storedPassword = sessionStorage.getItem('userPassword');
            if (storedPassword) {
              console.log('[AUTH_CONTEXT] Deriving encryption key from stored password...');
              const key = await deriveKeyFromPassword(storedPassword, currentUser.uid);
              setEncryptionKey(key);
              lastProcessedUserIdRef.current = currentUser.uid;
              console.log('[AUTH_CONTEXT] Encryption key derived and set');
            } else {
              console.log('[AUTH_CONTEXT] No stored password found');
            }
            // If no password in sessionStorage, user will need to re-login
          }
          
          processingRef.current = false;
          console.log('[AUTH_CONTEXT] Setting loading to false (email/password user)');
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

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

