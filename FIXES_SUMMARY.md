# Souhrn oprav - Šifrování a Rebranding

## Datum: 2025-01-XX

## Přehled změn

### 1. Oprava inicializace šifrování ✅

**Problém:**
Po přihlášení (zejména přes Google) se zobrazovala hláška:
```
Inicializace šifrování...
Prosím obnovte stránku
```
A po obnovení stránky se nic nestalo - stále stejná hláška.

**Příčina:**
- Šifrovací klíč nebyl persistentní mezi načteními stránky
- Pro Google uživatele se klíč nederioval automaticky při načtení
- Pro email/password uživatele nebylo heslo dostupné pro re-derivaci

**Řešení:**

#### A) Automatická derivace pro Google uživatele

**`lib/authContext.tsx`:**
```typescript
// Při načtení stránky zkontrolujeme typ uživatele
const isGoogleUser = currentUser.providerData.some(
  provider => provider.providerId === 'google.com'
);

if (isGoogleUser || storedKeyType === 'google') {
  // Automaticky derivujeme klíč z UID
  const key = await deriveKeyFromPassword(currentUser.uid, currentUser.uid);
  setEncryptionKey(key);
  localStorage.setItem('encryptionKeyType', 'google');
}
```

#### B) SessionStorage pro email/password uživatele

**`app/auth/page.tsx`:**
```typescript
// Při přihlášení uložíme heslo do sessionStorage
sessionStorage.setItem('userPassword', password);
localStorage.setItem('encryptionKeyType', 'password');
```

**`lib/authContext.tsx`:**
```typescript
// Při načtení stránky zkusíme načíst heslo
const storedPassword = sessionStorage.getItem('userPassword');
if (storedPassword) {
  const key = await deriveKeyFromPassword(storedPassword, currentUser.uid);
  setEncryptionKey(key);
}
```

**Poznámka:** SessionStorage se maže při zavření prohlížeče, takže heslo není trvale uloženo.

#### C) Automatické přesměrování při selhání

**`components/ProtectedRoute.tsx`:**
```typescript
// Pokud po 2 sekundách stále není klíč, přesměrujeme na login
if (!loading && user && !encryptionKey) {
  const timeout = setTimeout(() => {
    if (!encryptionKey) {
      router.push('/auth');
    }
  }, 2000);
  
  return () => clearTimeout(timeout);
}
```

### 2. Rebranding: EvidujCas → EvidujCas.cz ✅

Změněn název aplikace z "EvidujCas" na "EvidujCas.cz" ve všech souborech.

#### Změněné soubory:

**Kód:**
- `app/auth/page.tsx` - Hlavička přihlašovací stránky
- `components/Navigation.tsx` - Logo v navigaci
- `app/layout.tsx` - Metadata (title)

**Dokumentace:**
- `README.md` - Hlavní README
- `README_SECURITY.md` - Bezpečnostní dokumentace
- `SETUP.md` - Návod na nastavení
- `DEPLOYMENT.md` - Návod na nasazení
- `IMPLEMENTATION_SUMMARY.md` - Technický souhrn
- `GOOGLE_AUTH.md` - Google auth dokumentace

### 3. Vylepšení UX ✅

#### Loading stavy

**Před:**
```
Inicializace šifrování...
Prosím obnovte stránku
```

**Po:**
```
[Spinner animace]
Inicializace šifrování...
Pokud se nic nestane, budete přesměrováni na přihlášení
```

#### Automatické akce
- ✅ Automatická derivace klíče pro Google uživatele
- ✅ Automatické přesměrování při selhání (2s timeout)
- ✅ Lepší chybové hlášky

## Technické detaily

### Persistence šifrovacího klíče

#### Google uživatelé:
```
1. User se přihlásí přes Google
2. Klíč se derivuje z UID
3. localStorage.setItem('encryptionKeyType', 'google')
4. Při dalším načtení stránky:
   - Zkontroluje se typ uživatele (Google)
   - Automaticky se derivuje klíč z UID
   - Uživatel může pokračovat
```

#### Email/Password uživatelé:
```
1. User se přihlásí přes email/heslo
2. Klíč se derivuje z hesla
3. sessionStorage.setItem('userPassword', password)
4. localStorage.setItem('encryptionKeyType', 'password')
5. Při dalším načtení stránky (v rámci session):
   - Načte se heslo ze sessionStorage
   - Derivuje se klíč z hesla
   - Uživatel může pokračovat
6. Po zavření prohlížeče:
   - sessionStorage se vymaže
   - Uživatel musí zadat heslo znovu
```

### Bezpečnostní aspekty

#### SessionStorage vs LocalStorage

**SessionStorage:**
- ✅ Maže se při zavření prohlížeče
- ✅ Izolováno podle záložky
- ✅ Méně rizikové než localStorage
- ❌ Uživatel musí zadat heslo po zavření prohlížeče

