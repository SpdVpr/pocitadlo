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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">TODO List</h1>
        <p className="text-gray-600">Spravujte své úkoly</p>
      </div>

      {/* Add new todo form */}
      <form onSubmit={handleAddTodo} className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            placeholder="Přidat nový úkol..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Přidat
          </button>
        </div>
      </form>

      {/* Active todos */}
      {activeTodos.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Aktivní úkoly ({activeTodos.length})
          </h2>
          <div className="space-y-2">
            {activeTodos.map((todo) => (
              <div
                key={todo.id}
                className="bg-white rounded-lg shadow p-4 flex items-center gap-3"
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleComplete(todo)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
                
                {editingId === todo.id ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEdit(todo.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      Uložit
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors"
                    >
                      Zrušit
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="flex-1 text-gray-800">{todo.text}</span>
                    <button
                      onClick={() => handleStartEdit(todo)}
                      className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      Upravit
                    </button>
                    <button
                      onClick={() => handleDeleteTodo(todo.id)}
                      className="px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      Smazat
                    </button>
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
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Dokončené úkoly ({completedTodos.length})
          </h2>
          <div className="space-y-2">
            {completedTodos.map((todo) => (
              <div
                key={todo.id}
                className="bg-gray-50 rounded-lg shadow p-4 flex items-center gap-3 opacity-75"
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleComplete(todo)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
                <span className="flex-1 text-gray-600 line-through">{todo.text}</span>
                <button
                  onClick={() => handleDeleteTodo(todo.id)}
                  className="px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
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