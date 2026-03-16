# EvidujCas.cz 🕐

Bezpečná aplikace pro sledování času a projektů s end-to-end šifrováním.

## 📋 Přehled

EvidujCas.cz je moderní webová aplikace pro sledování odpracovaných hodin na projektech. Aplikace podporuje více uživatelů, přičemž každý uživatel vidí jen svá data. Citlivé informace (názvy projektů, hodinové sazby, ceny) jsou šifrované end-to-end, takže ani vlastník databáze nemůže data číst.

## ✨ Funkce

### 🔒 Bezpečnost
- **Firebase Authentication** - Email/heslo a Google přihlášení
- **End-to-End šifrování** - PBKDF2 + XSalsa20-Poly1305
- **Multi-user podpora** - Každý uživatel vidí jen svá data
- **Firestore Security Rules** - Serverová izolace dat

### ⏱️ Sledování času
- **Časovač** - Spuštění/zastavení měření času
- **Manuální záznamy** - Přidání času ručně
- **Denní statistiky** - Přehled dnešních hodin
- **Měsíční statistiky** - Přehled měsíčních hodin
- **Historie** - Kompletní historie všech záznamů

### 📊 Projekty
- **Správa projektů** - Vytváření, úprava, archivace
- **Hodinové sazby** - Nastavení ceny za hodinu
- **Barevné označení** - Vizuální rozlišení projektů
- **Statistiky** - Odpracované hodiny a vydělané peníze

### ✅ TODO List
- **Úkoly** - Vytváření a správa úkolů
- **Dokončení** - Označení úkolů jako hotových
- **Smazání** - Odstranění úkolů

## 🚀 Rychlý start

### Předpoklady
- Node.js 18+ a npm
- Firebase projekt (zdarma)

### Instalace

1. **Klonování repozitáře:**
```bash
git clone <repository-url>
cd pocitadlo
```

2. **Instalace závislostí:**
```bash
npm install
```

3. **Konfigurace Firebase:**

Vytvořte soubor `.env.local` v kořenovém adresáři:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

4. **Spuštění vývojového serveru:**
```bash
npm run dev
```

Otevřete [http://localhost:3000](http://localhost:3000) v prohlížeči.

## 📚 Dokumentace

- **[SETUP.md](SETUP.md)** - Kompletní návod na nastavení
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Návod na nasazení do produkce
- **[README_SECURITY.md](README_SECURITY.md)** - Bezpečnost a šifrování
- **[GOOGLE_AUTH.md](GOOGLE_AUTH.md)** - Google přihlášení
- **[FIRESTORE_RULES.md](FIRESTORE_RULES.md)** - Firestore pravidla
- **[MIGRATION.md](MIGRATION.md)** - Migrace dat z verze 1.0
- **[CHANGELOG.md](CHANGELOG.md)** - Historie změn

## 🛠️ Technologie

- **Next.js 16** - React framework s App Router
- **React 19** - UI knihovna
- **TypeScript** - Typová bezpečnost
- **Firebase** - Backend (Auth + Firestore)
- **Tailwind CSS** - Styling
- **TweetNaCl** - Kryptografie

## 🔐 Bezpečnost

### Šifrování
Aplikace používá end-to-end šifrování pro citlivá data:
- **PBKDF2** - Derivace klíče z hesla (100,000 iterací)
- **XSalsa20-Poly1305** - Symetrické šifrování
- **Client-side only** - Šifrování probíhá pouze na klientu

### Autentizace
- **Email/Password** - Klasické přihlášení
- **Google OAuth** - Přihlášení přes Google účet
- **Protected Routes** - Ochrana stránek před nepřihlášenými uživateli

### Izolace dat
- **userId** - Každý dokument má userId
- **Firestore Rules** - Serverová izolace
- **Client-side filtering** - Dodatečná ochrana

⚠️ **Důležité:** Pokud uživatel zapomene heslo, data nelze obnovit!

## 📦 Build

```bash
npm run build
```

## 🚢 Nasazení

Doporučujeme nasazení na [Vercel](https://vercel.com):

1. Push kódu na GitHub
2. Import projektu na Vercel
3. Nastavení environment variables
4. Deploy

Detailní návod: [DEPLOYMENT.md](DEPLOYMENT.md)

## 🤝 Přispívání

Příspěvky jsou vítány! Prosím:
1. Fork repozitáře
2. Vytvořte feature branch
3. Commit změny
4. Push do branch
5. Vytvořte Pull Request

## 📄 Licence

MIT License - viz LICENSE soubor

## 👤 Autor

Vytvořeno s ❤️ pro sledování času

## 🐛 Známé problémy

- Active timer není izolovaný podle uživatele (globální dokument)
- Google uživatelé nemohou změnit "heslo" (UID je fixní)
- Zapomenuté heslo = ztráta dat

## 🔮 Budoucí vylepšení

- [ ] Recovery key pro obnovu hesla
- [ ] Izolace active timer podle uživatele
- [ ] Změna hesla
- [ ] Export dat
- [ ] 2FA (Two-Factor Authentication)
- [ ] Mobilní aplikace
- [ ] Dark mode

## 📞 Podpora

Pokud máte problémy nebo otázky, vytvořte issue na GitHubu.

---

**EvidujCas.cz** - Bezpečné sledování času pro všechny 🚀
