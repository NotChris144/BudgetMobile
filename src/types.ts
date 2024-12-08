export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
}

export interface Transaction {
  date: Date;
  amount: number;
  category: string;
}

export interface AppData {
  expenses: Expense[];
  income: number;
  dailyBudget: number;
  transactions: Transaction[];
  username: string;
}