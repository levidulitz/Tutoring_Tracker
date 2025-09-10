import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Receipt, Home, Phone, Zap, Car, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Expense } from '../App';

interface ExpenseTrackingProps {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
}

const ExpenseTracking: React.FC<ExpenseTrackingProps> = ({ expenses, setExpenses }) => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    category: 'supplies' as Expense['category'],
    description: '',
    amount: '',
    deductible: true,
    receiptsAttached: false,
    notes: ''
  });

  const expenseCategories = [
    { id: 'home-office', name: 'Home Office', icon: Home, description: 'Rent, mortgage interest (business portion)' },
    { id: 'utilities', name: 'Utilities', icon: Zap, description: 'Electricity, heating, internet (business portion)' },
    { id: 'phone', name: 'Phone', icon: Phone, description: 'Business phone expenses' },
    { id: 'internet', name: 'Internet', icon: Zap, description: 'Internet service for business' },
    { id: 'supplies', name: 'Supplies', icon: BookOpen, description: 'Teaching materials, books, stationery' },
    { id: 'vehicle', name: 'Vehicle', icon: Car, description: 'Gas, maintenance, repairs (business use)' },
    { id: 'professional-development', name: 'Professional Development', icon: BookOpen, description: 'Training, courses, conferences' },
    { id: 'marketing', name: 'Marketing', icon: Receipt, description: 'Advertising, website, business cards' },
    { id: 'other', name: 'Other', icon: Receipt, description: 'Other business expenses' }
  ];

  const resetForm = () => {
    setFormData({
      date: '',
      category: 'supplies',
      description: '',
      amount: '',
      deductible: true,
      receiptsAttached: false,
      notes: ''
    });
    setEditingExpense(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const expenseData = {
      id: editingExpense?.id || Date.now().toString(),
      user_id: user?.id,
      date: formData.date,
      category: formData.category,
      description: formData.description,
      amount: parseFloat(formData.amount),
      deductible: formData.deductible,
      receipts_attached: formData.receiptsAttached,
      notes: formData.notes
    };

    saveExpense(expenseData);
  };

  const saveExpense = async (expenseData: any) => {
    try {
      if (editingExpense) {
        const { error } = await supabase
          .from('expenses')
          .update(expenseData)
          .eq('id', editingExpense.id);
        
        if (error) throw error;
        
        setExpenses(expenses.map(expense => 
          expense.id === editingExpense.id ? {
            id: expenseData.id,
            date: expenseData.date,
            category: expenseData.category,
            description: expenseData.description,
            amount: expenseData.amount,
            deductible: expenseData.deductible,
            receiptsAttached: expenseData.receipts_attached,
            notes: expenseData.notes || ''
          } : expense
        ));
      } else {
        const { data, error } = await supabase
          .from('expenses')
          .insert(expenseData)
          .select()
          .single();
        
        if (error) throw error;
        
        const newExpense: Expense = {
          id: data.id,
          date: data.date,
          category: data.category,
          description: data.description,
          amount: data.amount,
          deductible: data.deductible,
          receiptsAttached: data.receipts_attached,
          notes: data.notes || ''
        };
        
        setExpenses([...expenses, newExpense]);
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Failed to save expense. Please try again.');
    }
  };

  const handleEdit = (expense: Expense) => {
    setFormData({
      date: expense.date,
      category: expense.category,
      description: expense.description,
      amount: expense.amount.toString(),
      deductible: expense.deductible,
      receiptsAttached: expense.receiptsAttached,
      notes: expense.notes
    });
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleDelete = async (expenseId: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      try {
        const { error } = await supabase
          .from('expenses')
          .delete()
          .eq('id', expenseId);
        
        if (error) throw error;
        
        setExpenses(expenses.filter(expense => expense.id !== expenseId));
      } catch (error) {
        console.error('Error deleting expense:', error);
        alert('Failed to delete expense. Please try again.');
      }
    }
  };

  const getCategoryInfo = (categoryId: string) => {
    return expenseCategories.find(cat => cat.id === categoryId) || expenseCategories[0];
  };

  // Sort expenses by date (most recent first)
  const sortedExpenses = expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const deductibleExpenses = expenses.filter(e => e.deductible).reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expense Tracking</h1>
          <p className="mt-2 text-gray-600">Track your business expenses for tax deductions</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Receipt className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-semibold text-gray-900">${totalExpenses.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Receipt className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Deductible Expenses</p>
              <p className="text-2xl font-semibold text-gray-900">${deductibleExpenses.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Expense Form */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingExpense ? 'Edit Expense' : 'Add New Expense'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Expense['category'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {expenseCategories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {getCategoryInfo(formData.category).description}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Office supplies from Staples"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="deductible"
                    checked={formData.deductible}
                    onChange={(e) => setFormData({ ...formData, deductible: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="deductible" className="text-sm text-gray-700">
                    Tax deductible
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="receipts"
                    checked={formData.receiptsAttached}
                    onChange={(e) => setFormData({ ...formData, receiptsAttached: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="receipts" className="text-sm text-gray-700">
                    Receipt/documentation attached
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  placeholder="Additional notes or details"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {editingExpense ? 'Update Expense' : 'Add Expense'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-2 px-4 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expenses List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {sortedExpenses.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses recorded yet</h3>
            <p className="text-gray-500 mb-4">Start tracking your business expenses for tax deductions</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Expense
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sortedExpenses.map((expense) => {
              const categoryInfo = getCategoryInfo(expense.category);
              const Icon = categoryInfo.icon;
              return (
                <div key={expense.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Icon className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{expense.description}</h3>
                          <p className="text-sm text-gray-600">{categoryInfo.name}</p>
                        </div>
                      </div>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <div>Date: {new Date(expense.date).toLocaleDateString()}</div>
                        <div className="flex items-center space-x-4">
                          {expense.deductible && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                              Tax Deductible
                            </span>
                          )}
                          {expense.receiptsAttached && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                              Receipt Attached
                            </span>
                          )}
                        </div>
                      </div>
                      {expense.notes && (
                        <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{expense.notes}</p>
                      )}
                    </div>
                    <div className="ml-6 text-right">
                      <div className="text-2xl font-bold text-gray-900">${expense.amount.toFixed(2)}</div>
                      <div className="flex space-x-2 mt-4">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseTracking;