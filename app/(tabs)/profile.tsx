import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import Colors from '@/constants/Colors';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '@/constants/Theme';
import { Award, Trophy, Calendar, Settings, ChevronRight, Medal, CreditCard as Edit3, Check, X, User, Bell, Volume2, VolumeX } from 'lucide-react-native';
import { SenseiProfile } from '@/components/Sensei';
import { ProgressBadge } from '@/components/ProgressBadge';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useAchievements } from '@/hooks/useAchievements';
import { useSound } from '@/hooks/useSound';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';



export default function ProfileScreen() {
  const { profile, updateProfile, signOut } = useAuth();
  const { getCompletedLessonsCount, getCorrectQuizzesCount, getTotalStudyTime, getStreakData } = useUserProgress();
  const { getEarnedAchievements } = useAchievements();
  const { soundEnabled, toggleSound } = useSound();
  
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [editingFullName, setEditingFullName] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (profile) {
      setNewUsername(profile.username || '');
      setNewFullName(profile.full_name || '');
    }
  }, [profile]);

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  const earnedAchievements = getEarnedAchievements();
  const completedLessons = getCompletedLessonsCount();
  const correctQuizzes = getCorrectQuizzesCount();
  const totalStudyTime = getTotalStudyTime();
  const { currentStreak, longestStreak } = getStreakData();

  const handleUsernameUpdate = async () => {
    if (!newUsername.trim()) {
      Alert.alert('Error', 'Username cannot be empty');
      return;
    }

    const { error } = await updateProfile({ username: newUsername.toLowerCase() });
    if (error) {
      Alert.alert('Error', 'Failed to update username');
    } else {
      setEditingUsername(false);
    }
  };

  const handleFullNameUpdate = async () => {
    const { error } = await updateProfile({ full_name: newFullName.trim() || null });
    if (error) {
      Alert.alert('Error', 'Failed to update name');
    } else {
      setEditingFullName(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            const { error } = await signOut();
            if (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          }
        }
      ]
    );
  };

  const SettingsModal = () => (
    <Modal
      visible={showSettings}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowSettings(false)}
    >
      <View style={styles.settingsOverlay}>
        <Animated.View entering={FadeIn.duration(300)} style={styles.settingsModal}>
          <View style={styles.settingsHeader}>
            <Text style={styles.settingsTitle}>Settings</Text>
            <TouchableOpacity 
              style={styles.settingsCloseButton}
              onPress={() => setShowSettings(false)}
            >
              <X color={Colors.text.primary} size={24} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.settingsContent}>
            {/* Sound Settings */}
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                {soundEnabled ? (
                  <Volume2 color={Colors.accent.teal} size={24} />
                ) : (
                  <VolumeX color={Colors.text.tertiary} size={24} />
                )}
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Sound Effects</Text>
                  <Text style={styles.settingDescription}>
                    Play sounds for quiz answers and interactions
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.toggle, soundEnabled && styles.toggleActive]}
                onPress={toggleSound}
              >
                <View style={[styles.toggleThumb, soundEnabled && styles.toggleThumbActive]} />
              </TouchableOpacity>
            </View>
            
            {/* Notifications Settings */}
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Bell color={Colors.accent.magenta} size={24} />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Notifications</Text>
                  <Text style={styles.settingDescription}>
                    Receive reminders and updates
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.toggle, styles.toggleActive]}
                onPress={() => {}}
              >
                <View style={[styles.toggleThumb, styles.toggleThumbActive]} />
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.settingsDoneButton}
            onPress={() => setShowSettings(false)}
          >
            <Text style={styles.settingsDoneButtonText}>Done</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );

  const formatStudyTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.settingsButton} onPress={() => setShowSettings(true)}>
            <Settings color={Colors.text.primary} size={24} />
          </TouchableOpacity>
          
          <View style={styles.profileContainer}>
            <View style={styles.profileImageContainer}>
              <SenseiProfile style={styles.senseiImage} />
            </View>
            
            {/* Full Name */}
            <View style={styles.nameContainer}>
              {editingFullName ? (
                <View style={styles.editContainer}>
                  <TextInput
                    style={styles.editInput}
                    value={newFullName}
                    onChangeText={setNewFullName}
                    placeholder="Enter your name"
                    placeholderTextColor={Colors.text.tertiary}
                  />
                  <TouchableOpacity onPress={handleFullNameUpdate} style={styles.editButton}>
                    <Check color={Colors.accent.green} size={20} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setEditingFullName(false)} style={styles.editButton}>
                    <X color={Colors.accent.red} size={20} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.nameRow}
                  onPress={() => setEditingFullName(true)}
                >
                  <Text style={styles.userName}>
                    {profile.full_name || 'Add your name'}
                  </Text>
                  <Edit3 color={Colors.text.tertiary} size={16} />
                </TouchableOpacity>
              )}
            </View>

            {/* Username */}
            <View style={styles.usernameContainer}>
              {editingUsername ? (
                <View style={styles.editContainer}>
                  <TextInput
                    style={styles.editInput}
                    value={newUsername}
                    onChangeText={setNewUsername}
                    placeholder="Enter username"
                    placeholderTextColor={Colors.text.tertiary}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={handleUsernameUpdate} style={styles.editButton}>
                    <Check color={Colors.accent.green} size={20} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setEditingUsername(false)} style={styles.editButton}>
                    <X color={Colors.accent.red} size={20} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.usernameRow}
                  onPress={() => setEditingUsername(true)}
                >
                  <User color={Colors.text.tertiary} size={16} />
                  <Text style={styles.usernameText}>
                    @{profile.username || 'set_username'}
                  </Text>
                  <Edit3 color={Colors.text.tertiary} size={14} />
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.beltContainer}>
              <View style={[styles.beltIndicator, { backgroundColor: Colors.belt[profile.belt_level as keyof typeof Colors.belt] }]} />
              <Text style={styles.beltText}>{profile.belt_level.charAt(0).toUpperCase() + profile.belt_level.slice(1)} Belt</Text>
            </View>
          </View>
          
          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Image 
                source={require('@/assets/images/coin.png')}
                style={styles.statIcon} 
                resizeMode="contain"
              />
              <Text style={styles.statValue}>{profile.dough_coins}</Text>
              <Text style={styles.statLabel}>Dough Coins</Text>
            </View>
            
            <View style={styles.statCard}>
              <Calendar color={Colors.accent.magenta} size={24} />
              <Text style={styles.statValue}>{profile.streak_days}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            
            <View style={styles.statCard}>
              <Award color={Colors.accent.teal} size={24} />
              <Text style={styles.statValue}>{completedLessons}</Text>
              <Text style={styles.statLabel}>Lessons</Text>
            </View>
          </View>
        </View>
        
        {/* Detailed Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Statistics</Text>
          
          <View style={styles.detailedStatsContainer}>
            <View style={styles.detailedStatCard}>
              <Text style={styles.detailedStatValue}>{profile.total_lessons_completed}</Text>
              <Text style={styles.detailedStatLabel}>Total Lessons Completed</Text>
            </View>
            
            <View style={styles.detailedStatCard}>
              <Text style={styles.detailedStatValue}>{correctQuizzes}</Text>
              <Text style={styles.detailedStatLabel}>Correct Quiz Answers</Text>
            </View>
            
            <View style={styles.detailedStatCard}>
              <Text style={styles.detailedStatValue}>{formatStudyTime(totalStudyTime)}</Text>
              <Text style={styles.detailedStatLabel}>Total Study Time</Text>
            </View>
            
            <View style={styles.detailedStatCard}>
              <Text style={styles.detailedStatValue}>{longestStreak}</Text>
              <Text style={styles.detailedStatLabel}>Longest Streak</Text>
            </View>
          </View>
        </View>
        
        {/* Progress Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View style={styles.progressTitleContainer}>
                <Trophy color={Colors.accent.yellow} size={20} />
                <Text style={styles.progressTitle}>Financial Belt</Text>
              </View>
              <ChevronRight color={Colors.text.tertiary} size={20} />
            </View>
            
            <View style={styles.beltProgressContainer}>
              {Object.keys(Colors.belt).map((belt, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.beltProgressItem, 
                    { backgroundColor: Colors.belt[belt as keyof typeof Colors.belt] },
                    index <= Object.keys(Colors.belt).indexOf(profile.belt_level) && styles.beltProgressItemCompleted
                  ]} 
                />
              ))}
            </View>
            
            <Text style={styles.progressText}>
              Complete more lessons to advance to the next belt level
            </Text>
          </View>
        </View>
        
        {/* Achievements Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Achievements ({earnedAchievements.length})</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.badgesContainer}>
            {earnedAchievements.slice(0, 8).map((achievement) => (
              <ProgressBadge
                key={achievement.id}
                name={achievement.name}
                icon={achievement.icon}
                color={Colors.accent.teal}
                completed={true}
              />
            ))}
            {earnedAchievements.length === 0 && (
              <Text style={styles.noAchievementsText}>
                Complete lessons and quizzes to earn achievements!
              </Text>
            )}
          </View>
        </View>
        
        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <View style={styles.accountCard}>
            <View style={styles.accountItem}>
              <Text style={styles.accountLabel}>Email</Text>
              <Text style={styles.accountValue} numberOfLines={2}>{profile.email}</Text>
            </View>
            
            <View style={styles.accountItem}>
              <Text style={styles.accountLabel}>Member Since</Text>
              <Text style={styles.accountValue}>
                {new Date(profile.created_at).toLocaleDateString()}
              </Text>
            </View>
            
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      <SettingsModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.lg,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 100,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: Colors.background.secondary,
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
    paddingTop: 60,
    paddingBottom: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  settingsButton: {
    position: 'absolute',
    top: 60,
    right: SPACING.lg,
    zIndex: 10,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: Colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  senseiImage: {
    width: 80,
    height: 80,
  },
  nameContainer: {
    marginBottom: SPACING.xs,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  userName: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.xl,
    color: Colors.text.primary,
  },
  usernameContainer: {
    marginBottom: SPACING.md,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  usernameText: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.md,
    color: Colors.text.secondary,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  editInput: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.primary,
    minWidth: 150,
  },
  editButton: {
    padding: SPACING.xs,
  },
  beltContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.tertiary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  beltIndicator: {
    width: 12,
    height: 12,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.xs,
  },
  beltText: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.sm,
    color: Colors.text.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.background.tertiary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
  },
  statIcon: {
    width: 24,
    height: 24,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.xl,
    color: Colors.text.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.xs,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.lg,
    color: Colors.text.primary,
    marginBottom: SPACING.md,
  },
  seeAllText: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.sm,
    color: Colors.accent.teal,
  },
  detailedStatsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailedStatCard: {
    width: '48%',
    backgroundColor: Colors.background.secondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  detailedStatValue: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.xxl,
    color: Colors.accent.teal,
    marginBottom: SPACING.xs,
  },
  detailedStatLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  progressCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  progressTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.md,
    color: Colors.text.primary,
    marginLeft: SPACING.sm,
  },
  beltProgressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  beltProgressItem: {
    flex: 1,
    height: 8,
    borderRadius: BORDER_RADIUS.full,
    marginHorizontal: 2,
    opacity: 0.3,
  },
  beltProgressItemCompleted: {
    opacity: 1,
  },
  progressText: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.sm,
    color: Colors.text.secondary,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  noAchievementsText: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
    padding: SPACING.lg,
  },
  accountCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.tertiary,
  },
  accountLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.md,
    color: Colors.text.secondary,
  },
  accountValue: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.primary,
    flex: 1,
    textAlign: 'right',
    flexWrap: 'wrap',
  },
  signOutButton: {
    backgroundColor: Colors.accent.red,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  signOutText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.md,
    color: Colors.background.primary,
  },
  settingsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  settingsModal: {
    backgroundColor: Colors.background.secondary,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    minHeight: 400,
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  settingsTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.xl,
    color: Colors.text.primary,
  },
  settingsCloseButton: {
    padding: SPACING.sm,
  },
  settingsContent: {
    flex: 1,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.tertiary,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  settingTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.md,
    color: Colors.text.primary,
    marginBottom: SPACING.xs,
  },
  settingDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.sm,
    color: Colors.text.secondary,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.background.tertiary,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: Colors.accent.teal,
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.text.tertiary,
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    backgroundColor: Colors.background.primary,
    alignSelf: 'flex-end',
  },
  settingsDoneButton: {
    backgroundColor: Colors.accent.teal,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  settingsDoneButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.md,
    color: Colors.background.primary,
  },
});