**LocalStorage:**
- ❌ Persistentní (zůstává i po zavření)
- ❌ Sdíleno mezi záložkami
- ❌ Více rizikové (XSS útoky)
- ✅ Uživatel nemusí zadávat heslo znovu

**Rozhodnutí:** Použili jsme sessionStorage pro hesla (bezpečnější) a localStorage pouze pro typ klíče (není citlivé).

#### Google UID jako "heslo"

Pro Google uživatele používáme UID jako "heslo" pro derivaci klíče:
- ✅ UID je jedinečný
- ✅ UID je známý pouze po přihlášení
- ✅ UID je persistentní
- ✅ Můžeme ho automaticky derivovat při každém načtení
- ⚠️ Pokud někdo získá přístup k Google účtu, může dešifrovat data

**Doporučení:** Povolit 2FA na Google účtu.

## Testování

### Test 1: Google přihlášení

1. ✅ Přihlásit se přes Google
2. ✅ Vytvořit projekt
3. ✅ Obnovit stránku (F5)
4. ✅ Ověřit, že projekt je stále viditelný
5. ✅ Zavřít prohlížeč
6. ✅ Otevřít znovu
7. ✅ Ověřit, že projekt je stále viditelný (automatické přihlášení)

### Test 2: Email/Password přihlášení

1. ✅ Přihlásit se přes email/heslo
2. ✅ Vytvořit projekt
3. ✅ Obnovit stránku (F5)
4. ✅ Ověřit, že projekt je stále viditelný
5. ✅ Zavřít prohlížeč
6. ✅ Otevřít znovu
7. ✅ Ověřit, že je nutné zadat heslo znovu

### Test 3: Selhání derivace

1. ✅ Přihlásit se
2. ✅ Vymazat sessionStorage ručně (DevTools)
3. ✅ Obnovit stránku
4. ✅ Ověřit, že se zobrazí "Inicializace šifrování..."
5. ✅ Ověřit, že po 2 sekundách dojde k přesměrování na login

### Test 4: Rebranding

1. ✅ Otevřít `/auth` - ověřit "EvidujCas.cz"
2. ✅ Otevřít `/` - ověřit "EvidujCas.cz" v navigaci
3. ✅ Zkontrolovat title v záložce: "EvidujCas.cz - Sledování..."
4. ✅ Zkontrolovat všechny stránky

## Build

```
✓ Compiled successfully in 8.2s
✓ Finished TypeScript in 5.3s
✓ Collecting page data in 2.1s
✓ Generating static pages (8/8)
✓ Finalizing page optimization
```

## Známá omezení

### 1. Email/Password uživatelé musí zadat heslo po zavření prohlížeče

**Důvod:** Heslo je uloženo v sessionStorage, které se maže při zavření.

**Alternativy:**
- Uložit heslo do localStorage (méně bezpečné)
- Implementovat "Remember me" checkbox
- Použít IndexedDB s šifrováním

### 2. Google uživatelé nemohou změnit "heslo"

**Důvod:** UID je fixní a nelze změnit.

**Řešení:** Implementovat "master password" pro extra vrstvu šifrování.

### 3. SessionStorage není sdíleno mezi záložkami

**Důvod:** SessionStorage je izolováno podle záložky.

**Dopad:** Pokud uživatel otevře aplikaci ve dvou záložkách, musí se přihlásit v obou.

**Řešení:** Použít localStorage nebo Broadcast Channel API.

## Další vylepšení

### Priorita 1:
- [ ] Implementovat "Remember me" checkbox pro email/password
- [ ] Přidat možnost změny hesla
- [ ] Implementovat "master password" pro Google uživatele

### Priorita 2:
- [ ] Použít IndexedDB místo sessionStorage
- [ ] Implementovat Broadcast Channel API pro sdílení mezi záložkami
- [ ] Přidat biometrické přihlášení (WebAuthn)

### Priorita 3:
- [ ] Implementovat offline režim
- [ ] Přidat PWA podporu
- [ ] Implementovat automatické zálohování

## Závěr

✅ Opravena inicializace šifrování po přihlášení
✅ Automatická derivace klíče pro Google uživatele
✅ SessionStorage pro email/password uživatele
✅ Automatické přesměrování při selhání
✅ Rebranding na "EvidujCas.cz"
✅ Build proběhl úspěšně

**Aplikace je nyní plně funkční a připravená k použití!** 🎉

## Poznámky pro uživatele

### Pro Google uživatele:
- ✅ Automatické přihlášení po zavření prohlížeče
- ✅ Žádné heslo k zapamatování
- ⚠️ Doporučujeme povolit 2FA na Google účtu

### Pro Email/Password uživatele:
- ⚠️ Musíte zadat heslo po zavření prohlížeče
- ✅ Heslo není trvale uloženo (bezpečnější)
- ✅ Heslo se maže při zavření prohlížeče

