const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

// DoughJo color palette
const COLORS = {
  // Primary theme colors
  background: {
    primary: '#1A1A1A',
    secondary: '#222222',
    tertiary: '#2A2A2A'
  },
  
  // Accent colors
  accent: {
    teal: '#00E5CC', // Electric Teal (primary CTAs, progress)
    magenta: '#FF34B3', // Bright Magenta (secondary highlights)
    green: '#AAFF00', // Neon Lime Green (positive reinforcement)
    yellow: '#FFD600', // For Dough Coins and rewards
    orange: '#FF8A00', // For warnings or important notices
    red: '#FF3A5E', // For errors or negative feedback
  },
  
  // Text colors
  text: {
    primary: '#FFFFFF',
    secondary: '#BBBBBB',
    tertiary: '#888888',
    disabled: '#555555',
  },
  
  // Skill level colors (belt progression)
  belt: {
    white: '#F5F5F5',
    yellow: '#FFD600',
    orange: '#FF8A00',
    green: '#AAFF00',
    blue: '#00A3FF',
    purple: '#BA00FF',
    brown: '#8B4513',
    black: '#000000',
  },
  
  // UI component colors
  card: {
    background: '#2A2A2A',
    border: '#3A3A3A',
  },
  
  button: {
    primary: '#00E5CC',
    secondary: '#FF34B3',
    disabled: '#444444',
  },
  
  input: {
    background: '#2A2A2A',
    border: '#444444',
    focusBorder: '#00E5CC',
  },
  
  // System colors
  system: {
    success: '#AAFF00',
    warning: '#FFD600',
    error: '#FF3A5E',
    info: '#00A3FF',
  }
};

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: COLORS.text.primary,
    background: COLORS.background.primary,
    tint: COLORS.accent.teal,
    tabIconDefault: COLORS.text.tertiary,
    tabIconSelected: COLORS.accent.teal,
  },
  ...COLORS
};