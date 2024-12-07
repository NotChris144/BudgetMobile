import React, { useState } from 'react';
import { X } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface MoneyInputProps {
  onClose: () => void;
  onSubmit: (amount: number) => void;
}

const MoneyInput: React.FC<MoneyInputProps> = ({ onClose, onSubmit }) => {
  const [inputValue, setInputValue] = useState<string>('');

  const handleNumberClick = (num: number) => {
    if (inputValue.length < 6) {
      setInputValue(prev => prev + num);
    }
  };

  const handleClear = () => {
    setInputValue('');
  };

  const handleSubmit = () => {
    const amount = parseFloat((parseInt(inputValue) || 0) / 100);
    onSubmit(amount);
  };

  const getDisplayAmount = (): string => {
    if (!inputValue) return '£0.00';
    const amount = parseInt(inputValue) / 100;
    return formatCurrency(amount);
  };

  return (
    <div className="money-input-modal">
      <div className="money-input-content">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Quick Transaction</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-300">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <div className="card p-6 text-center">
            <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              {getDisplayAmount()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              className="btn-secondary py-4 px-0 text-xl"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="btn-secondary py-4 px-0 text-xl"
          >
            C
          </button>
          <button
            onClick={() => handleNumberClick(0)}
            className="btn-secondary py-4 px-0 text-xl"
          >
            0
          </button>
          <button
            onClick={handleSubmit}
            disabled={!inputValue}
            className="btn-primary py-4 px-0 text-xl"
          >
            ✓
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoneyInput;