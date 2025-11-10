'use client';

import { motion } from 'framer-motion';
import { Project } from '@/types';
import { formatHours, formatPrice } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  isSelected: boolean;
  onSelect: () => void;
  onAddTime: () => void;
  onSubtractTime: () => void;
  onCreateInvoice: () => void;
  onResetProject: () => void;
}

export default function ProjectCard({
  project,
  isSelected,
  onSelect,
  onAddTime,
  onSubtractTime,
  onCreateInvoice,
  onResetProject,
}: ProjectCardProps) {
  return (
    <motion.div
      onClick={onSelect}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`relative overflow-hidden bg-white rounded-2xl p-4 sm:p-6 cursor-pointer border-2 shadow-md ${
        isSelected
          ? 'border-blue-500 shadow-xl shadow-blue-200'
          : 'border-gray-200 hover:border-blue-300 hover:shadow-lg'
      }`}
    >

      <div className="relative flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <motion.div
            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex-shrink-0 shadow-lg"
            style={{ backgroundColor: project.color }}
            whileHover={{ scale: 1.2, rotate: 180 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
          <div className="min-w-0">
            <h3 className="font-bold text-base sm:text-lg text-gray-800 truncate">{project.name}</h3>
            <p className="text-xs sm:text-sm text-gray-500">{project.hourlyRate} {(project.currency || 'CZK') === 'EUR' ? '€' : 'Kč'}/hod</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onCreateInvoice();
            }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 hover:bg-green-200 rounded-full flex items-center justify-center shadow-sm"
            title="Vytvořit fakturu"
          >
            <span className="text-green-700 text-xs sm:text-sm">📄</span>
          </motion.button>
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Opravdu chcete vynulovat projekt? Tato akce je nevratná.')) {
                onResetProject();
              }
            }}
            whileHover={{ scale: 1.1, rotate: -180 }}
            whileTap={{ scale: 0.9 }}
            className="w-7 h-7 sm:w-8 sm:h-8 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center shadow-sm"
            title="Vynulovat projekt"
          >
            <span className="text-red-700 text-xs sm:text-sm">↺</span>
          </motion.button>
          {isSelected && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-md"
            >
              <span className="text-white text-xs sm:text-sm">✓</span>
            </motion.div>
          )}
        </div>
      </div>

      <div className="relative flex items-center justify-between mb-2 sm:mb-3">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gray-50 rounded-xl px-3 py-2"
        >
          <p className="text-xl sm:text-2xl font-bold text-gray-800">
            {formatHours(project.totalTimeCurrentMonth)}
          </p>
          <p className="text-xs sm:text-sm text-gray-500">tento měsíc</p>
        </motion.div>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="text-right bg-gray-50 rounded-xl px-3 py-2"
        >
          <p className="text-xl sm:text-2xl font-bold text-green-600">
            {formatPrice(project.totalPriceCurrentMonth, project.currency || 'CZK')}
          </p>
          <p className="text-xs sm:text-sm text-gray-500">celkem</p>
        </motion.div>
      </div>

      <div className="relative flex flex-col sm:flex-row gap-2 pt-2 sm:pt-3 border-t border-gray-200">
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onAddTime();
          }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-1 text-sm sm:text-base transition-colors"
        >
          <span className="text-base sm:text-lg">+</span>
          <span>Přidat čas</span>
        </motion.button>
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onSubtractTime();
          }}
          disabled={project.totalTimeCurrentMonth === 0}
          whileHover={project.totalTimeCurrentMonth > 0 ? { scale: 1.05, y: -2 } : {}}
          whileTap={project.totalTimeCurrentMonth > 0 ? { scale: 0.95 } : {}}
          className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base transition-colors"
        >
          <span className="text-base sm:text-lg">−</span>
          <span>Odebrat čas</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
