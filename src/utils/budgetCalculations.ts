import { Transaction } from '../types';

export interface DaySummary {
  day: string;
  date: string;
  spent: number;
  adjustedBudget: number;
  remainingToday: number;
  isToday: boolean;
}

export const getWeekStartDate = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  d.setDate(diff);
  d.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
  return d;
};

export const calculateWeeklySummaries = (
  transactions: Transaction[],
  baseDailyBudget: number,
  currentDate: Date,
  numberOfWeeks: number = 4
): {
  summary: DaySummary[];
  totalSpent: number;
  todaysRemaining: number;
  weekStartDate: Date;
  weekNumber: number;
  hasTransactions: boolean;
  shouldShowNext: boolean;
}[] => {
  const weeks = [];
  let rollover = 0;
  const safeBaseDailyBudget = isNaN(baseDailyBudget) ? 0 : baseDailyBudget;

  // Sort transactions by date
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (let weekOffset = 0; weekOffset < numberOfWeeks; weekOffset++) {
    const weekDate = new Date(currentDate);
    weekDate.setDate(weekDate.getDate() - (weekOffset * 7));
    const startOfWeek = getWeekStartDate(weekDate);
    
    const summary: DaySummary[] = [];
    let weekTotalSpent = 0;
    let weekRemainingToday = 0;
    let hasTransactionsInWeek = false;
    let daysWithTransactions = new Set<string>();

    // Calculate daily summaries for the week (Monday to Sunday)
    for (let i = 0; i < 7; i++) {
      const date = new Date(
        startOfWeek.getFullYear(),
        startOfWeek.getMonth(),
        startOfWeek.getDate() + i
      );
      const dateStr = date.toISOString().split('T')[0];
      const isToday = dateStr === currentDate.toISOString().split('T')[0];
      
      // Get transactions for this day
      const dayTransactions = sortedTransactions.filter(t => t.date === dateStr);
      const spent = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      if (spent > 0) {
        hasTransactionsInWeek = true;
        daysWithTransactions.add(dateStr);
      }
      
      weekTotalSpent += spent;
      
      // Calculate adjusted budget including rollover from previous day
      const adjustedBudget = safeBaseDailyBudget + rollover;
      
      // Calculate remaining amount for today
      const remainingToday = adjustedBudget - spent;
      
      if (isToday) {
        weekRemainingToday = remainingToday;
      }
      
      summary.push({
        day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
        date: dateStr,
        spent,
        adjustedBudget: isToday ? adjustedBudget : safeBaseDailyBudget,
        remainingToday,
        isToday
      });

      // Update rollover for the next day
      if (dateStr < currentDate.toISOString().split('T')[0]) {
        rollover = remainingToday;
      }
    }

    // Determine if we should show the next week
    const isSunday = new Date(currentDate).getDay() === 0;
    const hasAllDaysWithTransactions = daysWithTransactions.size === 7;
    const shouldShowNext = isSunday || hasAllDaysWithTransactions;

    // Only add weeks that have transactions or if it's the current week
    if (hasTransactionsInWeek || weekOffset === 0) {
      weeks.push({
        summary,
        totalSpent: weekTotalSpent,
        todaysRemaining: weekRemainingToday,
        weekStartDate: startOfWeek,
        weekNumber: weekOffset + 1,
        hasTransactions: hasTransactionsInWeek,
        shouldShowNext
      });
    }
  }

  return weeks;
};