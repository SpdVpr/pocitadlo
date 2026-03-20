'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Project, TimeEntry } from '@/types';
import ProjectCard from './ProjectCard';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ProjectListProps {
  projects: Project[];
  selectedProjectId: string | null;
  monthlyEntries: TimeEntry[];
  onProjectSelect: (projectId: string) => void;
  onAddTime: (project: Project) => void;
  onSubtractTime: (project: Project) => void;
  onCreateInvoice: (project: Project) => void;
  onResetProject: (project: Project) => void;
  onReorder: (projects: Project[]) => void;
}

function SortableProjectCard({
  project,
  isSelected,
  currentMonthTime,
  currentMonthPrice,
  onSelect,
  onAddTime,
  onSubtractTime,
  onCreateInvoice,
  onResetProject,
}: {
  project: Project;
  isSelected: boolean;
  currentMonthTime: number;
  currentMonthPrice: number;
  onSelect: () => void;
  onAddTime: () => void;
  onSubtractTime: () => void;
  onCreateInvoice: () => void;
  onResetProject: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: project.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ProjectCard
        project={project}
        isSelected={isSelected}
        currentMonthTime={currentMonthTime}
        currentMonthPrice={currentMonthPrice}
        onSelect={onSelect}
        onAddTime={onAddTime}
        onSubtractTime={onSubtractTime}
        onCreateInvoice={onCreateInvoice}
        onResetProject={onResetProject}
      />
    </div>
  );
}

export default function ProjectList({
  projects,
  selectedProjectId,
  monthlyEntries,
  onProjectSelect,
  onAddTime,
  onSubtractTime,
  onCreateInvoice,
  onResetProject,
  onReorder,
}: ProjectListProps) {
  const [localProjects, setLocalProjects] = useState<Project[]>(projects);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Build per-project current month stats from time entries.
  // Záznamy vytvořené PŘED project.resetAt se ignorují (byly vynulovány),
  // ale stále existují v historii.
  const projectResetMap = new Map<string, number>();
  projects.forEach(p => {
    if (p.resetAt) {
      projectResetMap.set(p.id, p.resetAt.toMillis());
    }
  });

  const projectMonthlyStats = new Map<string, { time: number; price: number }>();
  monthlyEntries.forEach(entry => {
    const resetAtMs = projectResetMap.get(entry.projectId);
    if (resetAtMs && entry.createdAt.toMillis() <= resetAtMs) {
      // Tento záznam byl před vynulováním — nezapočítávat do dashboardu
      return;
    }
    const existing = projectMonthlyStats.get(entry.projectId) || { time: 0, price: 0 };
    existing.time += entry.duration;
    existing.price += entry.price;
    projectMonthlyStats.set(entry.projectId, existing);
  });

  useEffect(() => {
    if (!isDragging) {
      setLocalProjects(projects);
    }
  }, [projects, isDragging]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 250, // 250ms delay before drag starts
        tolerance: 5, // 5px movement tolerance
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setIsDragging(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localProjects.findIndex((p) => p.id === active.id);
      const newIndex = localProjects.findIndex((p) => p.id === over.id);

      const reorderedProjects = arrayMove(localProjects, oldIndex, newIndex);
      setLocalProjects(reorderedProjects);
      onReorder(reorderedProjects);
    }

    setActiveId(null);
    setTimeout(() => setIsDragging(false), 100);
  };

  const activeProject = activeId ? localProjects.find((p) => p.id === activeId) : null;

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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={localProjects.map((p) => p.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {localProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
            >
              <SortableProjectCard
                project={project}
                isSelected={selectedProjectId === project.id}
                currentMonthTime={projectMonthlyStats.get(project.id)?.time || 0}
                currentMonthPrice={projectMonthlyStats.get(project.id)?.price || 0}
                onSelect={() => onProjectSelect(project.id)}
                onAddTime={() => onAddTime(project)}
                onSubtractTime={() => onSubtractTime(project)}
                onCreateInvoice={() => onCreateInvoice(project)}
                onResetProject={() => onResetProject(project)}
              />
            </motion.div>
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeProject ? (
          <div style={{ cursor: 'grabbing' }}>
            <ProjectCard
              project={activeProject}
              isSelected={selectedProjectId === activeProject.id}
              currentMonthTime={projectMonthlyStats.get(activeProject.id)?.time || 0}
              currentMonthPrice={projectMonthlyStats.get(activeProject.id)?.price || 0}
              onSelect={() => {}}
              onAddTime={() => {}}
              onSubtractTime={() => {}}
              onCreateInvoice={() => {}}
              onResetProject={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
