import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { Project, TimeEntry, ActiveTimer, TodoItem, UserSettings } from '@/types';
import { getCurrentMonthYear, getTodayDate } from './utils';
import { encryptData, decryptData } from './encryption';

const COLLECTIONS = {
  PROJECTS: 'projects',
  TIME_ENTRIES: 'time_entries',
  ACTIVE_TIMER: 'active_timer',
  TODOS: 'todos',
  USER_SETTINGS: 'user_settings',
};

export async function createProject(
  userId: string,
  name: string,
  hourlyRate: number,
  color: string,
  encryptionKey: Uint8Array
): Promise<string> {
  const now = Timestamp.now();
  const { month, year } = getCurrentMonthYear();

  const projectData = {
    userId,
    name: encryptData(name, encryptionKey),
    hourlyRate: encryptData(hourlyRate.toString(), encryptionKey),
    color,
    totalTimeCurrentMonth: 0,
    totalPriceCurrentMonth: 0,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(collection(db, COLLECTIONS.PROJECTS), projectData);
  return docRef.id;
}

export async function updateProject(
  id: string,
  data: Partial<Omit<Project, 'id' | 'createdAt'>>,
  encryptionKey?: Uint8Array
): Promise<void> {
  const projectRef = doc(db, COLLECTIONS.PROJECTS, id);
  const updateData: any = { ...data, updatedAt: Timestamp.now() };

  // Encrypt sensitive fields if provided
  if (encryptionKey) {
    if (data.name) {
      updateData.name = encryptData(data.name, encryptionKey);
    }
    if (data.hourlyRate !== undefined) {
      updateData.hourlyRate = encryptData(data.hourlyRate.toString(), encryptionKey);
    }
  }

  await updateDoc(projectRef, updateData);
}

export async function deleteProject(id: string): Promise<void> {
  const projectRef = doc(db, COLLECTIONS.PROJECTS, id);
  await deleteDoc(projectRef);
}

export function subscribeToProjects(
  userId: string,
  callback: (projects: Project[]) => void,
  encryptionKey: Uint8Array,
  activeOnly: boolean = true
) {
  const q = query(
    collection(db, COLLECTIONS.PROJECTS),
    where('userId', '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    let projects: Project[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      try {
        return {
          id: doc.id,
          ...data,
          name: decryptData(data.name, encryptionKey),
          hourlyRate: parseFloat(decryptData(data.hourlyRate, encryptionKey)),
        } as Project;
      } catch (error) {
        console.error('Error decrypting project:', error);
        return {
          id: doc.id,
          ...data,
          name: '[Chyba při dešifrování]',
          hourlyRate: 0,
        } as Project;
      }
    });

    if (activeOnly) {
      projects = projects.filter(p => p.isActive);
    }

    projects.sort((a, b) => a.name.localeCompare(b.name));

    callback(projects);
  });
}

export async function createTimeEntry(
  userId: string,
  projectId: string,
  duration: number,
  type: 'timer' | 'manual',
  hourlyRate: number,
  encryptionKey: Uint8Array,
  note?: string
): Promise<string> {
  const now = Timestamp.now();
  const { month, year } = getCurrentMonthYear();
  const price = (duration / 3600) * hourlyRate;

  const entryData: any = {
    userId,
    projectId,
    type,
    startTime: now,
    endTime: now,
    duration,
    price: encryptData(price.toString(), encryptionKey),
    month,
    year,
    createdAt: now,
    updatedAt: now,
  };

  if (note) {
    entryData.note = encryptData(note, encryptionKey);
  }

  const docRef = await addDoc(collection(db, COLLECTIONS.TIME_ENTRIES), entryData);

  await updateProjectTotals(projectId, duration, price);

  return docRef.id;
}

export async function updateProjectTotals(
  projectId: string,
  durationDelta: number,
  priceDelta: number
): Promise<void> {
  const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId);
  const projectSnap = await getDoc(projectRef);

  if (projectSnap.exists()) {
    const project = projectSnap.data() as Project;
    await updateDoc(projectRef, {
      totalTimeCurrentMonth: project.totalTimeCurrentMonth + durationDelta,
      totalPriceCurrentMonth: project.totalPriceCurrentMonth + priceDelta,
      updatedAt: Timestamp.now(),
    });
  }
}

export function subscribeToTimeEntries(
  userId: string,
  callback: (entries: TimeEntry[]) => void,
  encryptionKey: Uint8Array,
  projectId?: string,
  month?: number,
  year?: number
) {
  const q = query(
    collection(db, COLLECTIONS.TIME_ENTRIES),
    where('userId', '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    let entries: TimeEntry[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      try {
        return {
          id: doc.id,
          ...data,
          price: parseFloat(decryptData(data.price, encryptionKey)),
          note: data.note ? decryptData(data.note, encryptionKey) : undefined,
        } as TimeEntry;
      } catch (error) {
        console.error('Error decrypting entry:', error);
        return {
          id: doc.id,
          ...data,
          price: 0,
          note: '[Chyba při dešifrování]',
        } as TimeEntry;
      }
    });

    if (projectId) {
      entries = entries.filter(e => e.projectId === projectId);
    }
    if (month !== undefined && year !== undefined) {
      entries = entries.filter(e => e.month === month && e.year === year);
    }

    entries.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

    callback(entries);
  });
}

