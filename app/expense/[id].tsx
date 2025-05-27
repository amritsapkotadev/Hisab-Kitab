import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Appbar, Divider, List, Card, Button, useTheme as usePaperTheme } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useData } from '@/contexts/DataContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Avatar } from '@/components/Avatar';
import { format } from 'date-fns';
import { formatCurrency } from '@/utils/formatters';
import { Calendar, Receipt, Users, ArrowRight } from 'lucide-react-native';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getExpense, getGroup } = useData();
  const { theme } = useTheme();
  const paperTheme = usePaperTheme();
  
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
        <Animated.View entering={FadeIn.duration(300)} style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{expense.title}</Text>
          <Text style={[styles.groupName, { color: theme.colors.primary }]}>in {group.name}</Text>
          <Text style={[styles.amount, { color: theme.colors.text }]}>{formatCurrency(expense.amount)}</Text>
          
          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <Calendar size={16} color={theme.colors.primary} />
              <Text style={[styles.metaText, { color: theme.colors.text }]}>{formattedDate}</Text>
            </View>
            {expense.category && (
              <View style={styles.metaItem}>
                <Receipt size={16} color={theme.colors.primary} />
                <Text style={[styles.metaText, { color: theme.colors.text }]}>{expense.category}</Text>
              </View>
            )}
            <View style={styles.metaItem}>
              <Users size={16} color={theme.colors.primary} />
              <Text style={[styles.metaText, { color: theme.colors.text }]}>
                {group.members.length} members
              </Text>
            </View>
          </View>
        </Animated.View>
        
        <Animated.View 
          entering={SlideInRight.delay(100).duration(300)} 
          style={[styles.card, { backgroundColor: theme.colors.surface }]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Paid by</Text>
          {payers.map((payer, index) => (
            <Card 
              key={index} 
              style={[styles.paymentCard, { backgroundColor: theme.colors.surface }]}
            >
              <Card.Content style={styles.paymentContent}>
                <View style={styles.userInfo}>
                  <Avatar user={payer.user} size={40} />
                  <Text style={[styles.userName, { color: theme.colors.text }]}>
                    {payer.user?.name || 'Unknown'}
                  </Text>
                </View>
                <Text style={[styles.paymentAmount, { color: theme.colors.primary }]}>
                  {formatCurrency(payer.amount)}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </Animated.View>
        
        <Animated.View 
          entering={SlideInRight.delay(200).duration(300)} 
          style={[styles.card, { backgroundColor: theme.colors.surface }]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Split between</Text>
          {debtors.map((debtor, index) => (
            <Card 
              key={index} 
              style={[styles.paymentCard, { backgroundColor: theme.colors.surface }]}
            >
              <Card.Content style={styles.paymentContent}>
                <View style={styles.userInfo}>
                  <Avatar user={debtor.user} size={40} />
                  <View>
                    <Text style={[styles.userName, { color: theme.colors.text }]}>
                      {debtor.user?.name || 'Unknown'}
                    </Text>
                    {(debtor.shares || debtor.percentage) && (
                      <Text style={[styles.splitDetail, { color: theme.colors.placeholder }]}>
                        {debtor.shares ? `${debtor.shares} shares` : `${debtor.percentage}%`}
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.amountContainer}>
                  <ArrowRight size={16} color={theme.colors.primary} style={styles.arrow} />
                  <Text style={[styles.paymentAmount, { color: theme.colors.secondary }]}>
                    {formatCurrency(debtor.amount)}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          ))}
        </Animated.View>
        
        {expense.notes && (
          <Animated.View 
            entering={SlideInRight.delay(300).duration(300)} 
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
          >
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Notes</Text>
            <Card style={[styles.notesCard, { backgroundColor: paperTheme.colors.surfaceVariant }]}>
              <Card.Content>
                <Text style={[styles.notes, { color: theme.colors.text }]}>{expense.notes}</Text>
              </Card.Content>
            </Card>
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
    marginBottom: 16,
    borderRadius: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
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
    fontFamily: 'Inter-Regular',
  },
  card: {
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
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  paymentCard: {
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  paymentContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userName: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  splitDetail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  arrow: {
    opacity: 0.6,
  },
  paymentAmount: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  notesCard: {
    borderRadius: 8,
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