import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import Colors from '@/constants/Colors';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '@/constants/Theme';
import { Search, Filter, Plus, CreditCard as Edit, Trash2 } from 'lucide-react-native';
import { Lesson, LessonFilters } from '@/types/lesson';
import { useLessonManager } from '@/hooks/useLessonManager';

interface LessonManagerProps {
  onLessonSelect?: (lesson: Lesson) => void;
  showAdminControls?: boolean;
}

export function LessonManager({ onLessonSelect, showAdminControls = false }: LessonManagerProps) {
  const { lessons, loading, error, fetchLessons } = useLessonManager();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<LessonFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchLessons(filters);
  }, [filters]);

  const filteredLessons = lessons.filter(lesson =>
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lesson.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lesson.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFilterChange = (key: keyof LessonFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return Colors.accent.green;
      case 'intermediate': return Colors.accent.yellow;
      case 'advanced': return Colors.accent.red;
      default: return Colors.text.secondary;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading lessons...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchLessons(filters)}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search and Filter Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search color={Colors.text.tertiary} size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search lessons..."
            placeholderTextColor={Colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter color={Colors.accent.teal} size={20} />
        </TouchableOpacity>

        {showAdminControls && (
          <TouchableOpacity style={styles.addButton}>
            <Plus color={Colors.accent.teal} size={20} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Category:</Text>
            <TextInput
              style={styles.filterInput}
              placeholder="Any category"
              placeholderTextColor={Colors.text.tertiary}
              value={filters.category || ''}
              onChangeText={(value) => handleFilterChange('category', value)}
            />
          </View>
          
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Difficulty:</Text>
            <TextInput
              style={styles.filterInput}
              placeholder="Any difficulty"
              placeholderTextColor={Colors.text.tertiary}
              value={filters.difficulty || ''}
              onChangeText={(value) => handleFilterChange('difficulty', value)}
            />
          </View>
          
          <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
            <Text style={styles.clearFiltersText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Lessons List */}
      <ScrollView style={styles.lessonsList} showsVerticalScrollIndicator={false}>
        {filteredLessons.map((lesson) => (
          <TouchableOpacity
            key={lesson.id}
            style={styles.lessonCard}
            onPress={() => onLessonSelect?.(lesson)}
          >
            <View style={styles.lessonHeader}>
              <Text style={styles.lessonTitle}>{lesson.title}</Text>
              <View style={styles.lessonMeta}>
                <View style={[
                  styles.difficultyBadge,
                  { backgroundColor: getDifficultyColor(lesson.difficulty) + '20' }
                ]}>
                  <Text style={[
                    styles.difficultyText,
                    { color: getDifficultyColor(lesson.difficulty) }
                  ]}>
                    {lesson.difficulty}
                  </Text>
                </View>
                {showAdminControls && (
                  <View style={styles.adminControls}>
                    <TouchableOpacity style={styles.adminButton}>
                      <Edit color={Colors.text.tertiary} size={16} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.adminButton}>
                      <Trash2 color={Colors.accent.red} size={16} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
            
            <Text style={styles.lessonDescription}>{lesson.description}</Text>
            
            <View style={styles.lessonFooter}>
              <Text style={styles.categoryText}>{lesson.category}</Text>
              <View style={styles.lessonStats}>
                <Text style={styles.statText}>{lesson.questions.length} questions</Text>
                <Text style={styles.statText}>{lesson.estimatedTime} min</Text>
                <Text style={styles.xpText}>+{lesson.xpReward} XP</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        
        {filteredLessons.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No lessons found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
          </View>
        )}
      </ScrollView>
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
    padding: SPACING.xl,
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.lg,
    color: Colors.accent.red,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  retryButton: {
    backgroundColor: Colors.accent.teal,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  retryButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.md,
    color: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.primary,
    marginLeft: SPACING.sm,
  },
  filterButton: {
    padding: SPACING.sm,
    backgroundColor: Colors.background.secondary,
    borderRadius: BORDER_RADIUS.md,
  },
  addButton: {
    padding: SPACING.sm,
    backgroundColor: Colors.background.secondary,
    borderRadius: BORDER_RADIUS.md,
  },
  filtersContainer: {
    backgroundColor: Colors.background.secondary,
    margin: SPACING.lg,
    marginTop: 0,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  filterLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.md,
    color: Colors.text.primary,
    width: 80,
  },
  filterInput: {
    flex: 1,
    backgroundColor: Colors.background.tertiary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.primary,
  },
  clearFiltersButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  clearFiltersText: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.sm,
    color: Colors.accent.teal,
  },
  lessonsList: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  lessonCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  lessonTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.lg,
    color: Colors.text.primary,
    flex: 1,
    marginRight: SPACING.md,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  difficultyBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  difficultyText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.xs,
    textTransform: 'capitalize',
  },
  adminControls: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  adminButton: {
    padding: SPACING.xs,
  },
  lessonDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.secondary,
    marginBottom: SPACING.md,
    lineHeight: FONT_SIZE.md * 1.4,
  },
  lessonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryText: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.sm,
    color: Colors.accent.teal,
  },
  lessonStats: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statText: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.sm,
    color: Colors.text.tertiary,
  },
  xpText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.sm,
    color: Colors.accent.yellow,
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.lg,
    color: Colors.text.secondary,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
});