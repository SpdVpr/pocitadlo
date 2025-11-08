'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/types';
import { subscribeToProjects, createProject, updateProject, deleteProject, getProjectInvoiceSettings, updateProjectInvoiceSettings } from '@/lib/firestore';
import { formatHours, formatPrice } from '@/lib/utils';
import { useAuth } from '@/lib/authContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import ProjectInvoiceSettingsDialog from '@/components/ProjectInvoiceSettingsDialog';

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#06B6D4', '#84CC16'
];

function ProjectsPageContent() {
  const { user, encryptionKey } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [invoiceSettingsProject, setInvoiceSettingsProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    hourlyRate: '',
    color: COLORS[0],
    clientName: '',
    street: '',
    city: '',
    zipCode: '',
    ico: '',
    dic: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !encryptionKey) return;

    const unsubscribe = subscribeToProjects(user.uid, setProjects, encryptionKey, false);
    return () => unsubscribe();
  }, [user, encryptionKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.hourlyRate || !user || !encryptionKey) {
      alert('Vyplňte všechna pole');
      return;
    }

    setLoading(true);
    try {
      const rate = parseFloat(formData.hourlyRate);

      let projectId: string;
      if (editingProject) {
        await updateProject(editingProject.id, {
          name: formData.name,
          hourlyRate: rate,
          color: formData.color,
        }, encryptionKey);
        projectId = editingProject.id;
      } else {
        projectId = await createProject(user.uid, formData.name, rate, formData.color, encryptionKey);
      }

      if (formData.clientName) {
        await updateProjectInvoiceSettings(projectId, {
          clientName: formData.clientName,
          street: formData.street,
          city: formData.city,
          zipCode: formData.zipCode,
          ico: formData.ico || undefined,
          dic: formData.dic || undefined,
        });
      }

      resetForm();
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Chyba při ukládání projektu');
    }
    setLoading(false);
  };

  const handleEdit = async (project: Project) => {
    setEditingProject(project);
    
    const invoiceSettings = await getProjectInvoiceSettings(project.id);
    
    setFormData({
      name: project.name,
      hourlyRate: project.hourlyRate.toString(),
      color: project.color,
      clientName: invoiceSettings?.clientName || '',
      street: invoiceSettings?.street || '',
      city: invoiceSettings?.city || '',
      zipCode: invoiceSettings?.zipCode || '',
      ico: invoiceSettings?.ico || '',
      dic: invoiceSettings?.dic || '',
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
      clientName: '',
      street: '',
      city: '',
      zipCode: '',
      ico: '',
      dic: '',
    });
  };

  const activeProjects = projects.filter(p => p.isActive);
  const archivedProjects = projects.filter(p => !p.isActive);

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Správa projektů</h1>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full sm:w-auto px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm sm:text-base"
          >
            + Nový projekt
          </button>
        )}
      </div>

      {isCreating && (
        <div className="bg-gray-100 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">
            {editingProject ? 'Upravit projekt' : 'Nový projekt'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Název projektu
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="např. Webová aplikace"
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>

            <div className="mb-4">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Hodinová sazba (Kč)
              </label>
              <input
                type="number"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                placeholder="např. 500"
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>

            <div className="mb-6">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Barva
              </label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all ${
                      formData.color === color ? 'ring-4 ring-gray-300 scale-110' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="mb-6 pt-4 border-t border-gray-300">
              <h3 className="text-base sm:text-lg font-bold text-gray-700 mb-3 sm:mb-4">Fakturační údaje klienta (nepovinné)</h3>

              <div className="mb-4">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Jméno / Název společnosti
                </label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="např. ACME s.r.o."
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Ulice a číslo
                  </label>
                  <input
                    type="text"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    placeholder="např. Václavské nám. 1"
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Město
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="např. Praha"
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    PSČ
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    placeholder="např. 110 00"
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    IČO
                  </label>
                  <input
                    type="text"
                    value={formData.ico}
                    onChange={(e) => setFormData({ ...formData, ico: e.target.value })}
                    placeholder="např. 12345678"
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    DIČ
                  </label>
                  <input
                    type="text"
                    value={formData.dic}
                    onChange={(e) => setFormData({ ...formData, dic: e.target.value })}
                    placeholder="např. CZ12345678"
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-sm sm:text-base"
              >
                Zrušit
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
              >
                {loading ? 'Ukládám...' : editingProject ? 'Uložit' : 'Vytvořit'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-6 sm:space-y-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Aktivní projekty</h2>
          {activeProjects.length === 0 ? (
            <div className="bg-gray-100 rounded-xl p-6 sm:p-8 text-center text-gray-500 text-sm sm:text-base">
              Žádné aktivní projekty
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {activeProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-gray-100 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
                      <div
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0"
                        style={{ backgroundColor: project.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-xl font-bold text-gray-800 truncate">{project.name}</h3>
                        <p className="text-sm sm:text-base text-gray-500">{project.hourlyRate} Kč/hod</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg sm:text-2xl font-bold text-gray-800">
                          {formatHours(project.totalTimeCurrentMonth)}
                        </p>
                        <p className="text-sm sm:text-lg font-semibold text-green-600">
                          {formatPrice(project.totalPriceCurrentMonth)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => setInvoiceSettingsProject(project)}
                        className="flex-1 px-3 sm:px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition-colors text-xs sm:text-sm"
                        title="Fakturační údaje klienta"
                      >
                        📄 Fakturace
                      </button>
                      <button
                        onClick={() => handleEdit(project)}
                        className="flex-1 px-3 sm:px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-semibold hover:bg-purple-200 transition-colors text-xs sm:text-sm"
                      >
                        Upravit
                      </button>
                      <button
                        onClick={() => handleArchive(project)}
                        className="flex-1 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-xs sm:text-sm"
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
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Archivované projekty</h2>
            <div className="grid gap-3 sm:gap-4">
              {archivedProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-gray-50 rounded-xl p-4 sm:p-6 opacity-75"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 w-full sm:w-auto">
                      <div
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0"
                        style={{ backgroundColor: project.color }}
                      />
                      <div className="min-w-0">
                        <h3 className="text-base sm:text-xl font-bold text-gray-800 truncate">{project.name}</h3>
                        <p className="text-sm sm:text-base text-gray-500">{project.hourlyRate} Kč/hod</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => updateProject(project.id, { isActive: true })}
                        className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold hover:bg-green-200 transition-colors text-xs sm:text-sm"
                      >
                        Obnovit
                      </button>
                      <button
                        onClick={() => handleDelete(project)}
                        className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors text-xs sm:text-sm"
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

      {invoiceSettingsProject && (
        <ProjectInvoiceSettingsDialog
          project={invoiceSettingsProject}
          onClose={() => setInvoiceSettingsProject(null)}
        />
      )}
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <ProtectedRoute>
      <ProjectsPageContent />
    </ProtectedRoute>
  );
}
