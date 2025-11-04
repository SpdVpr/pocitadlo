'use client';

import { Project } from '@/types';
import ProjectCard from './ProjectCard';

interface ProjectListProps {
  projects: Project[];
  selectedProjectId: string | null;
  onProjectSelect: (projectId: string) => void;
  onAddTime: (project: Project) => void;
  onSubtractTime: (project: Project) => void;
}

export default function ProjectList({
  projects,
  selectedProjectId,
  onProjectSelect,
  onAddTime,
  onSubtractTime,
}: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="bg-gray-100 rounded-2xl shadow-lg p-12 text-center">
        <div className="text-6xl mb-4">📁</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Žádné projekty</h3>
        <p className="text-gray-500 mb-6">
          Začněte přidáním prvního projektu
        </p>
        <a
          href="/projects"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Přidat projekt
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          isSelected={selectedProjectId === project.id}
          onSelect={() => onProjectSelect(project.id)}
          onAddTime={() => onAddTime(project)}
          onSubtractTime={() => onSubtractTime(project)}
        />
      ))}
    </div>
  );
}
