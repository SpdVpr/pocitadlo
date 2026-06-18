'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Project, ActiveTimerEntry } from '@/types';
import { formatTime } from '@/lib/utils';
import { startProjectTimer, stopProjectTimer, pauseProjectTimer, resumeProjectTimer, createTimeEntry, subscribeToActiveTimers, subscribeToUserSettings, updateUserSettings } from '@/lib/firestore';
import { useAuth } from '@/lib/authContext';

interface TimerProps {
  projects: Project[];
  onProjectSelect: (projectId: string) => void;
  selectedProjectId: string | null;
}

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

export default function Timer({ projects, onProjectSelect, selectedProjectId }: TimerProps) {
  const { user, encryptionKey } = useAuth();
  const [runningTimers, setRunningTimers] = useState<RunningTimer[]>([]);
  const [timerStartOffset, setTimerStartOffset] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  // Subscribe to user settings
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToUserSettings(user.uid, (settings) => {
      setTimerStartOffset(settings?.timerStartOffset || 0);
    });
    return () => unsubscribe();
  }, [user]);

  // Subscribe to active timers
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToActiveTimers(user.uid, (timers: ActiveTimerEntry[]) => {
      const validTimers = projects.length > 0
        ? timers.filter(t => projects.find(p => p.id === t.projectId))
        : timers;

      setRunningTimers(prev => {
        return validTimers.map(t => {
          const existing = prev.find(rt => rt.projectId === t.projectId);
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
        });
      });
    });
    return () => unsubscribe();
  }, [projects, user]);

  // Tick all running (non-paused) timers
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

  const isProjectRunning = useCallback((projectId: string) => {
    return runningTimers.some(t => t.projectId === projectId);
  }, [runningTimers]);

  const handleStart = async () => {
    if (!selectedProjectId || !user) {
      alert('Prosím vyberte projekt');
      return;
    }
    if (isProjectRunning(selectedProjectId)) return;

    const now = new Date();
    const startWithOffset = new Date(now.getTime() - timerStartOffset * 1000);
    await startProjectTimer(user.uid, selectedProjectId, startWithOffset);
  };

  const handleStop = async (projectId: string) => {
    if (!user || !encryptionKey) {
      alert('Nelze zastavit časovač - chybí data. Obnovte stránku.');
      return;
    }

    const project = projects.find(p => p.id === projectId);
    const timer = runningTimers.find(t => t.projectId === projectId);
    if (!project || !timer) return;

    try {
      if (timer.elapsedSeconds > 0) {
        await createTimeEntry(
          user.uid,
          projectId,
          timer.elapsedSeconds,
          'timer',
          project.hourlyRate,
          project.currency || 'CZK',
          encryptionKey
        );
      }
      await stopProjectTimer(user.uid, projectId);
    } catch (error) {
      console.error('Error stopping timer:', error);
      alert('Chyba při zastavení časovače.');
    }
  };

  const handlePause = async (projectId: string) => {
    if (!user) return;
    try {
      await pauseProjectTimer(user.uid, projectId);
    } catch (error) {
      console.error('Error pausing timer:', error);
      alert('Chyba při pozastavení časovače.');
    }
  };

  const handleResume = async (projectId: string) => {
    if (!user) return;
    try {
      await resumeProjectTimer(user.uid, projectId);
    } catch (error) {
      console.error('Error resuming timer:', error);
      alert('Chyba při pokračování časovače.');
    }
  };

  const handleOffsetChange = async (offset: number) => {
    if (!user) return;
    try {
      await updateUserSettings(user.uid, { timerStartOffset: offset });
      setTimerStartOffset(offset);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const offsetOptions = [
    { label: '0', value: 0 },
    { label: '15', value: 900 },
    { label: '30', value: 1800 },
    { label: '60', value: 3600 },
  ];

  const isSelectedRunning = selectedProjectId ? isProjectRunning(selectedProjectId) : false;

  return (
    <div className="mb-6 sm:mb-8 space-y-4">
      {/* Running timer cells */}
      {runningTimers.map((timer) => {
        const project = projects.find(p => p.id === timer.projectId);
        if (!project) return null;
        return (
          <div
            key={timer.projectId}
            className={`bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border-2 ${
              timer.isPaused ? 'border-amber-200' : 'border-red-200'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    timer.isPaused ? 'bg-amber-500' : 'bg-red-500 animate-pulse'
                  }`}
                />
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: project.color }}
                />
                <div className="min-w-0">
                  <span className="font-bold text-sm sm:text-base text-gray-800 truncate block">{project.name}</span>
                  <span className="text-xs text-gray-500">
                    {timer.isPaused
                      ? 'Pozastaveno'
                      : `${project.hourlyRate} ${(project.currency || 'CZK') === 'EUR' ? '€' : 'Kč'}/hod`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <div
                  className={`text-2xl sm:text-4xl font-mono font-bold ${
                    timer.isPaused ? 'text-amber-600' : 'text-gray-800'
                  }`}
                >
                  {formatTime(timer.elapsedSeconds)}
                </div>
                {timer.isPaused ? (
                  <button
                    onClick={() => handleResume(timer.projectId)}
                    className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-sm sm:text-lg font-bold bg-green-500 hover:bg-green-600 text-white transition-all"
                    title="Pokračovat"
                  >
                    ▶
                  </button>
                ) : (
                  <button
                    onClick={() => handlePause(timer.projectId)}
                    className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-sm sm:text-lg font-bold bg-amber-500 hover:bg-amber-600 text-white transition-all"
                    title="Pozastavit"
                  >
                    ⏸
                  </button>
                )}
                <button
                  onClick={() => handleStop(timer.projectId)}
                  className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-sm sm:text-lg font-bold bg-red-500 hover:bg-red-600 text-white transition-all"
                >
                  STOP
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Start new timer panel */}
      <div className="bg-gray-100 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {selectedProject && !isSelectedRunning ? (
              <>
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: selectedProject.color }}
                />
                <div className="min-w-0">
                  <span className="font-semibold text-sm sm:text-base text-gray-800 truncate block">{selectedProject.name}</span>
                  <span className="text-xs text-gray-500">{selectedProject.hourlyRate} {(selectedProject.currency || 'CZK') === 'EUR' ? '€' : 'Kč'}/hod</span>
                </div>
              </>
            ) : (
              <span className="text-sm text-gray-500">
                {runningTimers.length > 0 ? 'Klikněte na další projekt pro spuštění' : 'Vyberte projekt'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {!isSelectedRunning && (
              <button
                onClick={handleStart}
                disabled={!selectedProjectId}
                className={`px-6 sm:px-8 py-2 sm:py-3 rounded-xl text-sm sm:text-lg font-bold transition-all ${
                  selectedProjectId
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                START
              </button>
            )}

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 sm:p-2.5 rounded-lg bg-white hover:bg-gray-50 transition-colors border border-gray-300 flex-shrink-0"
              title="Nastavení časovače"
            >
              <span className="text-base sm:text-lg">⚙️</span>
            </button>
          </div>
        </div>

        {showSettings && (
          <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-white rounded-xl border border-gray-200">
            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">Začít časovač od:</p>
            <div className="flex justify-center gap-2 flex-wrap">
              {offsetOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleOffsetChange(option.value)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    timerStartOffset === option.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label} min
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
