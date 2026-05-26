import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { expenseAPI } from '../../services/api';
import { Button, Input, Select, Textarea } from '../UI';
import './Expenses.css';

const CATEGORIES = ['Food', 'Utility', 'Subscriptions', 'Others'];

const ExpenseModal = ({ expense, onClose }) => {
  const isEdit = !!expense;
  const [form, setForm] = useState({
    name: '',
    vendor: '',
    amount: '',
    category: 'Others',
    date: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
    currency: 'USD',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (expense) {
      setForm({
        name: expense.name || '',
        vendor: expense.vendor || '',
        amount: expense.amount || '',
        category: expense.category || 'Others',
        date: format(new Date(expense.date), 'yyyy-MM-dd'),
        notes: expense.notes || '',
        currency: expense.currency || 'USD',
      });
    }
  }, [expense]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.amount || isNaN(form.amount) || parseFloat(form.amount) < 0)
      errs.amount = 'Valid amount is required';
    if (!form.category) errs.category = 'Category is required';
    if (!form.date) errs.date = 'Date is required';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSaving(true);
    try {
      const payload = { ...form, amount: parseFloat(form.amount) };
      if (isEdit) {
        await expenseAPI.update(expense._id, payload);
        toast.success('Expense updated');
      } else {
        await expenseAPI.create(payload);
        toast.success('Expense created');
      }
      onClose(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose(false)}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Expense' : 'New Expense'}</h2>
          <button className="modal-close" onClick={() => onClose(false)}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <Input
              label="Expense Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Electricity Bill"
              error={errors.name}
            />
            <Input
              label="Vendor / Merchant"
              name="vendor"
              value={form.vendor}
              onChange={handleChange}
              placeholder="e.g. APTPDC"
            />
          </div>
          <div className="form-row">
            <Input
              label="Amount"
              name="amount"
              type="number"
              step="0.01"
              min="0"
              value={form.amount}
              onChange={handleChange}
              placeholder="0.00"
              prefix="$"
              error={errors.amount}
            />
            <Select
              label="Category"
              name="category"
              value={form.category}
              onChange={handleChange}
              error={errors.category}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </div>
          <div className="form-row">
            <Input
              label="Date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              error={errors.date}
            />
            <Select label="Currency" name="currency" value={form.currency} onChange={handleChange}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="INR">INR</option>
            </Select>
          </div>
          <Textarea
            label="Notes (optional)"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Additional details..."
            rows={3}
          />
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => onClose(false)} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={saving}>
              {isEdit ? 'Update Expense' : 'Create Expense'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;
