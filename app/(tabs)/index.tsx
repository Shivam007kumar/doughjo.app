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
import { fetchDailyQuiz, completeDailyQuiz } from '@/lib/dailyQuiz';

// Define Quiz type for dailyQuizzes
type Quiz = {
  id: string;
  title: string;
  question: string;
  options: string[];
  correctAnswer: number;
  reward: number;
  difficulty: string;
  category: string;
};

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const { profile, refreshProfile, updateProfile } = useAuth();
  const { refreshQuizzes } = useDailyQuiz();
  const [currentBelt, setCurrentBelt] = useState('yellow');
  const [lessonProgress, setLessonProgress] = useState<{[key: string]: {completed: number, total: number}}>({});
  const [actualLessons, setActualLessons] = useState<any[]>([]);
  const isRefreshing = useRef(false);
  const [dailyQuizzes, setDailyQuizzes] = useState<Quiz[]>([]);
  const [uncompletedLessons, setUncompletedLessons] = useState<any[]>([]);
  const [showDailyQuiz, setShowDailyQuiz] = useState(false);
  const [dailyQuizData, setDailyQuizData] = useState<any>(null);
  const [dailyQuizLoading, setDailyQuizLoading] = useState(false);
  const [dailyQuizCompleted, setDailyQuizCompleted] = useState(false);
  const [dailyQuizAlreadyCompleted, setDailyQuizAlreadyCompleted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState(false);
  
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

  useEffect(() => {
    const fetchQuizzes = async () => {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .limit(3); // or whatever number you want

      if (error) {
        console.error('Failed to fetch quizzes:', error);
        setDailyQuizzes([]);
      } else {
        setDailyQuizzes(
          data.map(q => ({
            id: q.id,
            title: q.title,
            question: q.question,
            options: q.options,
            correctAnswer: q.correct_answer,
            reward: q.reward,
            difficulty: q.difficulty,
            category: q.category,
          }))
        );
      }
    };

    fetchQuizzes();
  }, []);

  useEffect(() => {
    const fetchUncompletedLessons = async () => {
      if (!profile?.id) return;

      // Fetch all lessons
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .order('order_index');

      if (lessonsError) {
        console.error('Error fetching lessons:', lessonsError);
        setUncompletedLessons([]);
        return;
      }

      // Fetch user's completed lessons
      const { data: userProgress, error: progressError } = await supabase
        .from('user_progress')
        .select('lesson_id, completed')
        .eq('user_id', profile.id)
        .eq('completed', true);

      if (progressError) {
        console.error('Error fetching user progress:', progressError);
        setUncompletedLessons([]);
        return;
      }

      const completedLessonIds = userProgress?.map(up => up.lesson_id) || [];
      // Filter out completed lessons and take top 3
      const uncompleted = lessons.filter(l => !completedLessonIds.includes(l.id)).slice(0, 3);
      setUncompletedLessons(uncompleted);
    };
    fetchUncompletedLessons();
  }, [profile?.id]);

  // Handler for tapping a daily quiz card
  const handleDailyQuizPress = async () => {
    if (!profile?.id) return;
    setDailyQuizLoading(true);
    try {
      const result = await fetchDailyQuiz(profile.id);
      if (result.alreadyCompleted) {
        setDailyQuizAlreadyCompleted(true);
        setDailyQuizData(null);
      } else {
        setDailyQuizData(result.quiz);
        setDailyQuizAlreadyCompleted(false);
      }
      setShowDailyQuiz(true);
    } catch (e) {
      setDailyQuizData(null);
      setDailyQuizAlreadyCompleted(false);
      setShowDailyQuiz(true);
    } finally {
      setDailyQuizLoading(false);
    }
  };

  // Handler for answering the quiz
  const handleDailyQuizAnswer = async (idx: number) => {
    if (!dailyQuizData || selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    const question = dailyQuizData.questions[0];
    const correct = idx === question.correctAnswer;
    setQuizCorrect(correct);
    setShowQuizResult(true);
    if (correct && profile?.id) {
      await completeDailyQuiz({
        userId: profile.id,
        lessonId: dailyQuizData.id,
        correctAnswers: 1,
        totalQuestions: 1,
        coinsRewarded: dailyQuizData.reward || 15
      });
      setDailyQuizCompleted(true);
      refreshProfile();
    }
  };

  // Handler for closing the daily quiz modal
  const handleCloseDailyQuiz = () => {
    setShowDailyQuiz(false);
    setDailyQuizData(null);
    setSelectedAnswer(null);
    setShowQuizResult(false);
    setQuizCorrect(false);
    setDailyQuizCompleted(false);
    setDailyQuizAlreadyCompleted(false);
  };

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
                onPress={handleDailyQuizPress}
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
            {uncompletedLessons.map(lesson => (
              <LessonCard
                key={lesson.id}
                id={lesson.id}
                title={lesson.title}
                description={lesson.description}
                icon={<Wallet color={Colors.accent.teal} size={24} />}
                progress={0}
                lessons={1}
                completedLessons={0}
                belt={lesson.belt_required || 'white'}
                locked={false}
              />
            ))}
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

      {/* Daily Quiz Modal/Overlay */}
      {showDailyQuiz && (
        <View style={styles.dailyQuizOverlay}>
          <View style={styles.dailyQuizModal}>
            {dailyQuizLoading ? (
              <Text>Loading...</Text>
            ) : dailyQuizAlreadyCompleted ? (
              <>
                <Text style={styles.dailyQuizTitle}>You've already completed today's quiz!</Text>
                <TouchableOpacity style={styles.dailyQuizButton} onPress={handleCloseDailyQuiz}>
                  <Text style={styles.dailyQuizButtonText}>Go Home</Text>
                </TouchableOpacity>
              </>
            ) : dailyQuizData ? (
              <>
                <Text style={styles.dailyQuizTitle}>{dailyQuizData.title}</Text>
                <Text style={styles.dailyQuizQuestion}>{dailyQuizData.questions[0].question}</Text>
                {dailyQuizData.questions[0].options.map((opt: string, idx: number) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.dailyQuizOption, selectedAnswer === idx && (quizCorrect ? styles.dailyQuizOptionCorrect : styles.dailyQuizOptionWrong)]}
                    onPress={() => handleDailyQuizAnswer(idx)}
                    disabled={selectedAnswer !== null}
                  >
                    <Text style={styles.dailyQuizOptionText}>{opt}</Text>
                  </TouchableOpacity>
                ))}
                {showQuizResult && (
                  <TouchableOpacity style={styles.dailyQuizButton} onPress={handleCloseDailyQuiz}>
                    <Text style={styles.dailyQuizButtonText}>Go Home</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <>
                <Text style={styles.dailyQuizTitle}>No quiz available today.</Text>
                <TouchableOpacity style={styles.dailyQuizButton} onPress={handleCloseDailyQuiz}>
                  <Text style={styles.dailyQuizButtonText}>Go Home</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      )}
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
  dailyQuizOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dailyQuizModal: {
    backgroundColor: Colors.background.primary,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    width: '80%',
    maxHeight: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dailyQuizTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.xl,
    color: Colors.text.primary,
    marginBottom: SPACING.md,
  },
  dailyQuizQuestion: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.primary,
    marginBottom: SPACING.md,
  },
  dailyQuizOption: {
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: Colors.accent.yellow,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.md,
  },
  dailyQuizOptionCorrect: {
    borderColor: Colors.accent.green,
  },
  dailyQuizOptionWrong: {
    borderColor: Colors.accent.red,
  },
  dailyQuizOptionText: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.primary,
  },
  dailyQuizButton: {
    padding: SPACING.md,
    backgroundColor: Colors.accent.yellow,
    borderRadius: BORDER_RADIUS.full,
  },
  dailyQuizButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.md,
    color: Colors.background.primary,
  },
});