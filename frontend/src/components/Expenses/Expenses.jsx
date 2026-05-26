import React, { useState, useEffect, useCallback } from 'react';
import { Pencil, Trash2, Plus, Search, Filter, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { expenseAPI } from '../../services/api';
import { Card, Button, CategoryBadge, EmptyState, Spinner } from '../UI';
import ExpenseModal from './ExpenseModal';
import './Expenses.css';

const CATEGORIES = ['All', 'Food', 'Utility', 'Subscriptions', 'Others'];
const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page: 1, limit: 100 };
      if (category !== 'All') params.category = category;
      const res = await expenseAPI.getAll(params);
      setExpenses(res.expenses || []);
      setPagination(res.pagination || {});
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    setDeleting(id);
    try {
      await expenseAPI.delete(id);
      toast.success('Expense deleted');
      fetchExpenses();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (expense) => {
    setEditExpense(expense);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditExpense(null);
    setModalOpen(true);
  };

  const handleModalClose = (refresh) => {
    setModalOpen(false);
    setEditExpense(null);
    if (refresh) fetchExpenses();
  };

  const filtered = expenses.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.name?.toLowerCase().includes(q) ||
      e.vendor?.toLowerCase().includes(q) ||
      e.category?.toLowerCase().includes(q)
    );
  });

  const totalFiltered = filtered.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="expenses-page">
      {/* Controls */}
      <div className="expenses-controls">
        <div className="search-wrap">
          <Search size={15} className="search-icon" />
          <input
            className="search-input"
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`filter-tab ${category === c ? 'active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <Button variant="primary" icon={<Plus size={15} />} onClick={handleCreate}>
          Add Expense
        </Button>
      </div>

      {/* Summary */}
      {!loading && filtered.length > 0 && (
        <div className="expenses-summary">
          <span className="summary-count">{filtered.length} transactions</span>
          <span className="summary-divider" />
          <span className="summary-total">Total: {fmt(totalFiltered)}</span>
        </div>
      )}

      {/* Table */}
      <Card className="expenses-table-card">
        {loading ? (
          <div className="table-loading">
            <Spinner size={28} />
            <span>Loading expenses...</span>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No expenses found"
            description={search ? 'Try a different search term' : 'Add your first expense to get started'}
            action={
              <Button variant="primary" icon={<Plus size={14} />} onClick={handleCreate}>
                Add Expense
              </Button>
            }
          />
        ) : (
          <div className="table-wrap">
            <table className="expenses-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Vendor</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th className="text-right">Amount</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((exp) => (
                  <tr key={exp._id} className="expense-row">
                    <td>
                      <div className="expense-name">{exp.name}</div>
                      {exp.aiExtracted && <span className="ai-tag">AI Extracted</span>}
                    </td>
                    <td className="text-secondary">{exp.vendor || '—'}</td>
                    <td><CategoryBadge category={exp.category} /></td>
                    <td className="text-secondary">{format(new Date(exp.date), 'MMM d, yyyy')}</td>
                    <td className="amount-cell">{fmt(exp.amount)}</td>
                    <td>
                      <div className="action-btns">
                        <button className="action-btn edit" onClick={() => handleEdit(exp)} title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDelete(exp._id)}
                          disabled={deleting === exp._id}
                          title="Delete"
                        >
                          {deleting === exp._id ? <Spinner size={14} /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {modalOpen && (
        <ExpenseModal expense={editExpense} onClose={handleModalClose} />
      )}
    </div>
  );
};

export default Expenses;
