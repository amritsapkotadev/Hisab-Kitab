import React from 'react';
import { View, StyleSheet, FlatList, Share } from 'react-native';
import { Text, FAB, Appbar, Portal, Dialog, Button } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useData } from '@/contexts/DataContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AvatarGroup } from '@/components/AvatarGroup';
import { ExpenseCard } from '@/components/ExpenseCard';
import { BalanceCard } from '@/components/BalanceCard';
import { SettlementCard } from '@/components/SettlementCard';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/utils/formatters';
import { Link } from 'lucide-react-native';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { getGroup, getGroupExpenses, getGroupBalances, getSettlements, settleExpense, getGroupInviteLink } = useData();
  const { user } = useAuth();
  const { theme } = useTheme();
  
  const [showSettlements, setShowSettlements] = React.useState(false);
  
  const group = getGroup(id as string);
  const expenses = getGroupExpenses(id as string);
  const balances = getGroupBalances(id as string);
  const settlements = getSettlements(id as string);
  
  // User's balance in this group
  const userBalance = user ? balances[user.id] || 0 : 0;
  const isPositive = userBalance >= 0;
  
  const handleBack = () => {
    router.back();
  };
  
  const handleAddExpense = () => {
    router.push(`/group/${id}/add-expense`);
  };
  
  const handleSettleUp = () => {
    setShowSettlements(true);
  };

  const handleShareGroup = async () => {
    try {
      const inviteLink = getGroupInviteLink(id as string);
      await Share.share({
        message: `Join my group "${group?.name}" on SplitWise!\n\n${inviteLink}`,
        title: 'Join Group',
      });
    } catch (error) {
      console.error('Error sharing group:', error);
    }
  };
  
  const handleSettleExpense = async (settlementId: string) => {
    try {
      await settleExpense(settlementId);
      // In a real app, this would refresh the balances
    } catch (error) {
      console.error('Error settling expense:', error);
    }
  };
  
  if (!group) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
          <Appbar.BackAction onPress={handleBack} />
          <Appbar.Content title="Group Not Found" />
        </Appbar.Header>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>This group doesn't exist or has been deleted.</Text>
          <Button mode="contained" onPress={handleBack} style={styles.errorButton}>
            Go Back
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.BackAction onPress={handleBack} />
        <Appbar.Content title={group.name} />
        <Appbar.Action icon={() => <Link size={24} />} onPress={handleShareGroup} />
        <Appbar.Action icon="account-group" />
      </Appbar.Header>
      
      <View style={styles.groupInfo}>
        <AvatarGroup users={group.members} size={40} maxDisplayed={5} />
        <Text style={styles.memberCount}>
          {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
        </Text>
      </View>
      
      <View style={styles.balanceContainer}>
        <BalanceCard
          title={isPositive ? "You are owed" : "You owe"}
          amount={Math.abs(userBalance)}
          isPositive={isPositive}
        />
      </View>
      
      <View style={styles.actionsContainer}>
        <Button 
          mode="contained-tonal" 
          onPress={handleSettleUp}
          style={styles.actionButton}
        >
          Settle Up
        </Button>
        <Button 
          mode="contained" 
          onPress={handleAddExpense}
          style={styles.actionButton}
        >
          Add Expense
        </Button>
      </View>
      
      <View style={styles.expensesHeader}>
        <Text style={styles.expensesTitle}>Expenses</Text>
      </View>
      
      <FlatList
        data={expenses}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <ExpenseCard expense={item} />}
        contentContainerStyle={styles.expensesList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No expenses yet</Text>
            <Button 
              mode="contained" 
              onPress={handleAddExpense}
              style={styles.addFirstExpenseButton}
            >
              Add First Expense
            </Button>
          </View>
        }
      />
      
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.onPrimary}
        onPress={handleAddExpense}
      />
      
      <Portal>
        <Dialog 
          visible={showSettlements} 
          onDismiss={() => setShowSettlements(false)}
          style={{ backgroundColor: theme.colors.surface }}
        >
          <Dialog.Title>Settle Up</Dialog.Title>
          <Dialog.Content>
            {settlements.length > 0 ? (
              settlements.map(settlement => (
                <SettlementCard 
                  key={settlement.id}
                  settlement={settlement}
                  onSettle={handleSettleExpense}
                />
              ))
            ) : (
              <Text style={styles.noSettlementsText}>
                All balances are settled in this group
              </Text>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowSettlements(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  groupInfo: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  memberCount: {
    fontSize: 14,
    opacity: 0.7,
  },
  balanceContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: 'white',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 24,
    backgroundColor: 'white',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  expensesHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  expensesTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  expensesList: {
    paddingBottom: 80,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: 'center',
    marginBottom: 16,
  },
  addFirstExpenseButton: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  noSettlementsText: {
    textAlign: 'center',
    marginVertical: 16,
    opacity: 0.7,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.7,
  },
  errorButton: {
    minWidth: 120,
  },
});