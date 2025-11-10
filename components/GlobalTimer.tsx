'use client';

import { useState, useEffect } from 'react';
import type { Project } from '@/types';
import { formatTime } from '@/lib/utils';
import { subscribeToActiveTimer, subscribeToProjects } from '@/lib/firestore';
import { useAuth } from '@/lib/authContext';
import { usePathname } from 'next/navigation';

export default function GlobalTimer() {
  const { user, encryptionKey } = useAuth();
  const pathname = usePathname();
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  const activeProject = projects.find((p) => p.id === activeProjectId);

  // Subscribe to projects
  useEffect(() => {
    if (!user || !encryptionKey) return;

    const unsubscribe = subscribeToProjects(user.uid, setProjects, encryptionKey);
    return () => unsubscribe();
  }, [user, encryptionKey]);

  // Subscribe to active timer
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToActiveTimer(user.uid, (timer) => {
      if (timer && timer.projectId && timer.startTime) {
        // Check if project exists (only when projects are loaded)
        if (projects.length > 0) {
          const projectExists = projects.find(p => p.id === timer.projectId);
          if (projectExists) {
            setIsRunning(true);
            setActiveProjectId(timer.projectId);
            setStartTime(timer.startTime.toDate());
          } else {
            // Project doesn't exist, stop the timer
            console.warn('GlobalTimer: Timer running for non-existent project:', timer.projectId);
            setIsRunning(false);
            setStartTime(null);
            setElapsedSeconds(0);
            setActiveProjectId(null);
          }
        } else {
          // Projects not loaded yet, just set the timer state
          setIsRunning(true);
          setActiveProjectId(timer.projectId);
          setStartTime(timer.startTime.toDate());
        }
      } else {
        setIsRunning(false);
        setStartTime(null);
        setElapsedSeconds(0);
        setActiveProjectId(null);
      }
    });

    return () => unsubscribe();
  }, [user, projects]);

  // Update elapsed time
  useEffect(() => {
    if (!isRunning || !startTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setElapsedSeconds(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  // Update document title
  useEffect(() => {
    if (isRunning && activeProject) {
      document.title = `${formatTime(elapsedSeconds)} - ${activeProject.name}`;
    } else {
      document.title = 'EvidujCas.cz - Sledování odpracovaných hodin';
    }

    return () => {
      document.title = 'EvidujCas.cz - Sledování odpracovaných hodin';
    };
  }, [isRunning, elapsedSeconds, activeProject]);

  // Don't show on landing page, auth page, or when not running
  if (pathname === '/' || pathname === '/auth' || !isRunning || !activeProject) {
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
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Běží časovač</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: activeProject.color }}
              />
              <span className="font-semibold text-sm truncate max-w-[150px]">
                {activeProject.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-2xl sm:text-3xl font-mono font-bold">
              {formatTime(elapsedSeconds)}
            </div>
            <a
              href="/dashboard"
              className="px-4 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm"
            >
              Zastavit
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

