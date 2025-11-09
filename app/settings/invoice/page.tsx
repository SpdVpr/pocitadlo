'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { getInvoiceSettings, updateInvoiceSettings } from '@/lib/firestore';

function InvoiceSettingsContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    street: '',
    city: '',
    zipCode: '',
    ico: '',
    dic: '',
    phone: '',
    email: '',
    bankAccount: '',
    invoicePrefix: 'F',
    nextInvoiceNumber: 1,
  });

  useEffect(() => {
    if (!user) return;

    const loadSettings = async () => {
      try {
        const settings = await getInvoiceSettings(user.uid);
        if (settings) {
          setFormData({
            companyName: settings.companyName,
            street: settings.street,
            city: settings.city,
            zipCode: settings.zipCode,
            ico: settings.ico,
            dic: settings.dic || '',
            phone: settings.phone || '',
            email: settings.email || '',
            bankAccount: settings.bankAccount || '',
            invoicePrefix: settings.invoicePrefix,
            nextInvoiceNumber: settings.nextInvoiceNumber,
          });
        }
      } catch (err) {
        console.error('Error loading invoice settings:', err);
        setError('Nepodařilo se načíst nastavení');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await updateInvoiceSettings(user.uid, formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving invoice settings:', err);
      setError('Nepodařilo se uložit nastavení');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Nastavení fakturace</h1>
        <p className="text-gray-600">Zadejte své fakturační údaje pro vytváření faktur</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-300 rounded-lg text-green-700">
          Nastavení bylo úspěšně uloženo
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Vaše fakturační údaje (dodavatel)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Název firmy / Jméno *
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
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
                IČO *
              </label>
              <input
                type="text"
                value={formData.ico}
                onChange={(e) => handleChange('ico', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
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

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Telefon
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Číslo účtu (pro QR platbu)
              </label>
              <input
                type="text"
                value={formData.bankAccount}
                onChange={(e) => handleChange('bankAccount', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="123456789/0100 nebo CZ6508000000192000145399"
              />
              <p className="text-xs text-gray-500 mt-1">
                Zadejte české číslo účtu (např. 123456789/0100) nebo IBAN
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 pt-6 border-t border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Číselná řada faktur</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Prefix faktury *
              </label>
              <input
                type="text"
                value={formData.invoicePrefix}
                onChange={(e) => handleChange('invoicePrefix', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
                placeholder="F"
              />
              <p className="text-sm text-gray-500 mt-1">Např. F, FAK, INV</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Další číslo faktury *
              </label>
              <input
                type="number"
                value={formData.nextInvoiceNumber}
                onChange={(e) => handleChange('nextInvoiceNumber', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
                min="1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Další faktura bude: {formData.invoicePrefix}{formData.nextInvoiceNumber.toString().padStart(4, '0')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <a
            href="/dashboard"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Zpět
          </a>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Ukládám...' : 'Uložit nastavení'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function InvoiceSettingsPage() {
  return (
    <ProtectedRoute>
      <InvoiceSettingsContent />
    </ProtectedRoute>
  );
}
