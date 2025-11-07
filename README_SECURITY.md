# EvidujCas.cz - Bezpečná aplikace pro sledování času

Aplikace pro sledování času s end-to-end šifrováním a autentizací.

## 🔒 Bezpečnost

### Autentizace
- ✅ Registrace a přihlášení přes email a heslo
- ✅ Heslo se nikdy neposílá na server (Firebase Auth)
- ✅ Každý uživatel má jedinečný ID

### End-to-End Šifrování
- ✅ Heslo se používá k derivaci šifrovacího klíče (PBKDF2)
- ✅ Ceny a názvy projektů jsou šifrované (XSalsa20-Poly1305)
- ✅ Poznámky v záznamech jsou šifrované
- ✅ Šifrování se provádí na klientu - server nikdy nevidí nešifrovaná data

### Firestore Pravidla
- ✅ Uživatel vidí jen své dokumenty
- ✅ Vlastník databáze vidí jen svá data
- ✅ Nikdo nemůže číst/psát cizí data

## ⚠️ Důležité Upozornění

**Pokud zapomenete heslo, data nelze obnovit!**

Heslo se používá k derivaci šifrovacího klíče. Pokud heslo zapomenete, nebudete moci dešifrovat svá data. Doporučujeme si heslo bezpečně poznamenat.

## 🚀 Spuštění

### Instalace
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

## 📋 Funkce

- ✅ Časovač pro sledování času v reálném čase
- ✅ Správa projektů s hodinovou sazbou a barvami
- ✅ Manuální přidávání/odebírání času
- ✅ Historie všech záznamů
- ✅ Měsíční a denní statistiky
- ✅ Real-time synchronizace přes Firebase
- ✅ Responzivní design (mobil i desktop)
- ✅ TODO list pro správu úkolů

## 🔧 Nastavení Firebase

Viz `SETUP.md` pro detailní instrukce.

## 📁 Struktura Aplikace

- `/` - Hlavní stránka s časovačem a projekty
- `/projects` - Správa projektů (vytváření, úprava, archivace)
- `/history` - Historie všech záznamů s filtrováním
- `/todo` - TODO list
- `/auth` - Přihlášení a registrace

## 🛡️ Technologie

- **Next.js 16** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Firebase** - Backend (Auth, Firestore)
- **TweetNaCl.js** - Encryption (XSalsa20-Poly1305)
- **Tailwind CSS** - Styling

## 📝 Licence

MIT

