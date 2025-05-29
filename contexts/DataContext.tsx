import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, doc, setDoc, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { useAuth } from './AuthContext';
import { Group, Expense, User, ExpenseSplit, Settlement, SplitMethod } from '@/types';

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
  getAllUsers: () => Promise<User[]>;
  getGroupInviteLink: (groupId: string) => string;
  joinGroupByInviteLink: (inviteLink: string, user: User) => Promise<void>;
}

const DataContext = createContext<DataContextType>({} as DataContextType);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'groups'), where('memberIds', 'array-contains', user.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const groupsData: Group[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        groupsData.push({
          id: doc.id,
          name: data.name,
          members: data.members,
          createdAt: data.createdAt.toDate(),
          description: data.description,
          category: data.category,
        });
      });
      setGroups(groupsData);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'expenses'), where('participantIds', 'array-contains', user.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const expensesData: Expense[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        expensesData.push({
          id: doc.id,
          groupId: data.groupId,
          title: data.title,
          amount: data.amount,
          paidBy: data.paidBy,
          splitBetween: data.splitBetween,
          splitMethod: data.splitMethod,
          date: data.date.toDate(),
          createdAt: data.createdAt.toDate(),
          category: data.category,
          notes: data.notes,
          settled: data.settled,
        });
      });
      setExpenses(expensesData);
    });
    return () => unsubscribe();
  }, [user]);

  const createGroup = async (name: string, members: User[], description?: string, category?: string): Promise<Group> => {
    if (!user) throw new Error('User not authenticated');
    const groupRef = doc(collection(db, 'groups'));
    const newGroup: Group = {
      id: groupRef.id,
      name,
      members: [...members, user],
      createdAt: new Date(),
      description,
      category,
    };
    await setDoc(groupRef, {
      ...newGroup,
      memberIds: newGroup.members.map(m => m.id),
      createdAt: new Date(),
    });
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
  ): Promise<Expense> => {
    if (!user) throw new Error('User not authenticated');
    const expenseRef = doc(collection(db, 'expenses'));
    const newExpense: Expense = {
      id: expenseRef.id,
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
      settled: false,
    };
    await setDoc(expenseRef, {
      ...newExpense,
      participantIds: [...new Set([...paidBy.map(p => p.userId), ...splitBetween.map(s => s.userId)])],
      createdAt: new Date(),
    });
    return newExpense;
  };

  const getGroupBalances = (groupId: string): Record<string, number> => {
    const balances: Record<string, number> = {};
    const groupExpenses = expenses.filter(expense => expense.groupId === groupId);
    const group = groups.find(group => group.id === groupId);
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
      Object.entries(balances).forEach(([userId, balance]) => {
        if (userId === user?.id) {
          if (balance < 0) totalOwed += Math.abs(balance);
          else totalOwedToUser += balance;
        }
      });
    });
    return { totalOwed, totalOwedToUser };
  };

  const getSettlements = (groupId: string): Settlement[] => {
    const balances = getGroupBalances(groupId);
    const group = groups.find(g => g.id === groupId);
    const settlements: Settlement[] = [];
    if (!group) return settlements;
    const debtors = Object.entries(balances).filter(([_, balance]) => balance < 0).map(([userId, balance]) => ({ userId, amount: Math.abs(balance) }));
    const creditors = Object.entries(balances).filter(([_, balance]) => balance > 0).map(([userId, balance]) => ({ userId, amount: balance }));
    while (debtors.length > 0 && creditors.length > 0) {
      const debtor = debtors[0];
      const creditor = creditors[0];
      const amount = Math.min(debtor.amount, creditor.amount);
      if (amount > 0) {
        const debtorUser = group.members.find(m => m.id === debtor.userId);
        const creditorUser = group.members.find(m => m.id === creditor.userId);
        if (debtorUser && creditorUser) {
          settlements.push({ id: Math.random().toString(), groupId, fromUser: debtorUser, toUser: creditorUser, amount, date: new Date(), status: 'pending' });
        }
        debtor.amount -= amount;
        creditor.amount -= amount;
      }
      if (debtor.amount <= 0) debtors.shift();
      if (creditor.amount <= 0) creditors.shift();
    }
    return settlements;
  };

  const settleExpense = async (expenseId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    const expenseRef = doc(db, 'expenses', expenseId);
    await setDoc(expenseRef, { settled: true }, { merge: true });
  };

  const getGroupInviteLink = (groupId: string): string => `${window.location.origin}/join-group/${groupId}`;

  const joinGroupByInviteLink = async (inviteLink: string, user: User): Promise<void> => {
    const groupId = inviteLink.split('/join-group/')[1];
    const groupRef = doc(db, 'groups', groupId);
    const group = groups.find(g => g.id === groupId);
    if (!group) throw new Error('Group not found');
    if (group.members.some(member => member.id === user.id)) throw new Error('You are already a member of this group');
    await setDoc(groupRef, {
      members: [...group.members, user],
      memberIds: [...group.members.map(m => m.id), user.id],
    }, { merge: true });
  };

  return (
    <DataContext.Provider
      value={{
        groups,
        expenses,
        createGroup,
        addExpense,
        getGroupExpenses: (groupId) => expenses.filter(e => e.groupId === groupId),
        getExpense: (expenseId) => expenses.find(e => e.id === expenseId),
        getGroup: (groupId) => groups.find(g => g.id === groupId),
        getGroupBalances,
        getUserBalance,
        getSettlements,
        settleExpense,
        getAllUsers: async () => [],
        getGroupInviteLink,
        joinGroupByInviteLink,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);