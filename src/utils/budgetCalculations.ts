import { addDays, addWeeks, endOfWeek, format, isSameDay, startOfWeek } from 'date-fns';
import { Transaction } from '../types';

export interface DaySummary {
  date: Date;
  spent: number;
  adjustedBudget: number;
  remainingToday: number;
  isToday: boolean;
  transactions: Transaction[];
}

export interface WeekSummary {
  startDate: Date;
  endDate: Date;
  totalSpent: number;
  weeklyBudget: number;
  remainingBudget: number;
  summary: DaySummary[];
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
  currentDate: Date
): WeekSummary[] {
  const startOfCurrentWeek = startOfWeek(currentDate);
  const startOfNextWeek = addWeeks(startOfCurrentWeek, 1);
  const endOfNextWeek = endOfWeek(startOfNextWeek);

  // Group transactions by date
  const transactionsByDate = transactions.reduce((acc, transaction) => {
    const dateKey = format(transaction.date, 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);

  // Initialize weeks array with current and next week
  const weeks: WeekSummary[] = [];
  let carryover = 0;

  // Calculate summaries for current and next week
  [startOfCurrentWeek, startOfNextWeek].forEach((weekStart, weekIndex) => {
    const weekDays: DaySummary[] = [];
    let weeklyTotal = 0;
    let weeklyBudget = 0;

    // Calculate each day in the week
    for (let i = 0; i < 7; i++) {
      const currentDay = addDays(weekStart, i);
      const dateKey = format(currentDay, 'yyyy-MM-dd');
      const dayTransactions = transactionsByDate[dateKey] || [];
      const spent = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
      weeklyTotal += spent;

      // Calculate adjusted budget with carryover
      const adjustedBudget = dailyBudget + carryover;
      weeklyBudget += dailyBudget;

      // Calculate remaining budget and new carryover
      const remainingToday = adjustedBudget - spent;
      carryover = remainingToday;

      weekDays.push({
        date: currentDay,
        spent,
        adjustedBudget,
        remainingToday,
        isToday: isSameDay(currentDay, currentDate),
        transactions: dayTransactions,
      });
    }

    weeks.push({
      startDate: weekStart,
      endDate: addDays(weekStart, 6),
      totalSpent: weeklyTotal,
      weeklyBudget,
      remainingBudget: weeklyBudget - weeklyTotal,
      summary: weekDays,
    });
  });

  return weeks;
}