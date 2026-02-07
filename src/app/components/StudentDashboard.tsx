
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Progress } from '@/app/components/ui/progress';
import { Textarea } from '@/app/components/ui/textarea';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import {
  BookOpen,
  FileText,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  ChevronRight,
  TrendingUp,
  Award,
  Download,
  MessageSquare,
  Loader2,
  Zap,
  AlertCircle,
} from 'lucide-react';
import { storage } from '@/app/utils/storage';
import { Content, Language, LANGUAGE_NAMES, User } from '@/app/types';
import {
  speakText,
  stopSpeech,
  startSpeechRecognition,
  generateAnswer,
  getSimplifiedText,
  generateQuiz,
  reconstructLesson,
} from '@/app/utils/ai-services';
import { ClassroomList } from './classroom/ClassroomList';
import { ClassroomView } from './classroom/ClassroomView';
import { DMChat } from './chat/DMChat';
import { DMList } from './chat/DMList';
import { VoiceControl } from './common/VoiceControl';
import { t } from '@/app/utils/translations';

interface StudentDashboardProps {
  currentUser: User;
  selectedLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

export function StudentDashboard({ currentUser, selectedLanguage, onLanguageChange }: StudentDashboardProps) {
  const [availableContent, setAvailableContent] = useState<Content[]>([]);
  const [myProgress, setMyProgress] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  // Classroom State
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // Lesson viewer state
  const [currentLesson, setCurrentLesson] = useState<Content | null>(null);
  const [isLessonOpen, setIsLessonOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isGeneratingAnswer, setIsGeneratingAnswer] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const [lessonLevel, setLessonLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [isReconstructing, setIsReconstructing] = useState(false);

  // DM State
  const [selectedChatUser, setSelectedChatUser] = useState<User | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (currentLesson) {
      // Display content in selected language
      const transData = currentLesson.translations?.[selectedLanguage];
      if (typeof transData === 'string') {
        // Fallback for old data
        setDisplayText(transData || currentLesson.text);
      } else {
        // New structure (TranslationData object)
        setDisplayText(transData?.text || currentLesson.text);
      }
    }
  }, [currentLesson, selectedLanguage]);

  const loadData = async () => {
    const allContent = storage.getContent();
    setAvailableContent(allContent.filter((c: Content) => c.approved));

    const progress = storage.getProgress();
    setMyProgress(progress.filter((p: any) => p.studentId === currentUser.id));
  };

  const subjects = Array.from(new Set(availableContent.map((c) => c.subject)));

  const filteredContent = availableContent.filter((c) => {
    if (selectedSubject !== 'all' && c.subject !== selectedSubject) return false;
    if (selectedLevel !== 'all' && c.level !== selectedLevel) return false;
    return true;
  });

  const handleOpenLesson = (content: Content) => {
    setCurrentLesson(content);
    setLessonLevel(content.level as any);
    setIsLessonOpen(true);
    setAnswer('');
    setQuestion('');
    setQuizScore(null);
    setActiveQuiz(null);

    // Cache lesson for offline access
    storage.cacheLesson(content);

    // Track progress
    updateProgress(content);
  };

