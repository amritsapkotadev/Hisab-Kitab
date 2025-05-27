import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { Group, Expense, User, ExpenseSplit, Settlement, SplitMethod } from '@/types';

// Mock users for demo
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
  },
];

// Mock groups
const MOCK_GROUPS: Group[] = [
  {
    id: '1',
    name: 'Weekend Trip',
    members: MOCK_USERS.slice(0, 4),
    createdAt: new Date('2024-01-15'),
    description: 'Beach weekend getaway',
    category: 'Travel'
  },
  {
    id: '2',
    name: 'Apartment 4B',
    members: MOCK_USERS.slice(0, 3),
    createdAt: new Date('2024-01-01'),
    description: 'Monthly apartment expenses',
    category: 'Home'
  }
];

// Mock expenses
const MOCK_EXPENSES: Expense[] = [
  {
    id: '1',
    groupId: '1',
    title: 'Hotel Booking',
    amount: 800,
    paidBy: [
      { userId: '1', amount: 500 },
      { userId: '2', amount: 300 }
    ],
    splitBetween: [
      { userId: '1', amount: 200 },
      { userId: '2', amount: 200 },
      { userId: '3', amount: 200 },
      { userId: '4', amount: 200 }
    ],
    splitMethod: SplitMethod.EQUAL,
    date: new Date('2024-01-16'),
    createdAt: new Date('2024-01-10'),
    category: 'Accommodation',
    notes: 'Oceanview rooms for 2 nights',
    settled: false
  },
  {
    id: '2',
    groupId: '1',
    title: 'Dinner',
    amount: 240,
    paidBy: [
      { userId: '3', amount: 240 }
    ],
    splitBetween: [
      { userId: '1', amount: 80 },
      { userId: '2', amount: 80 },
      { userId: '3', amount: 80 }
    ],
    splitMethod: SplitMethod.SHARES,
    date: new Date('2024-01-17'),
    createdAt: new Date('2024-01-17'),
    category: 'Food',
    notes: 'Seafood restaurant',
    settled: false
  }
];

interface DataContextType {
  groups: Group[];
  expenses: Expense[];
  createGroup: (name: string, members: User[], description?: string, category?: string) => Promise<Group>;
  addExpense: (
    groupId: string,
    title: string,
    amount: number,
    paidBy: ExpenseSplit[],
    splitBetween: ExpenseSplit[],
    splitMethod: SplitMethod,
    date: Date,
    category?: string,
    notes?: string
  ) => Promise<Expense>;
  getGroupExpenses: (groupId: string) => Expense[];
  getExpense: (expenseId: string) => Expense | undefined;
  getGroup: (groupId: string) => Group | undefined;
  getGroupBalances: (groupId: string) => Record<string, number>;
  getUserBalance: () => { totalOwed: number; totalOwedToUser: number };
  getSettlements: (groupId: string) => Settlement[];
  settleExpense: (expenseId: string) => Promise<void>;
  getAllUsers: () => User[];
  getGroupInviteLink: (groupId: string) => string;
  joinGroupByInviteLink: (inviteLink: string, user: User) => Promise<void>;
}

