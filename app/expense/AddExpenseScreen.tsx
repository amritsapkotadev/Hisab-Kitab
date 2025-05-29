import React from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { addDoc, collection } from 'firebase/firestore';
import { db, auth } from './firebaseConfig';

type FormData = {
  title: string;
  amount: string;
  category: string;
  description: string;
  date: string;
};

export default function AddExpenseScreen() {
  const { control, handleSubmit, reset } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      Alert.alert('User not authenticated');
      return;
    }

    try {
      await addDoc(collection(db, 'users', userId, 'expenses'), {
        title: data.title,
        amount: parseFloat(data.amount),
        category: data.category,
        description: data.description,
        date: new Date(data.date).toISOString(),
        createdAt: new Date().toISOString(),
      });

      Alert.alert('Expense saved successfully!');
      reset();
    } catch (error) {
      console.error('Error adding document:', error);
      Alert.alert('Failed to save expense');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add Expense</Text>

      <Controller
        control={control}
        name="title"
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} placeholder="Title" value={value} onChangeText={onChange} />
        )}
      />

      <Controller
        control={control}
        name="amount"
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} placeholder="Amount" value={value} keyboardType="numeric" onChangeText={onChange} />
        )}
      />

      <Controller
        control={control}
        name="category"
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} placeholder="Category" value={value} onChangeText={onChange} />
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} placeholder="Description" value={value} onChangeText={onChange} />
        )}
      />

      <Controller
        control={control}
        name="date"
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD)" value={value} onChangeText={onChange} />
        )}
      />

      <Button title="Save Expense" onPress={handleSubmit(onSubmit)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
});
