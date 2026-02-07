// Core type definitions for the application

export type UserRole = 'admin' | 'teacher' | 'student';

export type Language = 'en' | 'hi' | 'ta' | 'te' | 'kn' | 'ml' | 'bn' | 'mr' | 'gu' | 'ur' | 'as' | 'or' | 'pa' | 'brx' | 'doi' | 'kok' | 'mai' | 'mni' | 'ne' | 'sa' | 'sat' | 'sd';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  language: Language;
  institutionId?: string;
  createdAt: string;
}

export interface TranslationData {
  text: string;
  simplified?: string;
  explanation?: string;
  audioUrl?: string;
}

export interface Content {
  contentId: string;
  subject: string;
  topic: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  language: Language;
  text: string;
  simplifiedText: string;
  audioUrl?: string;
  uploadedBy: string;
  approved: boolean;
  translations: Record<string, TranslationData>;
  createdAt: string;
  classroomId?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'document';
  originalFileUrl?: string;
  fileType?: string;
}

export interface Progress {
  id: string;
  studentId: string;
  contentId: string;
  topic: string;
  completion: number;
  score: number;
  lastAccessed: string;
}

export interface Institution {
  id: string;
  name: string;
  supportedLanguages: Language[];
  adminId: string;
  createdAt: string;
}

export interface Report {
  id: string;
  type: 'user' | 'language' | 'performance';
  data: any;
  generatedAt: string;
}

export interface Question {
  id: string;
  studentId: string;
  contentId: string;
  question: string;
  answer: string;
  timestamp: string;
}

export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  hi: 'हिन्दी (Hindi)',
  ta: 'தமிழ் (Tamil)',
  te: 'తెలుగు (Telugu)',
  kn: 'ಕನ್ನಡ (Kannada)',
  ml: 'മലയാളം (Malayalam)',
  bn: 'বাংলা (Bengali)',
  mr: 'मराठी (Marathi)',
  gu: 'ગુજરાતી (Gujarati)',
  ur: 'اردو (Urdu)',
  as: 'অসমীয়া (Assamese)',
  or: 'ଓଡ଼ିଆ (Odia)',
  pa: 'ਪੰਜਾਬੀ (Punjabi)',
  brx: 'बड़ो (Bodo)',
  doi: 'डोगरी (Dogri)',
  kok: 'कोंकणी (Konkani)',
  mai: 'मैथिली (Maithili)',
  mni: 'মৈতৈলোন্ (Manipuri)',
  ne: 'नेपाली (Nepali)',
  sa: 'संस्कृतम् (Sanskrit)',
  sat: 'संथाली (Santhali)',
  sd: 'सिन्धी (Sindhi)',
};
