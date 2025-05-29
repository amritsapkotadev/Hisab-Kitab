// User type
export interface User {
  firebaseUser(firebaseUser: any): unknown;
  id: string;
  name: string;
  email: string;
  avatar?: string;
  emailVerified?: boolean;
}

// Group type
export interface Group {
  id: string;
  name: string;
  members: User[];
  createdAt: Date;
  description?: string;
  category?: string;
}

// Expense split type
export interface ExpenseSplit {
  userId: string;
  amount: number;
  shares?: number;
  percentage?: number;
}

// Split method enum
export enum SplitMethod {
  EQUAL = 'equal',
  EXACT = 'exact',
  SHARES = 'shares',
  PERCENTAGE = 'percentage'
}

// Expense type
export interface Expense {
  id: string;
  groupId: string;
  title: string;
  amount: number;
  paidBy: ExpenseSplit[];
  splitBetween: ExpenseSplit[];
  splitMethod: SplitMethod;
  date: Date;
  createdAt: Date;
  category?: string;
  notes?: string;
  settled: boolean;
}

// Settlement type
export interface Settlement {
  id: string;
  groupId: string;
  fromUser: User;
  toUser: User;
  amount: number;
  date: Date;
  status: 'pending' | 'completed';
}

// Category type
export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}