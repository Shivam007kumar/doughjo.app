import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, useWindowDimensions, Pressable, Linking, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';
import { SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS } from '@/constants/Theme';
import { Lock, Check, TrendingUp, PiggyBank, CreditCard, Wallet, BadgeDollarSign, ChartLine as LineChart, Brain, Trophy, Star } from 'lucide-react-native';
import { useEffect, useCallback } from 'react';
import { StreakCounter } from '@/components/StreakCounter';
import { LessonCard } from '@/components/LessonCard';
import { SenseiDashboard } from '@/components/Sensei';
import { QuizCard } from '@/components/QuizCard';
import { useAuth } from '@/contexts/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { useDailyQuiz } from '@/hooks/useDailyQuiz';
import { supabase } from '@/lib/supabase';
import { useRef } from 'react';

const dailyQuizzes = [
  {
    id: 'quiz-1',
    title: 'Emergency Fund Basics',
    question: 'How many months of expenses should you save in an emergency fund?',
    options: ['1-2 months', '3-6 months', '7-9 months', '10+ months'],
    correctAnswer: 1,
    reward: 20,
    difficulty: 'Easy',
    category: 'Saving'
  },
  {
    id: 'quiz-2',
    title: 'Credit Score Knowledge',
    question: 'What is considered a good credit score range?',
    options: ['300-579', '580-669', '670-739', '740-850'],
    correctAnswer: 3,
    reward: 25,
    difficulty: 'Medium',
    category: 'Credit'
  },
  {
    id: 'quiz-3',
    title: 'Budgeting Rule',
    question: 'In the 50/30/20 rule, what percentage goes to savings?',
    options: ['50%', '30%', '20%', '10%'],
    correctAnswer: 2,
    reward: 15,
    difficulty: 'Easy',
    category: 'Budgeting'
  }
];

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const { profile, refreshProfile, updateProfile } = useAuth();
  const { refreshQuizzes } = useDailyQuiz();
  const [currentBelt, setCurrentBelt] = useState('yellow');
  const [lessonProgress, setLessonProgress] = useState<{[key: string]: {completed: number, total: number}}>({});
  const [actualLessons, setActualLessons] = useState<any[]>([]);
  const isRefreshing = useRef(false);
  
  // Use real profile data or defaults
  const streakDays = profile?.streak_days || 0;
  const doughCoins = profile?.dough_coins || 0;
  
  // Fetch lesson progress data
  const fetchLessonProgress = useCallback(async () => {
    if (!profile?.id || isRefreshing.current) return;
    
    isRefreshing.current = true;
    
    try {
      // Get all lessons grouped by category
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('id, title, category, difficulty')
        .order('order_index');
      
      if (lessonsError) {
        console.error('Error fetching lessons:', lessonsError);
        return;
      }
      
      setActualLessons(lessons || []);
      
      // Get user's completed lessons
      const { data: userProgress, error: progressError } = await supabase
        .from('user_progress')
        .select('lesson_id, completed')
        .eq('user_id', profile.id)
        .eq('completed', true);
      
      if (progressError) {
        console.error('Error fetching user progress:', progressError);
        return;
      }
      
      // Group lessons by category and calculate progress
      const progressByCategory: {[key: string]: {completed: number, total: number}} = {};
      
      // Count total lessons per category
      lessons?.forEach(lesson => {
        if (!progressByCategory[lesson.category]) {
          progressByCategory[lesson.category] = { completed: 0, total: 0 };
        }
        progressByCategory[lesson.category].total++;
      });
      
      // Count completed lessons per category
      userProgress?.forEach(progress => {
        const lesson = lessons?.find(l => l.id === progress.lesson_id);
        if (lesson && progressByCategory[lesson.category]) {
          progressByCategory[lesson.category].completed++;
        }
      });
      
      setLessonProgress(progressByCategory);
      
    } catch (error) {
      console.error('Error fetching lesson progress:', error);
    } finally {
      isRefreshing.current = false;
    }
  }, [profile?.id]);
  
  // Refresh profile data when screen comes into focus (returning from lessons)
  const lastFocusTime = useRef(0);
  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      // Prevent rapid successive refreshes (debounce to 2 seconds)
      if (now - lastFocusTime.current < 2000) {
        return;
      }
      lastFocusTime.current = now;
      
      console.log('Home screen focused, refreshing profile and lesson progress');
      if (profile && !isRefreshing.current) {
        refreshProfile();
        refreshQuizzes();
        fetchLessonProgress();
      }
    }, [profile?.id, refreshProfile, fetchLessonProgress])
  );
  
  // Initial load of lesson progress
  useEffect(() => {
    if (profile?.id) {
      fetchLessonProgress();
    }
  }, [profile?.id, fetchLessonProgress]);
  
  // Get current time in India (IST, UTC+5:30)
  const greeting = useMemo(() => {
    const now = new Date();
    // Convert to IST (India Standard Time)
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const istOffset = 5.5 * 60 * 60000; // 5 hours 30 minutes in ms
    const istTime = new Date(utc + istOffset);
    const hour = istTime.getHours();
    if (hour < 12) return 'Good morning!';
    if (hour < 18) return 'Good afternoon!';
    return 'Good evening!';
  }, []);

  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with greeting, stats, and Bolt logo */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>{greeting}</Text>
              <Text style={styles.subGreeting}>Ready to level up{"\n"}your money skills?</Text>
            </View>
            <View style={styles.statsContainer}>
              <StreakCounter days={streakDays} />
              <View style={styles.coinsContainer}>
                <Image 
                  source={require('@/assets/images/coin.png')} 
                  style={styles.coinIcon} 
                  resizeMode="contain"
                />
                <Text style={styles.coinsText}>{doughCoins}</Text>
              </View>
            </View>
          </View>
          <Pressable
            style={styles.boltLogo}
            onPress={() => Linking.openURL('https://bolt.new/')}
            accessibilityRole="link"
            accessibilityLabel="Powered by Bolt. Visit bolt.new"
          >
            <Animated.Image
              source={require('@/assets/images/bolt-logo.png')}
              style={[styles.boltLogoImage, { transform: [{ rotate: spin }] }]}
              resizeMode="contain"
            />
          </Pressable>
        </View>
        
        {/* Sensei section */}
        <View style={styles.senseiSection}>
          <SenseiDashboard style={styles.senseiImage} />
          <View style={styles.senseiMessageContainer}>
            <Text style={styles.senseiMessage}>
              "Train daily. Master your money."
            </Text>
          </View>
        </View>

        {/* Daily Quiz Section */}
        <View style={styles.quizSection}>
          <View style={styles.quizHeader}>
            <Brain color={Colors.accent.magenta} size={24} />
            <Text style={styles.sectionTitle}>Daily Quiz Challenge</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Test your knowledge and earn Dough Coins!</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quizScrollContainer}
          >
            {dailyQuizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
              />
            ))}
          </ScrollView>
        </View>
        
        {/* Skill Tree / Dojos */}
        <View style={styles.skillTreeContainer}>
          <View style={styles.skillTreeHeader}>
            <Trophy color={Colors.accent.yellow} size={24} />
            <Text style={styles.sectionTitle}>Your Financial Dojos</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Master each dojo to earn your black belt</Text>
          
          <View style={styles.lessonCardsContainer}>
            {/* Budgeting Dojo */}
            <LessonCard
              id={actualLessons.find(l => l.category === 'Budgeting')?.id || actualLessons.find(l => l.category === 'Finance Basics')?.id || 'budget-intro'}
              title="Budgeting Basics"
              description="Learn to create and stick to a budget"
              icon={<Wallet color={Colors.accent.teal} size={24} />}
              progress={lessonProgress['Budgeting'] ? lessonProgress['Budgeting'].completed / lessonProgress['Budgeting'].total : 
                       lessonProgress['Finance Basics'] ? lessonProgress['Finance Basics'].completed / lessonProgress['Finance Basics'].total : 0}
              lessons={lessonProgress['Budgeting']?.total || lessonProgress['Finance Basics']?.total || 1}
              completedLessons={lessonProgress['Budgeting']?.completed || lessonProgress['Finance Basics']?.completed || 0}
              belt="green"
              locked={false}
            />
            
            {/* Saving Dojo */}
            <LessonCard
              id={actualLessons.find(l => l.category === 'Saving')?.id || 'income-expenses'}
              title="Saving Sensei"
              description="Discover strategies to save money effectively"
              icon={<PiggyBank color={Colors.accent.teal} size={24} />}
              progress={lessonProgress['Saving'] ? lessonProgress['Saving'].completed / lessonProgress['Saving'].total : 0}
              lessons={lessonProgress['Saving']?.total || 1}
              completedLessons={lessonProgress['Saving']?.completed || 0}
              belt="yellow"
              locked={false}
            />
            
            {/* Credit Dojo */}
            <LessonCard
              id={actualLessons.find(l => l.category === 'Credit')?.id || 'fifty-thirty-twenty'}
              title="Credit Card Master"
              description="Use credit responsibly and build your score"
              icon={<CreditCard color={Colors.accent.teal} size={24} />}
              progress={lessonProgress['Credit'] ? lessonProgress['Credit'].completed / lessonProgress['Credit'].total : 0}
              lessons={lessonProgress['Credit']?.total || 1}
              completedLessons={lessonProgress['Credit']?.completed || 0}
              belt="white"
              locked={false}
            />
            
            {/* Investing Dojo - Locked */}
            <LessonCard
              id={actualLessons.find(l => l.category === 'Investing')?.id || 'tracking-expenses'}
              title="Investing 101"
              description="Start your journey into investing"
              icon={<TrendingUp color={Colors.text.tertiary} size={24} />}
              progress={lessonProgress['Investing'] ? lessonProgress['Investing'].completed / lessonProgress['Investing'].total : 0}
              lessons={lessonProgress['Investing']?.total || 1}
              completedLessons={lessonProgress['Investing']?.completed || 0}
              belt="white"
              locked={true}
            />
            
            {/* Taxes Dojo - Locked */}
            <LessonCard
              id={actualLessons.find(l => l.category === 'Emergency Planning')?.id || 'budget-challenge'}
              title="Tax Tactics"
              description="Understand taxes and maximize returns"
              icon={<BadgeDollarSign color={Colors.text.tertiary} size={24} />}
              progress={lessonProgress['Emergency Planning'] ? lessonProgress['Emergency Planning'].completed / lessonProgress['Emergency Planning'].total : 0}
              lessons={lessonProgress['Emergency Planning']?.total || 1}
              completedLessons={lessonProgress['Emergency Planning']?.completed || 0}
              belt="white"
              locked={true}
            />
            
            {/* Advanced Investing - Locked */}
            <LessonCard
              id="advanced-investing"
              title="Advanced Investing"
              description="Level up your investment strategies"
              icon={<LineChart color={Colors.text.tertiary} size={24} />}
              progress={0}
              lessons={1}
              completedLessons={0}
              belt="white"
              locked={true}
            />
          </View>
        </View>
        
        {/* Achievement Showcase */}
        <View style={styles.achievementContainer}>
          <View style={styles.achievementHeader}>
            <Star color={Colors.accent.yellow} size={24} />
            <Text style={styles.sectionTitle}>Recent Achievements</Text>
          </View>
          
          <View style={styles.achievementCard}>
            <View style={styles.achievementIcon}>
              <Trophy color={Colors.accent.yellow} size={20} />
            </View>
            <View style={styles.achievementTextContainer}>
              <Text style={styles.achievementTitle}>Quiz Master</Text>
              <Text style={styles.achievementDescription}>
                Completed 3 daily quizzes in a row!
              </Text>
            </View>
            <View style={styles.achievementReward}>
              <Image 
                source={require('@/assets/images/coin.png')} 
                style={styles.achievementCoin} 
                resizeMode="contain"
              />
              <Text style={styles.achievementRewardText}>+50</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  greetingContainer: {
    marginBottom: SPACING.md,
  },
  greeting: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.xl,
    color: Colors.text.primary,
  },
  subGreeting: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.secondary,
    marginTop: SPACING.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  coinIcon: {
    width: 24,
    height: 24,
    marginRight: SPACING.xs,
  },
  coinsText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.md,
    color: Colors.accent.yellow,
  },
  senseiSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    backgroundColor: Colors.background.secondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  senseiImage: {
    width: 120,
    height: 120,
    flexShrink: 0,
    marginRight: SPACING.lg,
  },
  senseiMessageContainer: {
    flex: 1,
    marginLeft: 0,
    backgroundColor: Colors.background.tertiary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
  },
  senseiMessage: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.md,
    color: Colors.text.primary,
    fontStyle: 'italic',
  },
  quizSection: {
    marginBottom: SPACING.xl,
  },
  quizHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  quizScrollContainer: {
    paddingHorizontal: SPACING.lg,
    paddingRight: SPACING.xl,
  },
  skillTreeContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  skillTreeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  lessonCardsContainer: {
    width: '100%',
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.xl,
    color: Colors.text.primary,
    marginLeft: SPACING.sm,
  },
  sectionSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.secondary,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  achievementContainer: {
    paddingHorizontal: SPACING.lg,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  achievementCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: Colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  achievementTextContainer: {
    flex: 1,
  },
  achievementTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.md,
    color: Colors.text.primary,
    marginBottom: SPACING.xs,
  },
  achievementDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.sm,
    color: Colors.text.secondary,
  },
  achievementReward: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 214, 0, 0.2)',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  achievementCoin: {
    width: 20,
    height: 20,
    marginRight: SPACING.xs,
  },
  achievementRewardText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.md,
    color: Colors.accent.yellow,
  },
  boltLogo: {
    marginLeft: SPACING.md,
    marginTop: 0,
  },
  boltLogoImage: {
    width: 70,
    height: 70,
  },
});