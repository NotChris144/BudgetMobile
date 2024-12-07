export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
}

export interface Transaction {
  date: string;
  amount: number;
  category: string;
}

export interface AppData {
  expenses: Expense[];
  income: number;
  dailyBudget: number;
  transactions: Transaction[];
  username: string; // Add username to app data
}