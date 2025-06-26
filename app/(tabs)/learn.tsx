import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, Dimensions } from 'react-native';
import Colors from '@/constants/Colors';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '@/constants/Theme';
import { X, Heart, Trophy, RotateCcw, ArrowRight, Flame } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useSound } from '@/hooks/useSound';
import { DoughJoLoadingScreen } from '@/components/DoughJoLoadingScreen';
import { LessonCompleteModal } from '@/components/LessonCompleteModal';
import Animated, { FadeIn, FadeOut, BounceIn, withSpring, useSharedValue, useAnimatedStyle } from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  content: {
    type: string;
    xpReward: number;
    questions: Question[];
  };
  estimated_time: number;
}

export default function LearnScreen() {
  const { profile, updateProfile } = useAuth();
  const { playSound } = useSound();
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [hearts, setHearts] = useState(5);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [lessonComplete, setLessonComplete] = useState(false);
  const [xpGained, setXpGained] = useState(0);
  const [streakGained, setStreakGained] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Animation values
  const progressWidth = useSharedValue(0);
  const heartScale = useSharedValue(1);

  useEffect(() => {
    // Don't load lesson immediately, wait for loading screen
  }, []);

  const handleLoadingComplete = () => {
    setShowLoadingScreen(false);
    loadRandomLesson();
  };

  useEffect(() => {
    if (currentLesson && currentLesson.content.questions) {
      const progress = ((currentQuestionIndex + 1) / currentLesson.content.questions.length) * 100;
      progressWidth.value = withSpring(progress);
    }
  }, [currentQuestionIndex, currentLesson]);

  const loadRandomLesson = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Starting to load lesson...');
      
      // Since API routes aren't working in web preview, use direct Supabase connection
      const { supabase } = await import('@/lib/supabase');
      
      const { data: lessons, error } = await supabase
        .from('lessons')
        .select('*')
        .order('order_index');
      
      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }
      
      if (lessons.length === 0) {
        throw new Error('No lessons available');
      }
      
      // Select a random lesson
      const randomLesson = lessons[Math.floor(Math.random() * lessons.length)];
      console.log('Selected lesson:', randomLesson);
      
      // Validate lesson structure
      if (!randomLesson.content || !randomLesson.content.questions || randomLesson.content.questions.length === 0) {
        throw new Error('Invalid lesson structure - no questions found');
      }
      
      setCurrentLesson(randomLesson);
    } catch (error) {
      console.error('Failed to load lesson:', error);
      setError(error instanceof Error ? error.message : 'Failed to load lesson content');
    } finally {
      setLoading(false);
    }
  };

  const updateUserProgress = async (lessonId: string, completed: boolean, score: number) => {
    if (!profile?.id) {
      console.error('No user profile found');
      return;
    }
    
    try {
      // Use direct Supabase connection instead of API route
      const { supabase } = await import('@/lib/supabase');
      
      // Check if progress already exists
      const { data: existingProgress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', profile.id)
        .eq('lesson_id', lessonId)
        .single();

      let result;
      
      if (existingProgress) {
        // Update existing progress
        const { data: updatedProgress, error } = await supabase
          .from('user_progress')
          .update({
            completed,
            progress: completed ? 1.0 : (score / 15), // Assuming 15 questions per lesson
            time_spent: existingProgress.time_spent + 300, // Add 5 minutes per attempt
            completed_at: completed ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', profile.id)
          .eq('lesson_id', lessonId)
          .select()
          .single();

        if (error) {
          throw error;
        }
        result = updatedProgress;
      } else {
        // Create new progress record
        const { data: newProgress, error } = await supabase
          .from('user_progress')
          .insert([{
            user_id: profile.id,
            lesson_id: lessonId,
            completed,
            progress: completed ? 1.0 : (score / 15),
            time_spent: 300, // 5 minutes for first attempt
            completed_at: completed ? new Date().toISOString() : null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) {
          throw error;
        }
        result = newProgress;
      }
      
      console.log('Progress updated successfully:', result);
      return result;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Failed to update progress:', error.message);
      } else {
        console.error('Failed to update progress:', error);
      }
      return null;
    }
  };

  const currentQuestion = currentLesson?.content.questions[currentQuestionIndex];
  const totalQuestions = currentLesson?.content.questions.length || 0;

  const animatedProgressStyle = useAnimatedStyle(() => {
    return {
      width: `${progressWidth.value}%`,
    };
  });

  const animatedHeartStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: heartScale.value }],
    };
  });

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null || !currentQuestion) return;
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    
    // Play sound effect
    playSound(isCorrect ? 'correct' : 'incorrect');
    
    if (isCorrect) {
      setScore(score + 1);
    } else {
      const newHearts = hearts - 1;
      setHearts(newHearts);
      heartScale.value = withSpring(1.2, {}, () => {
        heartScale.value = withSpring(1);
      });
    }
  };

  const handleContinue = async () => {
    if (!currentLesson) return;

    if (currentQuestionIndex < currentLesson.content.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setShowExplanation(false);
    } else {
      // Lesson complete
      const earnedXP = currentLesson.content.xpReward;
      const completionPercentage = (score / currentLesson.content.questions.length) * 100;
      
      setXpGained(earnedXP);
      setLessonComplete(true);
      
      // Check if this gives a streak (simplified - in real app, check if it's first lesson today)
      const shouldGainStreak = completionPercentage >= 60; // 60% or better
      setStreakGained(shouldGainStreak);
      
      // Update user profile with XP and potentially streak
      if (profile) {
        const updates: any = {
          dough_coins: profile.dough_coins + earnedXP,
          total_lessons_completed: profile.total_lessons_completed + 1
        };
        
        if (shouldGainStreak) {
          updates.streak_days = profile.streak_days + 1;
          updates.longest_streak = Math.max(profile.longest_streak, profile.streak_days + 1);
        }
        
        await updateProfile(updates);
      }

      // Update progress in backend
      await updateUserProgress(currentLesson.id, true, score);
    }
  };

  const handleRetry = () => {
    if (hearts <= 0) {
      // Reset lesson
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setShowResult(false);
      setShowExplanation(false);
      setHearts(5);
      setScore(0);
    } else {
      // Just continue to next question
      handleContinue();
    }
  };

  const handleExit = () => {
    Alert.alert(
      'Exit Lesson',
      'Are you sure you want to exit? Your progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Exit', 
          style: 'destructive',
          onPress: () => router.back()
        }
      ]
    );
  };

  const resetLesson = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setShowExplanation(false);
    setHearts(5);
    setScore(0);
    setLessonComplete(false);
    setXpGained(0);
    setStreakGained(false);
  };

  const startNewLesson = () => {
    setLessonComplete(false);
    resetLesson();
    loadRandomLesson();
  };

  // Show loading screen first
  if (showLoadingScreen) {
    return (
      <DoughJoLoadingScreen 
        onLoadingComplete={handleLoadingComplete}
        showRetryAfter={5000}
      />
    );
  }

  if (loading) {
    return (
      <DoughJoLoadingScreen 
        onLoadingComplete={handleLoadingComplete}
        showRetryAfter={3000}
      />
    );
  }

  if (error) {
    return (
      <DoughJoLoadingScreen 
        onLoadingComplete={handleLoadingComplete}
        showRetryAfter={2000}
      />
    );
  }
  
  if (!currentLesson || !currentQuestion) {
    return (
      <DoughJoLoadingScreen 
        onLoadingComplete={handleLoadingComplete}
        showRetryAfter={3000}
      />
    );
  }

  if (hearts <= 0 && !lessonComplete) {
    return (
      <View style={styles.container}>
        <View style={styles.gameOverContainer}>
          <Text style={styles.gameOverTitle}>Out of Hearts!</Text>
          <Text style={styles.gameOverSubtitle}>Don't worry, you can try again</Text>
          
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>Questions Answered: {currentQuestionIndex + 1}</Text>
            <Text style={styles.statsText}>Correct Answers: {score}</Text>
            <Text style={styles.statsText}>Accuracy: {Math.round((score / (currentQuestionIndex + 1)) * 100)}%</Text>
          </View>
          
          <TouchableOpacity style={styles.retryButton} onPress={resetLesson}>
            <RotateCcw color={Colors.background.primary} size={20} />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.exitButton} onPress={() => router.back()}>
            <Text style={styles.exitButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.exitBtn} onPress={handleExit}>
          <X color={Colors.text.primary} size={24} />
        </TouchableOpacity>
        
        {/* Topic Header */}
        <View style={styles.topicHeader}>
          <Text style={styles.topicTitle}>{currentLesson.category}</Text>
          <Text style={styles.topicSubtitle}>{currentLesson.title}</Text>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[styles.progressFill, animatedProgressStyle]}
            />
          </View>
          <Text style={styles.progressText}>
            {currentQuestionIndex + 1} of {totalQuestions}
          </Text>
        </View>
        
        <Animated.View style={[styles.heartsContainer, animatedHeartStyle]}>
          <Heart
            size={24}
            color={Colors.accent.red}
            fill={Colors.accent.red}
          />
          <Text style={styles.heartsText}>{hearts}</Text>
        </Animated.View>
      </View>

      {/* Question */}
      <View style={styles.questionContainer}>
        <Animated.Text 
          key={currentQuestion.id}
          entering={FadeIn.duration(400)}
          style={styles.questionText}
        >
          {currentQuestion.question}
        </Animated.Text>
        
        {currentQuestion.category && (
          <View style={styles.questionCategoryBadge}>
            <Text style={styles.questionCategoryText}>{currentQuestion.category}</Text>
          </View>
        )}
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((option, index) => {
          let optionStyle = styles.option;
          let textStyle = styles.optionText;
          
          if (showResult) {
            if (index === currentQuestion.correctAnswer) {
              optionStyle = { ...styles.option, ...styles.correctOption };
              textStyle = { ...styles.optionText, ...styles.correctOptionText, fontWeight: "500" };
            } else if (selectedAnswer === index) {
              optionStyle = { ...styles.option, ...styles.incorrectOption };
              textStyle = { ...styles.optionText, ...styles.incorrectOptionText, fontWeight: "500" };
            }
          } else if (selectedAnswer === index) {
            optionStyle = { ...styles.option, ...styles.selectedOption };
          }
          
          return (
            <Animated.View
              key={index}
              entering={FadeIn.delay(index * 100).duration(300)}
            >
              <TouchableOpacity
                style={optionStyle}
                onPress={() => handleAnswerSelect(index)}
                disabled={selectedAnswer !== null}
              >
                <Text style={textStyle}>{option}</Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      {/* Explanation */}
      {showExplanation && currentQuestion.explanation && (
        <Animated.View 
          entering={FadeIn.duration(400)}
          style={styles.explanationContainer}
        >
          <Text style={styles.explanationTitle}>
            {selectedAnswer === currentQuestion.correctAnswer ? 'Correct! 🎉' : 'Not quite right 💡'}
          </Text>
          <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
        </Animated.View>
      )}

      {/* Bottom Button */}
      {showResult && (
        <Animated.View 
          entering={FadeIn.duration(400)}
          style={styles.bottomContainer}
        >
          {!showExplanation ? (
            <TouchableOpacity 
              style={styles.continueButton} 
              onPress={() => setShowExplanation(true)}
            >
              <Text style={styles.continueButtonText}>
                {selectedAnswer === currentQuestion.correctAnswer ? 'See Explanation' : 'Show Explanation'}
              </Text>
              <ArrowRight color={Colors.background.primary} size={20} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.continueButton} 
              onPress={handleContinue}
            >
              <Text style={styles.continueButtonText}>
                {currentQuestionIndex < currentLesson.content.questions.length - 1 ? 'Continue' : 'Finish Lesson'}
              </Text>
              <ArrowRight color={Colors.background.primary} size={20} />
            </TouchableOpacity>
          )}
        </Animated.View>
      )}

      {/* Lesson Complete Modal */}
      <LessonCompleteModal
        visible={lessonComplete}
        score={score}
        totalQuestions={totalQuestions}
        xpGained={xpGained}
        streakGained={streakGained}
        onNewLesson={startNewLesson}
        onClose={() => {
          setLessonComplete(false);
          router.back();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.lg,
    color: Colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    padding: SPACING.xl,
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.lg,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    backgroundColor: Colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.tertiary,
  },
  exitBtn: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: Colors.background.tertiary,
  },
  topicHeader: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: SPACING.md,
  },
  topicTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.lg,
    color: Colors.accent.teal,
    marginBottom: SPACING.xs,
  },
  topicSubtitle: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  progressContainer: {
    alignItems: 'center',
    minWidth: 100,
  },
  progressBar: {
    width: 80,
    height: 8,
    backgroundColor: Colors.background.tertiary,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent.teal,
    borderRadius: BORDER_RADIUS.full,
  },
  progressText: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.xs,
    color: Colors.text.tertiary,
  },
  heartsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: Colors.background.tertiary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  heartsText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.md,
    color: Colors.accent.red,
  },
  questionContainer: {
    padding: SPACING.lg,
    paddingVertical: SPACING.xl,
    minHeight: 160,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
  },
  questionText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.lg,
    color: Colors.text.primary,
    textAlign: 'center',
    lineHeight: FONT_SIZE.lg * 1.5,
    marginBottom: SPACING.md,
  },
  questionCategoryBadge: {
    backgroundColor: Colors.accent.magenta + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  questionCategoryText: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.sm,
    color: Colors.accent.magenta,
  },
  optionsContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    marginBottom: 120, // Space for fixed continue button
  },
  option: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 50,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedOption: {
    borderColor: Colors.accent.teal,
    backgroundColor: Colors.accent.teal + '20',
    transform: [{ scale: 0.98 }],
  },
  correctOption: {
    backgroundColor: Colors.accent.green,
    borderColor: Colors.accent.green,
    shadowColor: Colors.accent.green,
    shadowOpacity: 0.3,
  },
  incorrectOption: {
    backgroundColor: Colors.accent.red,
    borderColor: Colors.accent.red,
    shadowColor: Colors.accent.red,
    shadowOpacity: 0.3,
  },
  optionText: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.sm,
    color: Colors.text.primary,
    textAlign: 'center',
    lineHeight: FONT_SIZE.sm * 1.4,
    fontWeight: '500',
  },
  correctOptionText: {
    color: Colors.background.primary,
    fontWeight: '600',
  },
  incorrectOptionText: {
    color: Colors.background.primary,
    fontWeight: '600',
  },
  explanationContainer: {
    margin: SPACING.lg,
    marginBottom: 120, // Space for fixed continue button
    padding: SPACING.lg,
    backgroundColor: Colors.background.secondary,
    borderRadius: BORDER_RADIUS.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent.teal,
  },
  explanationTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.lg,
    color: Colors.text.primary,
    marginBottom: SPACING.sm,
  },
  explanationText: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.secondary,
    lineHeight: FONT_SIZE.md * 1.4,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    backgroundColor: Colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: Colors.background.secondary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  continueButton: {
    backgroundColor: Colors.accent.teal,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    minHeight: 52,
    shadowColor: Colors.accent.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.md,
    color: Colors.background.primary,
    fontWeight: '700',
  },
  gameOverContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  gameOverTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.xxxl,
    color: Colors.text.primary,
    marginBottom: SPACING.sm,
  },
  gameOverSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.lg,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  statsContainer: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    width: '100%',
  },
  statsText: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.md,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  retryButton: {
    backgroundColor: Colors.accent.teal,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    minHeight: 56,
  },
  retryButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.lg,
    color: Colors.background.primary,
  },
  exitButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  exitButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.md,
    color: Colors.text.tertiary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
  },
  trophyContainer: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: Colors.accent.yellow + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  completeTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.xl,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  completeSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  accuracyText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.lg,
    color: Colors.accent.teal,
    marginBottom: SPACING.xl,
  },
  rewardsContainer: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  xpContainer: {
    backgroundColor: Colors.accent.teal + '20',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    flex: 1,
  },
  xpText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.xxl,
    color: Colors.accent.teal,
    marginBottom: SPACING.xs,
  },
  xpSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.sm,
    color: Colors.text.secondary,
  },
  streakContainer: {
    backgroundColor: Colors.accent.orange + '20',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    flex: 1,
  },
  streakText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.md,
    color: Colors.accent.orange,
    marginTop: SPACING.xs,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
  },
  newLessonButton: {
    backgroundColor: Colors.accent.magenta,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    flex: 1,
    alignItems: 'center',
    minHeight: 56,
  },
  newLessonButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.md,
    color: Colors.background.primary,
  },
  doneButton: {
    backgroundColor: Colors.accent.teal,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    flex: 1,
    alignItems: 'center',
    minHeight: 56,
  },
  doneButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.md,
    color: Colors.background.primary,
  },
});