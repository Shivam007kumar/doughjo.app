import * as SecureStore from 'expo-secure-store';

export const supabaseStorage = {
  getItem: SecureStore.getItemAsync,
  setItem: SecureStore.setItemAsync,
  removeItem: SecureStore.deleteItemAsync,
}; 