import { useState, useEffect } from 'react';
import { Lesson, UserProgress, LessonFilters, ProgressStats } from '@/types/lesson';

export function useLessonManager() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch lessons with optional filters
  const fetchLessons = async (filters?: LessonFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.difficulty) params.append('difficulty', filters.difficulty);
      
      const response = await fetch(`/api/lessons?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch lessons');
      }
      
      const lessonsData = await response.json();
      setLessons(lessonsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch specific lesson by ID
  const fetchLesson = async (lessonId: string): Promise<Lesson | null> => {
    try {
      const response = await fetch(`/api/lessons?id=${lessonId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch lesson');
      }
      
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  };

  // Update user progress
  const updateProgress = async (progressData: {
    userId: string;
    lessonId: string;
    completed: boolean;
    score: number;
    hearts: number;
  }) => {
    try {
      const response = await fetch('/api/user-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...progressData,
          timestamp: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update progress');
      }
      
      const updatedProgress = await response.json();
      
      // Update local progress state
      setUserProgress(prev => {
        const existingIndex = prev.findIndex(p => 
          p.userId === progressData.userId && p.lessonId === progressData.lessonId
        );
        
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = updatedProgress;
          return updated;
        } else {
          return [...prev, updatedProgress];
        }
      });
      
      return updatedProgress;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  // Fetch user progress
  const fetchUserProgress = async (userId: string) => {
    try {
      const response = await fetch(`/api/user-progress?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user progress');
      }
      
      const progressData = await response.json();
      setUserProgress(progressData);
      return progressData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return [];
    }
  };

  // Get progress for specific lesson
  const getLessonProgress = (userId: string, lessonId: string): UserProgress | null => {
    return userProgress.find(p => p.userId === userId && p.lessonId === lessonId) || null;
  };

  // Calculate progress statistics
  const getProgressStats = (userId: string): ProgressStats => {
    const userLessons = userProgress.filter(p => p.userId === userId);
    const completedLessons = userLessons.filter(p => p.completed);
    
    const totalXP = completedLessons.reduce((sum, lesson) => {
      const lessonData = lessons.find(l => l.id === lesson.lessonId);
      return sum + (lessonData?.xpReward || 0);
    }, 0);
    
    const averageScore = userLessons.length > 0 
      ? userLessons.reduce((sum, p) => sum + p.bestScore, 0) / userLessons.length 
      : 0;
    
    const totalTimeSpent = userLessons.reduce((sum, p) => sum + p.totalTimeSpent, 0);
    
    return {
      totalLessons: lessons.length,
      completedLessons: completedLessons.length,
      totalXP,
      averageScore,
      totalTimeSpent,
      currentStreak: 0, // Would need to calculate based on dates
      longestStreak: 0   // Would need to calculate based on dates
    };
  };

  // Get recommended lessons based on user progress
  const getRecommendedLessons = (userId: string, limit: number = 5): Lesson[] => {
    const userLessonProgress = userProgress.filter(p => p.userId === userId);
    const completedLessonIds = userLessonProgress
      .filter(p => p.completed)
      .map(p => p.lessonId);
    
    // Filter out completed lessons and sort by difficulty
    const availableLessons = lessons.filter(lesson => 
      !completedLessonIds.includes(lesson.id)
    );
    
    // Sort by difficulty (beginner first) and return limited results
    return availableLessons
      .sort((a, b) => {
        const difficultyOrder = { beginner: 0, intermediate: 1, advanced: 2 };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      })
      .slice(0, limit);
  };

  return {
    lessons,
    userProgress,
    loading,
    error,
    fetchLessons,
    fetchLesson,
    updateProgress,
    fetchUserProgress,
    getLessonProgress,
    getProgressStats,
    getRecommendedLessons,
    setError
  };
}