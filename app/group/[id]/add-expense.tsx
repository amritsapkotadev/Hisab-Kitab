import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Chip, SegmentedButtons, IconButton, Appbar } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useData } from '@/contexts/DataContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ExpenseSplit, SplitMethod } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { Avatar } from '@/components/Avatar';
import { Calculator, DollarSign, Percent, Users } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function AddExpenseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getGroup, addExpense } = useData();
  const { theme } = useTheme();
  
  const group = getGroup(id);
  
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('');
  const [date] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  
  // Split method state
  const [splitMethod, setSplitMethod] = useState<SplitMethod>(SplitMethod.EQUAL);
  
  // Payer selection state
  const [selectedPayers, setSelectedPayers] = useState<Record<string, number>>({});
  
  // Split between state
  const [splitAmounts, setSplitAmounts] = useState<Record<string, number>>({});
  const [splitShares, setSplitShares] = useState<Record<string, number>>({});
  const [splitPercentages, setSplitPercentages] = useState<Record<string, number>>({});
  
  // Initialize split amounts when amount changes
  useEffect(() => {
    if (amount && group) {
      const totalAmount = parseFloat(amount);
      if (!isNaN(totalAmount)) {
        if (splitMethod === SplitMethod.EQUAL) {
          const perPerson = totalAmount / group.members.length;
          const newSplitAmounts: Record<string, number> = {};
          group.members.forEach(member => {
            newSplitAmounts[member.id] = perPerson;
          });
          setSplitAmounts(newSplitAmounts);
        } else if (splitMethod === SplitMethod.PERCENTAGE) {
          const equalPercentage = 100 / group.members.length;
          const newPercentages: Record<string, number> = {};
          group.members.forEach(member => {
            newPercentages[member.id] = equalPercentage;
          });
          setSplitPercentages(newPercentages);
          updateAmountsFromPercentages(newPercentages);
        }
      }
    }
  }, [amount, group, splitMethod]);

  const updateAmountsFromPercentages = (percentages: Record<string, number>) => {
    const totalAmount = parseFloat(amount);
    if (!isNaN(totalAmount)) {
      const newSplitAmounts: Record<string, number> = {};
      Object.entries(percentages).forEach(([userId, percentage]) => {
        newSplitAmounts[userId] = (totalAmount * percentage) / 100;
      });
      setSplitAmounts(newSplitAmounts);
    }
  };

  const updateAmountsFromShares = (shares: Record<string, number>) => {
    const totalAmount = parseFloat(amount);
    const totalShares = Object.values(shares).reduce((sum, share) => sum + share, 0);
    if (!isNaN(totalAmount) && totalShares > 0) {
      const newSplitAmounts: Record<string, number> = {};
      Object.entries(shares).forEach(([userId, share]) => {
        newSplitAmounts[userId] = (totalAmount * share) / totalShares;
      });
      setSplitAmounts(newSplitAmounts);
    }
  };

  const handlePayerAmountChange = (userId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setSelectedPayers(prev => ({
      ...prev,
      [userId]: numValue
    }));
  };

  const handleSplitAmountChange = (userId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setSplitAmounts(prev => ({
      ...prev,
      [userId]: numValue
    }));
  };

  const handleShareChange = (userId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    const newShares = {
      ...splitShares,
      [userId]: numValue
    };
    setSplitShares(newShares);
    updateAmountsFromShares(newShares);
  };

  const handlePercentageChange = (userId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    const newPercentages = {
      ...splitPercentages,
      [userId]: numValue
    };
    setSplitPercentages(newPercentages);
    updateAmountsFromPercentages(newPercentages);
  };

  const validateForm = () => {
    if (!title.trim() || !amount || !group) return false;
    
    const totalAmount = parseFloat(amount);
    if (isNaN(totalAmount) || totalAmount <= 0) return false;
    
    // Validate payers
    const totalPaid = Object.values(selectedPayers).reduce((sum, val) => sum + val, 0);
    if (Math.abs(totalPaid - totalAmount) > 0.01) return false;
    
    // Validate splits
    const totalSplit = Object.values(splitAmounts).reduce((sum, val) => sum + val, 0);
    if (Math.abs(totalSplit - totalAmount) > 0.01) return false;
    
    return true;
  };

  const handleSave = async () => {
    if (!validateForm() || !group) return;
    
    try {
      setIsLoading(true);
      
      const paidBy: ExpenseSplit[] = Object.entries(selectedPayers)
        .filter(([_, amount]) => amount > 0)
        .map(([userId, amount]) => ({
          userId,
          amount
        }));
      
      const splitBetween: ExpenseSplit[] = Object.entries(splitAmounts)
        .filter(([_, amount]) => amount > 0)
        .map(([userId, amount]) => ({
          userId,
          amount,
          shares: splitShares[userId],
          percentage: splitPercentages[userId]
        }));
      
      await addExpense(
        id,
        title,
        parseFloat(amount),
        paidBy,
        splitBetween,
        splitMethod,
        date,
        category,
        notes
      );
      
      router.back();
    } catch (error) {
      console.error('Error adding expense:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!group) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text>Group not found</Text>
      </View>
    );
  }

  const getSplitMethodIcon = (method: SplitMethod) => {
    switch (method) {
      case SplitMethod.EQUAL:
        return <Users size={20} />;
      case SplitMethod.EXACT:
        return <DollarSign size={20} />;
      case SplitMethod.SHARES:
        return <Calculator size={20} />;
      case SplitMethod.PERCENTAGE:
        return <Percent size={20} />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Add New Expense" />
      </Appbar.Header>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(300)} style={styles.card}>
          <TextInput
            label="Title"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={styles.input}
          />
          
          <TextInput
            label="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
            left={<TextInput.Affix text="$" />}
          />
          
          <TextInput
            label="Category (Optional)"
            value={category}
            onChangeText={setCategory}
            mode="outlined"
            style={styles.input}
          />
        </Animated.View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Split Method</Text>
          <SegmentedButtons
            value={splitMethod}
            onValueChange={value => setSplitMethod(value as SplitMethod)}
            buttons={[
              { 
                value: SplitMethod.EQUAL,
                label: 'Equal',
                icon: () => getSplitMethodIcon(SplitMethod.EQUAL)
              },
              { 
                value: SplitMethod.EXACT,
                label: 'Exact',
                icon: () => getSplitMethodIcon(SplitMethod.EXACT)
              },
              { 
                value: SplitMethod.SHARES,
                label: 'Shares',
                icon: () => getSplitMethodIcon(SplitMethod.SHARES)
              },
              { 
                value: SplitMethod.PERCENTAGE,
                label: '%',
                icon: () => getSplitMethodIcon(SplitMethod.PERCENTAGE)
              }
            ]}
          />
        </View>
        
        <Animated.View entering={FadeIn.duration(300)} style={[styles.card, styles.section]}>
          <Text style={styles.sectionTitle}>Paid By</Text>
          {group.members.map(member => (
            <View key={member.id} style={styles.memberRow}>
              <View style={styles.memberInfo}>
                <Avatar user={member} size={40} />
                <Text style={styles.memberName}>{member.name}</Text>
              </View>
              <TextInput
                value={selectedPayers[member.id]?.toString() || ''}
                onChangeText={value => handlePayerAmountChange(member.id, value)}
                keyboardType="numeric"
                mode="outlined"
                style={styles.amountInput}
                left={<TextInput.Affix text="$" />}
              />
            </View>
          ))}
        </Animated.View>
        
        <Animated.View entering={FadeIn.duration(300)} style={[styles.card, styles.section]}>
          <Text style={styles.sectionTitle}>Split Between</Text>
          {group.members.map(member => (
            <View key={member.id} style={styles.memberRow}>
              <View style={styles.memberInfo}>
                <Avatar user={member} size={40} />
                <Text style={styles.memberName}>{member.name}</Text>
              </View>
              {splitMethod === SplitMethod.EXACT && (
                <TextInput
                  value={splitAmounts[member.id]?.toString() || ''}
                  onChangeText={value => handleSplitAmountChange(member.id, value)}
                  keyboardType="numeric"
                  mode="outlined"
                  style={styles.amountInput}
                  left={<TextInput.Affix text="$" />}
                />
              )}
              {splitMethod === SplitMethod.SHARES && (
                <TextInput
                  value={splitShares[member.id]?.toString() || ''}
                  onChangeText={value => handleShareChange(member.id, value)}
                  keyboardType="numeric"
                  mode="outlined"
                  style={styles.amountInput}
                  placeholder="Shares"
                />
              )}
              {splitMethod === SplitMethod.PERCENTAGE && (
                <TextInput
                  value={splitPercentages[member.id]?.toString() || ''}
                  onChangeText={value => handlePercentageChange(member.id, value)}
                  keyboardType="numeric"
                  mode="outlined"
                  style={styles.amountInput}
                  right={<TextInput.Affix text="%" />}
                />
              )}
              {splitMethod === SplitMethod.EQUAL && (
                <Text style={styles.equalAmount}>
                  {formatCurrency(splitAmounts[member.id] || 0)}
                </Text>
              )}
            </View>
          ))}
        </Animated.View>
        
        <Animated.View entering={FadeIn.duration(300)} style={[styles.card, styles.section]}>
          <TextInput
            label="Notes (Optional)"
            value={notes}
            onChangeText={setNotes}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
          />
        </Animated.View>
        
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleSave}
            loading={isLoading}
            disabled={!validateForm() || isLoading}
            style={styles.saveButton}
          >
            Save Expense
          </Button>
        </View>
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
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 4,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberName: {
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  amountInput: {
    width: 120,
  },
  equalAmount: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
  buttonContainer: {
    marginTop: 8,
  },
  saveButton: {
    paddingVertical: 8,
  },
});