# Firestore Security Rules

Zkopírujte tyto pravidla do Firebase Console > Firestore Database > Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Uživatel vidí jen své dokumenty
    match /projects/{document=**} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }

    match /time_entries/{document=**} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }

    match /todos/{document=**} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }

    match /user_settings/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    match /active_timer/{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Vysvětlení pravidel:

1. **Projects, Time Entries, Todos**: Uživatel vidí a může upravovat jen své dokumenty (kde `userId == auth.uid`)
2. **User Settings**: Uživatel vidí a může upravovat jen své nastavení (document ID = userId)
3. **Active Timer**: Globální dokument pro aktuální běžící časovač (bez omezení)

## Jak nastavit v Firebase Console:

1. Jděte na [Firebase Console](https://console.firebase.google.com)
2. Vyberte váš projekt
3. Jděte na Firestore Database
4. Klikněte na "Rules"
5. Zkopírujte výše uvedená pravidla
6. Klikněte "Publish"

## Bezpečnost:

- ✅ Každý uživatel vidí jen svá data
- ✅ Vlastník databáze (vy) vidí jen svá data
- ✅ Nikdo nemůže číst/psát cizí data
- ✅ Citlivá data (ceny, názvy) jsou šifrována na klientu

---

# Firestore Indexy

Firestore vyžaduje indexy pro složené queries (kombinace `where` a `orderBy`).

## Potřebné indexy

### 1. Todos - userId + createdAt

**Kolekce:** `todos`
**Pole:**
- `userId` (Ascending)
- `createdAt` (Descending)

**Query scope:** Collection

### 2. Time Entries - userId + timestamp

**Kolekce:** `time_entries`
**Pole:**
- `userId` (Ascending)
- `timestamp` (Descending)

**Query scope:** Collection

### 3. Projects - userId + active

**Kolekce:** `projects`
**Pole:**
- `userId` (Ascending)
- `active` (Ascending)

**Query scope:** Collection

## Jak vytvořit indexy

### Metoda 1: Automaticky (Nejjednodušší)

1. Spusťte aplikaci lokálně nebo na produkci
2. Otevřete stránku, která vyžaduje index (např. `/todo`)
3. Otevřete konzoli prohlížeče (F12)
4. Uvidíte chybu s odkazem na vytvoření indexu
5. Klikněte na odkaz - otevře se Firebase Console
6. Klikněte "Create Index"
7. Počkejte na vytvoření (několik minut)

### Metoda 2: Manuálně

1. Jděte na [Firebase Console](https://console.firebase.google.com)
2. Vyberte váš projekt
3. Jděte na Firestore Database → Indexes
4. Klikněte "Create Index"
5. Vyplňte:
   - Collection ID: `todos`
   - Fields to index:
     - Field: `userId`, Order: Ascending
     - Field: `createdAt`, Order: Descending
   - Query scope: Collection
6. Klikněte "Create"
7. Opakujte pro ostatní indexy

### Metoda 3: Firebase CLI (Pro pokročilé)

Vytvořte soubor `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "todos",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "time_entries",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "timestamp",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "projects",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "active",
          "order": "ASCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

Pak spusťte:
```bash
firebase deploy --only firestore:indexes
```

## Poznámky

- ⏱️ Vytvoření indexu trvá několik minut
- ✅ Index se vytváří automaticky na pozadí
- ✅ Aplikace bude fungovat po vytvoření indexu
- ⚠️ Bez indexu se zobrazí chyba v konzoli

## Řešení problémů

### Chyba: "The query requires an index"

**Řešení:**
1. Zkopírujte odkaz z chybové hlášky
2. Otevřete odkaz v prohlížeči
3. Klikněte "Create Index"
4. Počkejte na vytvoření

### Index se nevytváří

**Možné příčiny:**
- Nedostatečná oprávnění (musíte být Owner projektu)
- Firebase Billing není nastaveno (vyžaduje Blaze plán pro indexy)

**Řešení:**
- Zkontrolujte oprávnění v Firebase Console
- Nastavte Blaze plán (zdarma do určitého limitu)

