// Enhanced local storage utility
export class StorageManager {
  static set(key, value) {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
      return true;
    } catch (error) {
      console.error(`Failed to save to localStorage:`, error);
      return false;
    }
  }

  static get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (error) {
      console.error(`Failed to read from localStorage:`, error);
      return defaultValue;
    }
  }

  static remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Failed to remove from localStorage:`, error);
      return false;
    }
  }

  static clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error(`Failed to clear localStorage:`, error);
      return false;
    }
  }

  // Validate data integrity
  static validateQuestionData(questions) {
    return questions.every(q => 
      q.id && 
      q.question && 
      Array.isArray(q.answers) && 
      q.answers.length > 0 &&
      q.answers.some(a => a.isCorrect) &&
      q.explanation
    );
  }
}
