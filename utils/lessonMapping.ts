// Utility to map lesson categories to actual database lesson IDs
export const getLessonIdByCategory = (lessons: any[], category: string): string | null => {
  const lesson = lessons.find(l => l.category === category);
  return lesson?.id || null;
};

// Fallback lesson IDs for development
export const FALLBACK_LESSON_IDS = {
  'Budgeting': 'budget-intro',
  'Saving': 'income-expenses', 
  'Credit': 'fifty-thirty-twenty',
  'Investing': 'tracking-expenses',
  'Finance Basics': 'budget-challenge',
  'Emergency Planning': 'advanced-investing'
};

// Get lesson ID with fallback
export const getLessonId = (lessons: any[], category: string): string => {
  return getLessonIdByCategory(lessons, category) || FALLBACK_LESSON_IDS[category as keyof typeof FALLBACK_LESSON_IDS] || 'default-lesson';
};