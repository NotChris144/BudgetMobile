import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

interface SettingsScreenProps {
  income: number;
  dailyBudget: number;
  updateSettings: (income: number, username: string) => void;
  totalExpenses: number;
  username?: string;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ 
  income, 
  dailyBudget, 
  updateSettings, 
  totalExpenses,
  username = 'User'
}) => {
  const [newIncome, setNewIncome] = useState(income.toString());
  const [newUsername, setNewUsername] = useState(username);

  useEffect(() => {
    setNewIncome(income.toString());
    setNewUsername(username);
  }, [income, username]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedIncome = parseFloat(newIncome) || 0;
    updateSettings(parsedIncome, newUsername);
  };

  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+(\.\d*)?$/.test(value)) {
      setNewIncome(value);
      const parsedIncome = parseFloat(value) || 0;
      updateSettings(parsedIncome, newUsername);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewUsername(value);
    updateSettings(parseFloat(newIncome) || 0, value);
  };

  const parsedIncome = parseFloat(newIncome) || 0;
  const availableAmount = parsedIncome - totalExpenses;
  const monthlyBudget = dailyBudget * 30;
  const isOverBudget = monthlyBudget > availableAmount;

  return (
    <div className="p-4 bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-white">Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-300">
            Your Name
          </label>
          <input
            type="text"
            id="username"
            value={newUsername}
            onChange={handleUsernameChange}
            className="mt-1 block w-full p-2 border rounded-md bg-gray-700 text-white"
            placeholder="Enter your name"
          />
        </div>
        <div>
          <label htmlFor="income" className="block text-sm font-medium text-gray-300">
            Monthly Income
          </label>
          <input
            type="text"
            id="income"
            value={newIncome}
            onChange={handleIncomeChange}
            className="mt-1 block w-full p-2 border rounded-md bg-gray-700 text-white"
            placeholder="Enter your monthly income"
          />
        </div>
        <div>
          <label htmlFor="dailyBudget" className="block text-sm font-medium text-gray-300">
            Calculated Daily Budget (with 20% buffer)
          </label>
          <input
            type="text"
            id="dailyBudget"
            value={dailyBudget.toFixed(2)}
            readOnly
            className="mt-1 block w-full p-2 border rounded-md bg-gray-700 text-white"
          />
        </div>
        {isOverBudget && (
          <div className="bg-yellow-900 border-l-4 border-yellow-500 text-yellow-200 p-4" role="alert">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm">
                  Warning: Your daily budget exceeds the available amount (income - expenses).
                </p>
              </div>
            </div>
          </div>
        )}
      </form>
      <div className="mt-6 bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2 text-white">Summary</h2>
        <div className="space-y-2 text-gray-300">
          <div className="flex justify-between">
            <span>Monthly Income:</span>
            <span className="font-semibold">£{parsedIncome.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Monthly Expenses:</span>
            <span className="font-semibold">£{totalExpenses.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Available Amount:</span>
            <span className="font-semibold">£{availableAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Monthly Budget (based on daily):</span>
            <span className="font-semibold">£{monthlyBudget.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Daily Budget (with 20% buffer):</span>
            <span className="font-semibold">£{dailyBudget.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;