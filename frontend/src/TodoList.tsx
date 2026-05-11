import React, { useEffect, useState } from 'react';
import './TodoList.css';
import { API_URL } from './config';

interface Todo {
  _id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate: string | null;
  createdAt: string;
}

const CARD_COLORS = ['#dbeafe', '#e9d5ff', '#fef3c7', '#fbcfe8', '#bbf7d0'];

export const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [descValue, setDescValue] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'active' | 'completed'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);

  const resetForm = () => {
    setInputValue('');
    setDescValue('');
    setPriority('medium');
    setDueDate('');
    setEditingId(null);
  };

  const fetchTodos = async () => {
    try {
      const response = await fetch(`${API_URL}/api/todos`);
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleSaveTodo = async () => {
    if (!inputValue.trim()) return;

    try {
      if (editingId) {
        const response = await fetch(`${API_URL}/api/todos/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: inputValue,
            description: descValue,
            priority,
            dueDate: dueDate || null
          })
        });
        const updatedTodo = await response.json();
        setTodos((prev) => prev.map((todo) => (todo._id === editingId ? updatedTodo : todo)));
      } else {
        const response = await fetch(`${API_URL}/api/todos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: inputValue,
            description: descValue,
            priority,
            dueDate: dueDate || null
          })
        });
        const newTodo = await response.json();
        setTodos((prev) => [newTodo, ...prev]);
      }

      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving todo:', error);
    }
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    try {
      const response = await fetch(`${API_URL}/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed })
      });
      const updatedTodo = await response.json();
      setTodos((prev) => prev.map((todo) => (todo._id === id ? updatedTodo : todo)));
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const deleteTodo = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await fetch(`${API_URL}/api/todos/${id}`, { method: 'DELETE' });
      setTodos((prev) => prev.filter((todo) => todo._id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const editTodo = (todo: Todo) => {
    setInputValue(todo.title);
    setDescValue(todo.description);
    setPriority(todo.priority);
    setDueDate(todo.dueDate ? todo.dueDate.split('T')[0] : '');
    setEditingId(todo._id);
    setShowForm(true);
  };

  const filteredTodos = todos
    .filter((todo) => (filter === 'active' ? !todo.completed : todo.completed))
    .filter((todo) => {
      const query = searchTerm.toLowerCase();
      return (
        todo.title.toLowerCase().includes(query) ||
        todo.description.toLowerCase().includes(query)
      );
    });

  const getCardColor = (index: number) => CARD_COLORS[index % CARD_COLORS.length];

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'No date';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">*</span>
            <span className="logo-text">HealDocs</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-item">
              <span className="nav-icon">O</span>
              <span className="nav-label">Overview</span>
            </div>
          </div>

          <div className="nav-section">
            <div className="nav-item active">
              <span className="nav-icon">T</span>
              <span className="nav-label">Todo List</span>
            </div>
            {todos.slice(0, 4).map((todo) => (
              <div key={`menu-${todo._id}`} className="nav-subitem">
                <span>{todo.title}</span>
              </div>
            ))}
          </div>
        </nav>
      </aside>

      <main className="main-content">
        <div className="top-header">
          <div className="header-left">
            <h1>Todo List</h1>
            <div className="date-selector">
              <span className="date-text">
                {new Date().toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
              <span className="dropdown-arrow">v</span>
            </div>
          </div>

          <div className="header-right">
            <div className="search-box">
              <span className="search-icon">S</span>
              <input
                type="text"
                placeholder="Search List"
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="add-list-btn" onClick={() => setShowForm((prev) => !prev)}>
              + Add New List
            </button>
          </div>
        </div>

        <div className="tabs-container">
          <button
            className={`tab ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active Task
          </button>
          <button
            className={`tab ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>

        {showForm && (
          <div className="add-form">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Task title"
              className="form-input"
            />
            <textarea
              value={descValue}
              onChange={(e) => setDescValue(e.target.value)}
              placeholder="Description"
              className="form-textarea"
              rows={2}
            />
            <div className="form-row">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="form-select"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="form-date"
              />
              <button className="form-submit" onClick={handleSaveTodo}>
                {editingId ? 'Update' : 'Add'}
              </button>
              <button
                className="form-cancel"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="cards-grid">
          {filteredTodos.length === 0 ? (
            <div className="empty-state">
              <p>No {filter} tasks to show</p>
            </div>
          ) : (
            filteredTodos.map((todo, index) => (
              <div
                key={todo._id}
                className="todo-card"
                style={{ backgroundColor: getCardColor(index) }}
              >
                <div className="card-header">
                  <h3 className="card-title">{todo.title}</h3>
                  <button className="card-menu" type="button">
                    ...
                  </button>
                </div>

                <p className="card-description">{todo.description || 'No description'}</p>

                <div className="card-footer">
                  <span className="card-time">{formatDate(todo.dueDate)}</span>
                  <div className="card-actions">
                    <button
                      className="card-edit"
                      onClick={() => editTodo(todo)}
                      title="Edit"
                      type="button"
                    >
                      E
                    </button>
                    <button
                      className="card-delete"
                      onClick={() => deleteTodo(todo._id)}
                      title="Delete"
                      type="button"
                    >
                      X
                    </button>
                    <button
                      className="card-complete"
                      onClick={() => toggleTodo(todo._id, todo.completed)}
                      title={todo.completed ? 'Mark Active' : 'Mark Complete'}
                      type="button"
                    >
                      {todo.completed ? 'U' : 'C'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default TodoList;
