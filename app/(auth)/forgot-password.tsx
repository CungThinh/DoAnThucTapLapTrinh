import { View, Text, StyleSheet, Alert } from 'react-native';
import React, { useState } from 'react';
import { Stack, Link, useRouter } from 'expo-router';
import CustomInput from '@/components/CustomInput';
import Button from '@/components/Button';
import { supabase } from '@/lib/supabase';
import Colors from '@/constants/Colors';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verifiedOTP, setVerifiedOTP] = useState(false);
  const router = useRouter();

  async function sendResetCode() {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        shouldCreateUser: false,
      });

      if (error) throw error;
      
      setCodeSent(true);
      Alert.alert('Success', 'Reset code has been sent to your email');
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    if (!code) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email'
      });

      if (error) throw error;

      setVerifiedOTP(true);
      Alert.alert('Success', 'Code verified successfully');
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword() {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      Alert.alert('Success', 'Password has been reset successfully', [
        {
          text: 'OK',
          onPress: () => router.replace('/(auth)/sign-in')
        }
      ]);
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (codeSent && !verifiedOTP) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Verify Code' }} />

        <Text style={styles.title}>Enter Code</Text>
        <Text style={styles.subtitle}>
          Enter the verification code sent to
        </Text>
        <Text style={styles.email}>{email}</Text>

        <CustomInput
          placeholder="Enter verification code"
          value={code}
          setValue={setCode}
          keyboardType="numeric"
        />

        <Text style={styles.resendText}>
          Didn't receive code?{' '}
          <Text style={styles.resendLink} onPress={sendResetCode}>
            Resend
          </Text>
        </Text>

        <Button
          text={loading ? "Verifying..." : "Verify Code"}
          onPress={verifyCode}
          disabled={loading}
        />

        <Link href="/(auth)/sign-in" style={styles.backButton}>
          Back To Sign In
        </Link>
      </View>
    );
  }

  if (verifiedOTP) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Reset Password' }} />

        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Please enter your new password
        </Text>

        <CustomInput
          placeholder="New password"
          value={newPassword}
          setValue={setNewPassword}
          secureTextEntry
        />

        <CustomInput
          placeholder="Confirm new password"
          value={confirmPassword}
          setValue={setConfirmPassword}
          secureTextEntry
        />

        <Button
          text={loading ? "Resetting..." : "Reset Password"}
          onPress={resetPassword}
          disabled={loading}
        />

        <Link href="/(auth)/sign-in" style={styles.backButton}>
          Back To Sign In
        </Link>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Forgot Password' }} />

      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>
        Enter your email address and we'll send you a verification code
      </Text>

      <CustomInput
        label="Email Address*"
        placeholder="Enter your email"
        value={email}
        setValue={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Button
        text={loading ? "Sending..." : "Send Code"}
        onPress={sendResetCode}
        disabled={loading}
      />

      <Link href="/(auth)/sign-in" style={styles.backButton}>
        Back To Sign In
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  email: {
    fontSize: 14,
    color: '#333',
    marginBottom: 32,
  },
  backButton: {
    marginTop: 24,
    alignSelf: 'center',
    color: Colors.primary,
  },
  resendText: {
    textAlign: 'center',
    marginVertical: 16,
    color: '#666',
  },
  resendLink: {
    color: Colors.primary,
    textDecorationLine: 'underline',
  }
});

export default ForgotPasswordScreen;

