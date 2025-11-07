'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/types';
import { formatTime } from '@/lib/utils';
import { setActiveTimer, createTimeEntry, subscribeToActiveTimer } from '@/lib/firestore';
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

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  useEffect(() => {
    const unsubscribe = subscribeToActiveTimer((timer) => {
      if (timer && timer.projectId && timer.startTime) {
        setIsRunning(true);
        onProjectSelect(timer.projectId);
        setStartTime(timer.startTime.toDate());
      } else {
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
    const startWithOffset = new Date(now.getTime() - 30 * 60 * 1000);
    setStartTime(startWithOffset);
    setIsRunning(true);
    setElapsedSeconds(1800);
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

  return (
    <div className="bg-gray-100 rounded-2xl shadow-lg p-8 mb-8">
      <div className="text-center">
        <div className="text-6xl font-mono font-bold mb-4 text-gray-800">
          {formatTime(elapsedSeconds)}
        </div>

        <div className="mb-6">
          {selectedProject ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: selectedProject.color }}
              />
              <span className="font-semibold text-gray-800">{selectedProject.name}</span>
              <span className="text-gray-500">({selectedProject.hourlyRate} Kč/hod)</span>
            </div>
          ) : (
            <div className="text-gray-500">Vyberte projekt</div>
          )}
        </div>

        <button
          onClick={isRunning ? handleStop : handleStart}
          disabled={!selectedProjectId && !isRunning}
          className={`px-12 py-4 rounded-xl text-xl font-bold transition-all ${
            isRunning
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : selectedProjectId
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          } ${isRunning ? 'animate-pulse' : ''}`}
        >
          {isRunning ? 'STOP' : 'START'}
        </button>
      </div>
    </div>
  );
}
