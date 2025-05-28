import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, FAB, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { collection, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { format } from 'date-fns';

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
}

export default function ExpensesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, 'users', user.id);
    const expensesRef = collection(userRef, 'expenses');
    const q = query(expensesRef, orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const expensesList: Expense[] = [];
      snapshot.forEach((doc) => {
        expensesList.push({ id: doc.id, ...doc.data() } as Expense);
      });
      setExpenses(expensesList);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddExpense = () => {
    router.push('/expenses/add');
  };

  const renderExpenseCard = ({ item }: { item: Expense }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.expenseTitle}>{item.title}</Text>
            <Text style={styles.expenseCategory}>{item.category}</Text>
          </View>
          <Text style={styles.expenseAmount}>
            ${item.amount.toFixed(2)}
          </Text>
        </View>
        {item.description && (
          <Text style={styles.expenseDescription}>{item.description}</Text>
        )}
        <Text style={styles.expenseDate}>
          {format(new Date(item.date), 'MMMM d, yyyy')}
        </Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Expenses</Text>
      </View>

      <FlatList
        data={expenses}
        renderItem={renderExpenseCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !isLoading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No expenses yet</Text>
            </View>
          )
        }
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleAddExpense}
        color={theme.colors.onPrimary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  expenseTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  expenseCategory: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  expenseDescription: {
    fontSize: 14,
    marginVertical: 8,
    fontFamily: 'Inter-Regular',
  },
  expenseDate: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});