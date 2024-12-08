import { Transaction } from '../types';

export interface DaySummary {
  date: Date;
  day: string;
  spent: number;
  adjustedBudget: number;
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
  
  // Initialize weeks map with current week and next 3 weeks
  const weeklyTransactions = new Map<string, Transaction[]>();
  for (let i = 0; i < 4; i++) {
    const weekStart = new Date(currentWeekStart);
    weekStart.setDate(weekStart.getDate() + (i * 7));
    weeklyTransactions.set(weekStart.toISOString(), []);
  }
  
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
    const isCurrentWeek = weekStartDate.toISOString() === currentWeekStart.toISOString();
    const isFutureWeek = weekStartDate > currentWeekStart;
    
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
      
      // Calculate adjusted daily budget based on running total
      const daysLeftInWeek = 7 - i;
      const adjustedDailyBudget = dailyBudget + (runningTotal / daysLeftInWeek);
      
      // For future weeks, distribute any carryover evenly
      const finalAdjustedBudget = isFutureWeek && i === 0 ? 
        dailyBudget + (carryOverAmount / 7) : adjustedDailyBudget;
      
      // Calculate remaining for today
      const remainingToday = finalAdjustedBudget - spent;
      const isToday = date.toDateString() === currentDate.toDateString();
      
      // Update running total for next day
      runningTotal = isFutureWeek ? 
        carryOverAmount - (spent * (i + 1)) : // For future weeks, subtract spent from total carryover
        remainingToday * daysLeftInWeek; // For current week, use remaining * days left
      
      // Get day name in correct order (Monday to Sunday)
      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const dayIndex = (date.getDay() + 6) % 7;
      
      return {
        date,
        day: dayNames[dayIndex],
        spent,
        adjustedBudget: Math.round(finalAdjustedBudget * 100) / 100,
        remainingToday: Math.round(remainingToday * 100) / 100,
        isToday
      };
    });

    const totalSpent = weekSummary.reduce((sum, day) => sum + day.spent, 0);
    const weeklyBudget = dailyBudget * 7 + carryOverAmount;
    const todaysRemaining = weeklyBudget - totalSpent;
    
    // Update carryover for next week
    carryOverAmount = todaysRemaining;

    // Always show next week if it's current week or if there are transactions
    const shouldShowNext = isCurrentWeek || weekSummary.some(day => day.spent > 0);

    return {
      summary: weekSummary,
      totalSpent,
      todaysRemaining: Math.round(todaysRemaining * 100) / 100,
      weekStartDate,
      weekNumber: index + 1,
      hasTransactions: weekSummary.some(day => day.spent > 0),
      shouldShowNext,
      isCurrentWeek,
      isFutureWeek
    };
  });

  // Filter out weeks that are too far in the future with no transactions
  return weeklySummaries.filter((week, index) => 
    index === 0 || // Always keep current week
    week.hasTransactions || // Keep weeks with transactions
    (index === 1 && weeklySummaries[0].shouldShowNext) // Keep next week if current week indicates it
  );
}