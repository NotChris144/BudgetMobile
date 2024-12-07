import React, { useState } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { Expense } from '../types';
import { formatCurrency } from '../utils/formatters';

interface ExpenseItemProps {
  expense: Expense;
  onDelete: () => void;
}

const ExpenseItem = React.forwardRef<HTMLDivElement, ExpenseItemProps>(
  ({ expense, onDelete }, ref) => {
    const [isDragging, setIsDragging] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    const handleDragEnd = (event: any, info: PanInfo) => {
      setIsDragging(false);
      if (info.offset.x < -100) {
        setDeleteConfirmOpen(true);
      }
    };

    return (
      <>
        <motion.div
          ref={ref}
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -100 }}
          className="relative"
        >
          <motion.div
            drag="x"
            dragDirectionLock
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            onDragStart={() => setIsDragging(true)}
            className="touch-pan-y"
          >
            <div className={`card backdrop-blur-md bg-gray-800/40 p-4 relative overflow-hidden
              ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-gray-100">{expense.name}</h3>
                  <span className="text-sm text-gray-400">{expense.category}</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  {formatCurrency(expense.amount)}
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {deleteConfirmOpen && (
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
              className="card p-6 w-full max-w-sm mx-4"
            >
              <div className="flex items-center gap-3 mb-4 text-red-400">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-lg font-semibold">Delete Expense</h3>
              </div>
              
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete this expense? This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmOpen(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDelete();
                    setDeleteConfirmOpen(false);
                  }}
                  className="btn flex-1 bg-red-500 hover:bg-red-600 text-white"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </>
    );
  }
);

ExpenseItem.displayName = 'ExpenseItem';

export default ExpenseItem;