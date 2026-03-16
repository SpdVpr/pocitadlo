# Nasazení aplikace EvidujCas.cz

## 1. Firebase Nastavení

### Vytvoření projektu
1. Jděte na [Firebase Console](https://console.firebase.google.com/)
2. Klikněte na "Add project" (Přidat projekt)
3. Zadejte název projektu (např. "evidujcas")
4. Postupujte podle průvodce

### Konfigurace Firestore Database
1. V Firebase Console vyberte svůj projekt
2. V levém menu klikněte na "Firestore Database"
3. Klikněte na "Create database"
4. Vyberte "Start in test mode" (později upravíte pravidla)
5. Vyberte lokaci (např. europe-west1)

### Konfigurace Authentication
1. V Firebase Console vyberte svůj projekt
2. V levém menu klikněte na "Authentication"
3. Klikněte na "Get started"
4. Vyberte "Email/Password" jako metodu přihlášení
5. Povolte "Email/Password" a klikněte "Save"
6. Vyberte "Google" jako další metodu přihlášení
7. Povolte "Google" a klikněte "Save"

### Získání konfigurace
1. V Firebase Console klikněte na ikonu ozubeného kola → "Project settings"
2. Scrollujte dolů na "Your apps"
3. Klikněte na ikonu "</>" (Web)
4. Zaregistrujte aplikaci (např. "EvidujCas Web")
5. Zkopírujte konfigurační hodnoty

### Nastavení prostředí
1. Vytvořte soubor `.env.local` v kořenovém adresáři projektu
2. Zkopírujte následující a vyplňte své hodnoty:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### Firestore Security Rules
1. V Firebase Console → Firestore Database → Rules
2. Zkopírujte pravidla z `FIRESTORE_RULES.md`
3. Klikněte "Publish"

## 2. Lokální Spuštění

### Instalace závislostí
```bash
npm install
```

### Vývojový režim
```bash
npm run dev
```

Aplikace běží na http://localhost:3000

### Build pro produkci
```bash
npm run build
npm start
```

## 3. Deployment na Vercel

### Příprava
1. Pushnete projekt na GitHub
2. Ujistěte se, že máte `.env.local` v `.gitignore` (už je tam)

### Nasazení
1. Jděte na [Vercel](https://vercel.com)
2. Klikněte "New Project"
3. Importujte GitHub repository
4. Přidejte Environment Variables (stejné jako v .env.local):
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
5. Klikněte "Deploy"

### Po nasazení
1. Zkontrolujte, že aplikace běží
2. **Vytvořte Firestore indexy** (viz níže)
3. Zaregistrujte testovacího uživatele
4. Ověřte, že šifrování funguje
5. Zkontrolujte Firestore pravidla

### Vytvoření Firestore indexů (Důležité!)

Po nasazení musíte vytvořit indexy pro Firestore queries:

**Metoda 1: Automaticky (Doporučeno)**
1. Otevřete nasazenou aplikaci
2. Zaregistrujte se / přihlaste se
3. Otevřete stránku `/todo`
4. Otevřete konzoli prohlížeče (F12)
5. Uvidíte chybu s odkazem na vytvoření indexu
6. Klikněte na odkaz → otevře se Firebase Console
7. Klikněte "Create Index"
8. Počkejte na vytvoření (několik minut)
9. Opakujte pro ostatní stránky, pokud se objeví chyby

**Metoda 2: Firebase CLI**
```bash
firebase deploy --only firestore:indexes
```

Více informací v `FIRESTORE_RULES.md`.

## 4. Testování

### Registrace
1. Jděte na `/auth`
2. Klikněte "Registrace"
3. Zadejte email a heslo (min. 8 znaků)
4. Klikněte "Registrovat"

### Vytvoření projektu
1. Jděte na `/projects`
2. Klikněte "Nový projekt"
3. Zadejte název, hodinovou sazbu a vyberte barvu
4. Klikněte "Vytvořit"

### Sledování času
1. Jděte na `/`
2. Vyberte projekt
3. Klikněte "Start"
4. Počkejte chvíli
5. Klikněte "Stop"
6. Zkontrolujte, že se čas přidal

### Ověření šifrování
1. Jděte do Firebase Console → Firestore Database
2. Otevřete kolekci `projects`
3. Zkontrolujte, že pole `name` a `hourlyRate` jsou šifrované (base64 string)
4. Otevřete kolekci `time_entries`
5. Zkontrolujte, že pole `price` a `note` jsou šifrované

### Ověření bezpečnosti
1. Vytvořte druhého uživatele
2. Přihlaste se jako druhý uživatel
3. Zkontrolujte, že nevidíte data prvního uživatele
4. Zkontrolujte, že Firestore pravidla fungují

## 5. Údržba

### Zálohování
- Firebase automaticky zálohuje data
- Doporučujeme pravidelně exportovat data z Firestore

### Monitoring
- Sledujte Firebase Console → Analytics
- Sledujte Vercel Dashboard → Analytics

### Aktualizace
```bash
npm update
npm run build
git push
```

## 6. Řešení problémů

### Chyba při dešifrování
- Uživatel zadal špatné heslo
- Data byla vytvořena před implementací šifrování
- Šifrovací klíč není správně odvozen

### Uživatel nevidí svá data
- Zkontrolujte Firestore pravidla
- Zkontrolujte, že `userId` je správně nastaveno
- Zkontrolujte, že uživatel je přihlášen

### Aplikace nefunguje po nasazení
- Zkontrolujte Environment Variables na Vercelu
- Zkontrolujte Firebase konfiguraci
- Zkontrolujte logy na Vercelu

## 7. Bezpečnost

### Důležité
- ⚠️ Nikdy nesdílejte `.env.local` soubor
- ⚠️ Nikdy necommitujte Firebase klíče do Gitu
- ⚠️ Vždy používejte silná hesla
- ⚠️ Pravidelně aktualizujte závislosti

### Doporučení
- Používejte 2FA pro Firebase účet
- Používejte 2FA pro Vercel účet
- Pravidelně kontrolujte Firebase Security Rules
- Pravidelně kontrolujte Firebase Authentication

## 8. Podpora

Pro více informací viz:
- `README_SECURITY.md` - Bezpečnost a šifrování
- `SETUP.md` - Základní nastavení
- `FIRESTORE_RULES.md` - Firestore pravidla

