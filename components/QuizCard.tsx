import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '@/constants/Theme';
import { Brain, Check, X, Clock } from 'lucide-react-native';
import { useDailyQuiz } from '@/hooks/useDailyQuiz';
import { useSound } from '@/hooks/useSound';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface Quiz {
  id: string;
  title: string;
  question: string;
  options: string[];
  correctAnswer: number;
  reward: number;
  difficulty: string;
  category: string;
}

interface QuizCardProps {
  quiz: Quiz;
  onPress?: () => void;
}

export function QuizCard({ quiz, onPress }: QuizCardProps) {
  const { isQuizCompleted, completeQuiz, getTimeUntilReset } = useDailyQuiz();
  const { playSound } = useSound();
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  
  const completed = isQuizCompleted(quiz.id);

  const handleAnswerSelect = (answerIndex: number) => {
    if (completed || selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    const isCorrect = answerIndex === quiz.correctAnswer;
    
    // Play sound effect
    playSound(isCorrect ? 'correct' : 'incorrect');
    
    // Complete the quiz
    completeQuiz(quiz.id, isCorrect, quiz.reward);
  };

  const handleCardPress = () => {
    if (completed) return;
    if (onPress) {
      onPress();
    } else {
      router.push(`/challenge/${quiz.id}`);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return Colors.accent.teal;
      case 'medium':
        return Colors.accent.yellow;
      case 'hard':
        return Colors.accent.magenta;
      default:
        return Colors.text.secondary;
    }
  };

  if (completed) {
    // Completed state - completely different card design
    return (
      <View style={[styles.container, styles.completedContainer]}>
        <View style={styles.completedContent}>
          <View style={styles.completedIconContainer}>
            <Check color={Colors.accent.teal} size={48} />
          </View>
          <Text style={styles.completedTitle}>Completed!</Text>
          <Text style={styles.completedSubtitle}>Great job on today's quiz</Text>
          
          <View style={styles.resetTimer}>
            <Clock color={Colors.text.tertiary} size={16} />
            <Text style={styles.resetTimerText}>Resets in {getTimeUntilReset()}</Text>
          </View>
          
          <View style={styles.completedReward}>
            <Image 
              source={require('@/assets/images/coin.png')} 
              style={styles.coinIcon} 
              resizeMode="contain"
            />
            <Text style={styles.completedRewardText}>+{quiz.reward} earned</Text>
          </View>
        </View>
      </View>
    );
  }

  // Active state - normal quiz card
  return (
    <>
      <TouchableOpacity 
        style={styles.container}
        onPress={handleCardPress}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.categoryContainer}>
              <Brain color={Colors.accent.magenta} size={16} />
              <Text style={styles.category}>{quiz.category}</Text>
            </View>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(quiz.difficulty) + '20' }]}>
              <Text style={[styles.difficulty, { color: getDifficultyColor(quiz.difficulty) }]}>
                {quiz.difficulty}
              </Text>
            </View>
          </View>
          
          <Text style={styles.title} numberOfLines={2}>
            {quiz.title}
          </Text>
          <Text style={styles.question} numberOfLines={3}>
            {quiz.question}
          </Text>
          
          <View style={styles.footer}>
            <View style={styles.rewardContainer}>
              <Image 
                source={require('@/assets/images/coin.png')} 
                style={styles.coinIcon} 
                resizeMode="contain"
              />
              <Text style={styles.rewardText}>+{quiz.reward}</Text>
            </View>
            
            <Text style={styles.tapToStart}>Tap to start</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Quiz Modal */}
      {showQuizModal && (
        <View style={styles.modalOverlay}>
          <Animated.View entering={FadeIn.duration(300)} style={styles.quizModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{quiz.title}</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => {
                  setShowQuizModal(false);
                  setSelectedAnswer(null);
                  setShowResult(false);
                }}
              >
                <X color={Colors.text.primary} size={24} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalQuestion}>{quiz.question}</Text>
            
            <View style={styles.optionsContainer}>
              {quiz.options.map((option, index) => {
                let optionStyle = styles.option;
                let textStyle = styles.optionText;
                
                if (showResult && index === quiz.correctAnswer) {
                  optionStyle = [styles.option, styles.correctOption];
                  textStyle = [styles.optionText, styles.correctOptionText];
                } else if (showResult && selectedAnswer === index && index !== quiz.correctAnswer) {
                  optionStyle = [styles.option, styles.incorrectOption];
                  textStyle = [styles.optionText, styles.incorrectOptionText];
                } else if (selectedAnswer === index && !showResult) {
                  optionStyle = [styles.option, styles.selectedOption];
                }
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={optionStyle}
                    onPress={() => handleAnswerSelect(index)}
                    disabled={selectedAnswer !== null}
                  >
                    <Text style={textStyle}>{option}</Text>
                    {showResult && index === quiz.correctAnswer && (
                      <Check color={Colors.background.primary} size={16} />
                    )}
                    {showResult && selectedAnswer === index && index !== quiz.correctAnswer && (
                      <X color={Colors.background.primary} size={16} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            
            {showResult && (
              <Animated.View entering={FadeIn.delay(500)} style={styles.resultContainer}>
                <Text style={[styles.resultText, selectedAnswer === quiz.correctAnswer ? styles.correctResult : styles.incorrectResult]}>
                  {selectedAnswer === quiz.correctAnswer ? '🎉 Correct!' : '💡 Not quite right'}
                </Text>
                <TouchableOpacity 
                  style={styles.continueButton}
                  onPress={() => {
                    setShowQuizModal(false);
                    setSelectedAnswer(null);
                    setShowResult(false);
                  }}
                >
                  <Text style={styles.continueButtonText}>Continue</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </Animated.View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.md,
    width: 280,
    overflow: 'hidden',
  },
  completedContainer: {
    backgroundColor: Colors.background.tertiary,
    borderWidth: 2,
    borderColor: Colors.accent.teal + '30',
  },
  completedContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  completedIconContainer: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: Colors.accent.teal + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  completedTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.xl,
    color: Colors.accent.teal,
    marginBottom: SPACING.xs,
  },
  completedSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  resetTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.md,
  },
  resetTimerText: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.sm,
    color: Colors.text.tertiary,
    marginLeft: SPACING.xs,
  },
  completedReward: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 214, 0, 0.2)',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  completedRewardText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.sm,
    color: Colors.accent.yellow,
    marginLeft: SPACING.xs,
  },
  content: {
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  category: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.sm,
    color: Colors.text.secondary,
    marginLeft: SPACING.xs,
  },
  difficultyBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  difficulty: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.xs,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.lg,
    color: Colors.text.primary,
    marginBottom: SPACING.sm,
    lineHeight: FONT_SIZE.lg * 1.2,
  },
  question: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.secondary,
    lineHeight: FONT_SIZE.md * 1.3,
    marginBottom: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 214, 0, 0.2)',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  coinIcon: {
    width: 16,
    height: 16,
    marginRight: SPACING.xs,
  },
  rewardText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.sm,
    color: Colors.accent.yellow,
  },
  tapToStart: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.sm,
    color: Colors.accent.teal,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  quizModal: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.xl,
    color: Colors.text.primary,
    flex: 1,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  modalQuestion: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.lg,
    color: Colors.text.primary,
    marginBottom: SPACING.xl,
    lineHeight: FONT_SIZE.lg * 1.4,
  },
  optionsContainer: {
    marginBottom: SPACING.xl,
  },
  option: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: Colors.accent.teal + '20',
    borderWidth: 1,
    borderColor: Colors.accent.teal,
  },
  correctOption: {
    backgroundColor: Colors.accent.teal,
  },
  incorrectOption: {
    backgroundColor: Colors.accent.magenta,
  },
  optionText: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.md,
    color: Colors.text.primary,
    flex: 1,
  },
  correctOptionText: {
    color: Colors.background.primary,
  },
  incorrectOptionText: {
    color: Colors.background.primary,
  },
  resultContainer: {
    alignItems: 'center',
  },
  resultText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.lg,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  correctResult: {
    color: Colors.accent.teal,
  },
  incorrectResult: {
    color: Colors.accent.magenta,
  },
  continueButton: {
    backgroundColor: Colors.accent.teal,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    minWidth: 120,
    alignItems: 'center',
  },
  continueButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.md,
    color: Colors.background.primary,
  },
});