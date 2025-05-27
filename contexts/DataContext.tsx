import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { Group, Expense, User, ExpenseSplit, Settlement, SplitMethod } from '@/types';

// ... (previous mock data)

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
  generateGroupInviteLink: (groupId: string) => string;
  joinGroupByInviteLink: (inviteLink: string, user: User) => Promise<void>;
}

const DataContext = createContext<DataContextType>({
  // ... (previous context defaults)
  generateGroupInviteLink: () => '',
  joinGroupByInviteLink: async () => {},
});

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ... (previous state and functions)

  const generateGroupInviteLink = (groupId: string) => {
    // In a real app, this would generate a secure token and store it in the backend
    // For demo purposes, we'll use a simple encoded string
    const token = btoa(`group-invite-${groupId}`);
    return `${window.location.origin}/join-group/${token}`;
  };

  const joinGroupByInviteLink = async (inviteLink: string, user: User) => {
    try {
      // Extract the token from the invite link
      const token = inviteLink.split('/join-group/')[1];
      const decodedToken = atob(token);
      const groupId = decodedToken.replace('group-invite-', '');

      const group = groups.find(g => g.id === groupId);
      if (!group) {
        throw new Error('Group not found');
      }

      // Check if user is already a member
      if (group.members.some(member => member.id === user.id)) {
        throw new Error('You are already a member of this group');
      }

      // Add user to group
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
        // ... (previous context values)
        generateGroupInviteLink,
        joinGroupByInviteLink,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);