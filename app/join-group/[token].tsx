import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ActivityIndicator, Button } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function JoinGroupScreen() {
  const { token } = useLocalSearchParams();
  const router = useRouter();
  const { joinGroupByInviteLink } = useData();
  const { user } = useAuth();
  const { theme } = useTheme();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const joinGroup = async () => {
      if (!user) {
        router.replace('/(auth)/login');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const inviteLink = `${window.location.origin}/join-group/${token}`;
        await joinGroupByInviteLink(inviteLink, user);
        router.replace('/(tabs)/groups');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to join group');
      } finally {
        setIsLoading(false);
      }
    };

    joinGroup();
  }, [token, user]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Animated.View 
        entering={FadeIn.duration(300)}
        style={styles.content}
      >
        {isLoading ? (
          <>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>Joining group...</Text>
          </>
        ) : error ? (
          <>
            <Text style={styles.errorText}>{error}</Text>
            <Button 
              mode="contained"
              onPress={() => router.replace('/(tabs)/groups')}
              style={styles.button}
            >
              Go to Groups
            </Button>
          </>
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    color: 'red',
    fontFamily: 'Inter-Regular',
  },
  button: {
    minWidth: 120,
  },
});