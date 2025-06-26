import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '@/constants/Colors';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '@/constants/Theme';
import { Check, X } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

type QuizOption = {
  id: string;
  text: string;
};

type QuizProps = {
  question: string;
  options: QuizOption[];
  correctAnswer: string;
  onAnswer: (isCorrect: boolean) => void;
};

export function Quiz({ question, options, correctAnswer, onAnswer }: QuizProps) {
  const [selectedAnswer, setSelectedAnswer] = React.useState<string | null>(null);
  const [showFeedback, setShowFeedback] = React.useState(false);

  const handleAnswer = (optionId: string) => {
    setSelectedAnswer(optionId);
    setShowFeedback(true);
    const isCorrect = optionId === correctAnswer;
    setTimeout(() => {
      onAnswer(isCorrect);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }, 1500);
  };

  return (
    <View style={styles.quizContainer}>
      <Text style={styles.question}>{question}</Text>
      {options.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={[
            styles.option,
            selectedAnswer === option.id && styles.selectedOption,
            showFeedback && selectedAnswer === option.id && {
              backgroundColor: option.id === correctAnswer ? Colors.accent.green : Colors.accent.red,
            },
          ]}
          onPress={() => !selectedAnswer && handleAnswer(option.id)}
          disabled={!!selectedAnswer}
        >
          <Text style={[
            styles.optionText,
            selectedAnswer === option.id && styles.selectedOptionText,
          ]}>
            {option.text}
          </Text>
          
          {showFeedback && selectedAnswer === option.id && (
            <Animated.View 
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(200)}
              style={styles.feedbackIcon}
            >
              {option.id === correctAnswer ? (
                <Check color={Colors.background.primary} size={24} />
              ) : (
                <X color={Colors.background.primary} size={24} />
              )}
            </Animated.View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  quizContainer: {
    padding: SPACING.lg,
    backgroundColor: Colors.background.secondary,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  question: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.lg,
    color: Colors.text.primary,
    marginBottom: SPACING.lg,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: Colors.background.tertiary,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  selectedOption: {
    backgroundColor: Colors.accent.teal,
  },
  optionText: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.md,
    color: Colors.text.primary,
    flex: 1,
  },
  selectedOptionText: {
    color: Colors.background.primary,
  },
  feedbackIcon: {
    marginLeft: SPACING.md,
  },
});