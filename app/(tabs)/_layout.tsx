import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';
import { Scroll, User, PenTool } from 'lucide-react-native';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '@/constants/Theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { JapaneseIcon } from '@/components/JapaneseIcons';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          ...styles.tabBar,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 8, // Lift tabs up by 8px
          paddingTop: SPACING.sm, // Add top padding for better spacing
        },
        tabBarActiveTintColor: Colors.accent.teal,
        tabBarInactiveTintColor: Colors.text.tertiary,
        tabBarLabelStyle: styles.tabBarLabel,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <JapaneseIcon type="torii" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: ({ color, size }) => <Scroll size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="glossary"
        options={{
          title: 'Glossary',
          tabBarIcon: ({ color, size }) => <PenTool size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <JapaneseIcon type="helmet" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: Colors.card.border,
    paddingTop: SPACING.xs,
  },
  tabBarLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.xs,
  },
});