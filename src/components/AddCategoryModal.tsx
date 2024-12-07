import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface AddCategoryModalProps {
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  newCategory: string;
  setNewCategory: (category: string) => void;
  allCategories: string[];
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  onClose,
  onSubmit,
  newCategory,
  setNewCategory,
  allCategories,
}) => {
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
        className="card w-full max-w-sm m-4 p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Add Category</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Category Name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="input"
            maxLength={20}
          />

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={!newCategory || allCategories.includes(newCategory)}
          >
            Add Category
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AddCategoryModal;