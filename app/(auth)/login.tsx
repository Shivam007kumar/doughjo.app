import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Platform, Modal } from 'react-native';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '@/constants/Theme';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, Heart } from 'lucide-react-native';
import Animated, { BounceIn, FadeIn } from 'react-native-reanimated';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [userName, setUserName] = useState('');
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      Alert.alert('Login Failed', error.message);
    } else {
      // Extract name from email for welcome message
      const name = email.split('@')[0];
      setUserName(name);
      setShowWelcomeModal(true);
    }
  };

  const handleWelcomeModalClose = () => {
    setShowWelcomeModal(false);
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Sign in to continue your financial journey</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Mail color={Colors.text.tertiary} size={20} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={Colors.text.tertiary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

        <View style={styles.inputContainer}>
          <Lock color={Colors.text.tertiary} size={20} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={Colors.text.tertiary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoComplete="password"
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff color={Colors.text.tertiary} size={20} />
            ) : (
              <Eye color={Colors.text.tertiary} size={20} />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <Text style={styles.footerLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Welcome Modal */}
      <Modal
        visible={showWelcomeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleWelcomeModalClose}
      >
        <View style={styles.modalOverlay}>
          <Animated.View entering={BounceIn.duration(600)} style={styles.welcomeModal}>
            <View style={styles.welcomeIconContainer}>
              <Heart color={Colors.accent.teal} size={48} />
            </View>
            <Text style={styles.welcomeTitle}>Welcome back, {userName}!</Text>
            <Text style={styles.welcomeMessage}>
              Great to see you again! Ready to continue your financial mastery journey?
            </Text>
            <TouchableOpacity
              style={styles.welcomeButton}
              onPress={handleWelcomeModalClose}
            >
              <Text style={styles.welcomeButtonText}>Let's Go!</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.xxxl,
    color: Colors.text.primary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.primary,
    paddingVertical: SPACING.sm,
  },
  eyeIcon: {
    padding: SPACING.sm,
  },
  loginButton: {
    backgroundColor: Colors.accent.teal,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.md,
    color: Colors.background.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.secondary,
  },
  footerLink: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.md,
    color: Colors.accent.teal,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  welcomeModal: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  welcomeIconContainer: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: Colors.accent.teal + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  welcomeTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.xl,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  welcomeMessage: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  welcomeButton: {
    backgroundColor: Colors.accent.teal,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    width: '100%',
    alignItems: 'center',
  },
  welcomeButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.md,
    color: Colors.background.primary,
  },
});