'use client';

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
    <div
      onClick={onSelect}
      className={`bg-gray-100 rounded-xl p-4 sm:p-6 cursor-pointer transition-all border-2 ${
        isSelected
          ? 'border-blue-500 shadow-lg sm:scale-105'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div
            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex-shrink-0"
            style={{ backgroundColor: project.color }}
          />
          <div className="min-w-0">
            <h3 className="font-bold text-base sm:text-lg text-gray-800 truncate">{project.name}</h3>
            <p className="text-xs sm:text-sm text-gray-500">{project.hourlyRate} {(project.currency || 'CZK') === 'EUR' ? '€' : 'Kč'}/hod</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCreateInvoice();
            }}
            className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 hover:bg-green-200 rounded-full flex items-center justify-center transition-colors"
            title="Vytvořit fakturu"
          >
            <span className="text-green-700 text-xs sm:text-sm">📄</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Opravdu chcete vynulovat projekt? Tato akce je nevratná.')) {
                onResetProject();
              }
            }}
            className="w-7 h-7 sm:w-8 sm:h-8 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors"
            title="Vynulovat projekt"
          >
            <span className="text-red-700 text-xs sm:text-sm">↺</span>
          </button>
          {isSelected && (
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs sm:text-sm">✓</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div>
          <p className="text-xl sm:text-2xl font-bold text-gray-800">
            {formatHours(project.totalTimeCurrentMonth)}
          </p>
          <p className="text-xs sm:text-sm text-gray-500">tento měsíc</p>
        </div>
        <div className="text-right">
          <p className="text-xl sm:text-2xl font-bold text-green-600">
            {formatPrice(project.totalPriceCurrentMonth, project.currency || 'CZK')}
          </p>
          <p className="text-xs sm:text-sm text-gray-500">celkem</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 pt-2 sm:pt-3 border-t border-gray-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddTime();
          }}
          className="flex-1 px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1 text-sm sm:text-base"
        >
          <span className="text-base sm:text-lg">+</span>
          <span>Přidat čas</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSubtractTime();
          }}
          disabled={project.totalTimeCurrentMonth === 0}
          className="flex-1 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          <span className="text-base sm:text-lg">−</span>
          <span>Odebrat čas</span>
        </button>
      </div>
    </div>
  );
}
