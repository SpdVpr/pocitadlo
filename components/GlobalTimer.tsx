'use client';

import { useState, useEffect } from 'react';
import type { Project, ActiveTimerEntry } from '@/types';
import { formatTime } from '@/lib/utils';
import { subscribeToActiveTimers, subscribeToProjects } from '@/lib/firestore';
import { useAuth } from '@/lib/authContext';
import { usePathname } from 'next/navigation';

interface RunningTimer {
  projectId: string;
  startTime: Date;
  elapsedSeconds: number;
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
      if (projects.length > 0) {
        const validTimers = timers.filter(t => projects.find(p => p.id === t.projectId));
        setRunningTimers(prev => {
          return validTimers.map(t => {
            const existing = prev.find(rt => rt.projectId === t.projectId);
            const startDate = t.startTime.toDate();
            if (existing && existing.startTime.getTime() === startDate.getTime()) {
              return existing;
            }
            return {
              projectId: t.projectId,
              startTime: startDate,
              elapsedSeconds: Math.floor((Date.now() - startDate.getTime()) / 1000),
            };
          });
        });
      } else {
        setRunningTimers(timers.map(t => ({
          projectId: t.projectId,
          startTime: t.startTime.toDate(),
          elapsedSeconds: Math.floor((Date.now() - t.startTime.toDate().getTime()) / 1000),
        })));
      }
    });

    return () => unsubscribe();
  }, [user, projects]);

  // Update elapsed time for all timers
  useEffect(() => {
    if (runningTimers.length === 0) return;

    const interval = setInterval(() => {
      setRunningTimers(prev =>
        prev.map(timer => ({
          ...timer,
          elapsedSeconds: Math.floor((Date.now() - timer.startTime.getTime()) / 1000),
        }))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [runningTimers.length]);

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
                  <div key={timer.projectId} className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10 flex-shrink-0">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="font-semibold text-sm truncate max-w-[100px]">
                      {project.name}
                    </span>
                    <span className="font-mono text-xs">
                      {formatTime(timer.elapsedSeconds)}
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
