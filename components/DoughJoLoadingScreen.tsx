import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, Dimensions, Text, TouchableOpacity } from 'react-native';
import Colors from '@/constants/Colors';
import { SPACING, BORDER_RADIUS, FONT_SIZE } from '@/constants/Theme';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface DoughJoLoadingScreenProps {
  onLoadingComplete: () => void;
  minDelay?: number;
  maxDelay?: number;
  showRetryAfter?: number;
}

const doughJoImages = [
  require('@/assets/images/smiling doughjo.png'),
  require('@/assets/images/happy cheering dough jo.png'),
  require('@/assets/images/standard doughjo.png'),
  require('@/assets/images/smily dough jo.png'),
  require('@/assets/images/dough jo in love.png'),
  require('@/assets/images/premium-dough-jo.png'),
];

export function DoughJoLoadingScreen({ 
  onLoadingComplete, 
  minDelay = 1000, 
  maxDelay = 2500,
  showRetryAfter = 5000
}: DoughJoLoadingScreenProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showRetry, setShowRetry] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading your lesson...');
  
  // Animation values
  const pulseScale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(0);
  const floatY = useSharedValue(0);
  const spinnerRotation = useSharedValue(0);
  const retryOpacity = useSharedValue(0);

  useEffect(() => {
    // Start entrance animation
    opacity.value = withTiming(1, { duration: 500 });
    
    // Start floating animation
    floatY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(10, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    // Start pulse animation
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );

    // Start spinner animation
    spinnerRotation.value = withRepeat(
      withTiming(360, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );

    // Cycle through images
    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % doughJoImages.length);
    }, 800);

    // Update loading text periodically
    const loadingTexts = [
      'Loading your lesson...',
      'Preparing financial wisdom...',
      'DoughJo is getting ready...',
      'Almost there...',
      'Just a moment more...'
    ];
    
    let textIndex = 0;
    const textInterval = setInterval(() => {
      textIndex = (textIndex + 1) % loadingTexts.length;
      setLoadingText(loadingTexts[textIndex]);
    }, 1500);

    // Show retry option after specified time
    const retryTimer = setTimeout(() => {
      setShowRetry(true);
      retryOpacity.value = withTiming(1, { duration: 500 });
    }, showRetryAfter);

    // Random delay before completing
    const randomDelay = Math.random() * (maxDelay - minDelay) + minDelay;
    
    const timer = setTimeout(() => {
      if (!showRetry) {
        // Exit animation
        opacity.value = withTiming(0, { duration: 500 }, () => {
          runOnJS(onLoadingComplete)();
        });
      }
    }, randomDelay);

    return () => {
      clearInterval(imageInterval);
      clearInterval(textInterval);
      clearTimeout(timer);
      clearTimeout(retryTimer);
    };
  }, []);

  const handleRetry = () => {
    // Reset retry state
    setShowRetry(false);
    retryOpacity.value = 0;
    setLoadingText('Retrying...');
    
    // Try again after a short delay
    setTimeout(() => {
      opacity.value = withTiming(0, { duration: 500 }, () => {
        runOnJS(onLoadingComplete)();
      });
    }, 1000);
  };

  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const imageAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: pulseScale.value },
        { translateY: floatY.value },
      ],
    };
  });

  const spinnerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${spinnerRotation.value}deg` },
      ],
    };
  });

  const orbAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      pulseScale.value,
      [1, 1.1],
      [1, 1.2]
    );
    
    return {
      transform: [
        { scale },
      ],
      opacity: interpolate(
        pulseScale.value,
        [1, 1.1],
        [0.3, 0.1]
      ),
    };
  });

  const retryAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: retryOpacity.value,
      transform: [
        { 
          translateY: interpolate(
            retryOpacity.value,
            [0, 1],
            [20, 0]
          )
        }
      ],
    };
  });

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      {/* Background orbs for depth */}
      <Animated.View style={[styles.backgroundOrb, styles.orb1, orbAnimatedStyle]} />
      <Animated.View style={[styles.backgroundOrb, styles.orb2, orbAnimatedStyle]} />
      <Animated.View style={[styles.backgroundOrb, styles.orb3, orbAnimatedStyle]} />
      
      {/* Main content container */}
      <View style={styles.contentContainer}>
        {/* DoughJo character */}
        <Animated.View style={[styles.imageContainer, imageAnimatedStyle]}>
          <Image
            source={doughJoImages[currentImageIndex]}
            style={styles.doughJoImage}
            resizeMode="contain"
          />
          
          {/* Glow effect */}
          <View style={styles.glowEffect} />
        </Animated.View>

        {/* Loading spinner */}
        <Animated.View style={[styles.spinnerContainer, spinnerAnimatedStyle]}>
          <View style={styles.spinner}>
            {[...Array(8)].map((_, index) => (
              <View
                key={index}
                style={[
                  styles.spinnerDot,
                  {
                    transform: [
                      { rotate: `${index * 45}deg` },
                      { translateY: -25 },
                    ],
                  },
                ]}
              />
            ))}
          </View>
        </Animated.View>

        {/* Floating particles */}
        {[...Array(6)].map((_, index) => (
          <FloatingParticle key={index} index={index} />
        ))}
        
        {/* Loading text */}
        <View style={styles.textContainer}>
          <Text style={styles.loadingText}>{loadingText}</Text>
        </View>
        
        {/* Retry button */}
        {showRetry && (
          <Animated.View style={[styles.retryContainer, retryAnimatedStyle]}>
            <Text style={styles.retryMessage}>Taking longer than expected...</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
}

// Floating particle component
function FloatingParticle({ index }: { index: number }) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    const delay = index * 200;
    
    // Entrance
    setTimeout(() => {
      opacity.value = withTiming(1, { duration: 500 });
      scale.value = withTiming(1, { duration: 500 });
    }, delay);

    // Floating animation
    setTimeout(() => {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-30 - Math.random() * 20, { 
            duration: 2000 + Math.random() * 1000,
            easing: Easing.inOut(Easing.sin) 
          }),
          withTiming(30 + Math.random() * 20, { 
            duration: 2000 + Math.random() * 1000,
            easing: Easing.inOut(Easing.sin) 
          })
        ),
        -1,
        true
      );

      translateX.value = withRepeat(
        withSequence(
          withTiming(-20 - Math.random() * 15, { 
            duration: 3000 + Math.random() * 1000,
            easing: Easing.inOut(Easing.sin) 
          }),
          withTiming(20 + Math.random() * 15, { 
            duration: 3000 + Math.random() * 1000,
            easing: Easing.inOut(Easing.sin) 
          })
        ),
        -1,
        true
      );
    }, delay);
  }, []);

  const particleAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  const positions = [
    { top: '20%', left: '15%' },
    { top: '30%', right: '20%' },
    { bottom: '35%', left: '10%' },
    { bottom: '25%', right: '15%' },
    { top: '60%', left: '80%' },
    { top: '70%', right: '75%' },
  ];

  return (
    <Animated.View 
      style={[
        styles.particle, 
        positions[index],
        particleAnimatedStyle
      ]} 
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
    position: 'relative',
  },
  doughJoImage: {
    width: 200,
    height: 200,
    zIndex: 2,
  },
  glowEffect: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: Colors.accent.teal,
    opacity: 0.1,
    zIndex: 1,
  },
  spinnerContainer: {
    marginTop: SPACING.xl,
  },
  spinner: {
    width: 60,
    height: 60,
    position: 'relative',
  },
  spinnerDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent.teal,
    top: '50%',
    left: '50%',
    marginLeft: -4,
    marginTop: -4,
  },
  backgroundOrb: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: Colors.accent.teal,
  },
  orb1: {
    width: 100,
    height: 100,
    top: '15%',
    left: '10%',
  },
  orb2: {
    width: 80,
    height: 80,
    top: '70%',
    right: '15%',
  },
  orb3: {
    width: 60,
    height: 60,
    bottom: '20%',
    left: '20%',
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent.yellow,
  },
  textContainer: {
    marginTop: SPACING.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.lg,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  retryContainer: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  retryMessage: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  retryButton: {
    backgroundColor: Colors.accent.teal,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  retryButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.md,
    color: Colors.background.primary,
  },
});