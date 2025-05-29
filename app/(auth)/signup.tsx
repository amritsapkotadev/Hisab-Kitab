import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Controller, useForm } from 'react-hook-form';
import {
  AlertNotificationRoot,
  Toast,
  ALERT_TYPE,
} from 'react-native-alert-notification';

interface SignupForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignupScreen() {
  const { signUp, signInWithGoogle } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors }, watch } = useForm<SignupForm>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data: SignupForm) => {
    try {
      setIsLoading(true);
      setError(null);

      await signUp(data.name, data.email, data.password);
      
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Success',
        textBody: 'Account created successfully!',
      });

      // Optionally navigate or reset form after success
      // router.push('/somepage');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred during sign up';
      setError(message);

      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await signInWithGoogle();

      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Success',
        textBody: 'Signed up with Google successfully!',
      });

    } catch (err) {
      const message = 'Google sign up failed. Please try again.';
      setError(message);

      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const goToLogin = () => {
    router.push('/(auth)/login');
  };

  return (
    <AlertNotificationRoot>
      <ScrollView 
        contentContainerStyle={[
          styles.container, 
          { backgroundColor: theme.colors.background }
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: theme.colors.placeholder }]}>
            Sign up to get started
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
              required: 'Name is required',
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Full Name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                mode="outlined"
                style={styles.input}
                error={!!errors.name}
                activeOutlineColor={theme.colors.primary}
              />
            )}
            name="name"
          />
          {errors.name && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {errors.name.message}
            </Text>
          )}

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
                activeOutlineColor={theme.colors.primary}
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
                activeOutlineColor={theme.colors.primary}
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
            rules={{
              required: 'Confirm Password is required',
              validate: value => value === password || 'Passwords do not match',
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Confirm Password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry
                mode="outlined"
                style={styles.input}
                error={!!errors.confirmPassword}
                activeOutlineColor={theme.colors.primary}
              />
            )}
            name="confirmPassword"
          />
          {errors.confirmPassword && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {errors.confirmPassword.message}
            </Text>
          )}

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
            contentStyle={{ paddingVertical: 10 }}
          >
            Sign Up
          </Button>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.placeholder }]} />
            <Text style={[styles.dividerText, { color: theme.colors.placeholder }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.placeholder }]} />
          </View>

          <Button
            mode="outlined"
            onPress={handleGoogleSignUp}
            loading={isLoading}
            disabled={isLoading}
            style={styles.googleButton}
            contentStyle={styles.buttonContent}
            icon="google"
            textColor={theme.colors.primary}
          >
            Sign up with Google
          </Button>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.text }]}>
            Already have an account?
          </Text>
          <TouchableOpacity onPress={goToLogin}>
            <Text style={[styles.footerLink, { color: theme.colors.primary }]}>
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </AlertNotificationRoot>
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
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.6,
    fontFamily: 'Inter-Regular',
  },
  form: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  button: {
    borderRadius: 8,
    marginTop: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
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
    borderRadius: 8,
    borderColor: '#4285F4',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    marginRight: 4,
    fontFamily: 'Inter-Regular',
  },
  footerLink: {
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  errorText: {
    marginBottom: 12,
    marginTop: -8,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
});
