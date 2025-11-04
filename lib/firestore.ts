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
import { Project, TimeEntry, ActiveTimer } from '@/types';
import { getCurrentMonthYear } from './utils';

const COLLECTIONS = {
  PROJECTS: 'projects',
  TIME_ENTRIES: 'time_entries',
  ACTIVE_TIMER: 'active_timer',
};

export async function createProject(
  name: string,
  hourlyRate: number,
  color: string
): Promise<string> {
  const now = Timestamp.now();
  const { month, year } = getCurrentMonthYear();
  
  const projectData = {
    name,
    hourlyRate,
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
  data: Partial<Omit<Project, 'id' | 'createdAt'>>
): Promise<void> {
  const projectRef = doc(db, COLLECTIONS.PROJECTS, id);
  await updateDoc(projectRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteProject(id: string): Promise<void> {
  const projectRef = doc(db, COLLECTIONS.PROJECTS, id);
  await deleteDoc(projectRef);
}

export function subscribeToProjects(
  callback: (projects: Project[]) => void,
  activeOnly: boolean = true
) {
  const q = query(collection(db, COLLECTIONS.PROJECTS));

  return onSnapshot(q, (snapshot) => {
    let projects: Project[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Project));
    
    if (activeOnly) {
      projects = projects.filter(p => p.isActive);
    }
    
    projects.sort((a, b) => a.name.localeCompare(b.name));
    
    callback(projects);
  });
}

export async function createTimeEntry(
  projectId: string,
  duration: number,
  type: 'timer' | 'manual',
  hourlyRate: number,
  note?: string
): Promise<string> {
  const now = Timestamp.now();
  const { month, year } = getCurrentMonthYear();
  const price = (duration / 3600) * hourlyRate;

  const entryData: any = {
    projectId,
    type,
    startTime: now,
    endTime: now,
    duration,
    price,
    month,
    year,
    createdAt: now,
    updatedAt: now,
  };

  if (note) {
    entryData.note = note;
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
  callback: (entries: TimeEntry[]) => void,
  projectId?: string,
  month?: number,
  year?: number
) {
  const q = query(collection(db, COLLECTIONS.TIME_ENTRIES));

  return onSnapshot(q, (snapshot) => {
    let entries: TimeEntry[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as TimeEntry));
    
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

export async function resetMonthlyStats(): Promise<void> {
  const projectsRef = collection(db, COLLECTIONS.PROJECTS);
  const snapshot = await getDocs(projectsRef);
  
  const updates = snapshot.docs.map((doc) =>
    updateDoc(doc.ref, {
      totalTimeCurrentMonth: 0,
      totalPriceCurrentMonth: 0,
      updatedAt: Timestamp.now(),
    })
  );

  await Promise.all(updates);
}
