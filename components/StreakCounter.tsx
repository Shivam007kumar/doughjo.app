import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '@/constants/Theme';
import { Flame } from 'lucide-react-native';

type StreakCounterProps = {
  days: number;
};

export const StreakCounter = ({ days }: StreakCounterProps) => {
  return (
    <View style={styles.container}>
      <Flame color={Colors.accent.orange} size={18} />
      <Text style={styles.text}>{days}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  text: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.md,
    color: Colors.accent.orange,
    marginLeft: SPACING.xs,
  },
});