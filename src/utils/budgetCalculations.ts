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
  // Adjust for Monday start (Sunday is 0, we want Monday to be 0)
  const diff = d.getDate() - (day === 0 ? 6 : day - 1);
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
  const sortedTransactions = [...transactions].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // Get current week's start date
  const currentWeekStart = getStartOfWeek(currentDate);
  
  // Initialize weeks map with current week
  const weeklyTransactions = new Map<string, Transaction[]>();
  weeklyTransactions.set(currentWeekStart.toISOString(), []);
  
  // Group transactions by week
  sortedTransactions.forEach(transaction => {
    const weekStart = getStartOfWeek(transaction.date);
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
        t.date.getDate() === date.getDate() &&
        t.date.getMonth() === date.getMonth() &&
        t.date.getFullYear() === date.getFullYear()
      );
      
      const spent = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
      const remainingToday = dailyBudget - spent;
      const isToday = date.toDateString() === currentDate.toDateString();
      
      // Get day name in correct order (Monday to Sunday)
      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const dayIndex = (date.getDay() + 6) % 7; // Convert Sunday (0) to 6, Monday (1) to 0, etc.
      
      return {
        date,
        day: dayNames[dayIndex],
        spent,
        remainingToday,
        isToday
      };
    });

    const totalSpent = weekSummary.reduce((sum, day) => sum + day.spent, 0);
    const todaysRemaining = dailyBudget * 7 - totalSpent;
    const hasTransactions = weekSummary.some(day => day.spent > 0);
    
    // Determine if we should show next week
    const isCurrentWeek = weekStartDate.toISOString() === currentWeekStart.toISOString();
    const isSunday = currentDate.getDay() === 0;
    
    // Show next week if it's the current week AND either:
    // 1. All days in current week have transactions OR
    // 2. It's Sunday
    const shouldShowNext = isCurrentWeek && (weekSummary.every(day => day.spent > 0) || isSunday);

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

  // Sort weeks chronologically
  weeklySummaries.sort((a, b) => a.weekStartDate.getTime() - b.weekStartDate.getTime());

  // If no weeks with transactions, return current week
  if (weeklySummaries.length === 0) {
    return [{
      summary: Array.from({ length: 7 }, (_, i) => {
        const date = new Date(currentWeekStart);
        date.setDate(date.getDate() + i);
        const isToday = date.toDateString() === currentDate.toDateString();
        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const dayIndex = (date.getDay() + 6) % 7;
        
        return {
          date,
          day: dayNames[dayIndex],
          spent: 0,
          remainingToday: dailyBudget,
          isToday
        };
      }),
      totalSpent: 0,
      todaysRemaining: dailyBudget * 7,
      weekStartDate: currentWeekStart,
      weekNumber: 1,
      hasTransactions: false,
      shouldShowNext: currentDate.getDay() === 0 // Show next week if it's Sunday
    }];
  }

  return weeklySummaries;
}