  const updateProgress = (content: Content) => {
    const existing = myProgress.find(
      (p) => p.contentId === content.contentId && p.studentId === currentUser.id
    );

    if (existing) {
      storage.updateProgress(existing.id, {
        lastAccessed: new Date().toISOString(),
        completion: Math.min(existing.completion + 10, 100),
      });
    } else {
      storage.addProgress({
        id: `progress-${Date.now()}`,
        studentId: currentUser.id,
        contentId: content.contentId,
        topic: content.topic,
        completion: 10,
        score: 0,
        lastAccessed: new Date().toISOString(),
      });
    }
    loadData();
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    } else {
      speakText(displayText, selectedLanguage);
      setIsSpeaking(true);
      // Auto-stop after speech ends
      const words = displayText.split(' ').length;
      const duration = (words / 150) * 60 * 1000 + 2000; // Rough estimate: 150 wpm
      setTimeout(() => setIsSpeaking(false), Math.min(duration, 30000));
    }
  };

  const handleLessonLevelChange = async (newLevel: 'beginner' | 'intermediate' | 'advanced') => {
    if (!currentLesson) return;
    setLessonLevel(newLevel);
    setIsGeneratingAnswer(true);
    try {
      const transData = currentLesson.translations?.[selectedLanguage];
      const sourceText = typeof transData === 'string' ? transData : (transData?.text || currentLesson.text);
      const simplified = await getSimplifiedText(sourceText, newLevel);
      setDisplayText(simplified);
    } catch (error) {
      console.error('Error changing level:', error);
    } finally {
      setIsGeneratingAnswer(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!currentLesson) return;
    setIsGeneratingQuiz(true);
    try {
      const data = await generateQuiz(displayText);
      if (data.success) {
        setActiveQuiz(data);
        setIsQuizOpen(true);
      }
    } catch (error) {
      alert("Failed to generate quiz");
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    startSpeechRecognition(
      selectedLanguage,
      (text) => {
        setQuestion(text);
        setIsListening(false);
      },
      (error) => {
        console.error('Speech recognition error:', error);
        setIsListening(false);
      }
    );
  };

  const handleReconstruct = async () => {
    if (!currentLesson) return;
    setIsReconstructing(true);
    try {
      const repairedText = await reconstructLesson(
        currentLesson.topic,
        currentLesson.subject,
        currentLesson.level
      );
      if (repairedText) {
        // Update local state and storage
        const updatedLesson = { ...currentLesson, text: repairedText };
        storage.updateContent(currentLesson.contentId, { text: repairedText });
        setCurrentLesson(updatedLesson);
        setDisplayText(repairedText);
        alert("Lesson reconstructed successfully using AI!");
      } else {
        alert("Failed to reconstruct lesson content. Please try again.");
      }
    } catch (error) {
      console.error("Reconstruction error:", error);
      alert("Error during reconstruction.");
    } finally {
      setIsReconstructing(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!question || !currentLesson) return;

    setIsGeneratingAnswer(true);
    try {
      const aiAnswer = await generateAnswer(
        question,
        currentLesson.contentId,
        selectedLanguage,
        lessonLevel
      );
      setAnswer(aiAnswer);

      // Save question to history
      storage.addQuestion({
        id: `q-${Date.now()}`,
        studentId: currentUser.id,
        contentId: currentLesson.contentId,
        question,
        answer: aiAnswer,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error generating answer:', error);
      setAnswer('Sorry, I could not generate an answer. Please try again.');
    } finally {
      setIsGeneratingAnswer(false);
    }
  };

  const handleMarkComplete = () => {
    if (!currentLesson) return;

    const existing = myProgress.find(
      (p) => p.contentId === currentLesson.contentId && p.studentId === currentUser.id
    );

    if (existing) {
      storage.updateProgress(existing.id, {
        completion: 100,
        score: 100,
        lastAccessed: new Date().toISOString(),
      });
      loadData();
      alert('Lesson marked as complete! 🎉');
    }
  };

  const stats = {
    totalLessons: availableContent.length,
    completedLessons: myProgress.filter((p) => p.completion === 100).length,
    inProgress: myProgress.filter((p) => p.completion > 0 && p.completion < 100).length,
    averageScore: myProgress.length > 0
      ? Math.round(myProgress.reduce((sum, p) => sum + p.score, 0) / myProgress.length)
      : 0,
  };

  if (selectedClassId) {
    return (
      <ClassroomView
        classId={selectedClassId}
        role="student"
        onBack={() => setSelectedClassId(null)}
        onOpenLesson={handleOpenLesson}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <VoiceControl />

      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-foreground">
            {t('student', selectedLanguage)} <span className="text-primary italic">{t('dashboard', selectedLanguage)}</span>
          </h2>
          <p className="text-muted-foreground font-medium mt-1">
            {t('welcome', selectedLanguage)}, {currentUser.name}
          </p>
        </div>
        <div className="flex gap-3">
          <Badge variant="secondary" className="px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
            Level: {currentUser.role.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Available Lessons', value: stats.totalLessons, icon: BookOpen, color: 'primary' },
          { label: 'Completed', value: stats.completedLessons, icon: Award, color: 'accent' },
          { label: 'In Progress', value: stats.inProgress, icon: TrendingUp, color: 'primary' },
          { label: 'Avg. Performance', value: `${stats.averageScore}%`, icon: TrendingUp, color: 'accent' },
        ].map((stat, i) => (
          <Card key={i} className="card-premium overflow-hidden group">
            <div className={`h-1.5 w-full bg-${stat.color}`} />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={`h-5 w-5 text-${stat.color} group-hover:scale-110 transition-transform`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="classrooms" className="w-full">
        <TabsList className="bg-muted/30 p-1.5 rounded-xl border border-border/50 mb-8 overflow-x-auto max-w-full">
          {[
            { value: 'classrooms', label: t('classrooms', selectedLanguage) || 'Classrooms' },
            { value: 'lessons', label: t('lessons', selectedLanguage) },
            { value: 'resources', label: t('resources', selectedLanguage) },
            { value: 'progress', label: t('progress', selectedLanguage) || 'Progress' },
            { value: 'messages', label: t('messages', selectedLanguage) || 'Messages' },
          ].map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="px-6 py-2.5 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-lg font-bold transition-all">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="classrooms" className="animate-in fade-in zoom-in-95 duration-500">
          <ClassroomList
            role="student"
            onSelectClassroom={setSelectedClassId}
          />
        </TabsContent>

        <TabsContent value="lessons" className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-border/50 shadow-xl">
            <div className="relative w-full md:w-96 group">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search for lessons..."
                className="pl-10 h-11 bg-background/50 border-border/50 focus:border-primary transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-[140px] h-11 bg-background/50">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={selectedLevel} onValueChange={(v: any) => setSelectedLevel(v)}>
                <SelectTrigger className="w-[140px] h-11 bg-background/50">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>

              <Badge variant="outline" className="h-11 px-4 bg-primary/10 border-primary/20 text-primary font-bold hidden sm:flex">
                {filteredContent.length} Topics
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent.length === 0 ? (
              <div className="col-span-full py-20 text-center">
                <BookOpen className="w-16 h-16 text-muted/30 mx-auto mb-4" />
                <p className="text-xl font-bold text-muted-foreground">No lessons found matching your filters</p>
              </div>
            ) : (
              filteredContent.map((content) => {
                const progress = myProgress.find((p) => p.contentId === content.contentId);
                return (
                  <Card key={content.contentId} className="card-premium h-full flex flex-col group hover:scale-[1.02] transition-all">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <Badge className="bg-accent text-accent-foreground font-black uppercase text-[10px] tracking-wider">
                          {content.level}
                        </Badge>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{content.subject}</span>
                      </div>
                      <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">{content.topic}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                      {progress && (
                        <div className="space-y-2 mt-auto pt-4">
                          <div className="flex justify-between text-[11px] font-bold uppercase text-muted-foreground">
                            <span>Mastery</span>
                            <span>{progress.completion}%</span>
                          </div>
                          <Progress value={progress.completion} className="h-2" />
                        </div>
                      )}
                    </CardContent>
                    <div className="p-6 pt-0 mt-auto">
                      <Button onClick={() => handleOpenLesson(content)} className="w-full h-11 font-bold shadow-lg shadow-primary/20">
                        Start Learning
                        <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="resources" className="animate-in fade-in zoom-in-95 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableContent.filter((l: Content) => l.mediaUrl).map((resource: Content) => (
              <Card key={resource.contentId} className="card-premium h-full flex flex-col group overflow-hidden">
                <div className="h-48 bg-muted/30 flex items-center justify-center border-b relative">
                  {resource.mediaType?.startsWith('image') ? (
                    <img src={resource.mediaUrl} alt={resource.topic} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : resource.mediaType?.startsWith('video') ? (
                    <div className="w-full h-full flex items-center justify-center bg-black/5">
                      <video src={resource.mediaUrl} className="max-h-full" />
                    </div>
                  ) : (
                    <div className="text-primary/40 flex flex-col items-center">
                      <FileText className="w-16 h-16 mb-2 animate-bounce" />
                      <span className="text-xs uppercase font-black tracking-widest">{resource.mediaType || 'DOC'}</span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-black/60 backdrop-blur-md text-white border-none">{resource.level}</Badge>
                  </div>
                </div>
                <CardContent className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold mb-1 truncate">{resource.topic}</h3>
                  <p className="text-xs text-muted-foreground font-bold uppercase mb-4">{resource.subject}</p>

                  <div className="flex gap-2 mt-auto">
                    <Button variant="outline" className="flex-1 font-bold" asChild>
                      <a href={resource.mediaUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4 mr-2" /> Get
                      </a>
                    </Button>
                    <Button onClick={() => handleOpenLesson(resource)} className="flex-1 font-bold">
                      Explore
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="animate-in fade-in zoom-in-95 duration-500">
          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Journey Tracking</CardTitle>
              <CardDescription className="font-medium">Your learning footprint and skill progression</CardDescription>
            </CardHeader>
            <CardContent>
              {myProgress.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                  <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="text-xl font-bold">Your journey hasn't started yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {myProgress.map((progress) => {
                    const content = availableContent.find((c) => c.contentId === progress.contentId);
                    if (!content) return null;

                    return (
                      <div key={progress.id} className="p-6 bg-muted/20 rounded-2xl border border-border/50 group hover:bg-card transition-all">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-lg font-bold group-hover:text-primary transition-colors">{content.topic}</h4>
                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{content.subject}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-black text-primary">{progress.completion}%</div>
                          </div>
                        </div>
                        <Progress value={progress.completion} className="h-3 rounded-full" />
                        <div className="mt-4 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          <span>Progress Rate</span>
                          <span>Last: {new Date(progress.lastAccessed).toLocaleDateString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="animate-in fade-in zoom-in-95 duration-500 min-h-[600px]">
          <Card className="card-premium overflow-hidden border-none shadow-2xl bg-card/90 backdrop-blur-sm h-full min-h-[600px] flex flex-col">
            {selectedChatUser ? (
              <DMChat
                currentUser={currentUser}
                recipient={selectedChatUser}
                onBack={() => setSelectedChatUser(null)}
              />
            ) : (
              <DMList
                currentUser={currentUser}
                onSelectUser={setSelectedChatUser}
              />
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Lesson Viewer Dialog */}
      <Dialog open={isLessonOpen} onOpenChange={setIsLessonOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] w-[95vw] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
          {currentLesson && (
            <div className="flex flex-col h-[90vh] bg-background">
              {/* Header */}
              <div className="p-6 bg-primary text-primary-foreground relative shrink-0">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Badge className="bg-white/20 hover:bg-white/30 text-white border-none uppercase font-black text-[9px]">
                        {lessonLevel}
                      </Badge>
                      <Badge variant="outline" className="border-white/20 text-white/70 uppercase font-bold text-[8px]">
                        {currentLesson.subject}
                      </Badge>
                    </div>
                    <DialogTitle className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
                      {currentLesson.topic}
                    </DialogTitle>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center bg-white/10 rounded-xl p-1 gap-1">
                      {['beginner', 'intermediate', 'advanced'].map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => handleLessonLevelChange(lvl as any)}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${lessonLevel === lvl ? 'bg-white text-primary shadow-lg' : 'text-white/70 hover:text-white'}`}
                        >
                          {lvl === 'beginner' ? 'Basic' : lvl === 'intermediate' ? 'Standard' : 'Expert'}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={handleSpeak} className="bg-white/10 hover:bg-white/20 rounded-xl text-white h-11 w-11" title={isSpeaking ? t('stopAudio', selectedLanguage) : t('playAudio', selectedLanguage)}>
                        {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </Button>
                      <Select value={selectedLanguage} onValueChange={onLanguageChange}>
                        <SelectTrigger className="w-[140px] h-11 bg-white/10 border-white/20 text-white rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                            <SelectItem key={code} value={code}>{name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-6 w-1 bg-primary rounded-full"></div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Study Material</h3>
                  </div>

                  <Card className="card-premium bg-muted/5 border-none shadow-none">
                    <CardContent className="py-10 px-8">
                      <div className="prose prose-slate max-w-none">
                        <p className="text-xl leading-relaxed text-foreground/90 whitespace-pre-wrap font-medium">
                          {displayText}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex gap-4 flex-wrap mt-6 p-6 bg-primary/5 rounded-3xl border border-primary/10">
                    <Button onClick={handleGenerateQuiz} disabled={isGeneratingQuiz} className="bg-accent text-accent-foreground font-black px-8 h-12 rounded-xl shadow-lg shadow-accent/20 hover:scale-105 transition-transform">
                      {isGeneratingQuiz ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Award className="w-4 h-4 mr-2" />}
                      Challenge Me (Quiz)
                    </Button>
                    <Button variant="outline" onClick={() => setDisplayText(currentLesson?.translations?.[selectedLanguage]?.text || currentLesson?.text || "")} className="font-bold border-border/50 h-12 px-6 rounded-xl">
                      Reset Content
                    </Button>

                    {(currentLesson?.originalFileUrl || currentLesson?.mediaUrl) && (
                      <Button
                        variant="secondary"
                        onClick={() => {
                          const fileUrl = currentLesson.originalFileUrl || currentLesson.mediaUrl;
                          window.open(`http://localhost:5000/uploads/${fileUrl}`, '_blank');
                        }}
                        className="font-black bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-none h-12 px-6 rounded-xl"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View Original
                      </Button>
                    )}

                    {currentLesson?.text && currentLesson.text.includes('__OCR_FAILED__') && (
                      <Button
                        onClick={handleReconstruct}
                        disabled={isReconstructing}
                        className="font-black bg-orange-500 text-white hover:bg-orange-600 border-none h-12 px-6 rounded-xl shadow-lg shadow-orange-500/20 animate-pulse"
                      >
                        {isReconstructing ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Repairing...</>
                        ) : (
                          <><Zap className="w-4 h-4 mr-2" /> Smart AI Reconstruct</>
                        )}
                      </Button>
                    )}
                  </div>

                  {currentLesson?.text && currentLesson.text.includes('__OCR_FAILED__') && !isReconstructing && (
                    <div className="mt-4 p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-black text-orange-800 uppercase tracking-wider">Extraction Interrupted</p>
                        <p className="text-[11px] font-bold text-orange-700/70 mt-0.5">We couldn't read the text from your upload. Use 'Smart AI Reconstruct' to generate a lesson or 'View Original' to see the source.</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-6 w-1 bg-accent rounded-full"></div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">AI Tutor Assistant</h3>
                  </div>

                  <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>

                    <div className="flex flex-col sm:flex-row gap-3 mb-8 relative z-10">
                      <div className="relative flex-1">
                        <Input
                          placeholder="Ask a doubt about this topic..."
                          className="h-14 border-none bg-muted/40 focus-visible:ring-primary rounded-2xl pl-14 font-bold text-lg"
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
                        />
                        <MessageSquare className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground/50" />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={handleVoiceInput} className={`h-14 w-14 rounded-2xl transition-all border-border/50 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-muted/50'}`}>
                          {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                        </Button>
                        <Button onClick={handleAskQuestion} disabled={isGeneratingAnswer || !question} className="h-14 px-10 rounded-2xl font-black text-lg bg-primary shadow-xl shadow-primary/20">
                          {isGeneratingAnswer ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Ask AI'}
                        </Button>
                      </div>
                    </div>

                    {answer && (
                      <div className="bg-primary/5 border border-primary/10 rounded-2xl p-8 animate-in slide-in-from-top-4 duration-500">
                        <div className="flex items-start gap-6">
                          <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex-shrink-0 flex items-center justify-center font-black text-lg shadow-lg">AI</div>
                          <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Tutor Response</p>
                            <p className="text-foreground font-semibold text-lg leading-relaxed">{answer}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 md:p-6 bg-muted/20 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                <Button variant="ghost" onClick={() => storage.cacheLesson(currentLesson)} className="font-bold text-muted-foreground hover:bg-white/50 px-4 rounded-xl text-xs md:text-sm">
                  <Download className="mr-2 h-3 w-3 md:h-4 md:w-4" /> Save for Offline
                </Button>
                <div className="flex gap-2 md:gap-4 w-full sm:w-auto">
                  <Button variant="outline" onClick={() => setIsLessonOpen(false)} className="flex-1 sm:flex-none h-10 md:h-12 px-6 md:px-10 rounded-xl font-bold border-border/50 text-xs md:text-sm">Dismiss</Button>
                  <Button onClick={handleMarkComplete} className="flex-1 sm:flex-none h-10 md:h-12 px-8 md:px-12 rounded-xl font-black bg-primary text-primary-foreground shadow-2xl shadow-primary/20 text-xs md:text-sm">Complete Lesson</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Quiz Modal */}
      <Dialog open={isQuizOpen} onOpenChange={setIsQuizOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
          <div className="flex flex-col h-full bg-quiz-theme text-foreground">
            <div className="p-8 bg-primary text-white shrink-0">
              <DialogTitle className="text-3xl font-black tracking-tight">AI Knowledge Check</DialogTitle>
              <DialogDescription className="text-white/70 font-bold uppercase text-[10px] tracking-[0.2em]">Generated for: {currentLesson?.topic}</DialogDescription>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
              {activeQuiz?.questions?.map((q: any, i: number) => {
                const isCorrect = q.selected === q.correctAnswer;
                const isSelected = q.selected !== undefined;

                return (
                  <div key={q.id} className={`space-y-4 p-8 rounded-3xl shadow-sm border ${isSelected ? (isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200') : 'bg-white/80 border-primary/5'}`}>
                    <div className="flex gap-3">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${isSelected ? (isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white') : 'bg-primary/10 text-primary'}`}>{i + 1}</span>
                      <h4 className="text-xl font-bold leading-tight">{q.question}</h4>
                    </div>

                    {q.options && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-11">
                        {q.options.map((opt: string) => {
                          const isOptionSelected = q.selected === opt;
                          const isOptionCorrect = q.correctAnswer === opt;

                          let btnVariant: "outline" | "default" = "outline";
                          let btnClass = "justify-start h-auto py-4 px-6 rounded-xl font-bold border-border/50 text-left whitespace-normal";

                          if (isSelected) {
                            if (isOptionCorrect) btnClass += " bg-green-500 text-white border-green-500 hover:bg-green-600";
                            else if (isOptionSelected) btnClass += " bg-red-500 text-white border-red-500 hover:bg-red-600";
                            else btnClass += " opacity-50";
                          } else {
                            btnClass += " hover:border-primary hover:bg-primary/5 transition-all";
                          }

                          return (
                            <Button
                              key={opt}
                              variant={btnVariant}
                              className={btnClass}
                              onClick={() => {
                                if (!isSelected) {
                                  const newQuestions = [...activeQuiz.questions];
                                  newQuestions[i] = { ...q, selected: opt };
                                  setActiveQuiz({ ...activeQuiz, questions: newQuestions });
                                }
                              }}
                            >
                              {opt}
                            </Button>
                          );
                        })}
                      </div>
                    )}
                    {isSelected && !isCorrect && (
                      <p className="mt-2 text-sm font-bold text-red-600 pl-11">Correct answer: {q.correctAnswer}</p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-8 bg-white border-t border-border/50 flex justify-between items-center shrink-0">
              <div className="text-sm font-bold text-muted-foreground">Progress: 100% Generated</div>
              <Button onClick={() => setIsQuizOpen(false)} className="rounded-xl px-12 h-14 font-black bg-accent text-accent-foreground shadow-xl shadow-accent/20">Submit Answers</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
