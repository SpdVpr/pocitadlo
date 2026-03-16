# Changelog

## [2.1.1] - 2025-01-XX

### 🐛 Opravy

#### Šifrování
- ✅ Opravena inicializace šifrovacího klíče po přihlášení
- ✅ Automatická derivace klíče pro Google uživatele při načtení stránky
- ✅ Použití sessionStorage pro heslo (email/password uživatelé)
- ✅ Automatické přesměrování na login při selhání derivace klíče
- ✅ Lepší loading stavy v ProtectedRoute

#### Změny
- ✅ Název aplikace změněn z "EvidujCas" na "EvidujCas.cz"
- ✅ Aktualizována všechna dokumentace

#### Dokumentace
- ✅ `FIRESTORE_INDEXES.md` - Rychlý návod na vytvoření indexů
- ✅ `firestore.indexes.json` - Definice indexů pro Firebase CLI
- ✅ Aktualizován `FIRESTORE_RULES.md` s informacemi o indexech
- ✅ Aktualizován `SETUP.md` s instrukcemi pro indexy
- ✅ Aktualizován `DEPLOYMENT.md` s instrukcemi pro indexy
- ✅ `FIXES_SUMMARY.md` - Souhrn oprav

---

## [2.1.0] - 2025-01-XX

### ✨ Přidáno - Google Authentication

#### Google přihlášení
- ✅ Přihlášení přes Google účet
- ✅ Google OAuth 2.0 integrace
- ✅ Automatická derivace šifrovacího klíče z UID
- ✅ UI s Google tlačítkem a logem

#### Změny
- ✅ Název aplikace změněn z "Počítadlo" na "EvidujCas"
- ✅ Aktualizována všechna dokumentace
- ✅ Aktualizovány metadata

#### Dokumentace
- ✅ `GOOGLE_AUTH.md` - Dokumentace Google přihlášení

---

## [2.0.0] - 2025-01-XX

### 🔒 Přidáno - Bezpečnost a Multi-User

#### Autentizace
- ✅ Firebase Authentication s email/heslo
- ✅ Registrace nových uživatelů
- ✅ Přihlášení existujících uživatelů
- ✅ Odhlášení
- ✅ Ochrana stránek (ProtectedRoute)
- ✅ Automatické přesměrování na login

#### End-to-End Šifrování
- ✅ PBKDF2 pro derivaci klíče z hesla (100,000 iterací, SHA-256)
- ✅ XSalsa20-Poly1305 pro šifrování dat (TweetNaCl.js)
- ✅ Šifrování názvů projektů
- ✅ Šifrování hodinových sazeb
- ✅ Šifrování cen v záznamech
- ✅ Šifrování poznámek v záznamech
- ✅ Šifrovací klíč se nikdy neposílá na server
- ✅ Šifrovací klíč se ukládá jen v paměti (React Context)

#### Multi-User Podpora
- ✅ Každý uživatel má jedinečný `userId`
- ✅ Všechny dokumenty obsahují `userId`
- ✅ Firestore queries filtrují podle `userId`
- ✅ Uživatelé vidí jen svá data
- ✅ Firestore Security Rules zajišťují izolaci dat

#### Nové Komponenty
- ✅ `AuthProvider` - Context pro autentizaci
- ✅ `ProtectedRoute` - Ochrana stránek
- ✅ `AuthPage` - Přihlášení a registrace
- ✅ `lib/encryption.ts` - Šifrovací utility
- ✅ `lib/authContext.tsx` - Autentizační context

#### Aktualizované Komponenty
- ✅ `app/page.tsx` - Použití autentizace a šifrování
- ✅ `app/projects/page.tsx` - Použití autentizace a šifrování
- ✅ `app/history/page.tsx` - Použití autentizace a šifrování
- ✅ `app/todo/page.tsx` - Použití autentizace
- ✅ `components/Timer.tsx` - Použití autentizace a šifrování
- ✅ `components/TimeAdjustDialog.tsx` - Použití autentizace a šifrování
- ✅ `components/Navigation.tsx` - Zobrazení uživatele a odhlášení
- ✅ `app/layout.tsx` - Obalení v AuthProvider

