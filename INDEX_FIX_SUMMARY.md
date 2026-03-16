# Souhrn řešení - Firestore Index Error

## Datum: 2025-01-XX

## Problém

Na stránce `/todo` se zobrazovala chyba:

```
FirebaseError: The query requires an index. You can create it here: 
https://console.firebase.google.com/v1/r/project/pocitadlo-97bdc/firestore/indexes?create_composite=...
```

## Příčina

Firestore vyžaduje **složené indexy** pro queries, které kombinují:
- `where` (filtrování)
- `orderBy` (řazení)

V našem případě:
```typescript
const q = query(
  collection(db, 'todos'),
  where('userId', '==', userId),    // Filtrování podle uživatele
  orderBy('createdAt', 'desc')      // Řazení podle data
);
```

Tato kombinace vyžaduje složený index na `userId` + `createdAt`.

## Řešení

### 1. Dokumentace ✅

Vytvořil jsem kompletní dokumentaci pro indexy:

#### Nové soubory:

**`FIRESTORE_INDEXES.md`** - Rychlý návod
- Jak vyřešit chybu krok za krokem
- 3 metody vytvoření indexů
- FAQ a troubleshooting
- Jednoduché instrukce pro uživatele

**`firestore.indexes.json`** - Definice indexů
- JSON soubor s definicí všech potřebných indexů
- Připraveno pro `firebase deploy --only firestore:indexes`
- Obsahuje indexy pro: todos, time_entries, projects

#### Aktualizované soubory:

**`FIRESTORE_RULES.md`**
- Přidána sekce o indexech
- 3 metody vytvoření (automaticky, manuálně, CLI)
- Detailní instrukce
- Poznámky o bezpečnosti

**`SETUP.md`**
- Přidána sekce "Firestore Indexy"
- 3 možnosti vytvoření
- Odkaz na detailní dokumentaci

**`DEPLOYMENT.md`**
- Přidána sekce "Vytvoření Firestore indexů"
- Důležité upozornění po nasazení
- Instrukce pro automatické vytvoření

**`CHANGELOG.md`**
- Přidána dokumentace indexů do verze 2.1.1

### 2. Potřebné indexy

Aplikace vyžaduje 3 složené indexy:

#### Index 1: Todos
```
Collection: todos
Fields:
  - userId (Ascending)
  - createdAt (Descending)
Query scope: Collection
```

**Používá se na:** `/todo`

#### Index 2: Time Entries
```
Collection: time_entries
Fields:
  - userId (Ascending)
  - timestamp (Descending)
Query scope: Collection
```

**Používá se na:** `/`, `/history`

#### Index 3: Projects
```
Collection: projects
Fields:
  - userId (Ascending)
  - active (Ascending)
Query scope: Collection
```

**Používá se na:** `/`, `/projects`

### 3. Jak vytvořit indexy

#### Metoda 1: Automaticky (Nejjednodušší) ⭐

1. Spusťte aplikaci
2. Přihlaste se
3. Otevřete stránku `/todo`
4. Otevřete konzoli prohlížeče (F12)
5. Uvidíte chybu s odkazem
6. **Klikněte na odkaz** - otevře se Firebase Console
7. Klikněte **"Create Index"**
8. Počkejte 2-5 minut
9. Obnovte stránku aplikace

**Výhody:**
- ✅ Nejrychlejší
- ✅ Automaticky předvyplněné
- ✅ Žádná konfigurace

#### Metoda 2: Manuálně

