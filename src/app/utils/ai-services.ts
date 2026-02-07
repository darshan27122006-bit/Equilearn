// AI and ML service utilities
// In production, these would call real APIs (HuggingFace, Google Translate, etc.)
// For this demo, we use mock implementations with realistic behavior

import { Language, LANGUAGE_NAMES } from '@/app/types';

// Mock language detection
export const detectLanguage = (text: string): Language => {
  // Simple heuristic-based detection (in production, use real API)
  const patterns = {
    hi: /[\u0900-\u097F]/,
    ta: /[\u0B80-\u0BFF]/,
    te: /[\u0C00-\u0C7F]/,
    kn: /[\u0C80-\u0CFF]/,
    ml: /[\u0D00-\u0D7F]/,
    bn: /[\u0980-\u09FF]/,
  };

  for (const [lang, pattern] of Object.entries(patterns)) {
    if (pattern.test(text)) {
      return lang as Language;
    }
  }

  return 'en';
};

// Mock translation service
export const translateText = async (
  text: string,
  targetLang: Language
): Promise<string> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock translations (in production, use Google Translate or HuggingFace)
  const greetings: Partial<Record<Language, string>> = {
    en: text,
    hi: `[हिंदी में अनुवादित] ${text}`,
    ta: `[தமிழில் மொழிபெயர்க்கப்பட்டது] ${text}`,
    te: `[తెలుగులో అనువదించబడింది] ${text}`,
    kn: `[ಕನ್ನಡದಲ್ಲಿ ಅನುವಾದಿಸಲಾಗಿದೆ] ${text}`,
    ml: `[മലയാളത്തിൽ വിവർത്തനം ചെയ്തു] ${text}`,
    bn: `[বাংলায় অনুবাদিত] ${text}`,
  };

  return greetings[targetLang] || text;
};

// Mock text simplification based on level
export const simplifyText = async (
  text: string,
  level: 'beginner' | 'intermediate' | 'advanced'
): Promise<string> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  switch (level) {
    case 'beginner':
      // Very simple, short sentences
      return `[Simplified for beginners]\n\n${text.substring(0, 200)}...\n\nThis is explained in simple words with easy examples.`;
    case 'intermediate':
      // Moderate complexity
      return `[Simplified for intermediate level]\n\n${text.substring(0, 400)}...\n\nThis includes more details and concepts.`;
    case 'advanced':
      // Full complexity
      return text;
    default:
      return text;
  }
};

// Text-to-Speech using Backend API (gTTS)
export const speakText = async (text: string, lang: Language): Promise<void> => {
  try {
    const res = await fetch(`/api/ai/generate_audio`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ text, language: lang })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.audio_url) {
        // Use relative URL for better portability
        const audioUrl = data.audio_url;
        const audio = new Audio(audioUrl);
        audio.play();
        (window as any).currentAudio = audio;
      }
    }
  } catch (e) {
    console.error("TTS Error", e);
  }
};

// Stop currently playing speech
export const stopSpeech = () => {
  if ((window as any).currentAudio) {
    (window as any).currentAudio.pause();
    (window as any).currentAudio = null;
  }
};

// Web Speech API for Recognition
export const startSpeechRecognition = (
  language: Language,
  onResult: (text: string) => void,
  onError: (error: any) => void
) => {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError("Speech recognition not supported in this browser.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = language;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event: any) => {
    const text = event.results[0][0].transcript;
    onResult(text);
  };

  recognition.onerror = (event: any) => {
    onError(event.error);
  };

  recognition.start();
};

// Generate AI answer to student question using backend
export const generateAnswer = async (
  question: string,
  contentId: string,
  language: Language,
  level: string = 'medium'
): Promise<string> => {
  try {
    const res = await fetch('/api/ai/chatbot_query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ question, contentId, language, level })
    });
    const data = await res.json();
    return data.response || "I'm having trouble connecting to the AI assistant.";
  } catch (e) {
    return "Failed to get AI response.";
  }
};

// Generate Quiz using backend
export const generateQuiz = async (text: string): Promise<any> => {
  try {
    const res = await fetch('/api/ai/generate_quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ text })
    });
    return await res.json();
  } catch (e) {
    console.error("Quiz Gen Error", e);
    return { success: false };
  }
};

// Extract text from file using backend
export const extractText = async (file: File): Promise<{ text: string; originalFileUrl?: string; fileType?: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch('/api/ai/extract_text', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });
    const data = await res.json();
    return {
      text: data.text || "",
      originalFileUrl: data.originalFileUrl,
      fileType: data.fileType
    };
  } catch (e) {
    console.error("Extraction Error", e);
    return { text: "" };
  }
};

// Content translation to multiple languages (backend supported now)
export const translateToAllLanguages = async (
  text: string,
  languages: Language[]
): Promise<Record<string, { text: string; simplified?: string }>> => {
  try {
    const res = await fetch('/api/ai/translate_text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ text, targetLanguages: languages })
    });
    const data = await res.json();
    return data.translations || {};
  } catch (e) {
    return {};
  }
};

// Simplified text generation
export const getSimplifiedText = async (text: string, level: string): Promise<string> => {
  try {
    const res = await fetch('/api/ai/simplify_text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ text, level })
    });
    const data = await res.json();
    return data.simplifiedText || text;
  } catch (e) {
    return text;
  }
};

// Reconstruct lesson using AI fallback
export const reconstructLesson = async (topic: string, subject: string, level: string): Promise<string | null> => {
  try {
    const res = await fetch('/api/ai/reconstruct_lesson', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ topic, subject, level })
    });
    const data = await res.json();
    return data.success ? data.text : null;
  } catch (e) {
    console.error("Reconstruction Error", e);
    return null;
  }
};

// Updated processUploadedContent to use backend routes or logic
export const processUploadedContent = async (
  content: string,
  targetLanguages: Language[],
  level: 'beginner' | 'intermediate' | 'advanced',
  file?: File
) => {
  let textToProcess = content;
  let originalFileUrl: string | undefined = undefined;
  let fileType: string | undefined = undefined;

  if (file && !content) {
    const result = await extractText(file);
    textToProcess = result.text;
    originalFileUrl = result.originalFileUrl;
    fileType = result.fileType;
  }

  const detectedLang = detectLanguage(textToProcess);
  const simplified = await getSimplifiedText(textToProcess, level);
  const translations = await translateToAllLanguages(textToProcess, targetLanguages);

  return {
    originalText: textToProcess,
    detectedLanguage: detectedLang,
    simplifiedText: simplified,
    translations,
    originalFileUrl,
    fileType
  };
};
