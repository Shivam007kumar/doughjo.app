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
  Alert
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import Colors from '@/constants/Colors';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '@/constants/Theme';
import { ArrowLeft, ArrowRight, BookOpen, Trophy, Star, Check, Circle, Flame, Award } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

const { width: screenWidth } = Dimensions.get('window');

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
  const [currentPage, setCurrentPage] = useState(0);
  const [completedPages, setCompletedPages] = useState<Set<number>>(new Set());
  const [showBeltReward, setShowBeltReward] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Get lesson data based on ID
  const getLessonData = (lessonId: string): LessonPage[] => {
    // Check if this is a UUID (from database) or a fallback string ID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (uuidRegex.test(lessonId)) {
      // This is a real lesson from the database, provide generic content
      return [
        {
          id: 'intro',
          type: 'intro',
          title: 'Welcome to Your Financial Lesson',
          content: 'You\'re about to learn important financial concepts that will help you build wealth and achieve your goals.',
          image: 'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=800'
        },
        {
          id: 'content-1',
          type: 'content',
          title: 'Financial Knowledge',
          content: 'This lesson contains valuable financial education content designed to improve your money management skills.',
          highlight: 'Every lesson completed brings you closer to financial mastery.',
          image: 'https://images.pexels.com/photos/4386370/pexels-photo-4386370.jpeg?auto=compress&cs=tinysrgb&w=800'
        },
        {
          id: 'summary',
          type: 'summary',
          title: 'Lesson Complete!',
          content: 'Congratulations! You\'ve completed this financial lesson and earned valuable knowledge plus rewards.',
          highlight: 'Keep learning to advance your financial belt level!'
        }
      ];
    }
    
    // Fallback content for string IDs (for development/testing)
    switch (lessonId) {
      case 'budget-intro':
        return [
          {
            id: 'intro',
            type: 'intro',
            title: 'Welcome to Budgeting Basics',
            content: 'Your journey to financial mastery begins here! Learn how to take control of your money with smart budgeting strategies.',
            image: 'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=800'
          },
          {
            id: 'what-is-budget',
            type: 'content',
            title: 'What is a Budget?',
            content: 'A budget is your financial roadmap. It helps you plan where your money goes before you spend it, ensuring you can afford your needs and reach your goals.',
            highlight: 'Think of a budget as your money\'s GPS - it shows you the best route to your financial destination.',
            image: 'https://images.pexels.com/photos/4386370/pexels-photo-4386370.jpeg?auto=compress&cs=tinysrgb&w=800'
          },
          {
            id: 'why-budget',
            type: 'content',
            title: 'Why Budget?',
            content: 'Budgeting gives you control over your money instead of wondering where it all went. It helps you save for goals, avoid debt, and reduce financial stress.',
            tip: 'People who budget are 3x more likely to achieve their financial goals!'
          },
          {
            id: 'budget-example',
            type: 'example',
            title: 'Real-Life Example',
            content: 'Meet Sarah, a college student who started budgeting:',
            example: {
              scenario: 'Sarah earned $1,200/month from her part-time job but always ran out of money.',
              solution: 'She created a budget: $600 for needs, $360 for wants, $240 for savings. Now she has an emergency fund and less stress!'
            },
            image: 'https://images.pexels.com/photos/4386339/pexels-photo-4386339.jpeg?auto=compress&cs=tinysrgb&w=800'
          },
          {
            id: 'getting-started',
            type: 'content',
            title: 'Getting Started',
            content: 'Start simple: Track your spending for one week. Write down every purchase, no matter how small. This awareness is the first step to financial control.',
            tip: 'Use your phone\'s notes app or a simple notebook - the tool doesn\'t matter, consistency does!'
          },
          {
            id: 'summary',
            type: 'summary',
            title: 'You\'re Ready!',
            content: 'Congratulations! You now understand the basics of budgeting. Remember: a budget isn\'t about restricting yourself - it\'s about giving yourself permission to spend on what matters most.',
            highlight: 'Your White Belt in Budgeting is earned! Ready for the next challenge?'
          }
        ];
      
      case 'income-expenses':
        return [
          {
            id: 'intro',
            type: 'intro',
            title: 'Welcome to Saving Sensei',
            content: 'Master the art of saving money and building wealth for your future. Learn proven strategies that work for any income level.',
            image: 'https://images.pexels.com/photos/3943716/pexels-photo-3943716.jpeg?auto=compress&cs=tinysrgb&w=800'
          },
          {
            id: 'saving-basics',
            type: 'content',
            title: 'Why Save Money?',
            content: 'Saving money provides security, freedom, and opportunities. It\'s your safety net for emergencies and your ticket to achieving dreams.',
            highlight: 'Every dollar saved is a dollar that works for your future self.',
            image: 'https://images.pexels.com/photos/3943723/pexels-photo-3943723.jpeg?auto=compress&cs=tinysrgb&w=800'
          },
          {
            id: 'emergency-fund',
            type: 'content',
            title: 'Emergency Fund Essentials',
            content: 'An emergency fund covers unexpected expenses without derailing your finances. Start with $1,000, then build to 3-6 months of expenses.',
            tip: 'Even $25 per month adds up to $300 in a year - start small and build the habit!'
          },
          {
            id: 'saving-strategies',
            type: 'example',
            title: 'Smart Saving Strategies',
            content: 'Here are proven methods to boost your savings:',
            example: {
              scenario: 'Alex wanted to save $2,400 in one year but struggled with discipline.',
              solution: 'He automated $200/month transfers and used the 52-week challenge. By year-end, he had saved $2,678!'
            }
          },
          {
            id: 'automation',
            type: 'content',
            title: 'Automate Your Success',
            content: 'Set up automatic transfers to your savings account. When saving happens automatically, you\'re more likely to stick with it.',
            tip: 'Pay yourself first - save before you spend on anything else!'
          },
          {
            id: 'summary',
            type: 'summary',
            title: 'Saving Sensei Complete!',
            content: 'You\'ve learned the fundamentals of saving money. Remember: consistency beats perfection. Start where you are, use what you have, do what you can.',
            highlight: 'Your Yellow Belt in Saving is earned! Keep building those money muscles!'
          }
        ];
      
      case 'fifty-thirty-twenty':
        return [
          {
            id: 'intro',
            type: 'intro',
            title: 'Welcome to Credit Card Master',
            content: 'Learn to use credit cards responsibly and build an excellent credit score. Master the tools that can either help or hurt your financial future.',
            image: 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=800'
          },
          {
            id: 'credit-basics',
            type: 'content',
            title: 'Credit Cards Explained',
            content: 'Credit cards are powerful financial tools that let you borrow money for purchases. Used wisely, they build credit and offer rewards. Used poorly, they create debt.',
            highlight: 'Credit cards are like fire - incredibly useful when controlled, dangerous when not.',
            image: 'https://images.pexels.com/photos/4386433/pexels-photo-4386433.jpeg?auto=compress&cs=tinysrgb&w=800'
          },
          {
            id: 'credit-score',
            type: 'content',
            title: 'Building Your Credit Score',
            content: 'Your credit score affects loan rates, apartment approvals, and even job opportunities. Pay on time, keep balances low, and be patient.',
            tip: 'Payment history is 35% of your credit score - never miss a payment!'
          },
          {
            id: 'responsible-use',
            type: 'example',
            title: 'Responsible Credit Use',
            content: 'See how smart credit card use builds wealth:',
            example: {
              scenario: 'Maria used her credit card for all purchases but struggled with growing balances.',
              solution: 'She started paying the full balance monthly and earned $300 in cashback rewards while building excellent credit!'
            }
          },
          {
            id: 'avoiding-debt',
            type: 'content',
            title: 'Avoiding Credit Card Debt',
            content: 'The key to credit card success: never spend more than you can pay off immediately. Treat your credit card like a debit card.',
            tip: 'If you can\'t afford to pay cash for it, you can\'t afford to put it on credit!'
          },
          {
            id: 'summary',
            type: 'summary',
            title: 'Credit Master Complete!',
            content: 'You now understand how to use credit cards responsibly. Remember: credit cards are tools, not free money. Use them wisely to build wealth, not debt.',
            highlight: 'Your White Belt in Credit is earned! Use this power responsibly!'
          }
        ];
      
      default:
        return [
          {
            id: 'placeholder',
            type: 'intro',
            title: 'Lesson Coming Soon',
            content: 'This lesson is being prepared for you. Check back soon for more financial wisdom!',
            image: 'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=800'
          }
        ];
    }
  };

  const lessonPages = getLessonData(id || 'budget-intro');

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

  const handlePageComplete = (pageIndex: number) => {
    const newCompleted = new Set(completedPages);
    newCompleted.add(pageIndex);
    setCompletedPages(newCompleted);

    // If all pages completed, show belt reward
    if (newCompleted.size === lessonPages.length) {
      handleLessonCompletion();
    }
  };
  
  const handleLessonCompletion = async () => {
    if (!profile || !id) return;
    
    console.log('Starting lesson completion for lesson:', id, 'user:', profile.id);
    
    // Validate that the lesson ID is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id as string)) {
      console.error('Invalid lesson ID format:', id);
      // For non-UUID IDs (development/fallback), just show the completion modal
      setShowBeltReward(true);
      return;
    }
    
    try {
      // Record lesson completion in user_progress table
      // This will trigger the database functions to award coins and update streaks
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: profile.id,
          lesson_id: id as string, // This should be a valid lesson UUID from the database
          completed: true,
          progress: 1.0,
          time_spent: 300, // 5 minutes estimated
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        });

      if (error) {
        console.error('Supabase error details:', error);
        console.error('Error recording lesson completion:', error);
        Alert.alert('Error', 'Failed to save lesson progress');
        return;
      }

      // Refresh profile to get updated coins and streak
      await refreshProfile();
      console.log('Profile refreshed after lesson completion');
      
      // Show completion modal
      setShowBeltReward(true);
      
    } catch (error) {
      console.error('Error completing lesson:', error);
      Alert.alert('Error', 'Failed to complete lesson');
    }
  };

  const goToNextPage = () => {
    if (currentPage < lessonPages.length - 1) {
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
              <Text style={styles.pageNumberText}>{index + 1}/{lessonPages.length}</Text>
            </View>
          </View>

          {/* Page Image */}
          {page.image && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: page.image }} style={styles.pageImage} />
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
          
          {currentPage < lessonPages.length - 1 ? (
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

  return (
    <View style={styles.container}>
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
          <Text style={styles.headerProgressText}>{completedPages.size}/{lessonPages.length}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(completedPages.size / lessonPages.length) * 100}%` }
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
        {lessonPages.map((page, index) => renderPage(page, index))}
      </ScrollView>

      {/* Belt Reward Modal */}
      {showBeltReward && (
        <View style={styles.rewardOverlay}>
          <View style={styles.rewardModal}>
            <View style={styles.rewardIcon}>
              <Award color={Colors.accent.yellow} size={48} />
            </View>
            <Text style={styles.rewardTitle}>Lesson Complete!</Text>
            <Text style={styles.rewardText}>
              Congratulations! You've completed this lesson and earned 50 Dough Coins.
            </Text>
            <View style={styles.rewardStats}>
              <Text style={styles.rewardStat}>+50 Dough Coins</Text>
              <Text style={styles.rewardStat}>+1 Lesson Complete</Text>
            </View>
            <TouchableOpacity 
              style={styles.rewardButton}
              onPress={() => {
                setShowBeltReward(false);
                router.back();
              }}
            >
              <Text style={styles.rewardButtonText}>Continue Journey</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
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
    fontSize: FONT_SIZE.lg,
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
    fontSize: FONT_SIZE.sm,
    color: Colors.accent.orange,
  },
  progressBarContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: Colors.background.secondary,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.background.tertiary,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent.teal,
    borderRadius: BORDER_RADIUS.full,
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
    fontSize: FONT_SIZE.xs,
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
    fontSize: FONT_SIZE.sm,
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
    height: 200,
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
    fontSize: FONT_SIZE.xxl,
    color: Colors.text.primary,
    marginBottom: SPACING.lg,
    lineHeight: FONT_SIZE.xxl * 1.3,
  },
  pageText: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.secondary,
    lineHeight: FONT_SIZE.md * 1.6,
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
    fontSize: FONT_SIZE.md,
    color: Colors.text.primary,
    marginLeft: SPACING.md,
    flex: 1,
    lineHeight: FONT_SIZE.md * 1.5,
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
    fontSize: FONT_SIZE.md,
    color: Colors.text.primary,
    flex: 1,
    lineHeight: FONT_SIZE.md * 1.5,
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
    fontSize: FONT_SIZE.lg,
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
    fontSize: FONT_SIZE.sm,
    color: Colors.accent.magenta,
    marginBottom: SPACING.xs,
  },
  exampleText: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.secondary,
    lineHeight: FONT_SIZE.md * 1.5,
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
    fontSize: FONT_SIZE.md,
    color: Colors.accent.green,
  },
  incompleteIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  incompleteText: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
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
  },
  navButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.md,
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
  },
  continueButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.md,
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
  },
  finishButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.md,
    color: Colors.background.primary,
  },
  rewardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  rewardModal: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    width: '100%',
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
    fontSize: FONT_SIZE.xl,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  rewardText: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: FONT_SIZE.md * 1.5,
    marginBottom: SPACING.xl,
  },
  rewardStats: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  rewardStat: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.md,
    color: Colors.accent.teal,
  },
  rewardButton: {
    backgroundColor: Colors.accent.teal,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    width: '100%',
    alignItems: 'center',
  },
  rewardButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.md,
    color: Colors.background.primary,
  },
});