1. Jděte na [Firebase Console](https://console.firebase.google.com)
2. Vyberte projekt
3. Firestore Database → Indexes
4. Create Index
5. Vyplňte podle specifikace výše
6. Create

**Výhody:**
- ✅ Kontrola nad indexy
- ✅ Můžete vytvořit všechny najednou

#### Metoda 3: Firebase CLI

```bash
firebase deploy --only firestore:indexes
```

**Výhody:**
- ✅ Automatizované
- ✅ Verzovatelné (Git)
- ✅ Reprodukovatelné

**Nevýhody:**
- ❌ Vyžaduje Firebase CLI
- ❌ Vyžaduje konfiguraci

## Instrukce pro uživatele

### Pokud vidíte chybu na `/todo`:

1. **Otevřete konzoli prohlížeče:**
   - Windows/Linux: `F12` nebo `Ctrl+Shift+I`
   - Mac: `Cmd+Option+I`

2. **Najděte chybu:**
   ```
   FirebaseError: The query requires an index...
   ```

3. **Zkopírujte odkaz:**
   - Celý odkaz začínající `https://console.firebase.google.com/...`

4. **Otevřete odkaz v novém tabu:**
   - Vložte odkaz do adresního řádku
   - Stiskněte Enter

5. **Vytvořte index:**
   - Klikněte na modré tlačítko **"Create Index"**
   - Počkejte (2-5 minut)

6. **Obnovte stránku aplikace:**
   - Vraťte se na `/todo`
   - Stiskněte `F5` nebo `Ctrl+R`

7. **Hotovo!** 🎉

### Pokud chyba přetrvává:

- Zkontrolujte, že index je "Enabled" (ne "Building")
- Vymažte cache prohlížeče (`Ctrl+Shift+Delete`)
- Zkuste jiný prohlížeč
- Zkontrolujte Firebase Console → Indexes

## Technické detaily

### Proč jsou indexy potřeba?

Firestore používá indexy pro efektivní vyhledávání:

**Bez indexu:**
```
1. Načti všechny dokumenty v kolekci
2. Filtruj podle userId
3. Seřaď podle createdAt
→ Pomalé, neefektivní
```

**S indexem:**
```
1. Použij index (userId + createdAt)
2. Vrať výsledky přímo
→ Rychlé, efektivní
```

### Kdy jsou indexy potřeba?

Indexy jsou potřeba pro:
- ✅ `where` + `orderBy` na různých polích
- ✅ Více `where` klauzulí
- ✅ `orderBy` na více polích
- ✅ Složené queries

Indexy NEJSOU potřeba pro:
- ❌ Jednoduchý `where`
- ❌ Jednoduchý `orderBy`
- ❌ `where` + `orderBy` na stejném poli

### Kolik stojí indexy?

**Firebase Spark (Free):**
- ✅ Až 200 složených indexů
- ✅ Zdarma
- ✅ Více než dost pro tuto aplikaci

**Firebase Blaze (Pay-as-you-go):**
- ✅ Neomezené indexy
- 💰 Platíte za storage a operace
- 💰 Indexy zvyšují storage náklady (minimálně)

### Jak dlouho trvá vytvoření?

- **Malá databáze (< 1000 dokumentů):** 2-5 minut
- **Střední databáze (1000-10000):** 5-15 minut
- **Velká databáze (> 10000):** 15-30 minut

## Build

```
✓ Compiled successfully in 6.9s
✓ Finished TypeScript in 3.5s
✓ Collecting page data
✓ Generating static pages (8/8)
✓ Finalizing page optimization
```

## Checklist pro nasazení

- [ ] Nasadit aplikaci na Vercel/hosting
- [ ] Otevřít aplikaci v prohlížeči
- [ ] Zaregistrovat se / přihlásit se
- [ ] Otevřít `/todo` → vytvořit index pro todos
- [ ] Otevřít `/history` → vytvořit index pro time_entries (pokud chyba)
- [ ] Otevřít `/projects` → vytvořit index pro projects (pokud chyba)
- [ ] Počkat na vytvoření všech indexů
- [ ] Otestovat všechny stránky
- [ ] Ověřit, že žádné chyby v konzoli

## Další kroky

### Pro vývojáře:

1. ✅ Přečíst `FIRESTORE_INDEXES.md`
2. ✅ Vytvořit indexy podle instrukcí
3. ✅ Otestovat všechny stránky
4. ✅ Zkontrolovat konzoli prohlížeče

### Pro uživatele:

1. ✅ Pokud vidíte chybu, klikněte na odkaz
2. ✅ Vytvořte index
3. ✅ Počkejte
4. ✅ Obnovte stránku

## Závěr

✅ Vytvořena kompletní dokumentace pro Firestore indexy
✅ 3 metody vytvoření indexů (automaticky, manuálně, CLI)
✅ Jednoduché instrukce pro uživatele
✅ FAQ a troubleshooting
✅ Build proběhl úspěšně

**Aplikace je připravena k nasazení!** 🎉

**Důležité:** Po nasazení nezapomeňte vytvořit indexy!

## Odkazy na dokumentaci

- `FIRESTORE_INDEXES.md` - Rychlý návod (START HERE!)
- `FIRESTORE_RULES.md` - Kompletní dokumentace pravidel a indexů
- `firestore.indexes.json` - Definice indexů pro CLI
- `SETUP.md` - Návod na nastavení
- `DEPLOYMENT.md` - Návod na nasazení