const DataContext = createContext<DataContextType>({
  groups: [],
  expenses: [],
  createGroup: async () => ({ id: '', name: '', members: [], createdAt: new Date() }),
  addExpense: async () => ({
    id: '',
    groupId: '',
    title: '',
    amount: 0,
    paidBy: [],
    splitBetween: [],
    splitMethod: SplitMethod.EQUAL,
    date: new Date(),
    createdAt: new Date(),
    settled: false
  }),
  getGroupExpenses: () => [],
  getExpense: () => undefined,
  getGroup: () => undefined,
  getGroupBalances: () => ({}),
  getUserBalance: () => ({ totalOwed: 0, totalOwedToUser: 0 }),
  getSettlements: () => [],
  settleExpense: async () => {},
  getAllUsers: () => [],
  getGroupInviteLink: () => '',
  joinGroupByInviteLink: async () => {},
});

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedGroups = await AsyncStorage.getItem('groups');
        const storedExpenses = await AsyncStorage.getItem('expenses');

        if (storedGroups) {
          const parsedGroups = JSON.parse(storedGroups);
          setGroups(parsedGroups.map((group: any) => ({
            ...group,
            createdAt: new Date(group.createdAt)
          })));
        } else {
          setGroups(MOCK_GROUPS);
          await AsyncStorage.setItem('groups', JSON.stringify(MOCK_GROUPS));
        }

        if (storedExpenses) {
          const parsedExpenses = JSON.parse(storedExpenses);
          setExpenses(parsedExpenses.map((expense: any) => ({
            ...expense,
            date: new Date(expense.date),
            createdAt: new Date(expense.createdAt)
          })));
        } else {
          setExpenses(MOCK_EXPENSES);
          await AsyncStorage.setItem('expenses', JSON.stringify(MOCK_EXPENSES));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  const createGroup = async (
    name: string,
    members: User[],
    description?: string,
    category?: string
  ) => {
    const newGroup: Group = {
      id: uuidv4(),
      name,
      members,
      createdAt: new Date(),
      description,
      category
    };

    const updatedGroups = [...groups, newGroup];
    setGroups(updatedGroups);
    await AsyncStorage.setItem('groups', JSON.stringify(updatedGroups));
    return newGroup;
  };

  const addExpense = async (
    groupId: string,
    title: string,
    amount: number,
    paidBy: ExpenseSplit[],
    splitBetween: ExpenseSplit[],
    splitMethod: SplitMethod,
    date: Date,
    category?: string,
    notes?: string
  ) => {
    const newExpense: Expense = {
      id: uuidv4(),
      groupId,
      title,
      amount,
      paidBy,
      splitBetween,
      splitMethod,
      date,
      createdAt: new Date(),
      category,
      notes,
      settled: false
    };

    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);
    await AsyncStorage.setItem('expenses', JSON.stringify(updatedExpenses));
    return newExpense;
  };

  const getGroupExpenses = (groupId: string) => {
    return expenses.filter(expense => expense.groupId === groupId);
  };

  const getExpense = (expenseId: string) => {
    return expenses.find(expense => expense.id === expenseId);
  };

  const getGroup = (groupId: string) => {
    return groups.find(group => group.id === groupId);
  };

  const getGroupBalances = (groupId: string) => {
    const balances: Record<string, number> = {};
    const groupExpenses = getGroupExpenses(groupId);
    const group = getGroup(groupId);

    if (group) {
      group.members.forEach(member => {
        balances[member.id] = 0;
      });

      groupExpenses.forEach(expense => {
        if (!expense.settled) {
          expense.paidBy.forEach(payment => {
            balances[payment.userId] = (balances[payment.userId] || 0) + payment.amount;
          });

          expense.splitBetween.forEach(split => {
            balances[split.userId] = (balances[split.userId] || 0) - split.amount;
          });
        }
      });
    }

    return balances;
  };

  const getUserBalance = () => {
    let totalOwed = 0;
    let totalOwedToUser = 0;

    groups.forEach(group => {
      const balances = getGroupBalances(group.id);
      Object.values(balances).forEach(balance => {
        if (balance < 0) {
          totalOwed += Math.abs(balance);
        } else {
          totalOwedToUser += balance;
        }
      });
    });

    return { totalOwed, totalOwedToUser };
  };

  const getSettlements = (groupId: string) => {
    const balances = getGroupBalances(groupId);
    const group = getGroup(groupId);
    const settlements: Settlement[] = [];

    if (!group) return settlements;

    const debtors = Object.entries(balances)
      .filter(([_, balance]) => balance < 0)
      .map(([userId, balance]) => ({
        userId,
        amount: Math.abs(balance)
      }));

    const creditors = Object.entries(balances)
      .filter(([_, balance]) => balance > 0)
      .map(([userId, balance]) => ({
        userId,
        amount: balance
      }));

    while (debtors.length > 0 && creditors.length > 0) {
      const debtor = debtors[0];
      const creditor = creditors[0];
      const amount = Math.min(debtor.amount, creditor.amount);

      if (amount > 0) {
        const debtorUser = group.members.find(m => m.id === debtor.userId);
        const creditorUser = group.members.find(m => m.id === creditor.userId);

        if (debtorUser && creditorUser) {
          settlements.push({
            id: uuidv4(),
            groupId,
            fromUser: debtorUser,
            toUser: creditorUser,
            amount,
            date: new Date(),
            status: 'pending'
          });
        }

        debtor.amount -= amount;
        creditor.amount -= amount;
      }

      if (debtor.amount <= 0) debtors.shift();
      if (creditor.amount <= 0) creditors.shift();
    }

    return settlements;
  };

  const settleExpense = async (expenseId: string) => {
    const updatedExpenses = expenses.map(expense =>
      expense.id === expenseId ? { ...expense, settled: true } : expense
    );
    setExpenses(updatedExpenses);
    await AsyncStorage.setItem('expenses', JSON.stringify(updatedExpenses));
  };

  const getAllUsers = () => MOCK_USERS;

  const getGroupInviteLink = (groupId: string) => {
    const token = btoa(`group-invite-${groupId}`);
    return `${window.location.origin}/join-group/${token}`;
  };

  const joinGroupByInviteLink = async (inviteLink: string, user: User) => {
    try {
      const token = inviteLink.split('/join-group/')[1];
      const decodedToken = atob(token);
      const groupId = decodedToken.replace('group-invite-', '');

      const group = groups.find(g => g.id === groupId);
      if (!group) {
        throw new Error('Group not found');
      }

      if (group.members.some(member => member.id === user.id)) {
        throw new Error('You are already a member of this group');
      }

      const updatedGroup = {
        ...group,
        members: [...group.members, user],
      };

      const updatedGroups = groups.map(g =>
        g.id === groupId ? updatedGroup : g
      );

      setGroups(updatedGroups);
      await AsyncStorage.setItem('groups', JSON.stringify(updatedGroups));
    } catch (error) {
      console.error('Error joining group:', error);
      throw error;
    }
  };

  return (
    <DataContext.Provider
      value={{
        groups,
        expenses,
        createGroup,
        addExpense,
        getGroupExpenses,
        getExpense,
        getGroup,
        getGroupBalances,
        getUserBalance,
        getSettlements,
        settleExpense,
        getAllUsers,
        getGroupInviteLink,
        joinGroupByInviteLink,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);