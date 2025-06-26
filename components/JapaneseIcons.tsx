import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect, Polygon } from 'react-native-svg';

interface JapaneseIconProps {
  type: 'torii' | 'helmet' | 'dojo' | 'scroll';
  size?: number;
  color?: string;
}

export function JapaneseIcon({ type, size = 24, color = '#FFFFFF' }: JapaneseIconProps) {
  const renderIcon = () => {
    switch (type) {
      case 'torii':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Torii Gate */}
            <Path
              d="M3 8h18M5 8v12M19 8v12M2 6h20v2H2zM4 4h16v2H4z"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      
      case 'helmet':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Samurai Helmet */}
            <Path
              d="M12 2C8 2 5 5 5 9v6c0 2 1 3 3 3h8c2 0 3-1 3-3V9c0-4-3-7-7-7z"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M8 18l-2 3M16 18l2 3M9 12h6M10 15h4"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      
      case 'dojo':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Traditional Building */}
            <Path
              d="M3 21h18M4 21V10l8-6 8 6v11M8 21V14h8v7M12 14v7"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M2 10h20v2H2z"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      
      case 'scroll':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Unfurled Scroll */}
            <Path
              d="M4 6h16v12H4zM2 6v12c0 1 1 2 2 2M22 6v12c0 1-1 2-2 2"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M8 10h8M8 14h6"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      
      default:
        return null;
    }
  };

  return <View style={styles.container}>{renderIcon()}</View>;
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});