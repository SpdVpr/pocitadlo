'use client';

import { useState } from 'react';
import { Project } from '@/types';
import { parseTimeInput } from '@/lib/utils';
import { createTimeEntry } from '@/lib/firestore';
import { useAuth } from '@/lib/authContext';

interface TimeAdjustDialogProps {
  project: Project;
  mode: 'add' | 'subtract';
  onClose: () => void;
}

export default function TimeAdjustDialog({ project, mode, onClose }: TimeAdjustDialogProps) {
  const { user, encryptionKey } = useAuth();
  const [timeInput, setTimeInput] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const quickOptions = [
    { label: '15 min', value: 0.25 },
    { label: '30 min', value: 0.5 },
    { label: '1 hod', value: 1 },
    { label: '2 hod', value: 2 },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!timeInput || !user || !encryptionKey) {
      alert('Zadejte čas');
      return;
    }

    setLoading(true);
    try {
      let duration = parseTimeInput(timeInput);

      if (mode === 'subtract') {
        if (duration > project.totalTimeCurrentMonth) {
          alert('Nelze odebrat více času, než má projekt');
          setLoading(false);
          return;
        }
        duration = -duration;
      }

      await createTimeEntry(
        user.uid,
        project.id,
        duration,
        'manual',
        project.hourlyRate,
        project.currency || 'CZK',
        encryptionKey,
        note || undefined
      );

      onClose();
    } catch (error) {
      console.error('Error adjusting time:', error);
      alert('Chyba při úpravě času');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-100 rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {mode === 'add' ? 'Přidat čas' : 'Odebrat čas'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: project.color }}
            />
            <span className="font-semibold">{project.name}</span>
          </div>
          <p className="text-sm text-gray-500">{project.hourlyRate} Kč/hod</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Rychlá volba
            </label>
            <div className="grid grid-cols-4 gap-2">
              {quickOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTimeInput(option.value.toString())}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold transition-colors"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Čas (hodiny nebo hh:mm)
            </label>
            <input
              type="text"
              value={timeInput}
              onChange={(e) => setTimeInput(e.target.value)}
              placeholder="např. 2.5 nebo 2:30"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Poznámka (volitelné)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="např. Zapomenuté hodiny z víkendu..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                mode === 'add'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              } disabled:opacity-50`}
            >
              {loading ? 'Ukládám...' : mode === 'add' ? 'Přidat' : 'Odebrat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
