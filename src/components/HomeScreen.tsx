import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Transaction } from '../types';
import DevModeMenu from './DevModeMenu';
import WelcomeMessage from './WelcomeMessage';
import WeeklySummaryPanel from './WeeklySummaryPanel';
import { calculateWeeklySummaries } from '../utils/budgetCalculations';
import { formatCurrency } from '../utils/formatters';

interface HomeScreenProps {
  dailyBudget: number;
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  removeTransaction: (index: number) => void;
  username?: string;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  onAddTransaction: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  dailyBudget: baseDailyBudget,
  transactions,
  addTransaction,
  removeTransaction,
  username = 'User',
  currentDate,
  setCurrentDate,
  onAddTransaction,
}) => {
  const weeks = useMemo(() => 
    calculateWeeklySummaries(transactions, baseDailyBudget, currentDate),
    [transactions, baseDailyBudget, currentDate]
  );

  // Find the week containing today's date
  const currentWeek = weeks.find(week => 
    week.summary.some(day => day.isToday)
  ) || weeks[0];

  // Get today's summary from the current week
  const todaysSummary = currentWeek?.summary.find(day => day.isToday);
  const displayBudget = todaysSummary?.adjustedBudget ?? baseDailyBudget;
  const todaysSpent = todaysSummary?.spent ?? 0;
  const budgetDifference = displayBudget - baseDailyBudget;

  return (
    <div className="home-content">
      <div className="welcome-section flex justify-between items-center">
        <WelcomeMessage username={username} />
        <DevModeMenu
          transactions={transactions}
          removeTransaction={removeTransaction}
          setCurrentDate={setCurrentDate}
          currentDate={currentDate}
        />
      </div>

      <div className="budget-section">
        <h2 className="budget-title">Your Daily Budget</h2>
        <div className="flex items-baseline justify-center gap-2">
          <p className="budget-amount">
            {formatCurrency(displayBudget)}
          </p>
          {budgetDifference !== 0 && (
            <div className={`flex items-center text-sm ${budgetDifference > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {budgetDifference > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {formatCurrency(Math.abs(budgetDifference))}
            </div>
          )}
        </div>
        {todaysSpent > 0 && (
          <div className="mt-2 text-sm text-gray-400">
            Spent today: <span className="text-red-400">{formatCurrency(todaysSpent)}</span>
          </div>
        )}
      </div>

      <div className="summary-section">
        <WeeklySummaryPanel weeks={weeks} />
      </div>
    </div>
  );
};

export default HomeScreen;