import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '@/constants/Colors';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '@/constants/Theme';
import { Lock, BookmarkPlus, BookmarkCheck } from 'lucide-react-native';
import { router } from 'expo-router';

type LessonCardProps = {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  progress: number;
  lessons: number;
  completedLessons: number;
  belt: string;
  locked: boolean;
  bookmarked?: boolean;
  onBookmark?: () => void;
};

export const LessonCard = ({ 
  id,
  title, 
  description, 
  icon, 
  progress, 
  lessons, 
  completedLessons,
  belt,
  locked,
  bookmarked,
  onBookmark
}: LessonCardProps) => {
  const handlePress = () => {
    console.log('Navigating to lesson:', id);
    if (!locked) {
      // Validate lesson ID before navigation
      if (!id || id === 'undefined') {
        console.error('Invalid lesson ID:', id);
        return;
      }
      router.push(`/lesson/${id}`);
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container,
        locked && styles.lockedContainer
      ]}
      disabled={locked}
      onPress={handlePress}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          {icon}
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
        {locked ? (
          <View style={styles.lockContainer}>
            <Lock color={Colors.text.tertiary} size={20} />
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.bookmarkContainer}
            onPress={onBookmark}
          >
            {bookmarked ? (
              <BookmarkCheck color={Colors.accent.teal} size={20} />
            ) : (
              <BookmarkPlus color={Colors.text.tertiary} size={20} />
            )}
          </TouchableOpacity>
        )}
      </View>
      
      {!locked && (
        <View style={styles.footer}>
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${progress * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {completedLessons}/{lessons} lessons
            </Text>
          </View>
          
          <View style={[
            styles.beltIndicator,
            { backgroundColor: Colors.belt[belt as keyof typeof Colors.belt] }
          ]} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  lockedContainer: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: Colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.md,
    color: Colors.text.primary,
    marginBottom: SPACING.xs,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.sm,
    color: Colors.text.secondary,
  },
  lockContainer: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: Colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  bookmarkContainer: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: Colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  progressContainer: {
    flex: 1,
    marginRight: SPACING.md,
  },
  progressBackground: {
    height: 6,
    backgroundColor: Colors.background.tertiary,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent.teal,
    borderRadius: BORDER_RADIUS.full,
  },
  progressText: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.xs,
    color: Colors.text.tertiary,
  },
  beltIndicator: {
    width: 12,
    height: 12,
    borderRadius: BORDER_RADIUS.full,
  },
});