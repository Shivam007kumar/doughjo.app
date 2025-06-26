import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement: any;
  reward_coins: number;
  created_at: string;
}

interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  created_at: string;
}

export function useAchievements() {
  const { user, profile, updateProfile } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
    if (user) {
      fetchUserAchievements();
    }
  }, [user]);

  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('category', { ascending: true });

      if (error) {
        console.error('Error fetching achievements:', error);
      } else {
        setAchievements(data || []);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAchievements = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user achievements:', error);
      } else {
        setUserAchievements(data || []);
      }
    } catch (error) {
      console.error('Error fetching user achievements:', error);
    }
  };

  const checkAndAwardAchievements = async (
    lessonsCompleted: number,
    correctQuizzesCompleted: number,
    streakDays: number,
    doughCoins: number
  ) => {
    if (!user || !profile) return;

    const unlockedAchievements = achievements.filter(achievement => {
      // Check if user already has this achievement
      const alreadyEarned = userAchievements.some(ua => ua.achievement_id === achievement.id);
      if (alreadyEarned) return false;

      // Check achievement requirements
      const req = achievement.requirement;
      
      switch (achievement.category) {
        case 'lessons':
          return lessonsCompleted >= req.count;
        case 'quizzes':
          return correctQuizzesCompleted >= req.count;
        case 'streak':
          return streakDays >= req.days;
        case 'coins':
          return doughCoins >= req.amount;
        default:
          return false;
      }
    });

    // Award new achievements
    for (const achievement of unlockedAchievements) {
      await awardAchievement(achievement.id, achievement.reward_coins);
    }

    return unlockedAchievements;
  };

  const awardAchievement = async (achievementId: string, rewardCoins: number) => {
    if (!user || !profile) return { error: new Error('No user logged in') };

    try {
      // Record the achievement
      const { error: achievementError } = await supabase
        .from('user_achievements')
        .insert({
          user_id: user.id,
          achievement_id: achievementId,
          earned_at: new Date().toISOString()
        });

      if (achievementError) {
        return { error: achievementError };
      }

      // Update user's dough coins
      const newCoins = profile.dough_coins + rewardCoins;
      await updateProfile({ dough_coins: newCoins });

      // Refresh user achievements
      await fetchUserAchievements();

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const getEarnedAchievements = (): Achievement[] => {
    const earnedIds = userAchievements.map(ua => ua.achievement_id);
    return achievements.filter(achievement => earnedIds.includes(achievement.id));
  };

  const getAvailableAchievements = (): Achievement[] => {
    const earnedIds = userAchievements.map(ua => ua.achievement_id);
    return achievements.filter(achievement => !earnedIds.includes(achievement.id));
  };

  const getAchievementProgress = (achievement: Achievement): number => {
    if (!profile) return 0;

    const req = achievement.requirement;
    
    switch (achievement.category) {
      case 'lessons':
        return Math.min(profile.total_lessons_completed / req.count, 1);
      case 'quizzes':
        return Math.min(profile.total_quizzes_completed / req.count, 1);
      case 'streak':
        return Math.min(profile.streak_days / req.days, 1);
      case 'coins':
        return Math.min(profile.dough_coins / req.amount, 1);
      default:
        return 0;
    }
  };

  return {
    achievements,
    userAchievements,
    loading,
    checkAndAwardAchievements,
    awardAchievement,
    getEarnedAchievements,
    getAvailableAchievements,
    getAchievementProgress,
    refreshAchievements: fetchAchievements,
    refreshUserAchievements: fetchUserAchievements
  };
}