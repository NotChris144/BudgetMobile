import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { Expense } from '../types';

interface AddExpenseModalProps {
  onClose: () => void;
  onSubmit: (expense: Omit<Expense, 'id'>) => void;
  newExpense: Omit<Expense, 'id'>;
  setNewExpense: (expense: Omit<Expense, 'id'>) => void;
  allCategories: string[];
  onAddCategory: () => void;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  onClose,
  onSubmit,
  newExpense,
  setNewExpense,
  allCategories,
  onAddCategory,
}) => {
  const [errors, setErrors] = useState({
    name: '',
    amount: '',
    category: ''
  });

  const validateForm = () => {
    const newErrors = {
      name: !newExpense.name ? 'Expense name is required' : '',
      amount: !newExpense.amount ? 'Amount is required' : '',
      category: !newExpense.category ? 'Category is required' : ''
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(newExpense);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="card w-full max-w-md m-4 p-6"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Expense Name"
                value={newExpense.name}
                onChange={(e) => {
                  setNewExpense({ ...newExpense, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                className={`text-xl font-bold bg-transparent w-full outline-none cursor-text caret-purple-500
                  ${errors.name ? 'text-red-400' : ''}`}
                autoFocus
              />
              {errors.name && (
                <p className="text-sm text-red-400 mt-1">{errors.name}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-300 ml-4"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div>
            <input
              type="number"
              placeholder="Amount"
              value={newExpense.amount || ''}
              onChange={(e) => {
                setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) });
                if (errors.amount) setErrors({ ...errors, amount: '' });
              }}
              className={`input ${errors.amount ? 'border-red-400' : ''}`}
              step="0.01"
            />
            {errors.amount && (
              <p className="text-sm text-red-400 mt-1">{errors.amount}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Category</label>
            <div className="flex flex-wrap gap-2">
              {allCategories.map((category) => (
                <button
                  key={`category-${category}`}
                  type="button"
                  onClick={() => {
                    setNewExpense({ ...newExpense, category });
                    if (errors.category) setErrors({ ...errors, category: '' });
                  }}
                  className={`px-3 py-2 rounded-xl text-sm ${
                    newExpense.category === category
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
              <button
                type="button"
                onClick={onAddCategory}
                className="px-3 py-2 rounded-xl text-sm bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 
                         border border-purple-500/50 shadow-lg shadow-purple-500/20"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {errors.category && (
              <p className="text-sm text-red-400 mt-1">{errors.category}</p>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
          >
            Add Expense
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AddExpenseModal;