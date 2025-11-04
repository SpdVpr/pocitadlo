# Nastavení aplikace Počítadlo

## 1. Firebase nastavení

### Vytvoření projektu
1. Jděte na [Firebase Console](https://console.firebase.google.com/)
2. Klikněte na "Add project" (Přidat projekt)
3. Zadejte název projektu (např. "pocitadlo")
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
4. Zaregistrujte aplikaci (např. "Pocitadlo Web")
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

### Firestore Security Rules (Produkční)
V Firebase Console → Firestore Database → Rules, nastavte:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /projects/{projectId} {
      allow read, write: if true;
    }
    match /time_entries/{entryId} {
      allow read, write: if true;
    }
    match /active_timer/{timerId} {
      allow read, write: if true;
    }
  }
}
```

**POZOR:** Toto je zjednodušená verze pro testování. Pro produkční nasazení přidejte autentizaci a přísnější pravidla!

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
✅ Měsíční statistiky
✅ Real-time synchronizace přes Firebase
✅ Responzivní design (mobil i desktop)
