import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { db, auth } from './firebaseConfig';
import { useRouter } from 'expo-router';

export default function AllExpensesScreen() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const q = query(
      collection(db, 'users', userId, 'expenses'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setExpenses(data);
    });

    return () => unsubscribe();
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/expense/${item.id}`)}
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text>₹ {item.amount.toFixed(2)}</Text>
      <Text style={styles.date}>{new Date(item.date).toDateString()}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Expenses</Text>
      <FlatList
        data={expenses}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#f4f4f4',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  date: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
});
