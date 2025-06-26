import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import Colors from '@/constants/Colors';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '@/constants/Theme';
import { ArrowLeft, Brain, Clock, Trophy, Star } from 'lucide-react-native';

export default function ChallengePage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <ArrowLeft color={Colors.text.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Challenge Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Challenge Info */}
        <View style={styles.challengeCard}>
          <View style={styles.challengeHeader}>
            <View style={styles.iconContainer}>
              <Brain color={Colors.accent.magenta} size={32} />
            </View>
            <View style={styles.challengeInfo}>
              <Text style={styles.challengeTitle}>Daily Quiz Challenge</Text>
              <Text style={styles.challengeId}>Challenge ID: {id}</Text>
            </View>
          </View>

          <Text style={styles.challengeDescription}>
            Test your financial knowledge with our daily quiz challenges. Each quiz is carefully crafted to help you learn important financial concepts while earning Dough Coins.
          </Text>

          {/* Challenge Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Clock color={Colors.accent.teal} size={20} />
              <Text style={styles.statLabel}>Duration</Text>
              <Text style={styles.statValue}>2-3 min</Text>
            </View>
            <View style={styles.statItem}>
              <Trophy color={Colors.accent.yellow} size={20} />
              <Text style={styles.statLabel}>Reward</Text>
              <Text style={styles.statValue}>15-25 coins</Text>
            </View>
            <View style={styles.statItem}>
              <Star color={Colors.accent.magenta} size={20} />
              <Text style={styles.statLabel}>Difficulty</Text>
              <Text style={styles.statValue}>Easy-Medium</Text>
            </View>
          </View>
        </View>

        {/* How It Works */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <View style={styles.stepsList}>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>Tap on a quiz card to start the challenge</Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>Read the question carefully and select your answer</Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>Get instant feedback and earn Dough Coins for correct answers</Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <Text style={styles.stepText}>Come back tomorrow for new challenges!</Text>
            </View>
          </View>
        </View>

        {/* Tips */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>💡 Pro Tips</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>• Complete all daily quizzes to maximize your coin earnings</Text>
            <Text style={styles.tipItem}>• Take your time to read each question carefully</Text>
            <Text style={styles.tipItem}>• Use the glossary to learn more about financial terms</Text>
            <Text style={styles.tipItem}>• Quizzes reset every day at midnight</Text>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.actionButton} onPress={handleGoBack}>
          <Text style={styles.actionButtonText}>Back to Challenges</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: Colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.card.border,
  },
  backButton: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: Colors.background.tertiary,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.lg,
    color: Colors.text.primary,
  },
  headerSpacer: {
    width: 40, // Same width as back button for centering
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  challengeCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: Colors.accent.magenta + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.xl,
    color: Colors.text.primary,
    marginBottom: SPACING.xs,
  },
  challengeId: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.sm,
    color: Colors.text.tertiary,
  },
  challengeDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.secondary,
    lineHeight: FONT_SIZE.md * 1.5,
    marginBottom: SPACING.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.sm,
    color: Colors.text.secondary,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.md,
    color: Colors.text.primary,
  },
  sectionCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.lg,
    color: Colors.text.primary,
    marginBottom: SPACING.md,
  },
  stepsList: {
    gap: SPACING.md,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: Colors.accent.teal,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    marginTop: 2,
  },
  stepNumberText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.sm,
    color: Colors.background.primary,
  },
  stepText: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.secondary,
    flex: 1,
    lineHeight: FONT_SIZE.md * 1.4,
  },
  tipsList: {
    gap: SPACING.sm,
  },
  tipItem: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.secondary,
    lineHeight: FONT_SIZE.md * 1.4,
  },
  actionButton: {
    backgroundColor: Colors.accent.teal,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.md,
    color: Colors.background.primary,
  },
});