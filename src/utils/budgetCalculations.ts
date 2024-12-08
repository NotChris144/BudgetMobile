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

  // Convert weeks map to array and sort chronologically
  const weekKeys = Array.from(weeklyTransactions.keys()).sort();
  let carryOverAmount = 0;

  const weeklySummaries = weekKeys.map((weekKey, index) => {
    const weekStartDate = new Date(weekKey);
    const transactions = weeklyTransactions.get(weekKey)!;
    
    // Calculate daily summaries with running total
    let runningTotal = carryOverAmount;
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
      const dailyBudgetWithCarryover = dailyBudget + (runningTotal / (7 - i));
      const remainingToday = dailyBudgetWithCarryover - spent;
      const isToday = date.toDateString() === currentDate.toDateString();
      
      // Update running total
      runningTotal = remainingToday * (7 - i);
      
      // Get day name in correct order (Monday to Sunday)
      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const dayIndex = (date.getDay() + 6) % 7;
      
      return {
        date,
        day: dayNames[dayIndex],
        spent,
        remainingToday: Math.round(remainingToday * 100) / 100,
        isToday
      };
    });

    const totalSpent = weekSummary.reduce((sum, day) => sum + day.spent, 0);
    const weeklyBudget = dailyBudget * 7 + carryOverAmount;
    const todaysRemaining = weeklyBudget - totalSpent;
    
    // Update carryover for next week
    carryOverAmount = todaysRemaining;

    // Determine if we should show next week
    const isCurrentWeek = weekStartDate.toISOString() === currentWeekStart.toISOString();
    const isSunday = currentDate.getDay() === 0;
    const shouldShowNext = isCurrentWeek && (weekSummary.every(day => day.spent > 0) || isSunday);

    return {
      summary: weekSummary,
      totalSpent,
      todaysRemaining: Math.round(todaysRemaining * 100) / 100,
      weekStartDate,
      weekNumber: index + 1,
      hasTransactions: weekSummary.some(day => day.spent > 0),
      shouldShowNext
    };
  });

  // If no weeks with transactions, return current week with carryover
  if (weeklySummaries.length === 0) {
    return [{
      summary: Array.from({ length: 7 }, (_, i) => {
        const date = new Date(currentWeekStart);
        date.setDate(date.getDate() + i);
        const isToday = date.toDateString() === currentDate.toDateString();
        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const dayIndex = (date.getDay() + 6) % 7;
        
        // Calculate daily budget with carryover
        const dailyBudgetWithCarryover = dailyBudget + (carryOverAmount / (7 - i));
        
        return {
          date,
          day: dayNames[dayIndex],
          spent: 0,
          remainingToday: Math.round(dailyBudgetWithCarryover * 100) / 100,
          isToday
        };
      }),
      totalSpent: 0,
      todaysRemaining: Math.round((dailyBudget * 7 + carryOverAmount) * 100) / 100,
      weekStartDate: currentWeekStart,
      weekNumber: 1,
      hasTransactions: false,
      shouldShowNext: currentDate.getDay() === 0
    }];
  }

  return weeklySummaries;
}