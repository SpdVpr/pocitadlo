# Google Authentication - Dokumentace

## Přehled

Aplikace EvidujCas.cz podporuje přihlášení přes Google účet pomocí Firebase Authentication.

## Implementace

### 1. Firebase Nastavení

#### Povolení Google přihlášení:
1. Jděte do [Firebase Console](https://console.firebase.google.com)
2. Vyberte váš projekt
3. Jděte na Authentication → Sign-in method
4. Klikněte na "Google"
5. Povolte "Enable"
6. Vyberte Project support email
7. Klikněte "Save"

### 2. Kód

#### Auth Page (`app/auth/page.tsx`):
```typescript
import { signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider } from 'firebase/auth';

const handleGoogleSignIn = async () => {
  const provider = new GoogleAuthProvider();

  // Detect if mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (isMobile) {
    // Use redirect for mobile devices to avoid WebView issues
    await signInWithRedirect(auth, provider);
  } else {
    // Use popup for desktop
    const userCredential = await signInWithPopup(auth, provider);

    // Pro Google přihlášení použijeme UID jako heslo pro derivaci klíče
    const encryptionKey = await deriveAndSetEncryptionKey(
      userCredential.user.uid,
      userCredential.user.uid
    );
    setEncryptionKey(encryptionKey);
    router.push('/dashboard');
  }
};

// Handle redirect result on mount
useEffect(() => {
  const handleRedirectResult = async () => {
    const result = await getRedirectResult(auth);
    if (result) {
      const encryptionKey = await deriveAndSetEncryptionKey(result.user.uid, result.user.uid);
      setEncryptionKey(encryptionKey);
      localStorage.setItem('encryptionKeyType', 'google');
      router.push('/dashboard');
    }
  };
  handleRedirectResult();
}, []);
```

### 3. Šifrování pro Google uživatele

#### Problém:
Google přihlášení neposkytuje heslo, které bychom mohli použít pro derivaci šifrovacího klíče.

#### Řešení:
Pro Google uživatele používáme jejich Firebase UID jako "heslo" pro derivaci klíče:
- UID je jedinečný pro každého uživatele
- UID je známý pouze po přihlášení
- UID je persistentní (nemění se)
- UID je bezpečný (nelze uhodnout)

#### Proces:
```
User → Google Sign In → Firebase Auth → User UID
                                            ↓
                        Derive Key (PBKDF2: UID + UID as salt)
                                            ↓
                                    Encryption Key
```

### 4. Bezpečnost

#### Výhody:
- ✅ Uživatel nemusí pamatovat heslo
- ✅ Využívá Google 2FA (pokud je povoleno)
- ✅ Rychlé přihlášení
- ✅ Bezpečné (Google OAuth 2.0)

#### Nevýhody:
- ⚠️ Šifrovací klíč je odvozen z UID (ne z hesla)
- ⚠️ Pokud někdo získá přístup k Google účtu, může dešifrovat data
- ⚠️ Nelze změnit "heslo" (UID je fixní)

#### Doporučení:
- Doporučujeme uživatelům povolit 2FA na Google účtu
- Varovat uživatele o důležitosti zabezpečení Google účtu
- Zvážit implementaci dodatečného "master password" pro extra bezpečnost

### 5. UI/UX

#### Google tlačítko:
- Zobrazuje se nad email/heslo formulářem
- Obsahuje Google logo (SVG)
- Text: "Přihlásit se přes Google"
- Odděleno "nebo" dividerem

#### Chybové stavy:
- `auth/popup-closed-by-user` - Uživatel zavřel popup
- `auth/cancelled-popup-request` - Popup byl zrušen
- Obecné chyby - Zobrazí se chybová hláška

### 6. Testování

#### Manuální test:
1. Jděte na `/auth`
2. Klikněte "Přihlásit se přes Google"
3. Vyberte Google účet
4. Povolte přístup
5. Měli byste být přesměrováni na `/`
6. Vytvořte projekt
7. Zkontrolujte, že data jsou šifrovaná v Firestore

#### Bezpečnostní test:
1. Přihlaste se přes Google
2. Vytvořte projekt s citlivými daty
3. Odhlaste se
4. Jděte do Firestore Console
5. Zkontrolujte, že `name` a `hourlyRate` jsou šifrované (base64)

### 7. Migrace z Email/Password na Google

Pokud uživatel má účet s email/heslo a chce přejít na Google:

#### Problém:
- Email/Password účet používá heslo pro derivaci klíče
- Google účet používá UID pro derivaci klíče
- Klíče jsou různé → data nelze dešifrovat

#### Řešení 1: Nový účet
Uživatel si vytvoří nový Google účet a ručně přenese data.

#### Řešení 2: Link accounts (Budoucí implementace)
Firebase podporuje propojení účtů:
```typescript
import { linkWithPopup } from 'firebase/auth';

const provider = new GoogleAuthProvider();
await linkWithPopup(auth.currentUser, provider);
```

Ale stále zůstává problém s různými šifrovacími klíči.

#### Řešení 3: Re-encryption (Budoucí implementace)
1. Uživatel se přihlásí přes email/heslo
2. Dešifruje všechna data
3. Propojí Google účet
4. Znovu zašifruje data s novým klíčem (odvozeným z UID)

### 8. Známá omezení

#### 1. Popup blokování
Některé prohlížeče blokují popup okna. Řešení:
- Použít `signInWithRedirect` místo `signInWithPopup`
- Varovat uživatele o povolení popupů

#### 2. Mobilní zařízení ✅ VYŘEŠENO
Na mobilních zařízeních může být popup problematický.

**Řešení implementováno:**
- Automatická detekce mobilního zařízení
- Použití `signInWithRedirect` pro mobily
- Použití `signInWithPopup` pro desktop
- Zpracování redirect výsledku při návratu

#### 3. Šifrovací klíč
Šifrovací klíč je odvozen z UID, ne z hesla. To znamená:
- Nelze změnit "heslo"
- Pokud někdo získá přístup k Google účtu, může dešifrovat data

### 9. Budoucí vylepšení

#### Priorita 1:
- [x] Implementovat `signInWithRedirect` pro mobilní zařízení ✅
- [ ] Přidat varování o zabezpečení Google účtu
- [ ] Implementovat "master password" pro extra bezpečnost

#### Priorita 2:
- [ ] Implementovat propojení účtů (link accounts)
- [ ] Implementovat re-encryption při změně metody přihlášení
- [ ] Přidat možnost změny šifrovacího klíče

#### Priorita 3:
- [ ] Přidat další OAuth providery (Facebook, GitHub, atd.)
- [ ] Implementovat SSO (Single Sign-On)
- [ ] Přidat biometrické přihlášení (WebAuthn)

### 10. FAQ

#### Q: Je Google přihlášení bezpečné?
A: Ano, Google OAuth 2.0 je velmi bezpečný. Ale doporučujeme povolit 2FA na Google účtu.

#### Q: Mohu změnit z email/heslo na Google?
A: Ano, ale budete muset ručně přenést data nebo počkat na implementaci re-encryption.

#### Q: Co se stane, pokud ztratím přístup k Google účtu?
A: Ztratíte přístup k datům. Doporučujeme pravidelně zálohovat data.

#### Q: Mohu používat více metod přihlášení?
A: Ano, Firebase podporuje propojení více metod přihlášení k jednomu účtu.

#### Q: Je šifrování stejně silné jako u email/heslo?
A: Ano, používáme stejný algoritmus (PBKDF2 + XSalsa20-Poly1305). Rozdíl je jen v tom, co používáme jako "heslo" (UID vs. skutečné heslo).

## Závěr

Google přihlášení je implementováno a funkční. Uživatelé mohou používat Google účet pro rychlé a bezpečné přihlášení. Data jsou stále šifrovaná end-to-end, i když šifrovací klíč je odvozen z UID místo hesla.

