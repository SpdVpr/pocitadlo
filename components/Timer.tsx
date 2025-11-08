'use client';

import { useState, useEffect } from 'react';
import { Project, UserSettings } from '@/types';
import { formatTime } from '@/lib/utils';
import { setActiveTimer, createTimeEntry, subscribeToActiveTimer, subscribeToUserSettings, updateUserSettings } from '@/lib/firestore';
import { useAuth } from '@/lib/authContext';

interface TimerProps {
  projects: Project[];
  onProjectSelect: (projectId: string) => void;
  selectedProjectId: string | null;
}

export default function Timer({ projects, onProjectSelect, selectedProjectId }: TimerProps) {
  const { user, encryptionKey } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [timerStartOffset, setTimerStartOffset] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  // Subscribe to user settings
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToUserSettings(user.uid, (settings) => {
      if (settings) {
        setTimerStartOffset(settings.timerStartOffset);
      } else {
        setTimerStartOffset(0); // Default to 0 if no settings
      }
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const unsubscribe = subscribeToActiveTimer((timer) => {
      if (timer && timer.projectId && timer.startTime) {
        setIsRunning(true);
        onProjectSelect(timer.projectId);
        setStartTime(timer.startTime.toDate());
      } else if (timer && timer.projectId === null) {
        setIsRunning(false);
        setStartTime(null);
        setElapsedSeconds(0);
      }
    });

    return () => unsubscribe();
  }, [onProjectSelect]);

  useEffect(() => {
    if (!isRunning || !startTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setElapsedSeconds(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const handleStart = async () => {
    if (!selectedProjectId) {
      alert('Prosím vyberte projekt');
      return;
    }

    const now = new Date();
    const startWithOffset = new Date(now.getTime() - timerStartOffset * 1000);
    setStartTime(startWithOffset);
    setIsRunning(true);
    setElapsedSeconds(timerStartOffset);
    await setActiveTimer(selectedProjectId, startWithOffset);
  };

  const handleStop = async () => {
    if (!selectedProjectId || !selectedProject || !user || !encryptionKey) return;

    setIsRunning(false);
    await setActiveTimer(null);

    if (elapsedSeconds > 0) {
      await createTimeEntry(
        user.uid,
        selectedProjectId,
        elapsedSeconds,
        'timer',
        selectedProject.hourlyRate,
        encryptionKey
      );
    }

    setElapsedSeconds(0);
    setStartTime(null);
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

  return (
    <div className="bg-gray-100 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
      <div className="text-center">
        <div className="text-4xl sm:text-5xl md:text-6xl font-mono font-bold mb-3 sm:mb-4 text-gray-800">
          {formatTime(elapsedSeconds)}
        </div>

        <div className="mb-4 sm:mb-6">
          {selectedProject ? (
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gray-100">
              <div
                className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: selectedProject.color }}
              />
              <span className="font-semibold text-sm sm:text-base text-gray-800 truncate max-w-[150px] sm:max-w-none">{selectedProject.name}</span>
              <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">({selectedProject.hourlyRate} Kč/hod)</span>
            </div>
          ) : (
            <div className="text-sm sm:text-base text-gray-500">Vyberte projekt</div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <button
            onClick={isRunning ? handleStop : handleStart}
            disabled={!selectedProjectId && !isRunning}
            className={`w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 rounded-xl text-lg sm:text-xl font-bold transition-all ${
              isRunning
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : selectedProjectId
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            } ${isRunning ? 'animate-pulse' : ''}`}
          >
            {isRunning ? 'STOP' : 'START'}
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2.5 sm:p-3 rounded-lg bg-white hover:bg-gray-50 transition-colors border border-gray-300 flex-shrink-0"
            title="Nastavení časovače"
          >
            <span className="text-lg sm:text-xl">⚙️</span>
          </button>
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
