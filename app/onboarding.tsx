import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';
import { SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS } from '@/constants/Theme';
import { ArrowRight } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { SenseiWelcome } from '@/components/Sensei';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    title: "Welcome to DoughJo!",
    subtitle: "Level up your money game with DoughJo Sensei",
    description: "Learn financial skills through fun, bite-sized lessons. Earn rewards and track your progress as you master your finances.",
    image: require('@/assets/images/onboarding-1.png')
  },
  {
    title: "Master Financial Skills",
    subtitle: "Train in different financial dojos",
    description: "Progress through our skill tree to learn budgeting, saving, investing, and more. Each completed lesson brings you closer to financial mastery.",
    image: require('@/assets/images/onboarding-2.png')
  },
  {
    title: "Earn While You Learn",
    subtitle: "Collect Dough Coins & achievements",
    description: "Complete lessons, maintain streaks, and tackle challenges to earn Dough Coins and unlock special rewards.",
    image: require('@/assets/images/doughjoan.gif')
  }
];

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      router.replace('/(auth)/login');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.slideContainer}>
        <Animated.View 
          key={currentSlide}
          entering={FadeIn.duration(400)}
          exiting={FadeOut.duration(400)}
          style={styles.slide}
        >
          <View style={styles.imageContainer}>
            {currentSlide === 0 ? (
              <SenseiWelcome style={styles.senseiContainer} />
            ) : (
              <Image 
                source={SLIDES[currentSlide].image}
                style={styles.image}
                resizeMode="contain"
              />
            )}
          </View>
          
          <Text style={styles.subtitle}>{SLIDES[currentSlide].subtitle}</Text>
          <Text style={styles.title}>{SLIDES[currentSlide].title}</Text>
          <Text style={styles.description}>{SLIDES[currentSlide].description}</Text>
        </Animated.View>
      </View>
      
      <View style={styles.footer}>
        <View style={styles.paginationContainer}>
          {SLIDES.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.paginationDot,
                currentSlide === index && styles.paginationDotActive
              ]} 
            />
          ))}
        </View>
        
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentSlide === SLIDES.length - 1 ? "Get Started" : "Next"}
          </Text>
          <ArrowRight size={20} color={Colors.background.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  slide: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: width * 0.8,
    height: width * 0.8,
    marginBottom: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  senseiContainer: {
    width: width * 0.7,
    height: width * 0.7,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.xxxl,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.lg,
    color: Colors.accent.teal,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  footer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: Colors.text.tertiary,
    marginRight: SPACING.sm,
  },
  paginationDotActive: {
    backgroundColor: Colors.accent.teal,
    width: 20,
  },
  nextButton: {
    backgroundColor: Colors.accent.teal,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.md,
    color: Colors.background.primary,
    marginRight: SPACING.sm,
  },
});