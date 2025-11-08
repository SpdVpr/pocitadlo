'use client';

import { useState, useEffect } from 'react';
import { Project, TimeEntry } from '@/types';
import { subscribeToProjects, subscribeToDailyTimeEntries, resetProjectStats } from '@/lib/firestore';
import { getCurrentMonthYear, getMonthName, formatHours, formatPrice } from '@/lib/utils';
import { useAuth } from '@/lib/authContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Timer from '@/components/Timer';
import ProjectList from '@/components/ProjectList';
import TimeAdjustDialog from '@/components/TimeAdjustDialog';
import InvoiceDialog from '@/components/InvoiceDialog';

function DashboardContent() {
  const { user, encryptionKey } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [dailyEntries, setDailyEntries] = useState<TimeEntry[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    project: Project | null;
    mode: 'add' | 'subtract';
  }>({
    isOpen: false,
    project: null,
    mode: 'add',
  });
  const [invoiceDialogProject, setInvoiceDialogProject] = useState<Project | null>(null);

  useEffect(() => {
    if (!user || !encryptionKey) return;

    const unsubscribe = subscribeToProjects(user.uid, setProjects, encryptionKey);
    return () => unsubscribe();
  }, [user, encryptionKey]);

  useEffect(() => {
    if (!user || !encryptionKey) return;

    const unsubscribe = subscribeToDailyTimeEntries(user.uid, setDailyEntries, encryptionKey);
    return () => unsubscribe();
  }, [user, encryptionKey]);

  const handleAddTime = (project: Project) => {
    setDialogState({
      isOpen: true,
      project,
      mode: 'add',
    });
  };

  const handleSubtractTime = (project: Project) => {
    setDialogState({
      isOpen: true,
      project,
      mode: 'subtract',
    });
  };

  const closeDialog = () => {
    setDialogState({
      isOpen: false,
      project: null,
      mode: 'add',
    });
  };

  const handleCreateInvoice = (project: Project) => {
    setInvoiceDialogProject(project);
  };

  const closeInvoiceDialog = () => {
    setInvoiceDialogProject(null);
  };

  const handleResetProject = async (project: Project) => {
    try {
      await resetProjectStats(project.id);
    } catch (error) {
      console.error('Error resetting project:', error);
    }
  };

  const totalStats = projects.reduce(
    (acc, project) => ({
      totalHours: acc.totalHours + project.totalTimeCurrentMonth,
      totalPrice: acc.totalPrice + project.totalPriceCurrentMonth,
    }),
    { totalHours: 0, totalPrice: 0 }
  );

  const dailyStats = dailyEntries.reduce(
    (acc, entry) => ({
      totalHours: acc.totalHours + entry.duration,
      totalPrice: acc.totalPrice + entry.price,
    }),
    { totalHours: 0, totalPrice: 0 }
  );

  const { month, year } = getCurrentMonthYear();

  return (
    <div>
      <Timer
        projects={projects}
        onProjectSelect={setSelectedProjectId}
        selectedProjectId={selectedProjectId}
      />

      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Projekty</h2>
        <ProjectList
          projects={projects}
          selectedProjectId={selectedProjectId}
          onProjectSelect={setSelectedProjectId}
          onAddTime={handleAddTime}
          onSubtractTime={handleSubtractTime}
          onCreateInvoice={handleCreateInvoice}
          onResetProject={handleResetProject}
        />
      </div>

      <div className="bg-gray-100 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800">
            Statistiky za {getMonthName(month)} {year}
          </h3>
          <a
            href="/projects"
            className="w-full sm:w-auto text-center px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm sm:text-base"
          >
            Spravovat projekty
          </a>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          <div>
            <p className="text-gray-500 text-xs sm:text-sm mb-1">Celkový počet hodin</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
              {formatHours(totalStats.totalHours)}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs sm:text-sm mb-1">Celková částka</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600">
              {formatPrice(totalStats.totalPrice)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-purple-50 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">
          Denní statistiky
        </h3>

        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          <div>
            <p className="text-gray-500 text-xs sm:text-sm mb-1">Počet hodin dnes</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
              {formatHours(dailyStats.totalHours)}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs sm:text-sm mb-1">Částka dnes</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-600">
              {formatPrice(dailyStats.totalPrice)}
            </p>
          </div>
        </div>
      </div>

      {dialogState.isOpen && dialogState.project && (
        <TimeAdjustDialog
          project={dialogState.project}
          mode={dialogState.mode}
          onClose={closeDialog}
        />
      )}

      {invoiceDialogProject && (
        <InvoiceDialog
          project={invoiceDialogProject}
          onClose={closeInvoiceDialog}
        />
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

