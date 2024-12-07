import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Expense } from '../types';
import { formatCurrency } from '../utils/formatters';
import ExpenseItem from './ExpenseItem';
import AddExpenseModal from './AddExpenseModal';
import AddCategoryModal from './AddCategoryModal';

interface ExpensesScreenProps {
  expenses: Expense[];
  income: number;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  removeExpense?: (id: string) => void;
}

const ExpensesScreen: React.FC<ExpensesScreenProps> = ({
  expenses,
  income,
  addExpense,
  removeExpense
}) => {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [newExpense, setNewExpense] = useState<Omit<Expense, 'id'>>({
    name: '',
    amount: 0,
    category: ''
  });

  // Load custom categories from localStorage on mount
  useEffect(() => {
    const savedCategories = localStorage.getItem('customCategories');
    if (savedCategories) {
      setCustomCategories(JSON.parse(savedCategories));
    }
  }, []);

  const defaultCategories = ['Household', 'Food', 'Subscription', 'Pets', 'Wellness', 'Entertainment'];
  const allCategories = [...defaultCategories, ...customCategories];

  const handleAddExpense = (expense: Omit<Expense, 'id'>) => {
    addExpense(expense);
    setNewExpense({ name: '', amount: 0, category: '' });
    setShowAddExpense(false);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory && !allCategories.includes(newCategory)) {
      const updatedCategories = [...customCategories, newCategory];
      setCustomCategories(updatedCategories);
      localStorage.setItem('customCategories', JSON.stringify(updatedCategories));
      setNewCategory('');
      setShowAddCategory(false);
    }
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const leftover = income - totalExpenses;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900">
      <div className="max-w-md mx-auto flex flex-col h-screen">
        <div className="flex-1 overflow-auto p-6 pb-32">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-100">Expenses</h1>
          </div>

          <div className="space-y-3 mb-6">
            <AnimatePresence mode="popLayout">
              {expenses.map((expense) => (
                <ExpenseItem
                  key={expense.id}
                  expense={expense}
                  onDelete={() => removeExpense?.(expense.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="fixed bottom-20 left-0 right-0 bg-gray-800/50 backdrop-blur-md border-t border-gray-700/50">
          <div className="max-w-md mx-auto p-4">
            <div className="flex justify-between items-center space-x-4">
              <div className="flex-1">
                <span className="text-sm text-gray-400">Income</span>
                <span className="block font-medium">{formatCurrency(income)}</span>
              </div>
              <div className="flex-1">
                <span className="text-sm text-gray-400">Expenses</span>
                <span className="block font-medium text-red-400">{formatCurrency(totalExpenses)}</span>
              </div>
              <div className="flex-1">
                <span className="text-sm text-gray-400">Remaining</span>
                <span className={`block font-medium ${leftover >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatCurrency(leftover)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowAddExpense(true)}
          className="fixed bottom-24 right-6 btn-primary p-4 rounded-full shadow-lg shadow-purple-500/25"
        >
          <Plus className="w-6 h-6" />
        </button>

        <AnimatePresence>
          {showAddExpense && (
            <AddExpenseModal
              onClose={() => setShowAddExpense(false)}
              onSubmit={handleAddExpense}
              newExpense={newExpense}
              setNewExpense={setNewExpense}
              allCategories={allCategories}
              onAddCategory={() => setShowAddCategory(true)}
            />
          )}

          {showAddCategory && (
            <AddCategoryModal
              onClose={() => setShowAddCategory(false)}
              onSubmit={handleAddCategory}
              newCategory={newCategory}
              setNewCategory={setNewCategory}
              allCategories={allCategories}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ExpensesScreen;