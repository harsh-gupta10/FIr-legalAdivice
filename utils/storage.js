import AsyncStorage from '@react-native-async-storage/async-storage';

const DRAFT_KEY = 'fir:draft:v1';

export const saveDraft = async (formData) => {
  try {
    await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
    return true;
  } catch (error) {
    console.error('Error saving draft:', error);
    return false;
  }
};

export const loadDraft = async () => {
  try {
    const draft = await AsyncStorage.getItem(DRAFT_KEY);
    if (draft) {
      return JSON.parse(draft);
    }
    return null;
  } catch (error) {
    console.error('Error loading draft:', error);
    return null;
  }
};

export const deleteDraft = async () => {
  try {
    await AsyncStorage.removeItem(DRAFT_KEY);
    return true;
  } catch (error) {
    console.error('Error deleting draft:', error);
    return false;
  }
};
