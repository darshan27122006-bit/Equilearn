import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { LogOut, User as UserIcon, Languages } from 'lucide-react';
import { LoginPage } from '@/app/components/LoginPage';
import { AdminDashboard } from '@/app/components/AdminDashboard';
import { TeacherDashboard } from '@/app/components/TeacherDashboard';
import { StudentDashboard } from '@/app/components/StudentDashboard';
import { User, Language, LANGUAGE_NAMES } from '@/app/types';
import { getCurrentUser, logout, initializeDefaultUsers } from '@/app/utils/auth';
import { initializeDemoContent } from '@/app/utils/demo-data';
import { Toaster } from '@/app/components/ui/sonner';
import { t } from '@/app/utils/translations';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');

  useEffect(() => {
    // Initialize default users and demo content
    initializeDefaultUsers();
    initializeDemoContent();

    // Check if user is already logged in
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setSelectedLanguage(user.language);
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setSelectedLanguage(user.language);
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
  };

  const handleLanguageChange = (lang: Language) => {
    setSelectedLanguage(lang);
    if (currentUser) {
      // Update user preferences
      const updatedUser = { ...currentUser, language: lang };
      setCurrentUser(updatedUser);
    }
  };

  // Determine theme based on role
  const getThemeClass = () => {
    if (!currentUser) return 'student-theme';
    switch (currentUser.role) {
      case 'admin': return 'admin-theme';
      case 'teacher': return 'teacher-theme';
      case 'student': return 'student-theme';
      default: return 'student-theme';
    }
  };

  const themeClass = getThemeClass();

  // If not logged in, show login page in student theme
  if (!currentUser) {
    return (
      <div className="student-theme">
        <LoginPage onLogin={handleLogin} />
        {/* Watermark */}
        <div className="fixed bottom-4 right-4 opacity-20 text-[10px] font-black pointer-events-none select-none z-[100] uppercase tracking-widest text-foreground/50">
          Team Name: Hypercoders
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background text-foreground transition-colors duration-500 ${themeClass}`}>
      {/* Navigation Bar */}
      <nav className="bg-primary text-primary-foreground border-b border-primary/20 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 shadow-inner">
                  <img src="/logo.png" alt="EquiLearn" className="w-7 h-7" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  EquiLearn
                </h1>
                <p className="text-[10px] opacity-80 uppercase tracking-widest font-semibold">
                  {t('multilingualAsst', selectedLanguage)}
                </p>
              </div>
            </div>

            {/* User Info and Controls */}
            <div className="flex items-center gap-4">
              {/* Language Selector */}
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 opacity-80" />
                <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white placeholder:text-white/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                      <SelectItem key={code} value={code}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* User Info */}
              <div className="flex items-center gap-3 px-4 py-1.5 bg-white/10 rounded-full border border-white/10 backdrop-blur-sm shadow-sm">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground shadow-md">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div className="text-sm">
                  <div className="font-bold leading-tight">{currentUser.name}</div>
                  <div className="text-[10px] opacity-70 uppercase font-black">{currentUser.role}</div>
                </div>
              </div>

              {/* Logout Button */}
              <Button variant="outline" size="sm" onClick={handleLogout} className="bg-transparent border-white/30 hover:bg-white/20 text-white transition-all">
                <LogOut className="w-4 h-4 mr-2" />
                {t('logout', selectedLanguage)}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {currentUser.role === 'admin' && <AdminDashboard />}
        {currentUser.role === 'teacher' && (
          <TeacherDashboard
            currentUser={currentUser}
            selectedLanguage={selectedLanguage}
            onLanguageChange={handleLanguageChange}
          />
        )}
        {currentUser.role === 'student' && (
          <StudentDashboard
            currentUser={currentUser}
            selectedLanguage={selectedLanguage}
            onLanguageChange={handleLanguageChange}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground border-t border-primary/20 mt-12 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="EquiLearn" className="w-10 h-10 rounded-lg" />
                <h3 className="text-xl font-bold">EquiLearn</h3>
              </div>
              <p className="text-sm opacity-80 leading-relaxed">
                {t('appDescription', selectedLanguage) || "AI-Based Multilingual Learning Assistant for Local & Minority Languages. Empowering education through technology and linguistic diversity."}
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4 border-b border-white/10 pb-2">{t('features', selectedLanguage) || "Features"}</h3>
              <ul className="text-sm space-y-2 opacity-80">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent" /> {t('feature1', selectedLanguage) || "15+ supported languages"}</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent" /> {t('feature2', selectedLanguage) || "AI-powered translation"}</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent" /> {t('feature3', selectedLanguage) || "Speech-to-text & TTS"}</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent" /> {t('feature4', selectedLanguage) || "Offline support"}</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent" /> {t('feature5', selectedLanguage) || "Progress tracking"}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4 border-b border-white/10 pb-2">{t('techStack', selectedLanguage) || "Tech Stack"}</h3>
              <ul className="text-sm space-y-2 opacity-80">
                <li>• React + TypeScript</li>
                <li>• Python Flask Backend</li>
                <li>• Local Storage (offline)</li>
                <li>• Responsive UI</li>
                <li>• Role-based access</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 text-center text-xs opacity-60">
            © 2026 EquiLearn. Built for accessibility and inclusion. Developed by Expert UI Team.
          </div>
        </div>
      </footer>

      {/* Toast Notifications */}
      <Toaster />

      {/* Watermark */}
      <div className="fixed bottom-4 right-4 opacity-20 text-[10px] font-black pointer-events-none select-none z-[100] uppercase tracking-widest text-foreground/50">
        Team Name: Hypercoders
      </div>
    </div>
  );
}
