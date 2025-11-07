'use client';

import { useState, useEffect } from 'react';
import { updateUserSettings, subscribeToUserSettings } from '@/lib/firestore';
import { useAuth } from '@/lib/authContext';

export default function TimerSettings() {
  const { user } = useAuth();
  const [timerStartOffset, setTimerStartOffset] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToUserSettings(user.uid, (settings) => {
      if (settings) {
        setTimerStartOffset(settings.timerStartOffset);
      } else {
        setTimerStartOffset(0);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleSave = async (offset: number) => {
    if (!user) return;

    setSaving(true);
    try {
      await updateUserSettings(user.uid, { timerStartOffset: offset });
      setTimerStartOffset(offset);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Chyba při ukládání nastavení');
    } finally {
      setSaving(false);
    }
  };

  const options = [
    { label: '0 minut', value: 0, description: 'Začít od nuly' },
    { label: '15 minut', value: 900, description: 'Začít od 15 minut' },
    { label: '30 minut', value: 1800, description: 'Začít od 30 minut' },
    { label: '60 minut', value: 3600, description: 'Začít od 1 hodiny' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">⚙️ Nastavení časovače</h2>
        {showSuccess && (
          <span className="text-green-600 font-semibold text-sm">✓ Uloženo</span>
        )}
      </div>
      
      <p className="text-gray-600 mb-4 text-sm">
        Vyberte, od kolika minut má časovač začínat při spuštění:
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSave(option.value)}
            disabled={saving}
            className={`p-4 rounded-xl border-2 transition-all ${
              timerStartOffset === option.value
                ? 'border-purple-600 bg-purple-50 text-purple-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300'
            } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="font-bold text-lg mb-1">{option.label}</div>
            <div className="text-xs opacity-75">{option.description}</div>
          </button>
        ))}
      </div>

      <div className="mt-4 p-3 bg-purple-50 rounded-lg text-sm text-gray-700">
        <p className="font-semibold mb-1">💡 Tip:</p>
        <p>
          Pokud často zapomínáte spustit časovač včas, nastavte výchozí čas na 15, 30 nebo 60 minut.
          Časovač pak začne s předstihem a vy můžete čas upravit později.
        </p>
      </div>
    </div>
  );
}

