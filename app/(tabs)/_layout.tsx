import React from 'react';
import { Tabs } from 'expo-router';
import { Chrome as Home, UsersRound, Receipt, User } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function TabLayout() {
  const { theme, isDark } = useTheme();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: isDark ? '#999' : '#666',
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: isDark ? '#333' : '#e0e0e0',
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontFamily: 'Inter-SemiBold',
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          headerShown: false,
          tabBarActiveBackgroundColor: theme.colors.primary,
          tabBarActiveTintColor: theme.colors.onPrimary,
          tabBarInactiveBackgroundColor: theme.colors.surface,
          tabBarInactiveTintColor: isDark ? '#999' : '#666',
          tabBarLabelStyle: {
            fontFamily: 'Inter-SemiBold',
            fontWeight: '600',
          },
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          headerShown: false,
          tabBarActiveBackgroundColor: theme.colors.primary,
          tabBarActiveTintColor: theme.colors.onPrimary,
          tabBarInactiveBackgroundColor: theme.colors.surface,
          tabBarInactiveTintColor: isDark ? '#999' : '#666',
          tabBarLabelStyle: {
            fontFamily: 'Inter-SemiBold',
            fontWeight: '600',
          },
          title: 'Groups',
          tabBarIcon: ({ color, size }) => (
            <UsersRound size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          headerShown: false,
          tabBarActiveBackgroundColor: theme.colors.primary,
          tabBarActiveTintColor: theme.colors.onPrimary,
          tabBarInactiveBackgroundColor: theme.colors.surface,
          tabBarInactiveTintColor: isDark ? '#999' : '#666',
          tabBarLabelStyle: {
            fontFamily: 'Inter-SemiBold',
            fontWeight: '600',
          },
          title: 'Activity',
          tabBarIcon: ({ color, size }) => (
            <Receipt size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
          tabBarActiveBackgroundColor: theme.colors.primary,
          tabBarActiveTintColor: theme.colors.onPrimary,
          tabBarInactiveBackgroundColor: theme.colors.surface,
          tabBarInactiveTintColor: isDark ? '#999' : '#666',
          tabBarLabelStyle: {
            fontFamily: 'Inter-SemiBold',
            fontWeight: '600',
          },
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}