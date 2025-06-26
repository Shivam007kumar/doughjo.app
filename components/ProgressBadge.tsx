import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '@/constants/Theme';
import { Award, Flame, PiggyBank, Brain, TrendingUp, CreditCard } from 'lucide-react-native';

type ProgressBadgeProps = {
  name: string;
  icon: string;
  color: string;
  completed: boolean;
};

export const ProgressBadge = ({ name, icon, color, completed }: ProgressBadgeProps) => {
  const renderIcon = () => {
    const iconProps = {
      size: 24,
      color: completed ? color : Colors.text.tertiary,
    };
    
    switch (icon) {
      case 'award':
        return <Award {...iconProps} />;
      case 'flame':
        return <Flame {...iconProps} />;
      case 'piggy-bank':
        return <PiggyBank {...iconProps} />;
      case 'brain':
        return <Brain {...iconProps} />;
      case 'trending-up':
        return <TrendingUp {...iconProps} />;
      case 'credit-card':
        return <CreditCard {...iconProps} />;
      default:
        return <Award {...iconProps} />;
    }
  };

  return (
    <View style={styles.container}>
      <View 
        style={[
          styles.iconContainer,
          { backgroundColor: completed ? `${color}20` : Colors.background.tertiary }
        ]}
      >
        {renderIcon()}
      </View>
      <Text 
        style={[
          styles.name,
          { color: completed ? Colors.text.primary : Colors.text.tertiary }
        ]}
        numberOfLines={2}
      >
        {name}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '23%',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  name: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.xs,
    textAlign: 'center',
  },
});