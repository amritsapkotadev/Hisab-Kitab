import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, HelperText, Portal, Dialog } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { addDoc, collection, doc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { format } from 'date-fns';

interface ExpenseForm {
  title: string;
  amount: string;
  category: string;
  description?: string;
  date: string;
}

const CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Health',
  'Travel',
  'Other'
];

export default function AddExpenseScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);

  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm<ExpenseForm>({
    defaultValues: {
      title: '',
      amount: '',
      category: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd')
    }
  });

  const selectedCategory = watch('category');

  const onSubmit = async (data: ExpenseForm) => {
    if (!user) return;

    try {
      setIsLoading(true);
      const userRef = doc(db, 'users', user.id);
      const expensesRef = collection(userRef, 'expenses');

      await addDoc(expensesRef, {
        title: data.title,
        amount: parseFloat(data.amount),
        category: data.category,
        description: data.description || '',
        date: new Date(data.date).toISOString(),
        createdAt: new Date().toISOString(),
      });

      setShowSuccess(true);
    } catch (error) {
      console.error('Error adding expense:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = (category: string) => {
    setValue('category', category);
    setShowCategoryDialog(false);
  };

  const handleSuccess = () => {
    setShowSuccess(false);
    router.back();
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>Add New Expense</Text>

      <Controller
        control={control}
        rules={{
          required: 'Title is required'
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Title"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            mode="outlined"
            style={styles.input}
            error={!!errors.title}
          />
        )}
        name="title"
      />
      {errors.title && (
        <HelperText type="error">{errors.title.message}</HelperText>
      )}

      <Controller
        control={control}
        rules={{
          required: 'Amount is required',
          pattern: {
            value: /^\d+(\.\d{0,2})?$/,
            message: 'Please enter a valid amount'
          }
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Amount"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            mode="outlined"
            keyboardType="decimal-pad"
            style={styles.input}
            error={!!errors.amount}
            left={<TextInput.Affix text="$" />}
          />
        )}
        name="amount"
      />
      {errors.amount && (
        <HelperText type="error">{errors.amount.message}</HelperText>
      )}

      <Controller
        control={control}
        rules={{
          required: 'Category is required'
        }}
        render={({ field: { value } }) => (
          <TextInput
            label="Category"
            value={value}
            onPressIn={() => setShowCategoryDialog(true)}
            mode="outlined"
            style={styles.input}
            error={!!errors.category}
            editable={false}
            right={<TextInput.Icon icon="chevron-down" />}
          />
        )}
        name="category"
      />
      {errors.category && (
        <HelperText type="error">{errors.category.message}</HelperText>
      )}

      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Description (Optional)"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={3}
          />
        )}
        name="description"
      />

      <Controller
        control={control}
        rules={{
          required: 'Date is required'
        }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Date"
            value={value}
            onChangeText={onChange}
            mode="outlined"
            style={styles.input}
            error={!!errors.date}
            right={<TextInput.Icon icon="calendar" />}
            render={props => (
              <input
                type="date"
                value={value}
                onChange={e => onChange(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  width: '100%',
                  height: '100%',
                  padding: '16px',
                  fontSize: '16px',
                  fontFamily: 'Inter-Regular',
                  color: theme.colors.text
                }}
              />
            )}
          />
        )}
        name="date"
      />

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={isLoading}
        disabled={isLoading}
        style={styles.button}
      >
        Add Expense
      </Button>

      <Portal>
        <Dialog visible={showCategoryDialog} onDismiss={() => setShowCategoryDialog(false)}>
          <Dialog.Title>Select Category</Dialog.Title>
          <Dialog.Content>
            <ScrollView style={styles.categoryList}>
              {CATEGORIES.map((category) => (
                <Button
                  key={category}
                  mode={selectedCategory === category ? 'contained' : 'outlined'}
                  onPress={() => handleCategorySelect(category)}
                  style={styles.categoryButton}
                >
                  {category}
                </Button>
              ))}
            </ScrollView>
          </Dialog.Content>
        </Dialog>

        <Dialog visible={showSuccess} onDismiss={handleSuccess}>
          <Dialog.Title>Success</Dialog.Title>
          <Dialog.Content>
            <Text>Expense added successfully!</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleSuccess}>OK</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    fontFamily: 'Inter-Bold',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 24,
    paddingVertical: 8,
  },
  categoryList: {
    maxHeight: 300,
  },
  categoryButton: {
    marginVertical: 4,
  },
});