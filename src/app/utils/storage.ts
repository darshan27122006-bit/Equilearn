// Local storage utilities for offline support and data persistence

const STORAGE_KEYS = {
  USER: 'ml_assistant_user',
  USERS: 'ml_assistant_users',
  CONTENT: 'ml_assistant_content',
  PROGRESS: 'ml_assistant_progress',
  INSTITUTIONS: 'ml_assistant_institutions',
  CACHED_LESSONS: 'ml_assistant_cached_lessons',
  QUESTIONS: 'ml_assistant_questions',
};

export const storage = {
  // User management
  setCurrentUser: (user: any) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  getCurrentUser: () => {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  },

  clearCurrentUser: () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  // Users database
  getUsers: () => {
    const users = localStorage.getItem(STORAGE_KEYS.USERS);
    return users ? JSON.parse(users) : [];
  },

  setUsers: (users: any[]) => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  addUser: (user: any) => {
    const users = storage.getUsers();
    users.push(user);
    storage.setUsers(users);
  },

  updateUser: (userId: string, updates: any) => {
    const users = storage.getUsers();
    const index = users.findIndex((u: any) => u.id === userId);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      storage.setUsers(users);
    }
  },

  deleteUser: (userId: string) => {
    const users = storage.getUsers();
    const filtered = users.filter((u: any) => u.id !== userId);
    storage.setUsers(filtered);
  },

  // Content management
  getContent: () => {
    const content = localStorage.getItem(STORAGE_KEYS.CONTENT);
    return content ? JSON.parse(content) : [];
  },

  setContent: (content: any[]) => {
    localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(content));
  },

  addContent: (content: any) => {
    const contents = storage.getContent();
    contents.push(content);
    storage.setContent(contents);
  },

  updateContent: (contentId: string, updates: any) => {
    const contents = storage.getContent();
    const index = contents.findIndex((c: any) => c.contentId === contentId);
    if (index !== -1) {
      contents[index] = { ...contents[index], ...updates };
      storage.setContent(contents);
    }
  },

  deleteContent: (contentId: string) => {
    const contents = storage.getContent();
    const filtered = contents.filter((c: any) => c.contentId !== contentId);
    storage.setContent(filtered);
  },

  // Progress tracking
  getProgress: () => {
    const progress = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    return progress ? JSON.parse(progress) : [];
  },

  setProgress: (progress: any[]) => {
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
  },

  addProgress: (progress: any) => {
    const progressData = storage.getProgress();
    progressData.push(progress);
    storage.setProgress(progressData);
  },

  updateProgress: (progressId: string, updates: any) => {
    const progressData = storage.getProgress();
    const index = progressData.findIndex((p: any) => p.id === progressId);
    if (index !== -1) {
      progressData[index] = { ...progressData[index], ...updates };
      storage.setProgress(progressData);
    }
  },

  // Institutions
  getInstitutions: () => {
    const institutions = localStorage.getItem(STORAGE_KEYS.INSTITUTIONS);
    return institutions ? JSON.parse(institutions) : [];
  },

  setInstitutions: (institutions: any[]) => {
    localStorage.setItem(STORAGE_KEYS.INSTITUTIONS, JSON.stringify(institutions));
  },

  addInstitution: (institution: any) => {
    const institutions = storage.getInstitutions();
    institutions.push(institution);
    storage.setInstitutions(institutions);
  },

  // Cached lessons for offline access
  getCachedLessons: () => {
    const cached = localStorage.getItem(STORAGE_KEYS.CACHED_LESSONS);
    return cached ? JSON.parse(cached) : [];
  },

  cacheLesson: (lesson: any) => {
    const cached = storage.getCachedLessons();
    const exists = cached.findIndex((l: any) => l.contentId === lesson.contentId);
    if (exists !== -1) {
      cached[exists] = lesson;
    } else {
      cached.push(lesson);
    }
    localStorage.setItem(STORAGE_KEYS.CACHED_LESSONS, JSON.stringify(cached));
  },

  // Questions
  getQuestions: () => {
    const questions = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    return questions ? JSON.parse(questions) : [];
  },

  addQuestion: (question: any) => {
    const questions = storage.getQuestions();
    questions.push(question);
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  },

  // Clear all data
  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  },
};