#### Aktualizované Firestore Funkce
- ✅ `createProject` - Přidán `userId` a šifrování
- ✅ `updateProject` - Přidáno šifrování
- ✅ `subscribeToProjects` - Filtrování podle `userId` a dešifrování
- ✅ `createTimeEntry` - Přidán `userId` a šifrování
- ✅ `subscribeToTimeEntries` - Filtrování podle `userId` a dešifrování
- ✅ `subscribeToDailyTimeEntries` - Filtrování podle `userId` a dešifrování
- ✅ `createTodo` - Přidán `userId`
- ✅ `subscribeToTodos` - Filtrování podle `userId`
- ✅ `resetMonthlyStats` - Filtrování podle `userId`

#### Dokumentace
- ✅ `README_SECURITY.md` - Bezpečnost a šifrování
- ✅ `FIRESTORE_RULES.md` - Firestore pravidla
- ✅ `DEPLOYMENT.md` - Nasazení aplikace
- ✅ `SETUP.md` - Aktualizováno s autentizací
- ✅ `CHANGELOG.md` - Historie změn

#### Závislosti
- ✅ `tweetnacl` - Šifrování
- ✅ `tweetnacl-util` - Utility pro šifrování

### ⚠️ Breaking Changes

#### Migrace dat
- Všechna existující data v Firestore potřebují migraci
- Přidání `userId` ke všem dokumentům
- Šifrování citlivých polí

#### Firestore Security Rules
- Nová pravidla vyžadují autentizaci
- Uživatelé vidí jen svá data
- Nutné aktualizovat pravidla v Firebase Console

#### Uživatelské rozhraní
- Nová přihlašovací stránka `/auth`
- Všechny stránky vyžadují přihlášení
- Navigace zobrazuje email uživatele

### 🐛 Opravy
- Opraveno: Uživatelé mohli vidět data ostatních
- Opraveno: Citlivá data nebyla šifrovaná
- Opraveno: Chyběla autentizace

### 📝 Poznámky

#### Důležité upozornění
⚠️ **Pokud zapomenete heslo, data nelze obnovit!**

Heslo se používá k derivaci šifrovacího klíče. Pokud heslo zapomenete, nebudete moci dešifrovat svá data.

#### Migrace existujících dat
Pokud máte existující data v Firestore, budete muset:
1. Exportovat data
2. Přidat `userId` ke všem dokumentům
3. Šifrovat citlivá pole
4. Importovat data zpět

#### Testování
Před nasazením do produkce doporučujeme:
1. Vytvořit testovací Firebase projekt
2. Otestovat registraci a přihlášení
3. Otestovat šifrování a dešifrování
4. Otestovat Firestore pravidla
5. Otestovat izolaci dat mezi uživateli

---

## [1.0.0] - 2025-01-XX

### ✨ Přidáno - Základní Funkce

#### Časovač
- ✅ Spuštění a zastavení časovače
- ✅ Zobrazení uplynulého času
- ✅ Automatické ukládání času do projektu
- ✅ Real-time synchronizace aktivního časovače

#### Projekty
- ✅ Vytváření projektů
- ✅ Úprava projektů
- ✅ Archivace projektů
- ✅ Mazání projektů
- ✅ Hodinová sazba
- ✅ Barevné označení
- ✅ Měsíční statistiky (čas a cena)

#### Záznamy
- ✅ Automatické vytváření záznamů z časovače
- ✅ Manuální přidávání času
- ✅ Manuální odebírání času
- ✅ Poznámky k záznamům
- ✅ Historie všech záznamů
- ✅ Filtrování podle projektu
- ✅ Filtrování podle měsíce a roku
- ✅ Mazání záznamů

#### Statistiky
- ✅ Měsíční statistiky (celkový čas a cena)
- ✅ Denní statistiky (celkový čas a cena)
- ✅ Statistiky podle projektů
- ✅ Vynulování měsíčních statistik

#### TODO List
- ✅ Vytváření úkolů
- ✅ Označení jako hotové
- ✅ Úprava úkolů
- ✅ Mazání úkolů
- ✅ Filtrování (všechny/aktivní/hotové)

#### UI/UX
- ✅ Responzivní design
- ✅ Mobilní optimalizace
- ✅ Navigace mezi stránkami
- ✅ Barevné karty projektů
- ✅ Ikony v navigaci

#### Technologie
- ✅ Next.js 16 (App Router)
- ✅ React 19
- ✅ TypeScript
- ✅ Firebase (Firestore)
- ✅ Tailwind CSS

#### Dokumentace
- ✅ `README.md` - Základní informace
- ✅ `SETUP.md` - Nastavení aplikace

