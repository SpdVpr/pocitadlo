'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Project, TimeEntry } from '@/types';
import { subscribeToProjects, subscribeToDailyTimeEntries, resetProjectStats, updateProjectsOrder } from '@/lib/firestore';
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

  const handleReorderProjects = async (reorderedProjects: Project[]) => {
    const projectOrders = reorderedProjects.map((project, index) => ({
      id: project.id,
      order: index,
    }));

    try {
      await updateProjectsOrder(projectOrders);
    } catch (error) {
      console.error('Error updating project order:', error);
    }
  };

  const totalStats = projects.reduce(
    (acc, project) => {
      const currency = project.currency || 'CZK';
      return {
        CZK: {
          totalHours: acc.CZK.totalHours + (currency === 'CZK' ? project.totalTimeCurrentMonth : 0),
          totalPrice: acc.CZK.totalPrice + (currency === 'CZK' ? project.totalPriceCurrentMonth : 0),
        },
        EUR: {
          totalHours: acc.EUR.totalHours + (currency === 'EUR' ? project.totalTimeCurrentMonth : 0),
          totalPrice: acc.EUR.totalPrice + (currency === 'EUR' ? project.totalPriceCurrentMonth : 0),
        },
      };
    },
    { CZK: { totalHours: 0, totalPrice: 0 }, EUR: { totalHours: 0, totalPrice: 0 } }
  );

  const dailyStats = dailyEntries.reduce(
    (acc, entry) => {
      const currency = entry.currency || 'CZK';
      return {
        CZK: {
          totalHours: acc.CZK.totalHours + (currency === 'CZK' ? entry.duration : 0),
          totalPrice: acc.CZK.totalPrice + (currency === 'CZK' ? entry.price : 0),
        },
        EUR: {
          totalHours: acc.EUR.totalHours + (currency === 'EUR' ? entry.duration : 0),
          totalPrice: acc.EUR.totalPrice + (currency === 'EUR' ? entry.price : 0),
        },
      };
    },
    { CZK: { totalHours: 0, totalPrice: 0 }, EUR: { totalHours: 0, totalPrice: 0 } }
  );

  const { month, year } = getCurrentMonthYear();

  return (
    <div>
      <Timer
        projects={projects}
        onProjectSelect={setSelectedProjectId}
        selectedProjectId={selectedProjectId}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 sm:mb-8"
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Projekty
          </h2>
          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gray-400">
              <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>Podržte kartu pro změnu pořadí</span>
          </div>
        </div>
        <ProjectList
          projects={projects}
          selectedProjectId={selectedProjectId}
          onProjectSelect={setSelectedProjectId}
          onAddTime={handleAddTime}
          onSubtractTime={handleSubtractTime}
          onCreateInvoice={handleCreateInvoice}
          onResetProject={handleResetProject}
          onReorder={handleReorderProjects}
        />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 mb-6 sm:mb-8 border border-gray-200"
      >
        <motion.div 
          className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full blur-3xl opacity-20"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6">
          <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Statistiky za {getMonthName(month)} {year}
          </h3>
          <motion.a
            href="/projects"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto text-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
          >
            Spravovat projekty
          </motion.a>
        </div>

        <div className="relative space-y-4">
          {totalStats.CZK.totalHours > 0 && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="grid grid-cols-2 gap-4 sm:gap-6"
            >
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 shadow-md"
              >
                <p className="text-gray-600 text-xs sm:text-sm mb-2 font-medium">Celkový počet hodin (CZK)</p>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  {formatHours(totalStats.CZK.totalHours)}
                </p>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 shadow-md"
              >
                <p className="text-gray-600 text-xs sm:text-sm mb-2 font-medium">Celková částka (CZK)</p>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {formatPrice(totalStats.CZK.totalPrice, 'CZK')}
                </p>
              </motion.div>
            </motion.div>
          )}
          {totalStats.EUR.totalHours > 0 && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 gap-4 sm:gap-6"
            >
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 shadow-md"
              >
                <p className="text-gray-600 text-xs sm:text-sm mb-2 font-medium">Celkový počet hodin (EUR)</p>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  {formatHours(totalStats.EUR.totalHours)}
                </p>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 shadow-md"
              >
                <p className="text-gray-600 text-xs sm:text-sm mb-2 font-medium">Celková částka (EUR)</p>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {formatPrice(totalStats.EUR.totalPrice, 'EUR')}
                </p>
              </motion.div>
            </motion.div>
          )}
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 border border-purple-200"
      >
        <motion.div 
          className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full blur-3xl opacity-20"
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <h3 className="relative text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
          Denní statistiky
        </h3>

        <div className="relative space-y-4">
          {dailyStats.CZK.totalHours > 0 && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="grid grid-cols-2 gap-4 sm:gap-6"
            >
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-md"
              >
                <p className="text-gray-600 text-xs sm:text-sm mb-2 font-medium">Počet hodin dnes (CZK)</p>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  {formatHours(dailyStats.CZK.totalHours)}
                </p>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-md"
              >
                <p className="text-gray-600 text-xs sm:text-sm mb-2 font-medium">Částka dnes (CZK)</p>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {formatPrice(dailyStats.CZK.totalPrice, 'CZK')}
                </p>
              </motion.div>
            </motion.div>
          )}
          {dailyStats.EUR.totalHours > 0 && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 gap-4 sm:gap-6"
            >
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-md"
              >
                <p className="text-gray-600 text-xs sm:text-sm mb-2 font-medium">Počet hodin dnes (EUR)</p>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  {formatHours(dailyStats.EUR.totalHours)}
                </p>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-md"
              >
                <p className="text-gray-600 text-xs sm:text-sm mb-2 font-medium">Částka dnes (EUR)</p>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {formatPrice(dailyStats.EUR.totalPrice, 'EUR')}
                </p>
              </motion.div>
            </motion.div>
          )}
        </div>
      </motion.div>

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

