# Firestore Indexy - Rychlý návod

## Problém

Pokud vidíte tuto chybu v konzoli:

```
FirebaseError: The query requires an index. You can create it here: https://console.firebase.google.com/...
```

Znamená to, že Firestore potřebuje vytvořit index pro vaši query.

## Řešení (Nejrychlejší způsob)

### Krok 1: Zkopírujte odkaz z chyby

V konzoli prohlížeče (F12) najděte chybovou hlášku a zkopírujte celý odkaz začínající `https://console.firebase.google.com/...`

### Krok 2: Otevřete odkaz

Vložte odkaz do prohlížeče. Otevře se Firebase Console s předvyplněným formulářem pro vytvoření indexu.

### Krok 3: Vytvořte index

Klikněte na tlačítko **"Create Index"**.

### Krok 4: Počkejte

Vytvoření indexu trvá několik minut. Uvidíte progress bar.

### Krok 5: Hotovo

Po vytvoření indexu obnovte stránku aplikace. Chyba by měla zmizet.

---

## Které indexy jsou potřeba?

### 1. Todos (TODO list)

**Stránka:** `/todo`

**Index:**
- Collection: `todos`
- Fields:
  - `userId` (Ascending)
  - `createdAt` (Descending)

**Odkaz na vytvoření:**
Spusťte aplikaci, otevřete `/todo`, zkopírujte odkaz z chyby.

### 2. Time Entries (Historie)

**Stránka:** `/history`, `/`

**Index:**
- Collection: `time_entries`
- Fields:
  - `userId` (Ascending)
  - `timestamp` (Descending)

**Odkaz na vytvoření:**
Spusťte aplikaci, otevřete `/history`, zkopírujte odkaz z chyby.

### 3. Projects (Projekty)

**Stránka:** `/`, `/projects`

**Index:**
- Collection: `projects`
- Fields:
  - `userId` (Ascending)
  - `active` (Ascending)

**Odkaz na vytvoření:**
Spusťte aplikaci, otevřete `/projects`, zkopírujte odkaz z chyby.

---

## Alternativní metody

### Metoda 2: Manuální vytvoření

1. Jděte na [Firebase Console](https://console.firebase.google.com)
2. Vyberte váš projekt
3. Jděte na **Firestore Database** → **Indexes**
4. Klikněte **"Create Index"**
5. Vyplňte:
   - **Collection ID:** `todos` (nebo jiná kolekce)
   - **Fields to index:**
     - Field: `userId`, Order: **Ascending**
     - Field: `createdAt`, Order: **Descending**
   - **Query scope:** Collection
6. Klikněte **"Create"**
7. Počkejte na vytvoření

### Metoda 3: Firebase CLI

1. Ujistěte se, že máte Firebase CLI nainstalované:
```bash
npm install -g firebase-tools
```

2. Přihlaste se:
```bash
firebase login
```

3. Inicializujte projekt (pokud ještě není):
```bash
firebase init firestore
```

4. Nasaďte indexy:
```bash
firebase deploy --only firestore:indexes
```

Soubor `firestore.indexes.json` už obsahuje všechny potřebné indexy.

---

## FAQ

### Q: Jak dlouho trvá vytvoření indexu?

**A:** Obvykle 2-5 minut. Pro velké databáze může trvat déle.

### Q: Musím vytvořit indexy pro každou stránku?

**A:** Ano, každá stránka, která používá složené queries (where + orderBy), potřebuje vlastní index.

### Q: Co se stane, pokud nevytvořím index?

**A:** Stránka nebude fungovat správně. Uvidíte chybu v konzoli a data se nenačtou.

### Q: Mohu smazat index?

**A:** Ano, v Firebase Console → Firestore Database → Indexes můžete indexy smazat.

### Q: Stojí indexy peníze?

**A:** Indexy jsou zdarma v rámci Firebase Spark (free) plánu. Blaze plán účtuje za storage a operace.

### Q: Kolik indexů mohu mít?

**A:** Firebase Spark plán umožňuje až 200 složených indexů. To je více než dost pro tuto aplikaci.

### Q: Index se nevytváří, co dělat?

**A:** Zkontrolujte:
- Máte správná oprávnění (musíte být Owner projektu)
- Firebase projekt má povolený Firestore
- Nejste na Spark plánu s vyčerpanými limity

---

## Troubleshooting

### Chyba: "Missing or insufficient permissions"

**Příčina:** Nemáte oprávnění vytvářet indexy.

**Řešení:**
1. Zkontrolujte, že jste Owner projektu v Firebase Console
2. Požádejte vlastníka projektu o vytvoření indexů

### Chyba: "Index already exists"

**Příčina:** Index už existuje.

**Řešení:**
- Obnovte stránku aplikace
- Pokud chyba přetrvává, smažte index a vytvořte ho znovu

### Index je "Building" dlouho

**Příčina:** Databáze je velká nebo Firebase má vysoké zatížení.

**Řešení:**
- Počkejte (může trvat až 30 minut)
- Zkontrolujte status v Firebase Console

### Aplikace stále hlásí chybu po vytvoření indexu

**Příčina:** Index ještě není hotový nebo cache prohlížeče.

**Řešení:**
1. Zkontrolujte status indexu v Firebase Console
2. Obnovte stránku (Ctrl+F5 / Cmd+Shift+R)
3. Vymažte cache prohlížeče

---

## Shrnutí

1. ✅ Spusťte aplikaci
2. ✅ Otevřete stránku, která hlásí chybu
3. ✅ Zkopírujte odkaz z chyby v konzoli
4. ✅ Otevřete odkaz a klikněte "Create Index"
5. ✅ Počkejte na vytvoření
6. ✅ Obnovte stránku aplikace

**Hotovo!** 🎉

---

## Další informace

- [Firebase Indexy Dokumentace](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Firestore Pricing](https://firebase.google.com/pricing)
- `FIRESTORE_RULES.md` - Kompletní dokumentace pravidel a indexů

