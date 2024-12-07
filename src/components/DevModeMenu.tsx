import React, { useState } from 'react';
import { Settings, X } from 'lucide-react';
import { Transaction } from '../types';

interface DevModeMenuProps {
  transactions: Transaction[];
  removeTransaction: (index: number) => void;
  setCurrentDate: (date: Date) => void;
  currentDate: Date;
}

const DevModeMenu: React.FC<DevModeMenuProps> = ({
  transactions,
  removeTransaction,
  setCurrentDate,
  currentDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    // Set time to noon to avoid timezone issues
    newDate.setHours(12, 0, 0, 0);
    setCurrentDate(newDate);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 bg-gray-800 text-white p-2 rounded-full shadow-lg z-50"
      >
        <Settings className="w-6 h-6" />
      </button>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Dev Mode Menu</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="virtualDate" className="block text-sm font-medium text-gray-300 mb-1">
                  Virtual Date
                </label>
                <input
                  type="date"
                  id="virtualDate"
                  value={currentDate.toISOString().split('T')[0]}
                  onChange={handleDateChange}
                  className="w-full p-2 bg-gray-700 rounded-md text-white"
                />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Recent Transactions</h4>
                <ul className="space-y-2 max-h-60 overflow-y-auto">
                  {transactions.slice().reverse().map((transaction, index) => (
                    <li key={index} className="flex justify-between items-center bg-gray-700 p-2 rounded-md">
                      <span className="text-white">
                        {new Date(transaction.date).toLocaleDateString()} - £{transaction.amount.toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeTransaction(transactions.length - 1 - index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DevModeMenu;