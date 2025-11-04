'use client';

import { useState, useEffect } from 'react';
import { Project, TimeEntry } from '@/types';
import { subscribeToProjects, subscribeToTimeEntries, deleteTimeEntry, resetMonthlyStats } from '@/lib/firestore';
import { formatHours, formatPrice, getCurrentMonthYear, getMonthName } from '@/lib/utils';

export default function HistoryPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [selectedYear, setSelectedYear] = useState<number>(0);

  const { month: currentMonth, year: currentYear } = getCurrentMonthYear();

  useEffect(() => {
    setSelectedMonth(currentMonth);
    setSelectedYear(currentYear);
  }, [currentMonth, currentYear]);

  useEffect(() => {
    const unsubscribe = subscribeToProjects((newProjects) => {
      setProjects(newProjects);
    }, false);

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedMonth === 0 || selectedYear === 0) return;

    const unsubscribe = subscribeToTimeEntries(
      (newEntries) => {
        setEntries(newEntries);
      },
      selectedProjectId === 'all' ? undefined : selectedProjectId,
      selectedMonth,
      selectedYear
    );

    return () => unsubscribe();
  }, [selectedProjectId, selectedMonth, selectedYear]);

  const handleDelete = async (entry: TimeEntry) => {
    if (confirm('Opravdu chcete smazat tento záznam?')) {
      try {
        await deleteTimeEntry(entry.id, entry.projectId, entry.duration, entry.price);
      } catch (error) {
        console.error('Error deleting entry:', error);
        alert('Chyba při mazání záznamu');
      }
    }
  };

  const handleResetMonth = async () => {
    if (confirm(`Opravdu chcete vynulovat statistiky za ${getMonthName(selectedMonth)} ${selectedYear}? Toto nelze vrátit zpět!`)) {
      try {
        await resetMonthlyStats();
        alert('Měsíční statistiky byly vynulovány');
      } catch (error) {
        console.error('Error resetting stats:', error);
        alert('Chyba při resetování statistik');
      }
    }
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Neznámý projekt';
  };

  const getProjectColor = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.color : '#gray';
  };

  const filteredEntries = entries;

  const totalStats = filteredEntries.reduce(
    (acc, entry) => ({
      totalTime: acc.totalTime + entry.duration,
      totalPrice: acc.totalPrice + entry.price,
    }),
    { totalTime: 0, totalPrice: 0 }
  );

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Historie záznamů</h1>
        <button
          onClick={handleResetMonth}
          className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
        >
          Vynulovat měsíc
        </button>
      </div>

      <div className="bg-gray-100 rounded-2xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Projekt
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Všechny projekty</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Měsíc
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {months.map((month) => (
                <option key={month} value={month}>
                  {getMonthName(month)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Rok
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-200">
          <div>
            <p className="text-gray-500 text-sm mb-1">Celkový čas</p>
            <p className="text-3xl font-bold text-gray-800">
              {formatHours(totalStats.totalTime)}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1">Celková částka</p>
            <p className="text-3xl font-bold text-green-600">
              {formatPrice(totalStats.totalPrice)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-100 rounded-2xl shadow-lg overflow-hidden">
        {filteredEntries.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-xl">Žádné záznamy</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Datum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Projekt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Typ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Trvání
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Částka
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Poznámka
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Akce
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {entry.createdAt.toDate().toLocaleDateString('cs-CZ')}
                      <br />
                      <span className="text-gray-500">
                        {entry.createdAt.toDate().toLocaleTimeString('cs-CZ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: getProjectColor(entry.projectId) }}
                        />
                        <span className="text-sm font-semibold text-gray-800">
                          {getProjectName(entry.projectId)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          entry.type === 'timer'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {entry.type === 'timer' ? '⏱️ Časovač' : '✏️ Manuální'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                      {formatHours(Math.abs(entry.duration))}
                      {entry.duration < 0 && <span className="text-red-600"> (odebrán)</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      {formatPrice(entry.price)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {entry.note || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleDelete(entry)}
                        className="text-red-600 hover:text-red-800 font-semibold"
                      >
                        Smazat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
