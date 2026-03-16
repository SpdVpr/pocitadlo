'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/types';
import { getProjectInvoiceSettings, updateProjectInvoiceSettings } from '@/lib/firestore';

interface ProjectInvoiceSettingsDialogProps {
  project: Project;
  onClose: () => void;
}

export default function ProjectInvoiceSettingsDialog({ project, onClose }: ProjectInvoiceSettingsDialogProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    clientName: '',
    street: '',
    city: '',
    zipCode: '',
    ico: '',
    dic: '',
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getProjectInvoiceSettings(project.id);
        if (settings) {
          setFormData({
            clientName: settings.clientName,
            street: settings.street,
            city: settings.city,
            zipCode: settings.zipCode,
            ico: settings.ico || '',
            dic: settings.dic || '',
          });
        }
      } catch (err) {
        console.error('Error loading project invoice settings:', err);
        setError('Nepodařilo se načíst nastavení');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [project.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSaving(true);
    setError(null);

    try {
      await updateProjectInvoiceSettings(project.id, formData);
      onClose();
    } catch (err) {
      console.error('Error saving project invoice settings:', err);
      setError('Nepodařilo se uložit nastavení');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Fakturační údaje klienta</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-4 p-3 bg-purple-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Projekt: <span className="font-semibold">{project.name}</span>
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Název firmy / Jméno klienta *
                  </label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => handleChange('clientName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ulice a číslo *
                  </label>
                  <input
                    type="text"
                    value={formData.street}
                    onChange={(e) => handleChange('street', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Město *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    PSČ *
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => handleChange('zipCode', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    IČO
                  </label>
                  <input
                    type="text"
                    value={formData.ico}
                    onChange={(e) => handleChange('ico', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    DIČ
                  </label>
                  <input
                    type="text"
                    value={formData.dic}
                    onChange={(e) => handleChange('dic', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Ukládám...' : 'Uložit'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
