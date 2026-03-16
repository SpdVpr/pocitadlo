# Nastavení aplikace EvidujCas.cz

## 1. Firebase nastavení

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

### Firestore Authentication
1. V Firebase Console vyberte svůj projekt
2. V levém menu klikněte na "Authentication"
3. Klikněte na "Get started"
4. Vyberte "Email/Password" jako metodu přihlášení
5. Povolte "Email/Password" a klikněte "Save"
6. Vyberte "Google" jako další metodu přihlášení
7. Povolte "Google" a klikněte "Save"

### Firestore Security Rules (Produkční)
V Firebase Console → Firestore Database → Rules, nastavte pravidla z souboru `FIRESTORE_RULES.md`

Tato pravidla zajišťují:
- ✅ Každý uživatel vidí jen svá data
- ✅ Vlastník databáze vidí jen svá data
- ✅ Nikdo nemůže číst/psát cizí data
- ✅ Citlivá data jsou šifrována na klientu

### Firestore Indexy (Důležité!)
Firestore vyžaduje indexy pro složené queries. Máte 3 možnosti:

**Možnost 1: Automaticky (Nejjednodušší)**
1. Spusťte aplikaci
2. Otevřete stránku `/todo`
3. V konzoli prohlížeče uvidíte chybu s odkazem
4. Klikněte na odkaz a vytvořte index
5. Opakujte pro ostatní stránky

**Možnost 2: Manuálně**
1. Jděte na Firebase Console → Firestore Database → Indexes
2. Vytvořte indexy podle `FIRESTORE_RULES.md`

**Možnost 3: Firebase CLI**
```bash
firebase deploy --only firestore:indexes
```

Více informací v `FIRESTORE_RULES.md`.

## 2. Spuštění aplikace

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

1. Pushnete projekt na GitHub
2. Jděte na [Vercel](https://vercel.com)
3. Klikněte "New Project"
4. Importujte GitHub repository
5. Přidejte Environment Variables (stejné jako v .env.local)
6. Klikněte "Deploy"

## Struktura aplikace

- `/` - Hlavní stránka s časovačem a projekty
- `/projects` - Správa projektů (vytváření, úprava, archivace)
- `/history` - Historie všech záznamů s filtrováním

## Funkce

✅ Časovač pro sledování času v reálném čase
✅ Správa projektů s hodinovou sazbou a barvami
✅ Manuální přidávání/odebírání času
✅ Historie všech záznamů
✅ Měsíční a denní statistiky
✅ Real-time synchronizace přes Firebase
✅ Responzivní design (mobil i desktop)
✅ **Autentizace** - Každý uživatel má svůj účet
✅ **End-to-End šifrování** - Ceny a názvy projektů jsou šifrované
✅ **Bezpečnost** - Uživatelé vidí jen svá data
✅ **TODO list** - Správa úkolů

## Bezpečnost

### Autentizace
- Registrace a přihlášení přes email a heslo
- Heslo se nikdy neposílá na server (Firebase Auth)
- Každý uživatel má jedinečný ID

### Šifrování
- Heslo se používá k derivaci šifrovacího klíče (PBKDF2)
- Ceny a názvy projektů jsou šifrované (XSalsa20-Poly1305)
- Poznámky v záznamech jsou šifrované
- Šifrování se provádí na klientu - server nikdy nevidí nešifrovaná data

### Firestore pravidla
- Uživatel vidí jen své dokumenty
- Vlastník databáze vidí jen svá data
- Nikdo nemůže číst/psát cizí data

## Důležité upozornění

⚠️ **Pokud zapomenete heslo, data nelze obnovit!**

Heslo se používá k derivaci šifrovacího klíče. Pokud heslo zapomenete, nebudete moci dešifrovat svá data. Doporučujeme si heslo bezpečně poznamenat.
