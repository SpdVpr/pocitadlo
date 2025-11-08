'use client';

import { useState, useEffect } from 'react';
import { Project, PaymentMethod } from '@/types';
import { useAuth } from '@/lib/authContext';
import { 
  getInvoiceSettings, 
  getProjectInvoiceSettings, 
  createInvoice, 
  resetProjectStats 
} from '@/lib/firestore';
import { Timestamp } from 'firebase/firestore';
import { generateInvoicePDF } from '@/lib/pdfGenerator';
import { formatHours } from '@/lib/utils';

interface InvoiceDialogProps {
  project: Project;
  onClose: () => void;
}

export default function InvoiceDialog({ project, onClose }: InvoiceDialogProps) {
  const { user } = useAuth();
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transfer');
  const [daysUntilDue, setDaysUntilDue] = useState(14);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInvoiceSettings, setHasInvoiceSettings] = useState(false);
  const [hasProjectSettings, setHasProjectSettings] = useState(false);

  const hours = project.totalTimeCurrentMonth / 3600;
  const totalPrice = project.totalPriceCurrentMonth;

  useEffect(() => {
    if (!user) return;

    const checkSettings = async () => {
      const invoiceSettings = await getInvoiceSettings(user.uid);
      const projectSettings = await getProjectInvoiceSettings(project.id);
      
      setHasInvoiceSettings(!!invoiceSettings);
      setHasProjectSettings(!!projectSettings);
    };

    checkSettings();
  }, [user, project.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    if (!hasInvoiceSettings) {
      setError('Nejprve nastavte fakturační údaje v nastavení');
      return;
    }
    if (!hasProjectSettings) {
      setError('Nejprve nastavte fakturační údaje klienta u projektu');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const invoiceSettings = await getInvoiceSettings(user.uid);
      const projectSettings = await getProjectInvoiceSettings(project.id);

      if (!invoiceSettings || !projectSettings) {
        setError('Chybí fakturační údaje');
        setLoading(false);
        return;
      }

      const issueDate = Timestamp.now();
      const dueDate = Timestamp.fromDate(
        new Date(Date.now() + daysUntilDue * 24 * 60 * 60 * 1000)
      );

      const invoiceNumber = `${invoiceSettings.invoicePrefix}${invoiceSettings.nextInvoiceNumber.toString().padStart(4, '0')}`;
      const variableSymbol = invoiceSettings.nextInvoiceNumber.toString();

      const invoice = {
        invoiceNumber,
        variableSymbol,
        issueDate,
        dueDate,
        description,
        hours,
        hourlyRate: project.hourlyRate,
        totalPrice,
        paymentMethod,
        supplier: {
          companyName: invoiceSettings.companyName,
          street: invoiceSettings.street,
          city: invoiceSettings.city,
          zipCode: invoiceSettings.zipCode,
          ico: invoiceSettings.ico,
          dic: invoiceSettings.dic,
          phone: invoiceSettings.phone,
          email: invoiceSettings.email,
          bankAccount: invoiceSettings.bankAccount,
        },
        client: {
          companyName: projectSettings.clientName,
          street: projectSettings.street,
          city: projectSettings.city,
          zipCode: projectSettings.zipCode,
          ico: projectSettings.ico,
          dic: projectSettings.dic,
        },
      };

      const invoiceId = await createInvoice(user.uid, project.id, invoice);

      const fullInvoice = {
        id: invoiceId,
        userId: user.uid,
        projectId: project.id,
        ...invoice,
        createdAt: Timestamp.now(),
      };

      await generateInvoicePDF(fullInvoice);

      await resetProjectStats(project.id);

      onClose();
    } catch (err) {
      console.error('Error creating invoice:', err);
      setError('Nepodařilo se vytvořit fakturu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Vytvořit fakturu</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-6 p-4 bg-purple-50 rounded-lg">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Projekt:</span>
            <span className="font-semibold">{project.name}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Počet hodin:</span>
            <span className="font-semibold">{formatHours(project.totalTimeCurrentMonth)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Hodinová sazba:</span>
            <span className="font-semibold">{project.hourlyRate} Kč/hod</span>
          </div>
          <div className="flex justify-between border-t border-purple-200 pt-2 mt-2">
            <span className="text-gray-800 font-bold">Celková cena:</span>
            <span className="text-green-600 font-bold text-lg">{totalPrice.toFixed(2)} Kč</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {!hasInvoiceSettings && (
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg text-yellow-800">
            Nejprve nastavte fakturační údaje v <a href="/invoicing" className="underline font-semibold">nastavení</a>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Co fakturujete, popis
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={3}
              required
              placeholder="Např. Vývoj webové aplikace"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Způsob platby
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="transfer">Bankovní převod</option>
              <option value="cash">Hotově</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Splatnost (dny)
            </label>
            <input
              type="number"
              value={daysUntilDue}
              onChange={(e) => setDaysUntilDue(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              min="0"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={loading || !hasInvoiceSettings || !hasProjectSettings}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Vytvářím...' : 'Vytvořit fakturu'}
            </button>
          </div>
        </form>

        <div className="mt-4 text-sm text-gray-500">
          Po vytvoření faktury se stav projektu vynuluje a PDF se stáhne.
        </div>
      </div>
    </div>
  );
}
