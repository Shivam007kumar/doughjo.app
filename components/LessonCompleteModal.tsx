import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image } from 'react-native';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '@/constants/Theme';
import { Trophy, Flame, Star, Sparkles } from 'lucide-react-native';
import Animated, { BounceIn, FadeIn, SlideInUp } from 'react-native-reanimated';

interface LessonCompleteModalProps {
  visible: boolean;
  score: number;
  totalQuestions: number;
  xpGained: number;
  streakGained: boolean;
  onNewLesson: () => void;
  onClose: () => void;
}

export function LessonCompleteModal({
  visible,
  score,
  totalQuestions,
  xpGained,
  streakGained,
  onNewLesson,
  onClose
}: LessonCompleteModalProps) {
  const accuracy = Math.round((score / totalQuestions) * 100);
  const isExcellent = accuracy >= 80;
  const isGood = accuracy >= 60;

  const getPerformanceMessage = () => {
    if (isExcellent) return "🎌 Excellent work, Sensei!";
    if (isGood) return "🥋 Well done, Student!";
    return "📚 Keep practicing!";
  };

  const getPerformanceColor = () => {
    if (isExcellent) return Colors.accent.yellow;
    if (isGood) return Colors.accent.teal;
    return Colors.accent.magenta;
  };

  const handleContinueJourney = () => {
    onClose();
    // Small delay to ensure modal closes before navigation
    setTimeout(() => {
      router.replace('/(tabs)');
    }, 100);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View entering={BounceIn.duration(800)} style={styles.completeModal}>
          {/* Celebration Header */}
          <View style={styles.celebrationHeader}>
            <Animated.View entering={FadeIn.delay(200)} style={styles.sparkleContainer}>
              <Sparkles color={Colors.accent.yellow} size={24} />
            </Animated.View>
            <Animated.View entering={BounceIn.delay(400)} style={[styles.trophyContainer, { backgroundColor: getPerformanceColor() + '20' }]}>
              <Trophy color={getPerformanceColor()} size={48} />
            </Animated.View>
            <Animated.View entering={FadeIn.delay(600)} style={styles.sparkleContainer}>
              <Sparkles color={Colors.accent.yellow} size={24} />
            </Animated.View>
          </View>
          
          {/* Performance Message */}
          <Animated.Text entering={SlideInUp.delay(300)} style={[styles.performanceMessage, { color: getPerformanceColor() }]}>
            {getPerformanceMessage()}
          </Animated.Text>
          
          {/* Main Title */}
          <Animated.Text entering={SlideInUp.delay(400)} style={styles.completeTitle}>
            Lesson Complete!
          </Animated.Text>
          
          {/* Stats Container */}
          <Animated.View entering={SlideInUp.delay(500)} style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{score}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{totalQuestions}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: getPerformanceColor() }]}>{accuracy}%</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
          </Animated.View>
          
          {/* Rewards Section */}
          <Animated.View entering={SlideInUp.delay(600)} style={styles.rewardsContainer}>
            <Text style={styles.rewardsTitle}>Rewards Earned</Text>
            
            <View style={styles.rewardsList}>
              {/* Dough Coins Reward */}
              <View style={styles.rewardItem}>
                <View style={styles.rewardIconContainer}>
                  <Image 
                    source={require('@/assets/images/coin.png')} 
                    style={styles.coinIcon} 
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.rewardTextContainer}>
                  <Text style={styles.rewardAmount}>+{xpGained}</Text>
                  <Text style={styles.rewardLabel}>Dough Coins</Text>
                </View>
              </View>
              
              {/* Streak Reward */}
              {streakGained && (
                <View style={styles.rewardItem}>
                  <View style={[styles.rewardIconContainer, { backgroundColor: Colors.accent.orange + '20' }]}>
                    <Flame color={Colors.accent.orange} size={24} />
                  </View>
                  <View style={styles.rewardTextContainer}>
                    <Text style={styles.rewardAmount}>+1</Text>
                    <Text style={styles.rewardLabel}>Day Streak</Text>
                  </View>
                </View>
              )}
              
              {/* Experience Reward */}
              <View style={styles.rewardItem}>
                <View style={[styles.rewardIconContainer, { backgroundColor: Colors.accent.magenta + '20' }]}>
                  <Star color={Colors.accent.magenta} size={24} />
                </View>
                <View style={styles.rewardTextContainer}>
                  <Text style={styles.rewardAmount}>+1</Text>
                  <Text style={styles.rewardLabel}>Lesson</Text>
                </View>
              </View>
            </View>
          </Animated.View>
          
          {/* Action Buttons */}
          <Animated.View entering={SlideInUp.delay(700)} style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onNewLesson}
            >
              <Text style={styles.secondaryButtonText}>New Lesson</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: getPerformanceColor() }]}
              onPress={handleContinueJourney}
            >
              <Text style={styles.primaryButtonText}>Continue Journey</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  completeModal: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: Colors.accent.teal + '30',
  },
  celebrationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  sparkleContainer: {
    marginHorizontal: SPACING.lg,
  },
  trophyContainer: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.accent.yellow + '50',
  },
  performanceMessage: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.lg,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  completeTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.xxl,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.background.tertiary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.xxl,
    color: Colors.text.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.sm,
    color: Colors.text.secondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.card.border,
    marginHorizontal: SPACING.md,
  },
  rewardsContainer: {
    width: '100%',
    marginBottom: SPACING.xl,
  },
  rewardsTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.lg,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  rewardsList: {
    gap: SPACING.md,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.tertiary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  rewardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: Colors.accent.yellow + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  coinIcon: {
    width: 24,
    height: 24,
  },
  rewardTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rewardAmount: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.lg,
    color: Colors.text.primary,
  },
  rewardLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.secondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
  },
  primaryButton: {
    flex: 2,
    backgroundColor: Colors.accent.teal,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.md,
    color: Colors.background.primary,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: Colors.background.tertiary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.card.border,
  },
  secondaryButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.md,
    color: Colors.text.primary,
  },
});