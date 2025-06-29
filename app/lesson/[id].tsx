import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Dimensions, 
  TouchableOpacity, 
  Image,
  Animated,
  Alert,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import Colors from '@/constants/Colors';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '@/constants/Theme';
import { ArrowLeft, ArrowRight, BookOpen, Trophy, Star, Check, Circle, Flame, Award } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface LessonPage {
  id: string;
  type: 'intro' | 'content' | 'tip' | 'example' | 'summary';
  title: string;
  content: string;
  image?: string;
  highlight?: string;
  tip?: string;
  example?: {
    scenario: string;
    solution: string;
  };
}

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile, updateProfile, refreshProfile } = useAuth();
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBeltReward, setShowBeltReward] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [completedPages, setCompletedPages] = useState<Set<number>>(new Set());
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  
  // Quiz state management
  const [hearts, setHearts] = useState(3);
  const [showWrongAnswer, setShowWrongAnswer] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState<number | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [wrongAnswers, setWrongAnswers] = useState<Set<number>>(new Set());
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        console.error('Error fetching lesson:', error);
        setLesson(null);
      } else {
        setLesson(data);
      }
      setLoading(false);
    };
    fetchLesson();
  }, [id]);

  useEffect(() => {
    // Animate page entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentPage]);

  useEffect(() => {
    if (lesson?.content?.type === 'quiz_lesson') {
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setShowResult(false);
      setScore(0);
      setQuizCompleted(false);
    }
  }, [lesson]);

  const handlePageComplete = (pageIndex: number) => {
    const newCompleted = new Set(completedPages);
    newCompleted.add(pageIndex);
    setCompletedPages(newCompleted);

    // If all pages completed, show belt reward
    if (newCompleted.size === lesson.content.length) {
      handleLessonCompletion();
    }
  };
  
  const handleLessonCompletion = async () => {
    if (!profile || !id) return;
    
    console.log('Starting lesson completion for lesson:', id, 'user:', profile.id);
    
    try {
      // Record lesson completion in user_progress table
      // This will trigger the database functions to award coins and update streaks
      const { error } = await supabase
        .from('user_progress')
        .upsert([
          {
            user_id: profile.id,
            lesson_id: id,
            completed: true,
            progress: 1.0,
            time_spent: 300, // 5 minutes estimated
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ], {
          onConflict: 'user_id,lesson_id'
        });

      if (error) {
        console.error('Supabase error details:', error);
        Alert.alert('Error', JSON.stringify(error));
        return;
      }

      // Refresh profile to get updated coins and streak
      await refreshProfile();
      console.log('Profile refreshed after lesson completion');
      
      // Show completion modal
      setShowBeltReward(true);
      setShowConfetti(true);
      
    } catch (error) {
      console.error('Error completing lesson:', error);
      Alert.alert('Error', 'Failed to complete lesson');
    }
  };

  const goToNextPage = () => {
    if (currentPage < lesson.content.length - 1) {
      handlePageComplete(currentPage);
      setCurrentPage(currentPage + 1);
      scrollViewRef.current?.scrollTo({ x: (currentPage + 1) * screenWidth, animated: true });
    } else {
      handlePageComplete(currentPage);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      scrollViewRef.current?.scrollTo({ x: (currentPage - 1) * screenWidth, animated: true });
    }
  };

  // Render quiz lesson
  if (lesson.content?.type === 'quiz_lesson') {
    const questions = lesson.content.questions;
    const currentQuestion = questions[currentQuestionIndex];
    const totalQuestions = questions.length;
    const correctIdx = currentQuestion.correct_answer ?? currentQuestion.correctAnswer;

    // Move handlers here so they have access to correctIdx
    const handleAnswer = (idx: number) => {
      if (selectedAnswer === correctIdx) return; // Already correct, do nothing
      if (idx === correctIdx) {
        setSelectedAnswer(idx);
        setShowResult(true);
        setScore(score + 1);
      } else {
        setWrongAnswers(prev => new Set(prev).add(idx));
        setShowResult(true);
        // Do not set selectedAnswer, so user can try again
      }
    };

    const handleContinue = async () => {
      setWrongAnswers(new Set());
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setShowResult(false);
        setShowExplanation(false);
      } else {
        // Complete lesson
        setQuizCompleted(true);
        setShowBeltReward(true);
        setShowConfetti(true);
        // Mark as completed in DB
        if (profile && id) {
          await supabase
            .from('user_progress')
            .upsert([
              {
                user_id: profile.id,
                lesson_id: id,
                completed: true,
                progress: 1.0,
                time_spent: 120,
                completed_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ], { onConflict: 'user_id,lesson_id' });
          await refreshProfile();
        }
      }
    };

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background.primary} />
        {!quizCompleted ? (
          <View style={[styles.quizContainer, {paddingHorizontal: 24, paddingTop: 32}]}>
            <Text style={[styles.lessonTitle, {marginTop: 0}]}>{lesson.title}</Text>
            <Text style={styles.lessonDescription}>{lesson.description}</Text>
            <Text style={styles.progressText}>{currentQuestionIndex + 1} of {totalQuestions}</Text>
            <View style={[styles.questionCard, {marginTop: 16}]}>
              <Text style={styles.questionText}>{currentQuestion.question}</Text>
              <View style={[styles.optionsContainer, {marginTop: 16}]}>
                {currentQuestion.options.map((opt: string, idx: number) => {
                  let optionStyle = styles.optionButton;
                  let textStyle = styles.optionButtonText;
                  let disabled = false;
                  if (selectedAnswer === correctIdx) {
                    if (idx === correctIdx) {
                      optionStyle = { ...styles.optionButton, ...styles.optionButtonCorrect };
                      textStyle = { ...styles.optionButtonText, ...styles.optionButtonTextCorrect };
                    } else if (wrongAnswers.has(idx)) {
                      optionStyle = { ...styles.optionButton, ...styles.optionButtonWrong };
                      textStyle = { ...styles.optionButtonText, ...styles.optionButtonTextWrong };
                      disabled = true;
                    } else {
                      disabled = true;
                    }
                  } else if (wrongAnswers.has(idx)) {
                    optionStyle = { ...styles.optionButton, ...styles.optionButtonWrong };
                    textStyle = { ...styles.optionButtonText, ...styles.optionButtonTextWrong };
                    disabled = true;
                  }
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={optionStyle}
                      onPress={() => handleAnswer(idx)}
                      disabled={disabled}
                    >
                      <Text style={textStyle}>{opt}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {/* Feedback and retry logic */}
              {showResult && (
                <>
                  {selectedAnswer !== correctIdx && (
                    <>
                      <Text style={styles.incorrectResult}>💡 Not quite right. Try again!</Text>
                      <TouchableOpacity
                        style={[styles.retryButton, {marginTop: 8, alignSelf: 'center'}]}
                        onPress={() => {
                          setShowResult(false);
                          setSelectedAnswer(null);
                          setWrongAnswers(new Set());
                        }}
                      >
                        <Text style={styles.retryButtonText}>Retry</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  {selectedAnswer === correctIdx && (
                    <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
                      <Text style={styles.continueButtonText}>
                        {currentQuestionIndex < totalQuestions - 1 ? 'Continue' : 'Finish Lesson'}
                      </Text>
                      <ArrowRight color={Colors.background.primary} size={20} />
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          </View>
        ) : (
          // Show congrats modal (existing modal)
          <View style={styles.rewardOverlay}>
            {showConfetti && (
              <View style={styles.confettiContainer}>
                <Text style={styles.confetti}>🎉🎊✨🎉🎊✨</Text>
              </View>
            )}
            <View style={styles.rewardModal}>
              <View style={styles.rewardIcon}>
                <Award color={Colors.accent.yellow} size={48} />
              </View>
              <Text style={styles.rewardTitle}>Congratulations!</Text>
              <Text style={styles.rewardText}>You've completed this lesson and earned 50 Dough Coins.</Text>
              <View style={styles.rewardStats}>
                <Text style={styles.rewardStat}>+50 Dough Coins</Text>
                <Text style={styles.rewardStat}>+1 Lesson Complete</Text>
              </View>
              <TouchableOpacity 
                style={styles.rewardButton}
                onPress={() => {
                  setShowBeltReward(false);
                  setShowConfetti(false);
                  router.replace('/');
                }}
              >
                <Text style={styles.rewardButtonText}>Go Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    );
  }

  // Place this before the main return statement, outside the quiz lesson block:
  const renderPage = (page: LessonPage, index: number) => {
    const isCompleted = completedPages.has(index);
    return (
      <Animated.View 
        key={page.id}
        style={[
          styles.pageContainer,
          { 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <ScrollView 
          style={styles.pageContent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.pageScrollContent}
        >
          {/* Page Header */}
          <View style={styles.pageHeader}>
            <View style={styles.pageTypeIndicator}>
              <Text style={styles.pageTypeText}>
                {page.type.charAt(0).toUpperCase() + page.type.slice(1)}
              </Text>
            </View>
            <View style={styles.pageNumber}>
              <Text style={styles.pageNumberText}>{index + 1}/{lesson.content.length}</Text>
            </View>
          </View>
          {/* Page Image */}
          {page.image && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: page.image }} style={styles.pageImage} resizeMode="cover" />
              <View style={styles.imageOverlay} />
            </View>
          )}
          {/* Page Title */}
          <Text style={styles.pageTitle}>{page.title}</Text>
          {/* Page Content */}
          <Text style={styles.pageText}>{page.content}</Text>
          {/* Highlight Box */}
          {page.highlight && (
            <View style={styles.highlightBox}>
              <Star color={Colors.accent.yellow} size={20} />
              <Text style={styles.highlightText}>{page.highlight}</Text>
            </View>
          )}
          {/* Tip Box */}
          {page.tip && (
            <View style={styles.tipBox}>
              <View style={styles.tipIcon}>
                <Text style={styles.tipEmoji}>💡</Text>
              </View>
              <Text style={styles.tipText}>{page.tip}</Text>
            </View>
          )}
          {/* Example Box */}
          {page.example && (
            <View style={styles.exampleBox}>
              <Text style={styles.exampleTitle}>Real Example</Text>
              <View style={styles.exampleScenario}>
                <Text style={styles.exampleLabel}>Scenario:</Text>
                <Text style={styles.exampleText}>{page.example.scenario}</Text>
              </View>
              <View style={styles.exampleSolution}>
                <Text style={styles.exampleLabel}>Solution:</Text>
                <Text style={styles.exampleText}>{page.example.solution}</Text>
              </View>
            </View>
          )}
          {/* Completion Status */}
          <View style={styles.completionContainer}>
            {isCompleted ? (
              <View style={styles.completedIndicator}>
                <Check color={Colors.accent.green} size={24} />
                <Text style={styles.completedText}>Page Complete!</Text>
              </View>
            ) : (
              <View style={styles.incompleteIndicator}>
                <Circle color={Colors.text.tertiary} size={24} />
                <Text style={styles.incompleteText}>Tap continue when ready</Text>
              </View>
            )}
          </View>
        </ScrollView>
        {/* Page Navigation */}
        <View style={styles.pageNavigation}>
          {currentPage > 0 && (
            <TouchableOpacity style={styles.navButton} onPress={goToPreviousPage}>
              <ArrowLeft color={Colors.text.primary} size={20} />
              <Text style={styles.navButtonText}>Previous</Text>
            </TouchableOpacity>
          )}
          <View style={styles.navSpacer} />
          {currentPage < lesson.content.length - 1 ? (
            <TouchableOpacity style={styles.continueButton} onPress={goToNextPage}>
              <Text style={styles.continueButtonText}>Continue</Text>
              <ArrowRight color={Colors.background.primary} size={20} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.finishButton} onPress={goToNextPage}>
              <Text style={styles.finishButtonText}>Complete Lesson</Text>
              <Trophy color={Colors.background.primary} size={20} />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    );
  };

  // Render other lesson types as needed
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background.secondary} />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color={Colors.text.primary} size={24} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <BookOpen color={Colors.accent.teal} size={24} />
          <Text style={styles.headerTitle}>Lesson Book</Text>
        </View>
        
        <View style={styles.headerProgress}>
          <Flame color={Colors.accent.orange} size={20} />
          <Text style={styles.headerProgressText}>{completedPages.size}/{lesson.content.length}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(completedPages.size / lesson.content.length) * 100}%` }
            ]} 
          />
        </View>
      </View>

      {/* Lesson Pages */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={styles.pagesContainer}
      >
        {lesson.content.map((page: any, index: number) => renderPage(page, index))}
      </ScrollView>

      {/* Belt Reward Modal */}
      {showBeltReward && (
        <View style={styles.rewardOverlay}>
          {/* Confetti Animation (simple emoji burst) */}
          {showConfetti && (
            <View style={styles.confettiContainer}>
              <Text style={styles.confetti}>🎉🎊✨🎉🎊✨</Text>
            </View>
          )}
          <View style={styles.rewardModal}>
            <View style={styles.rewardIcon}>
              <Award color={Colors.accent.yellow} size={48} />
            </View>
            <Text style={styles.rewardTitle}>Congratulations!</Text>
            <Text style={styles.rewardText}>You've completed this lesson and earned 50 Dough Coins.</Text>
            <View style={styles.rewardStats}>
              <Text style={styles.rewardStat}>+50 Dough Coins</Text>
              <Text style={styles.rewardStat}>+1 Lesson Complete</Text>
            </View>
            <TouchableOpacity 
              style={styles.rewardButton}
              onPress={() => {
                setShowBeltReward(false);
                setShowConfetti(false);
                router.replace('/'); // Go to home screen
              }}
            >
              <Text style={styles.rewardButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  quizContainer: {
    flex: 1,
  },
  quizScrollContent: {
    paddingBottom: 60,
  },
  quizContent: {
    padding: SPACING.lg,
  },
  coverImageContainer: {
    position: 'relative',
    width: '100%',
    height: Math.min(screenHeight * 0.25, 200),
    marginBottom: SPACING.lg,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS.lg,
  },
  coverImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: BORDER_RADIUS.lg,
  },
  lessonTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: Math.max(FONT_SIZE.xxl, screenWidth * 0.06),
    color: Colors.text.primary,
    marginBottom: SPACING.sm,
    textAlign: 'left',
    lineHeight: Math.max(FONT_SIZE.xxl * 1.3, screenWidth * 0.08),
    maxWidth: screenWidth * 0.6,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  lessonDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: Math.max(FONT_SIZE.lg, screenWidth * 0.045),
    color: Colors.text.secondary,
    marginBottom: SPACING.lg,
    textAlign: 'left',
    lineHeight: Math.max(FONT_SIZE.lg * 1.5, screenWidth * 0.07),
    maxWidth: screenWidth * 0.6,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.background.tertiary,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent.teal,
    borderRadius: BORDER_RADIUS.full,
  },
  progressText: {
    fontFamily: 'Inter-Medium',
    fontSize: Math.max(FONT_SIZE.md, screenWidth * 0.035),
    color: Colors.accent.teal,
  },
  questionCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  questionNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: Colors.accent.teal,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    marginTop: 2,
  },
  questionNumberText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.md,
    color: Colors.background.primary,
  },
  questionText: {
    fontFamily: 'Inter-Bold',
    fontSize: Math.max(FONT_SIZE.lg, screenWidth * 0.04),
    color: Colors.text.primary,
    flex: 1,
    lineHeight: Math.max(FONT_SIZE.lg * 1.4, screenWidth * 0.056),
  },
  optionsContainer: {
    gap: SPACING.sm,
  },
  optionButton: {
    backgroundColor: Colors.background.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderWidth: 2,
    borderColor: Colors.background.tertiary,
    minHeight: 56,
  },
  optionButtonSelected: {
    backgroundColor: Colors.accent.teal + '15',
    borderColor: Colors.accent.teal,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionRadio: {
    width: 20,
    height: 20,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 2,
    borderColor: Colors.text.tertiary,
    marginRight: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionRadioSelected: {
    borderColor: Colors.accent.teal,
    backgroundColor: Colors.accent.teal,
  },
  optionRadioInner: {
    width: 8,
    height: 8,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: Colors.background.primary,
  },
  optionButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: Math.max(FONT_SIZE.md, screenWidth * 0.035),
    color: Colors.text.primary,
    flex: 1,
    lineHeight: Math.max(FONT_SIZE.md * 1.4, screenWidth * 0.049),
  },
  optionButtonTextSelected: {
    color: Colors.accent.teal,
    fontFamily: 'Inter-Bold',
  },
  optionButtonCorrect: {
    backgroundColor: Colors.accent.green + '20',
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderWidth: 2,
    borderColor: Colors.accent.green,
    minHeight: 56,
  },
  optionButtonTextCorrect: {
    fontFamily: 'Inter-Medium',
    fontSize: Math.max(FONT_SIZE.md, screenWidth * 0.035),
    color: Colors.accent.green,
    flex: 1,
    lineHeight: Math.max(FONT_SIZE.md * 1.4, screenWidth * 0.049),
  },
  optionButtonWrong: {
    backgroundColor: Colors.accent.red + '20',
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderWidth: 2,
    borderColor: Colors.accent.red,
    minHeight: 56,
  },
  optionButtonTextWrong: {
    fontFamily: 'Inter-Medium',
    fontSize: Math.max(FONT_SIZE.md, screenWidth * 0.035),
    color: Colors.accent.red,
    flex: 1,
    lineHeight: Math.max(FONT_SIZE.md * 1.4, screenWidth * 0.049),
  },
  correctIndicator: {
    fontFamily: 'Inter-Bold',
    fontSize: Math.max(FONT_SIZE.lg, screenWidth * 0.04),
    color: Colors.accent.green,
    marginLeft: SPACING.sm,
  },
  wrongIndicator: {
    fontFamily: 'Inter-Bold',
    fontSize: Math.max(FONT_SIZE.lg, screenWidth * 0.04),
    color: Colors.accent.red,
    marginLeft: SPACING.sm,
  },
  completeButton: {
    backgroundColor: Colors.accent.teal,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.xl,
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
    shadowColor: Colors.accent.teal,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    minHeight: 60,
  },
  completeButtonDisabled: {
    backgroundColor: Colors.background.tertiary,
    shadowOpacity: 0,
    elevation: 0,
  },
  completeButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: Math.max(FONT_SIZE.xl, screenWidth * 0.045),
    color: Colors.background.primary,
  },
  completeButtonTextDisabled: {
    color: Colors.text.tertiary,
  },
  rewardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  confettiContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1001,
  },
  confetti: {
    fontSize: Math.min(40, screenWidth * 0.1),
    textAlign: 'center',
    marginBottom: 20,
  },
  rewardModal: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    width: Math.min(320, screenWidth * 0.85),
    maxWidth: 400,
  },
  rewardIcon: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: Colors.accent.yellow + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  rewardTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: Math.max(FONT_SIZE.xl, screenWidth * 0.05),
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  rewardText: {
    fontFamily: 'Inter-Regular',
    fontSize: Math.max(FONT_SIZE.md, screenWidth * 0.035),
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: Math.max(FONT_SIZE.md * 1.5, screenWidth * 0.053),
  },
  rewardStats: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginBottom: SPACING.xl,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  rewardStat: {
    fontFamily: 'Inter-Bold',
    fontSize: Math.max(FONT_SIZE.md, screenWidth * 0.035),
    color: Colors.accent.teal,
  },
  rewardButton: {
    backgroundColor: Colors.accent.teal,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    width: '100%',
    alignItems: 'center',
    marginTop: SPACING.md,
    minHeight: 50,
  },
  rewardButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: Math.max(FONT_SIZE.md, screenWidth * 0.035),
    color: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: Colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.tertiary,
  },
  backButton: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: Colors.background.tertiary,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: Math.max(FONT_SIZE.lg, screenWidth * 0.04),
    color: Colors.text.primary,
  },
  headerProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: Colors.background.tertiary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  headerProgressText: {
    fontFamily: 'Inter-Bold',
    fontSize: Math.max(FONT_SIZE.sm, screenWidth * 0.03),
    color: Colors.accent.orange,
  },
  progressBarContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: Colors.background.secondary,
  },
  pagesContainer: {
    flex: 1,
  },
  pageContainer: {
    width: screenWidth,
    flex: 1,
  },
  pageContent: {
    flex: 1,
  },
  pageScrollContent: {
    padding: SPACING.lg,
    paddingBottom: 120, // Space for navigation
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  pageTypeIndicator: {
    backgroundColor: Colors.accent.teal + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  pageTypeText: {
    fontFamily: 'Inter-Bold',
    fontSize: Math.max(FONT_SIZE.xs, screenWidth * 0.025),
    color: Colors.accent.teal,
    textTransform: 'uppercase',
  },
  pageNumber: {
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  pageNumberText: {
    fontFamily: 'Inter-Medium',
    fontSize: Math.max(FONT_SIZE.sm, screenWidth * 0.03),
    color: Colors.text.secondary,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: SPACING.xl,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  pageImage: {
    width: '100%',
    height: Math.min(screenHeight * 0.25, 200),
    borderRadius: BORDER_RADIUS.xl,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: BORDER_RADIUS.xl,
  },
  pageTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: Math.max(FONT_SIZE.xxl, screenWidth * 0.06),
    color: Colors.text.primary,
    marginBottom: SPACING.lg,
    lineHeight: Math.max(FONT_SIZE.xxl * 1.3, screenWidth * 0.078),
  },
  pageText: {
    fontFamily: 'Inter-Regular',
    fontSize: Math.max(FONT_SIZE.md, screenWidth * 0.035),
    color: Colors.text.secondary,
    lineHeight: Math.max(FONT_SIZE.md * 1.6, screenWidth * 0.056),
    marginBottom: SPACING.lg,
  },
  highlightBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.accent.yellow + '20',
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent.yellow,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  highlightText: {
    fontFamily: 'Inter-Medium',
    fontSize: Math.max(FONT_SIZE.md, screenWidth * 0.035),
    color: Colors.text.primary,
    marginLeft: SPACING.md,
    flex: 1,
    lineHeight: Math.max(FONT_SIZE.md * 1.5, screenWidth * 0.053),
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.accent.teal + '20',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  tipIcon: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: Colors.accent.teal,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  tipEmoji: {
    fontSize: 16,
  },
  tipText: {
    fontFamily: 'Inter-Medium',
    fontSize: Math.max(FONT_SIZE.md, screenWidth * 0.035),
    color: Colors.text.primary,
    flex: 1,
    lineHeight: Math.max(FONT_SIZE.md * 1.5, screenWidth * 0.053),
  },
  exampleBox: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: Colors.background.tertiary,
  },
  exampleTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: Math.max(FONT_SIZE.lg, screenWidth * 0.04),
    color: Colors.text.primary,
    marginBottom: SPACING.md,
  },
  exampleScenario: {
    marginBottom: SPACING.md,
  },
  exampleSolution: {
    marginBottom: 0,
  },
  exampleLabel: {
    fontFamily: 'Inter-Bold',
    fontSize: Math.max(FONT_SIZE.sm, screenWidth * 0.03),
    color: Colors.accent.magenta,
    marginBottom: SPACING.xs,
  },
  exampleText: {
    fontFamily: 'Inter-Regular',
    fontSize: Math.max(FONT_SIZE.md, screenWidth * 0.035),
    color: Colors.text.secondary,
    lineHeight: Math.max(FONT_SIZE.md * 1.5, screenWidth * 0.053),
  },
  completionContainer: {
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  completedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  completedText: {
    fontFamily: 'Inter-Bold',
    fontSize: Math.max(FONT_SIZE.md, screenWidth * 0.035),
    color: Colors.accent.green,
  },
  incompleteIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  incompleteText: {
    fontFamily: 'Inter-Regular',
    fontSize: Math.max(FONT_SIZE.md, screenWidth * 0.035),
    color: Colors.text.tertiary,
  },
  pageNavigation: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: Colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: Colors.background.secondary,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: Colors.background.secondary,
    minHeight: 50,
  },
  navButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: Math.max(FONT_SIZE.md, screenWidth * 0.035),
    color: Colors.text.primary,
  },
  navSpacer: {
    flex: 1,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: Colors.accent.teal,
    shadowColor: Colors.accent.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minHeight: 50,
  },
  continueButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: Math.max(FONT_SIZE.md, screenWidth * 0.035),
    color: Colors.background.primary,
  },
  finishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: Colors.accent.green,
    shadowColor: Colors.accent.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minHeight: 50,
  },
  finishButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: Math.max(FONT_SIZE.md, screenWidth * 0.035),
    color: Colors.background.primary,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: Math.max(FONT_SIZE.lg, screenWidth * 0.04),
    color: Colors.text.secondary,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: Math.max(FONT_SIZE.lg, screenWidth * 0.04),
    color: Colors.text.secondary,
  },
  heartsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  heartsLabel: {
    fontFamily: 'Inter-Bold',
    fontSize: Math.max(FONT_SIZE.md, screenWidth * 0.035),
    color: Colors.text.primary,
    marginRight: SPACING.md,
  },
  heartsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heart: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: Colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
  },
  heartActive: {
    backgroundColor: Colors.accent.teal,
  },
  heartText: {
    fontFamily: 'Inter-Bold',
    fontSize: Math.max(FONT_SIZE.md, screenWidth * 0.035),
    color: Colors.text.primary,
  },
  heartTextActive: {
    color: Colors.background.primary,
  },
  currentQuestionCard: {
    backgroundColor: Colors.accent.teal + '10',
  },
  wrongAnswerFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    backgroundColor: Colors.accent.red + '10',
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.lg,
  },
  wrongAnswerText: {
    fontFamily: 'Inter-Medium',
    fontSize: Math.max(FONT_SIZE.md, screenWidth * 0.035),
    color: Colors.text.primary,
  },
  retryButton: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: Colors.accent.teal,
  },
  retryButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: Math.max(FONT_SIZE.md, screenWidth * 0.035),
    color: Colors.background.primary,
  },
  gameOverContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  gameOverTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: Math.max(FONT_SIZE.xl, screenWidth * 0.05),
    color: Colors.text.primary,
    marginBottom: SPACING.md,
  },
  gameOverText: {
    fontFamily: 'Inter-Regular',
    fontSize: Math.max(FONT_SIZE.md, screenWidth * 0.035),
    color: Colors.text.secondary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  restartButton: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: Colors.accent.teal,
  },
  restartButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: Math.max(FONT_SIZE.md, screenWidth * 0.035),
    color: Colors.background.primary,
  },
  incorrectResult: {
    fontFamily: 'Inter-Medium',
    fontSize: Math.max(FONT_SIZE.md, screenWidth * 0.035),
    color: Colors.text.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
});