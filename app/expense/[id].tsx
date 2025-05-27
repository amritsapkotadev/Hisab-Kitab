import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Appbar, Divider, List, Card, Button } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useData } from '@/contexts/DataContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Avatar } from '@/components/Avatar';
import { format } from 'date-fns';
import { formatCurrency } from '@/utils/formatters';
import { Calendar, Receipt, Users } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getExpense, getGroup } = useData();
  const { theme } = useTheme();
  
  const expense = getExpense(id);
  const group = expense ? getGroup(expense.groupId) : null;
  
  const handleBack = () => {
    router.back();
  };
  
  if (!expense || !group) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header>
          <Appbar.BackAction onPress={handleBack} />
          <Appbar.Content title="Expense Not Found" />
        </Appbar.Header>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            This expense doesn't exist or has been deleted.
          </Text>
          <Button mode="contained" onPress={handleBack}>
            Go Back
          </Button>
        </View>
      </View>
    );
  }
  
  // Find payers and their amounts
  const payers = expense.paidBy.map(payment => {
    const user = group.members.find(member => member.id === payment.userId);
    return {
      user,
      amount: payment.amount,
    };
  });
  
  // Find who owes what
  const debtors = expense.splitBetween.map(split => {
    const user = group.members.find(member => member.id === split.userId);
    return {
      user,
      amount: split.amount,
      shares: split.shares,
      percentage: split.percentage,
    };
  });
  
  const formattedDate = format(expense.date, 'MMMM d, yyyy');

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={handleBack} />
        <Appbar.Content title="Expense Details" />
      </Appbar.Header>
      
      <ScrollView style={styles.content}>
        <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
          <Text style={styles.title}>{expense.title}</Text>
          <Text style={styles.groupName}>in {group.name}</Text>
          <Text style={styles.amount}>{formatCurrency(expense.amount)}</Text>
          
          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <Calendar size={16} color={theme.colors.primary} />
              <Text style={styles.metaText}>{formattedDate}</Text>
            </View>
            {expense.category && (
              <View style={styles.metaItem}>
                <Receipt size={16} color={theme.colors.primary} />
                <Text style={styles.metaText}>{expense.category}</Text>
              </View>
            )}
            <View style={styles.metaItem}>
              <Users size={16} color={theme.colors.primary} />
              <Text style={styles.metaText}>
                {group.members.length} members
              </Text>
            </View>
          </View>
        </Animated.View>
        
        <Animated.View entering={FadeIn.delay(100).duration(300)} style={styles.card}>
          <Text style={styles.sectionTitle}>Paid by</Text>
          {payers.map((payer, index) => (
            <List.Item
              key={index}
              title={payer.user?.name || 'Unknown'}
              description={formatCurrency(payer.amount)}
              left={props => 
                <Avatar 
                  {...props} 
                  user={payer.user} 
                  size={40} 
                  style={styles.avatar} 
                />
              }
              titleStyle={styles.listItemTitle}
              descriptionStyle={styles.listItemAmount}
            />
          ))}
        </Animated.View>
        
        <Animated.View entering={FadeIn.delay(200).duration(300)} style={styles.card}>
          <Text style={styles.sectionTitle}>Split between</Text>
          {debtors.map((debtor, index) => (
            <List.Item
              key={index}
              title={debtor.user?.name || 'Unknown'}
              description={
                <>
                  <Text style={styles.listItemAmount}>
                    {formatCurrency(debtor.amount)}
                  </Text>
                  {debtor.shares && (
                    <Text style={styles.splitDetail}>
                      {' '}({debtor.shares} shares)
                    </Text>
                  )}
                  {debtor.percentage && (
                    <Text style={styles.splitDetail}>
                      {' '}({debtor.percentage}%)
                    </Text>
                  )}
                </>
              }
              left={props => 
                <Avatar 
                  {...props} 
                  user={debtor.user} 
                  size={40} 
                  style={styles.avatar} 
                />
              }
              titleStyle={styles.listItemTitle}
            />
          ))}
        </Animated.View>
        
        {expense.notes && (
          <Animated.View entering={FadeIn.delay(300).duration(300)} style={styles.card}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{expense.notes}</Text>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  groupName: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 16,
    fontFamily: 'Inter-Regular',
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    opacity: 0.7,
    fontFamily: 'Inter-Regular',
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  avatar: {
    marginRight: 16,
    alignSelf: 'center',
  },
  listItemTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  listItemAmount: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  splitDetail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    opacity: 0.6,
  },
  notes: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
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
});