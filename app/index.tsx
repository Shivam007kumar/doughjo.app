import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/Colors';

export default function IndexScreen() {
  const { session, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (session && profile) {
        // Check if user needs to set up username
        if (!profile.username) {
          router.replace('/(auth)/username-setup');
        } else {
          router.replace('/(tabs)');
        }
      } else if (session && !profile) {
        // Profile is still loading, wait a bit more
        return;
      } else {
        router.replace('/onboarding');
      }
    }
  }, [session, profile, loading]);

  return (
    <View style={styles.container}>
      {/* Loading screen or splash */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
});