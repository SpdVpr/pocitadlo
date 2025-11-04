'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/types';
import { subscribeToProjects, createProject, updateProject, deleteProject } from '@/lib/firestore';
import { formatHours, formatPrice } from '@/lib/utils';

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#06B6D4', '#84CC16'
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    hourlyRate: '',
    color: COLORS[0],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToProjects((newProjects) => {
      setProjects(newProjects);
    }, false);

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.hourlyRate) {
      alert('Vyplňte všechna pole');
      return;
    }

    setLoading(true);
    try {
      const rate = parseFloat(formData.hourlyRate);
      
      if (editingProject) {
        await updateProject(editingProject.id, {
          name: formData.name,
          hourlyRate: rate,
          color: formData.color,
        });
      } else {
        await createProject(formData.name, rate, formData.color);
      }

      resetForm();
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Chyba při ukládání projektu');
    }
    setLoading(false);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      hourlyRate: project.hourlyRate.toString(),
      color: project.color,
    });
    setIsCreating(true);
  };

  const handleArchive = async (project: Project) => {
    if (confirm(`Opravdu chcete archivovat projekt "${project.name}"?`)) {
      await updateProject(project.id, { isActive: false });
    }
  };

  const handleDelete = async (project: Project) => {
    if (confirm(`POZOR: Opravdu chcete smazat projekt "${project.name}"? Toto nelze vrátit zpět!`)) {
      try {
        await deleteProject(project.id);
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Chyba při mazání projektu');
      }
    }
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingProject(null);
    setFormData({
      name: '',
      hourlyRate: '',
      color: COLORS[0],
    });
  };

  const activeProjects = projects.filter(p => p.isActive);
  const archivedProjects = projects.filter(p => !p.isActive);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Správa projektů</h1>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            + Nový projekt
          </button>
        )}
      </div>

      {isCreating && (
        <div className="bg-gray-100 rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {editingProject ? 'Upravit projekt' : 'Nový projekt'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Název projektu
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="např. Webová aplikace"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Hodinová sazba (Kč)
              </label>
              <input
                type="number"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                placeholder="např. 500"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Barva
              </label>
              <div className="flex gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-10 h-10 rounded-full transition-all ${
                      formData.color === color ? 'ring-4 ring-gray-300 scale-110' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Zrušit
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Ukládám...' : editingProject ? 'Uložit' : 'Vytvořit'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Aktivní projekty</h2>
          {activeProjects.length === 0 ? (
            <div className="bg-gray-100 rounded-xl p-8 text-center text-gray-500">
              Žádné aktivní projekty
            </div>
          ) : (
            <div className="grid gap-4">
              {activeProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className="w-12 h-12 rounded-full flex-shrink-0"
                        style={{ backgroundColor: project.color }}
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800">{project.name}</h3>
                        <p className="text-gray-500">{project.hourlyRate} Kč/hod</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-800">
                          {formatHours(project.totalTimeCurrentMonth)}
                        </p>
                        <p className="text-lg font-semibold text-green-600">
                          {formatPrice(project.totalPriceCurrentMonth)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(project)}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition-colors"
                      >
                        Upravit
                      </button>
                      <button
                        onClick={() => handleArchive(project)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                      >
                        Archivovat
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {archivedProjects.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Archivované projekty</h2>
            <div className="grid gap-4">
              {archivedProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-gray-50 rounded-xl p-6 opacity-75"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className="w-12 h-12 rounded-full flex-shrink-0"
                        style={{ backgroundColor: project.color }}
                      />
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{project.name}</h3>
                        <p className="text-gray-500">{project.hourlyRate} Kč/hod</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateProject(project.id, { isActive: true })}
                        className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold hover:bg-green-200 transition-colors"
                      >
                        Obnovit
                      </button>
                      <button
                        onClick={() => handleDelete(project)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors"
                      >
                        Smazat
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
