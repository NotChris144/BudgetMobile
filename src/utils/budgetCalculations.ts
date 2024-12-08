import { Transaction } from '../types';

export interface DaySummary {
  date: Date;
  day: string;
  spent: number;
  remainingToday: number;
  isToday: boolean;
}

export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function calculateWeeklySummaries(
  transactions: Transaction[],
  dailyBudget: number,
  currentDate: Date = new Date()
) {
  // Sort transactions by date
  const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Group transactions by week
  const weeklyTransactions = new Map<string, Transaction[]>();
  
  sortedTransactions.forEach(transaction => {
    const weekStart = getStartOfWeek(new Date(transaction.date));
    const weekKey = weekStart.toISOString();
    
    if (!weeklyTransactions.has(weekKey)) {
      weeklyTransactions.set(weekKey, []);
    }
    weeklyTransactions.get(weekKey)!.push(transaction);
  });

  // Calculate summaries for each week
  const weeklySummaries = Array.from(weeklyTransactions.entries()).map(([weekKey, transactions], index) => {
    const weekStartDate = new Date(weekKey);
    const weekSummary = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStartDate);
      date.setDate(date.getDate() + i);
      
      // Get transactions for this day
      const dayTransactions = transactions.filter(t => 
        new Date(t.date).getDate() === date.getDate() &&
        new Date(t.date).getMonth() === date.getMonth() &&
        new Date(t.date).getFullYear() === date.getFullYear()
      );
      
      const spent = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
      const remainingToday = dailyBudget - spent;
      const isToday = date.toDateString() === currentDate.toDateString();
      
      return {
        date,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        spent,
        remainingToday,
        isToday
      };
    });

    const totalSpent = weekSummary.reduce((sum, day) => sum + day.spent, 0);
    const todaysRemaining = dailyBudget * 7 - totalSpent;
    const hasTransactions = weekSummary.some(day => day.spent > 0);
    
    // Determine if we should show next week
    const isCurrentWeek = weekStartDate <= currentDate && 
      new Date(weekStartDate.getTime() + 7 * 24 * 60 * 60 * 1000) > currentDate;
    
    const allDaysHaveTransactions = weekSummary.every(day => day.spent > 0);
    const isSunday = currentDate.getDay() === 0;
    
    // Show next week if:
    // 1. All days in current week have transactions OR
    // 2. It's Sunday and we're in the current week
    const shouldShowNext = isCurrentWeek && (allDaysHaveTransactions || isSunday);

    return {
      summary: weekSummary,
      totalSpent,
      todaysRemaining,
      weekStartDate,
      weekNumber: index + 1,
      hasTransactions,
      shouldShowNext
    };
  });

  return weeklySummaries;
}