export function subscribeToDailyTimeEntries(
  userId: string,
  callback: (entries: TimeEntry[]) => void,
  encryptionKey: Uint8Array
) {
  const { day, month, year } = getTodayDate();
  const q = query(
    collection(db, COLLECTIONS.TIME_ENTRIES),
    where('userId', '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    let entries: TimeEntry[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      try {
        return {
          id: doc.id,
          ...data,
          price: parseFloat(decryptData(data.price, encryptionKey)),
          note: data.note ? decryptData(data.note, encryptionKey) : undefined,
        } as TimeEntry;
      } catch (error) {
        console.error('Error decrypting entry:', error);
        return {
          id: doc.id,
          ...data,
          price: 0,
          note: '[Chyba při dešifrování]',
        } as TimeEntry;
      }
    });

    // Filter for today's entries
    entries = entries.filter(e => {
      const entryDate = e.createdAt.toDate();
      return (
        entryDate.getDate() === day &&
        entryDate.getMonth() + 1 === month &&
        entryDate.getFullYear() === year
      );
    });

    entries.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

    callback(entries);
  });
}

export async function deleteTimeEntry(id: string, projectId: string, duration: number, price: number): Promise<void> {
  const entryRef = doc(db, COLLECTIONS.TIME_ENTRIES, id);
  await deleteDoc(entryRef);
  await updateProjectTotals(projectId, -duration, -price);
}

export async function setActiveTimer(projectId: string | null, startTime?: Date): Promise<void> {
  const timerRef = doc(db, COLLECTIONS.ACTIVE_TIMER, 'current');
  await setDoc(timerRef, {
    projectId,
    startTime: projectId ? (startTime ? Timestamp.fromDate(startTime) : Timestamp.now()) : null,
  });
}

export async function getActiveTimer(): Promise<ActiveTimer | null> {
  const timerRef = doc(db, COLLECTIONS.ACTIVE_TIMER, 'current');
  const timerSnap = await getDoc(timerRef);
  
  if (timerSnap.exists()) {
    return timerSnap.data() as ActiveTimer;
  }
  return null;
}

export function subscribeToActiveTimer(callback: (timer: ActiveTimer | null) => void) {
  const timerRef = doc(db, COLLECTIONS.ACTIVE_TIMER, 'current');
  
  return onSnapshot(timerRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as ActiveTimer);
    } else {
      callback(null);
    }
  });
}

export async function resetMonthlyStats(userId: string): Promise<void> {
  const q = query(
    collection(db, COLLECTIONS.PROJECTS),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);

  const updates = snapshot.docs.map((doc) =>
    updateDoc(doc.ref, {
      totalTimeCurrentMonth: 0,
      totalPriceCurrentMonth: 0,
      updatedAt: Timestamp.now(),
    })
  );

  await Promise.all(updates);
}

// TODO List Functions
export async function createTodo(userId: string, text: string): Promise<string> {
  const now = Timestamp.now();

  const todoData = {
    userId,
    text,
    completed: false,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(collection(db, COLLECTIONS.TODOS), todoData);
  return docRef.id;
}

export async function updateTodo(
  id: string,
  data: Partial<Omit<TodoItem, 'id' | 'createdAt'>>
): Promise<void> {
  const todoRef = doc(db, COLLECTIONS.TODOS, id);
  await updateDoc(todoRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteTodo(id: string): Promise<void> {
  const todoRef = doc(db, COLLECTIONS.TODOS, id);
  await deleteDoc(todoRef);
}

export function subscribeToTodos(userId: string, callback: (todos: TodoItem[]) => void) {
  const q = query(
    collection(db, COLLECTIONS.TODOS),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const todos: TodoItem[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as TodoItem));

    callback(todos);
  });
}

// User Settings Functions
export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  const settingsRef = doc(db, COLLECTIONS.USER_SETTINGS, userId);
  const settingsSnap = await getDoc(settingsRef);

  if (settingsSnap.exists()) {
    return settingsSnap.data() as UserSettings;
  }
  return null;
}

export async function updateUserSettings(
  userId: string,
  settings: Partial<Omit<UserSettings, 'userId' | 'createdAt'>>
): Promise<void> {
  const settingsRef = doc(db, COLLECTIONS.USER_SETTINGS, userId);
  const existingSettings = await getDoc(settingsRef);

  if (existingSettings.exists()) {
    await updateDoc(settingsRef, {
      ...settings,
      updatedAt: Timestamp.now(),
    });
  } else {
    await setDoc(settingsRef, {
      userId,
      timerStartOffset: settings.timerStartOffset ?? 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  }
}

export function subscribeToUserSettings(
  userId: string,
  callback: (settings: UserSettings | null) => void
) {
  const settingsRef = doc(db, COLLECTIONS.USER_SETTINGS, userId);

  return onSnapshot(settingsRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as UserSettings);
    } else {
      callback(null);
    }
  });
}
