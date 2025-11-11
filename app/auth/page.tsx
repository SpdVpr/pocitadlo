'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  browserLocalPersistence,
  setPersistence,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { deriveAndSetEncryptionKey } from '@/lib/authContext';
import { useAuth } from '@/lib/authContext';

export default function AuthPage() {
  const router = useRouter();
  const { user, encryptionKey, setEncryptionKey } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const addDebugLog = (message: string) => {
    console.log(message);
  };

  useEffect(() => {
    addDebugLog(`[AUTH_PAGE] Mount - user: ${!!user}, encryptionKey: ${!!encryptionKey}`);
    
    // Check for redirect result immediately on mount
    const checkRedirect = async () => {
      try {
        addDebugLog('[AUTH_PAGE] Checking getRedirectResult...');
        const result = await getRedirectResult(auth);
        if (result) {
          addDebugLog(`[AUTH_PAGE] ✅ getRedirectResult returned user: ${result.user.uid}`);
          addDebugLog(`[AUTH_PAGE] User email: ${result.user.email}`);
          addDebugLog(`[AUTH_PAGE] User provider: ${result.providerId}`);
        } else {
          addDebugLog('[AUTH_PAGE] getRedirectResult returned null (normal page load)');
        }
      } catch (error) {
        addDebugLog(`[AUTH_PAGE] ❌ getRedirectResult error: ${error instanceof Error ? error.message : String(error)}`);
        const err = error as { code?: string };
        if (err.code) {
          addDebugLog(`[AUTH_PAGE] Error code: ${err.code}`);
        }
      }
    };
    
    checkRedirect();
  }, []);

  // Redirect if already logged in with encryption key
  useEffect(() => {
    addDebugLog(`[AUTH_PAGE] Check - user: ${!!user}, encryptionKey: ${!!encryptionKey}`);
    if (user && encryptionKey) {
      addDebugLog('[AUTH_PAGE] ✅ User + encryptionKey ready, redirecting to dashboard...');
      router.push('/dashboard');
    } else if (user && !encryptionKey) {
      addDebugLog('[AUTH_PAGE] ⏳ User present, waiting for encryptionKey...');
    }
  }, [user, encryptionKey, router]);

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      // Detect if mobile device
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      addDebugLog(`[AUTH] Starting Google sign in, isMobile: ${isMobile}`);
      addDebugLog(`[AUTH] Current URL: ${window.location.href}`);

      if (isMobile) {
        // Use redirect for mobile devices to avoid WebView issues
        addDebugLog('[AUTH] Using signInWithRedirect for mobile');
        addDebugLog(`[AUTH] Auth domain: ${auth.config.authDomain}`);
        addDebugLog(`[AUTH] Current auth state: ${auth.currentUser?.uid || 'none'}`);
        
        // CRITICAL: Set persistence BEFORE signInWithRedirect
        addDebugLog('[AUTH] Setting persistence to browserLocalPersistence...');
        try {
          await setPersistence(auth, browserLocalPersistence);
          addDebugLog('[AUTH] ✅ Persistence set successfully');
        } catch (persistError) {
          addDebugLog(`[AUTH] ❌ Persistence error: ${persistError instanceof Error ? persistError.message : String(persistError)}`);
          throw persistError;
        }
        
        addDebugLog('[AUTH] Calling signInWithRedirect...');
        await signInWithRedirect(auth, provider);
        addDebugLog('[AUTH] signInWithRedirect returned - redirecting to Google...');
        // Note: onAuthStateChanged in authContext will handle the result
      } else {
        // Use popup for desktop
        addDebugLog('[AUTH] Using popup for desktop');
        const userCredential = await signInWithPopup(auth, provider);

        // For desktop, derive key immediately and redirect
        const encryptionKey = await deriveAndSetEncryptionKey(userCredential.user.uid, userCredential.user.uid);
        setEncryptionKey(encryptionKey);
        localStorage.setItem('encryptionKeyType', 'google');
        console.log('[AUTH] Encryption key set for desktop, redirecting to dashboard');
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      console.error('[AUTH] Google sign-in error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Přihlášení bylo zrušeno');
      } else if (error.code === 'auth/cancelled-popup-request') {
        // Ignorovat - uživatel zavřel popup
      } else if (error.code === 'auth/unauthorized-domain') {
        setError('Tato doména není autorizována pro Google přihlášení. Kontaktujte správce.');
      } else {
        setError(error.message || 'Chyba při přihlášení přes Google');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const encryptionKey = await deriveAndSetEncryptionKey(password, userCredential.user.uid);
        setEncryptionKey(encryptionKey);
        localStorage.setItem('encryptionKeyType', 'password');
        // Store password in sessionStorage (cleared when browser closes)
        sessionStorage.setItem('userPassword', password);
        router.push('/dashboard');
      } else {
        // Register
        if (password !== confirmPassword) {
          setError('Hesla se neshodují');
          setLoading(false);
          return;
        }

        if (password.length < 8) {
          setError('Heslo musí mít alespoň 8 znaků');
          setLoading(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const encryptionKey = await deriveAndSetEncryptionKey(password, userCredential.user.uid);
        setEncryptionKey(encryptionKey);
        localStorage.setItem('encryptionKeyType', 'password');
        sessionStorage.setItem('userPassword', password);
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === 'auth/email-already-in-use') {
        setError('Tento email je již registrován');
      } else if (error.code === 'auth/invalid-email') {
        setError('Neplatný email');
      } else if (error.code === 'auth/weak-password') {
        setError('Heslo je příliš slabé');
      } else if (error.code === 'auth/user-not-found') {
        setError('Uživatel nenalezen');
      } else if (error.code === 'auth/wrong-password') {
        setError('Nesprávné heslo');
      } else {
        setError(error.message || 'Chyba při autentizaci');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-purple-600 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 text-center">
          EvidujCas.cz
        </h1>
        <p className="text-sm sm:text-base text-gray-600 text-center mb-6 sm:mb-8">
          {isLogin ? 'Přihlášení' : 'Registrace'}
        </p>

        {user && !encryptionKey && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 sm:mb-6 text-sm sm:text-base">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
              Dokončování přihlášení...
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 sm:mb-6 text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-white border-2 border-gray-300 text-gray-700 font-semibold py-2.5 sm:py-3 rounded-lg hover:bg-gray-50 transition-colors disabled:bg-gray-100 flex items-center justify-center gap-2 mb-4 sm:mb-6 text-sm sm:text-base"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {loading ? 'Zpracování...' : 'Přihlásit se přes Google'}
        </button>

        <div className="relative mb-4 sm:mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-xs sm:text-sm">
            <span className="px-2 bg-white text-gray-500">nebo</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-sm sm:text-base text-gray-700 font-semibold mb-1.5 sm:mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
              placeholder="vase@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm sm:text-base text-gray-700 font-semibold mb-1.5 sm:mb-2">
              Heslo
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
              placeholder="••••••••"
              required
            />
            {!isLogin && (
              <p className="text-gray-500 text-xs sm:text-sm mt-1">
                Minimálně 8 znaků
              </p>
            )}
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm sm:text-base text-gray-700 font-semibold mb-1.5 sm:mb-2">
                Potvrzení hesla
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                placeholder="••••••••"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white font-semibold py-2.5 sm:py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 text-sm sm:text-base"
          >
            {loading ? 'Zpracování...' : isLogin ? 'Přihlásit se' : 'Registrovat se'}
          </button>
        </form>

        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-sm sm:text-base text-gray-600">
            {isLogin ? 'Nemáte účet?' : 'Již máte účet?'}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-purple-600 font-semibold hover:underline ml-1 sm:ml-2 text-sm sm:text-base"
            >
              {isLogin ? 'Registrujte se' : 'Přihlaste se'}
            </button>
          </p>
        </div>

        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-purple-50 rounded-lg text-xs sm:text-sm text-gray-700">
          <p className="font-semibold mb-1.5 sm:mb-2">⚠️ Důležité:</p>
          <ul className="list-disc list-inside space-y-0.5 sm:space-y-1">
            <li>Vaše heslo se používá k šifrování dat</li>
            <li>Pokud heslo zapomenete, data nelze obnovit</li>
            <li>Heslo se nikdy neposílá na server</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

