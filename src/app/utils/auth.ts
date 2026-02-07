// Authentication utilities
// In production, this would use JWT tokens and secure backend authentication

import { User, UserRole } from '@/app/types';
import { storage } from './storage';

// Mock JWT token generation
const generateToken = (userId: string): string => {
  // In production, this would be a real JWT token from backend
  return btoa(JSON.stringify({ userId, timestamp: Date.now() }));
};

// Initialize with default admin if no users exist
export const initializeDefaultUsers = () => {
  const users = storage.getUsers();
  
  if (users.length === 0) {
    // Create default admin
    const defaultAdmin: User = {
      id: 'admin-001',
      name: 'Admin User',
      email: 'admin@mlassistant.com',
      role: 'admin',
      language: 'en',
      createdAt: new Date().toISOString(),
    };

    // Create default teacher
    const defaultTeacher: User = {
      id: 'teacher-001',
      name: 'Teacher Demo',
      email: 'teacher@mlassistant.com',
      role: 'teacher',
      language: 'en',
      institutionId: 'inst-001',
      createdAt: new Date().toISOString(),
    };

    // Create default student
    const defaultStudent: User = {
      id: 'student-001',
      name: 'Student Demo',
      email: 'student@mlassistant.com',
      role: 'student',
      language: 'en',
      institutionId: 'inst-001',
      createdAt: new Date().toISOString(),
    };

    storage.setUsers([
      { ...defaultAdmin, password: 'admin123' },
      { ...defaultTeacher, password: 'teacher123' },
      { ...defaultStudent, password: 'student123' },
    ]);

    // Create default institution
    storage.addInstitution({
      id: 'inst-001',
      name: 'Demo Institution',
      supportedLanguages: ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn'],
      adminId: 'admin-001',
      createdAt: new Date().toISOString(),
    });
  }
};

// Login function
export const login = (
  email: string,
  password: string
): { success: boolean; user?: User; token?: string; error?: string } => {
  const users = storage.getUsers();
  const user = users.find(
    (u: any) => u.email === email && u.password === password
  );

  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    const token = generateToken(user.id);
    storage.setCurrentUser(userWithoutPassword);
    return { success: true, user: userWithoutPassword, token };
  }

  return { success: false, error: 'Invalid email or password' };
};

// Logout function
export const logout = () => {
  storage.clearCurrentUser();
};

// Register new user
export const register = (
  name: string,
  email: string,
  password: string,
  role: UserRole,
  language: string,
  institutionId?: string
): { success: boolean; user?: User; error?: string } => {
  const users = storage.getUsers();
  
  // Check if email already exists
  if (users.some((u: any) => u.email === email)) {
    return { success: false, error: 'Email already registered' };
  }

  const newUser: User & { password: string } = {
    id: `${role}-${Date.now()}`,
    name,
    email,
    password,
    role,
    language: language as any,
    institutionId,
    createdAt: new Date().toISOString(),
  };

  storage.addUser(newUser);
  
  const { password: _, ...userWithoutPassword } = newUser;
  return { success: true, user: userWithoutPassword };
};

// Get current user
export const getCurrentUser = (): User | null => {
  return storage.getCurrentUser();
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

// Check user role
export const hasRole = (role: UserRole): boolean => {
  const user = getCurrentUser();
  return user?.role === role;
};

// Update user profile
export const updateProfile = (
  userId: string,
  updates: Partial<User>
): { success: boolean; error?: string } => {
  try {
    storage.updateUser(userId, updates);
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      storage.setCurrentUser({ ...currentUser, ...updates });
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update profile' };
  }
};
