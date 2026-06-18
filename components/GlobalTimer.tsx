'use client';

import { useState, useEffect } from 'react';
import type { Project, ActiveTimerEntry } from '@/types';
import { formatTime } from '@/lib/utils';
import { subscribeToActiveTimers, subscribeToProjects } from '@/lib/firestore';
import { useAuth } from '@/lib/authContext';
import { usePathname } from 'next/navigation';

interface RunningTimer {
  projectId: string;
  startTime: Date | null; // null when paused
  accumulatedSeconds: number;
  isPaused: boolean;
  elapsedSeconds: number;
}

function computeElapsed(t: { startTime: Date | null; accumulatedSeconds: number; isPaused: boolean }) {
  if (t.isPaused || !t.startTime) return t.accumulatedSeconds;
  return t.accumulatedSeconds + Math.floor((Date.now() - t.startTime.getTime()) / 1000);
}

export default function GlobalTimer() {
  const { user, encryptionKey } = useAuth();
  const pathname = usePathname();
  const [runningTimers, setRunningTimers] = useState<RunningTimer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // Subscribe to projects
  useEffect(() => {
    if (!user || !encryptionKey) return;

    const unsubscribe = subscribeToProjects(user.uid, setProjects, encryptionKey);
    return () => unsubscribe();
  }, [user, encryptionKey]);

  // Subscribe to active timers
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToActiveTimers(user.uid, (timers: ActiveTimerEntry[]) => {
      const mapTimer = (t: ActiveTimerEntry, existing?: RunningTimer): RunningTimer => {
        const startDate = t.startTime ? t.startTime.toDate() : null;
        const accumulated = t.accumulatedSeconds || 0;
        const isPaused = t.isPaused || false;
        if (
          existing &&
          (existing.startTime?.getTime() ?? null) === (startDate?.getTime() ?? null) &&
          existing.isPaused === isPaused &&
          existing.accumulatedSeconds === accumulated
        ) {
          return existing;
        }
        return {
          projectId: t.projectId,
          startTime: startDate,
          accumulatedSeconds: accumulated,
          isPaused,
          elapsedSeconds: computeElapsed({ startTime: startDate, accumulatedSeconds: accumulated, isPaused }),
        };
      };

      if (projects.length > 0) {
        const validTimers = timers.filter(t => projects.find(p => p.id === t.projectId));
        setRunningTimers(prev => validTimers.map(t => mapTimer(t, prev.find(rt => rt.projectId === t.projectId))));
      } else {
        setRunningTimers(prev => timers.map(t => mapTimer(t, prev.find(rt => rt.projectId === t.projectId))));
      }
    });

    return () => unsubscribe();
  }, [user, projects]);

  // Update elapsed time for all running (non-paused) timers
  const activeCount = runningTimers.filter(t => !t.isPaused && t.startTime).length;
  useEffect(() => {
    if (activeCount === 0) return;

    const interval = setInterval(() => {
      setRunningTimers(prev =>
        prev.map(timer =>
          timer.isPaused || !timer.startTime
            ? timer
            : { ...timer, elapsedSeconds: computeElapsed(timer) }
        )
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [activeCount]);

  // Update document title with first running timer
  useEffect(() => {
    if (runningTimers.length > 0) {
      const firstTimer = runningTimers[0];
      const project = projects.find(p => p.id === firstTimer.projectId);
      if (project) {
        const suffix = runningTimers.length > 1 ? ` (+${runningTimers.length - 1})` : '';
        document.title = `${formatTime(firstTimer.elapsedSeconds)} - ${project.name}${suffix}`;
      }
    } else {
      document.title = 'EvidujCas.cz - Sledování odpracovaných hodin';
    }

    return () => {
      document.title = 'EvidujCas.cz - Sledování odpracovaných hodin';
    };
  }, [runningTimers, projects]);

  // Don't show on landing page, auth page, or when not running
  if (pathname === '/' || pathname === '/auth' || runningTimers.length === 0) {
    return null;
  }

  // Don't show on dashboard page (Timer component is already there)
  if (pathname === '/dashboard') {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg z-40 border-t-2 border-purple-500">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">
                {runningTimers.length === 1 ? 'Běží časovač' : `${runningTimers.length} časovače`}
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2 overflow-x-auto">
              {runningTimers.map((timer) => {
                const project = projects.find(p => p.id === timer.projectId);
                if (!project) return null;
                return (
                  <div key={timer.projectId} className={`flex items-center gap-2 px-3 py-1 rounded-lg flex-shrink-0 ${timer.isPaused ? 'bg-white/5' : 'bg-white/10'}`}>
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="font-semibold text-sm truncate max-w-[100px]">
                      {project.name}
                    </span>
                    <span className="font-mono text-xs">
                      {timer.isPaused ? '⏸ ' : ''}{formatTime(timer.elapsedSeconds)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="text-2xl sm:text-3xl font-mono font-bold">
              {formatTime(runningTimers[0]?.elapsedSeconds || 0)}
            </div>
            <a
              href="/dashboard"
              className="px-4 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm"
            >
              Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
