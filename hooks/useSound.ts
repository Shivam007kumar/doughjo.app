import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SoundSettings {
  soundEnabled: boolean;
}

export function useSound() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sounds, setSounds] = useState<{[key: string]: Audio.Sound}>({});

  useEffect(() => {
    loadSoundSettings();
    if (Platform.OS !== 'web') {
      loadSounds();
    }
    
    return () => {
      // Cleanup sounds
      Object.values(sounds).forEach(sound => {
        sound.unloadAsync();
      });
    };
  }, []);

  const loadSoundSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('soundSettings');
      if (settings) {
        const parsed: SoundSettings = JSON.parse(settings);
        setSoundEnabled(parsed.soundEnabled);
      }
    } catch (error) {
      console.error('Error loading sound settings:', error);
    }
  };

  const saveSoundSettings = async (enabled: boolean) => {
    try {
      const settings: SoundSettings = { soundEnabled: enabled };
      await AsyncStorage.setItem('soundSettings', JSON.stringify(settings));
      setSoundEnabled(enabled);
    } catch (error) {
      console.error('Error saving sound settings:', error);
    }
  };

  const loadSounds = async () => {
    if (Platform.OS === 'web') return;

    try {
      // Create sound objects for correct, incorrect, and click sounds
      // Note: You would need to add actual sound files to assets/sounds/
      const soundFiles = {
        correct: require('@/assets/sounds/correct.mp3'),
        incorrect: require('@/assets/sounds/incorrect.mp3'),
        click: require('@/assets/sounds/click.mp3')
      };

      const loadedSounds: {[key: string]: Audio.Sound} = {};

      for (const [key, file] of Object.entries(soundFiles)) {
        try {
          const { sound } = await Audio.Sound.createAsync(file);
          loadedSounds[key] = sound;
        } catch (error) {
          console.warn(`Could not load ${key} sound:`, error);
          // Create a dummy sound object that won't crash
          loadedSounds[key] = {
            replayAsync: async () => {},
            unloadAsync: async () => {}
          } as Audio.Sound;
        }
      }

      setSounds(loadedSounds);
    } catch (error) {
      console.error('Error loading sounds:', error);
    }
  };

  const playSound = async (soundType: 'correct' | 'incorrect' | 'click') => {
    if (!soundEnabled) {
      return;
    }

    if (Platform.OS === 'web') {
      // For web, use Web Audio API or just skip silently
      return;
    }

    try {
      const sound = sounds[soundType];
      if (sound && sound.replayAsync) {
        await sound.replayAsync();
      }
    } catch (error) {
      // Silently handle sound errors to prevent UI disruption
      console.warn(`Could not play ${soundType} sound:`, error);
    }
  };

  const toggleSound = () => {
    const newState = !soundEnabled;
    saveSoundSettings(newState);
  };

  return {
    soundEnabled,
    toggleSound,
    playSound
  };
}