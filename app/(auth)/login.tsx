import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, TextInput, Button, Checkbox } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Controller, useForm } from 'react-hook-form';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SignupScreen from './signup';
interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function LoginScreen() {
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (data.rememberMe) {
        await AsyncStorage.setItem('rememberMe', 'true');
        await AsyncStorage.setItem('userEmail', data.email);
      } else {
        await AsyncStorage.removeItem('rememberMe');
        await AsyncStorage.removeItem('userEmail');
      }
      
      await signIn(data.email, data.password);
    } catch (err) {
      setError('Invalid email or password. Try using "john@example.com".');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await signInWithGoogle();
    } catch (err) {
      setError('Google sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const goToSignup = () => {
    router.push('/(auth)/signup');
  };

  

  return (
    <ScrollView 
      contentContainerStyle={[
        styles.container, 
        { backgroundColor: theme.colors.background }
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Welcome Back</Text>
        <Text style={[styles.subtitle, { color: theme.colors.placeholder }]}>
          Sign in to continue
        </Text>
      </View>
      
      {error && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}
      
      <View style={styles.form}>
        <Controller
          control={control}
          rules={{
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Email"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="none"
              keyboardType="email-address"
              mode="outlined"
              style={styles.input}
              error={!!errors.email}
            />
          )}
          name="email"
        />
        {errors.email && (
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {errors.email.message}
          </Text>
        )}
        
        <Controller
          control={control}
          rules={{
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters',
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              mode="outlined"
              style={styles.input}
              error={!!errors.password}
            />
          )}
          name="password"
        />
        {errors.password && (
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {errors.password.message}
          </Text>
        )}
        
        <Controller
          control={control}
          render={({ field: { onChange, value } }) => (
            <View style={styles.checkboxContainer}>
              <Checkbox
                status={value ? 'checked' : 'unchecked'}
                onPress={() => onChange(!value)}
                color={theme.colors.primary}
              />
              <Text style={[styles.checkboxLabel, { color: theme.colors.text }]}>
                Remember me
              </Text>
            </View>
          )}
          name="rememberMe"
        />
        
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
          disabled={isLoading}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Sign In
        </Button>

        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: theme.colors.placeholder }]} />
          <Text style={[styles.dividerText, { color: theme.colors.placeholder }]}>or</Text>
          <View style={[styles.dividerLine, { backgroundColor: theme.colors.placeholder }]} />
        </View>

        <Button
          mode="outlined"
          onPress={handleGoogleSignIn}
          loading={isLoading}
          disabled={isLoading}
          style={styles.googleButton}
          contentStyle={styles.buttonContent}
          icon="google"
        >
          Sign in with Google
        </Button>
        
        
      </View>
      
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.colors.text }]}>
          Don't have an account?
        </Text>
        <TouchableOpacity onPress={goToSignup}>
          <Text style={[styles.footerLink, { color: theme.colors.primary }]}>
            Sign Up
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  form: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  button: {
    borderRadius: 12,
    marginBottom: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    opacity: 0.2,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  googleButton: {
    borderRadius: 12,
    marginBottom: 16,
  },
  demoContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  demoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textDecorationLine: 'underline',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    marginRight: 4,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  footerLink: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 12,
    marginTop: -8,
  },
});