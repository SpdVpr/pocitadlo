'use client';

import { useState, useEffect } from 'react';
import { TodoItem } from '@/types';
import { subscribeToTodos, createTodo, updateTodo, deleteTodo } from '@/lib/firestore';
import { useAuth } from '@/lib/authContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function TodoPageContent() {
  const { user } = useAuth();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToTodos(user.uid, (newTodos) => {
      setTodos(newTodos);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodoText.trim() && user) {
      await createTodo(user.uid, newTodoText.trim());
      setNewTodoText('');
    }
  };

  const handleToggleComplete = async (todo: TodoItem) => {
    await updateTodo(todo.id, { completed: !todo.completed });
  };

  const handleStartEdit = (todo: TodoItem) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const handleSaveEdit = async (id: string) => {
    if (editText.trim()) {
      await updateTodo(id, { text: editText.trim() });
      setEditingId(null);
      setEditText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleDeleteTodo = async (id: string) => {
    if (confirm('Opravdu chcete smazat tento úkol?')) {
      await deleteTodo(id);
    }
  };

  const activeTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">TODO List</h1>
        <p className="text-sm sm:text-base text-gray-600">Spravujte své úkoly</p>
      </div>

      {/* Add new todo form */}
      <form onSubmit={handleAddTodo} className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            placeholder="Přidat nový úkol..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm sm:text-base whitespace-nowrap"
          >
            Přidat
          </button>
        </div>
      </form>

      {/* Active todos */}
      {activeTodos.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">
            Aktivní úkoly ({activeTodos.length})
          </h2>
          <div className="space-y-2">
            {activeTodos.map((todo) => (
              <div
                key={todo.id}
                className="bg-white rounded-lg shadow p-3 sm:p-4 flex items-start sm:items-center gap-2 sm:gap-3"
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleComplete(todo)}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500 cursor-pointer flex-shrink-0 mt-0.5 sm:mt-0"
                />

                {editingId === todo.id ? (
                  <div className="flex-1 flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="flex-1 px-3 py-1.5 sm:py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(todo.id)}
                        className="flex-1 sm:flex-none px-3 py-1.5 sm:py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm sm:text-base"
                      >
                        Uložit
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex-1 sm:flex-none px-3 py-1.5 sm:py-1 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors text-sm sm:text-base"
                      >
                        Zrušit
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="flex-1 text-sm sm:text-base text-gray-800 break-words">{todo.text}</span>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleStartEdit(todo)}
                        className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-purple-600 hover:bg-purple-50 rounded transition-colors whitespace-nowrap"
                      >
                        Upravit
                      </button>
                      <button
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-red-600 hover:bg-red-50 rounded transition-colors whitespace-nowrap"
                      >
                        Smazat
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed todos */}
      {completedTodos.length > 0 && (
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">
            Dokončené úkoly ({completedTodos.length})
          </h2>
          <div className="space-y-2">
            {completedTodos.map((todo) => (
              <div
                key={todo.id}
                className="bg-gray-50 rounded-lg shadow p-3 sm:p-4 flex items-start sm:items-center gap-2 sm:gap-3 opacity-75"
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleComplete(todo)}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500 cursor-pointer flex-shrink-0 mt-0.5 sm:mt-0"
                />
                <span className="flex-1 text-sm sm:text-base text-gray-600 line-through break-words">{todo.text}</span>
                <button
                  onClick={() => handleDeleteTodo(todo.id)}
                  className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-red-600 hover:bg-red-50 rounded transition-colors whitespace-nowrap flex-shrink-0"
                >
                  Smazat
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {todos.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">Zatím nemáte žádné úkoly.</p>
          <p>Začněte přidáním nového úkolu výše.</p>
        </div>
      )}
    </div>
  );
}

export default function TodoPage() {
  return (
    <ProtectedRoute>
      <TodoPageContent />
    </ProtectedRoute>
  );
}