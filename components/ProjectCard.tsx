'use client';

import { Project } from '@/types';
import { formatHours, formatPrice } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  isSelected: boolean;
  onSelect: () => void;
  onAddTime: () => void;
  onSubtractTime: () => void;
}

export default function ProjectCard({
  project,
  isSelected,
  onSelect,
  onAddTime,
  onSubtractTime,
}: ProjectCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`bg-gray-100 rounded-xl p-6 cursor-pointer transition-all border-2 ${
        isSelected
          ? 'border-blue-500 shadow-lg scale-105'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div
            className="w-6 h-6 rounded-full flex-shrink-0"
            style={{ backgroundColor: project.color }}
          />
          <div>
            <h3 className="font-bold text-lg text-gray-800">{project.name}</h3>
            <p className="text-sm text-gray-500">{project.hourlyRate} Kč/hod</p>
          </div>
        </div>
        
        {isSelected && (
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm">✓</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-2xl font-bold text-gray-800">
            {formatHours(project.totalTimeCurrentMonth)}
          </p>
          <p className="text-sm text-gray-500">tento měsíc</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-green-600">
            {formatPrice(project.totalPriceCurrentMonth)}
          </p>
          <p className="text-sm text-gray-500">celkem</p>
        </div>
      </div>

      <div className="flex gap-2 pt-3 border-t border-gray-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddTime();
          }}
          className="flex-1 px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1"
        >
          <span className="text-lg">+</span>
          <span>Přidat čas</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSubtractTime();
          }}
          disabled={project.totalTimeCurrentMonth === 0}
          className="flex-1 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-lg">−</span>
          <span>Odebrat čas</span>
        </button>
      </div>
    </div>
  );
}
