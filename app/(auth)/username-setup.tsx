import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '@/constants/Theme';
import { useAuth } from '@/contexts/AuthContext';
import { User, Check } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

export default function UsernameSetupScreen() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const { user } = useAuth();

  const checkUsernameAvailability = async (usernameToCheck: string) => {
    if (usernameToCheck.length < 3) {
      setIsAvailable(null);
      return;
    }

    setCheckingAvailability(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', usernameToCheck.toLowerCase())
        .single();

      if (error && error.code === 'PGRST116') {
        // No rows returned, username is available
        setIsAvailable(true);
      } else if (data) {
        // Username exists
        setIsAvailable(false);
      }
    } catch (error) {
      console.error('Error checking username:', error);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleUsernameChange = (text: string) => {
    // Only allow alphanumeric characters and underscores
    const cleanText = text.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(cleanText);
    
    // Debounce username availability check
    if (cleanText.length >= 3) {
      const timeoutId = setTimeout(() => {
        checkUsernameAvailability(cleanText);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    } else {
      setIsAvailable(null);
    }
  };

  const handleSaveUsername = async () => {
    if (!username || username.length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters long');
      return;
    }

    if (!isAvailable) {
      Alert.alert('Error', 'Please choose an available username');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User not found');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          username: username.toLowerCase(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save username');
    } finally {
      setLoading(false);
    }
  };

  const getUsernameStatus = () => {
    if (username.length < 3) {
      return { color: Colors.text.tertiary, text: 'Minimum 3 characters' };
    }
    if (checkingAvailability) {
      return { color: Colors.text.secondary, text: 'Checking availability...' };
    }
    if (isAvailable === true) {
      return { color: Colors.accent.green, text: 'Username available!' };
    }
    if (isAvailable === false) {
      return { color: Colors.accent.red, text: 'Username taken' };
    }
    return { color: Colors.text.tertiary, text: '' };
  };

  const status = getUsernameStatus();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Username</Text>
        <Text style={styles.subtitle}>
          This will be your unique identifier in DoughJo. You can change it later in settings.
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <User color={Colors.text.tertiary} size={20} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter username"
            placeholderTextColor={Colors.text.tertiary}
            value={username}
            onChangeText={handleUsernameChange}
            autoCapitalize="none"
            autoComplete="username"
            maxLength={20}
          />
          {isAvailable === true && (
            <Check color={Colors.accent.green} size={20} style={styles.checkIcon} />
          )}
        </View>

        {status.text && (
          <Text style={[styles.statusText, { color: status.color }]}>
            {status.text}
          </Text>
        )}

        <View style={styles.guidelines}>
          <Text style={styles.guidelinesTitle}>Username Guidelines:</Text>
          <Text style={styles.guidelineItem}>• 3-20 characters long</Text>
          <Text style={styles.guidelineItem}>• Letters, numbers, and underscores only</Text>
          <Text style={styles.guidelineItem}>• Must be unique</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            (!isAvailable || loading) && styles.saveButtonDisabled
          ]}
          onPress={handleSaveUsername}
          disabled={!isAvailable || loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Continue to DoughJo'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
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
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
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
  checkIcon: {
    marginLeft: SPACING.sm,
  },
  statusText: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  guidelines: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  guidelinesTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.md,
    color: Colors.text.primary,
    marginBottom: SPACING.sm,
  },
  guidelineItem: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.sm,
    color: Colors.text.secondary,
    marginBottom: SPACING.xs,
  },
  saveButton: {
    backgroundColor: Colors.accent.teal,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.md,
    color: Colors.background.primary,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  skipButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.md,
    color: Colors.text.tertiary,
  },
});