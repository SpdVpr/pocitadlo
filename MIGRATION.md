# Migrace dat z verze 1.0 na 2.0

## Přehled změn

Verze 2.0 přidává:
- Autentizaci (Firebase Auth)
- End-to-end šifrování
- Multi-user podporu
- `userId` ke všem dokumentům
- Šifrování citlivých polí

## ⚠️ Důležité upozornění

**Před migrací si zálohujte všechna data!**

Migrace je nevratná operace. Pokud něco pokazíte, budete potřebovat zálohu.

## Možnosti migrace

### Možnost 1: Nový Firebase projekt (Doporučeno)

Nejjednodušší způsob je vytvořit nový Firebase projekt a začít od začátku:

1. Vytvořte nový Firebase projekt
2. Nastavte Authentication
3. Nastavte Firestore
4. Nastavte Security Rules
5. Nasaďte aplikaci
6. Zaregistrujte se jako nový uživatel
7. Začněte používat aplikaci

**Výhody:**
- ✅ Žádná migrace dat
- ✅ Čistý start
- ✅ Žádné problémy s kompatibilitou

**Nevýhody:**
- ❌ Ztráta starých dat
- ❌ Nutnost znovu vytvořit projekty

### Možnost 2: Migrace existujících dat

Pokud chcete zachovat stará data, budete muset provést migraci:

#### Krok 1: Záloha dat

1. Jděte do Firebase Console
2. Firestore Database → Export/Import
3. Exportujte všechna data
4. Uložte export na bezpečné místo

#### Krok 2: Příprava

1. Nainstalujte Firebase Admin SDK:
```bash
npm install firebase-admin
```

2. Vytvořte service account v Firebase Console:
   - Project Settings → Service Accounts
   - Generate New Private Key
   - Uložte JSON soubor jako `serviceAccountKey.json`

#### Krok 3: Migrace script

Vytvořte soubor `migrate.js`:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrateData() {
  // 1. Vytvořte testovacího uživatele
  const userEmail = 'your-email@example.com';
  const userPassword = 'your-secure-password';
  
  const userRecord = await admin.auth().createUser({
    email: userEmail,
    password: userPassword,
  });
  
  const userId = userRecord.uid;
  console.log('Created user:', userId);

  // 2. Migrace projektů
  const projectsSnapshot = await db.collection('projects').get();
  
  for (const doc of projectsSnapshot.docs) {
    const data = doc.data();
    
    // Přidejte userId
    await doc.ref.update({
      userId: userId,
      // Poznámka: Šifrování musíte provést ručně
      // protože potřebujete heslo uživatele
    });
    
    console.log('Migrated project:', doc.id);
  }

  // 3. Migrace time_entries
  const entriesSnapshot = await db.collection('time_entries').get();
  
  for (const doc of entriesSnapshot.docs) {
    await doc.ref.update({
      userId: userId,
    });
    
    console.log('Migrated entry:', doc.id);
  }

  // 4. Migrace todos
  const todosSnapshot = await db.collection('todos').get();
  
  for (const doc of todosSnapshot.docs) {
    await doc.ref.update({
      userId: userId,
    });
    
    console.log('Migrated todo:', doc.id);
  }

  console.log('Migration complete!');
}

migrateData().catch(console.error);
```

#### Krok 4: Spuštění migrace

```bash
node migrate.js
```

#### Krok 5: Šifrování dat

Šifrování musíte provést ručně, protože potřebujete heslo uživatele:

1. Přihlaste se do aplikace s migrovaným účtem
2. Jděte na `/projects`
3. Pro každý projekt:
   - Klikněte "Upravit"
   - Znovu zadejte název a hodinovou sazbu
   - Klikněte "Uložit"
4. Tím se data zašifrují

**Poznámka:** Staré záznamy (time_entries) nebudou šifrované. Pokud chcete šifrovat i je, budete muset vytvořit vlastní script.

#### Krok 6: Aktualizace Security Rules

1. Jděte do Firebase Console
2. Firestore Database → Rules
3. Zkopírujte pravidla z `FIRESTORE_RULES.md`
4. Klikněte "Publish"

#### Krok 7: Testování

1. Přihlaste se do aplikace
2. Zkontrolujte, že vidíte všechny projekty
3. Zkontrolujte, že vidíte všechny záznamy
4. Zkontrolujte, že vidíte všechny TODO
5. Vytvořte nový projekt a zkontrolujte, že je šifrovaný
6. Vytvořte nový záznam a zkontrolujte, že je šifrovaný

### Možnost 3: Ruční migrace

Pokud máte málo dat, můžete je migrovat ručně:

1. Vytvořte nový Firebase projekt
2. Zaregistrujte se v aplikaci
3. Ručně vytvořte všechny projekty
4. Ručně přidejte všechny záznamy (pokud je to nutné)
5. Ručně vytvořte všechny TODO

## Řešení problémů

### Chyba: "Missing or insufficient permissions"

- Zkontrolujte, že jste aktualizovali Security Rules
- Zkontrolujte, že všechny dokumenty mají `userId`

### Chyba při dešifrování

- Staré dokumenty nemají šifrovaná data
- Musíte je ručně aktualizovat (viz Krok 5)

### Uživatel nevidí svá data

- Zkontrolujte, že všechny dokumenty mají správný `userId`
- Zkontrolujte Security Rules

## Doporučení

1. **Pro nové projekty:** Použijte Možnost 1 (nový projekt)
2. **Pro existující projekty s málo daty:** Použijte Možnost 3 (ruční migrace)
3. **Pro existující projekty s hodně daty:** Použijte Možnost 2 (automatická migrace)

## Podpora

Pokud máte problémy s migrací, kontaktujte vývojáře nebo vytvořte issue na GitHubu.

## Záloha

**Vždy si zálohujte data před migrací!**

Firebase nabízí export/import funkcionalitu:
- Firebase Console → Firestore Database → Export/Import

Doporučujeme pravidelně zálohovat data i po migraci.

