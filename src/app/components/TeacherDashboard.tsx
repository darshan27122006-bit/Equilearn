import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Upload, BookOpen, Users, TrendingUp, CheckCircle, Loader2, Languages } from 'lucide-react';
import { storage } from '@/app/utils/storage';
import { Content, Language, LANGUAGE_NAMES, User } from '@/app/types';
import { processUploadedContent } from '@/app/utils/ai-services';
import { ClassroomList } from './classroom/ClassroomList';
import { CreateClassroom } from './classroom/CreateClassroom';
import { ClassroomView } from './classroom/ClassroomView';
import { t } from '@/app/utils/translations';
import { Camera, X, Check } from 'lucide-react';
import { classroomService, Classroom } from '@/app/utils/classroom-services';

interface TeacherDashboardProps {
  currentUser: User;
  selectedLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

export function TeacherDashboard({ currentUser, selectedLanguage, onLanguageChange }: TeacherDashboardProps) {
  const [myContent, setMyContent] = useState<Content[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Classroom State
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [isCreatingClass, setIsCreatingClass] = useState(false);

  // Upload form state
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [contentText, setContentText] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<Language[]>(['en', 'hi', 'ta']);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadClassroomId, setUploadClassroomId] = useState<string>('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    const allContent = storage.getContent();
    setMyContent(allContent.filter((c: Content) => c.uploadedBy === currentUser.id));

    const allUsers = storage.getUsers();
    setStudents(allUsers.filter((u: any) => u.role === 'student'));

    // Fetch assigned classrooms from backend
    const clss = await classroomService.getAssignedClassrooms();
    setClassrooms(clss);
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(mediaStream);
      setShowCamera(true);
    } catch (err) {
      console.error("Camera error:", err);
      alert("Could not access camera");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    const video = document.getElementById('camera-preview') as HTMLVideoElement;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(dataUrl);

      // Convert dataUrl to File object for upload
      fetch(dataUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
          setSelectedFile(file);
        });

      stopCamera();
    }
  };

  const clearCaptured = () => {
    setCapturedImage(null);
    setSelectedFile(null);
  };

  const handleUploadContent = async () => {
    if (!subject || !topic || (!contentText && !selectedFile)) {
      alert('Please fill in all required fields (Text or File)');
      return;
    }

    setUploading(true);
    setUploadSuccess(false);

    try {
      // Process content with AI (now supports file extraction via backend)
      const processed = await processUploadedContent(
        contentText,
        selectedLanguages,
        level,
        selectedFile || undefined
      );

      // Create new content object
      const newContent: Content = {
        contentId: `content-${Date.now()}`,
        subject,
        topic,
        level,
        language: processed.detectedLanguage,
        text: processed.originalText,
        simplifiedText: processed.simplifiedText,
        uploadedBy: currentUser.id,
        approved: true, // Auto-approve for this upgrade 
        translations: processed.translations,
        originalFileUrl: processed.originalFileUrl || (selectedFile ? selectedFile.name : undefined),
        fileType: processed.fileType || (selectedFile ? selectedFile.name.split('.').pop() : undefined),
        classroomId: uploadClassroomId || undefined,
        createdAt: new Date().toISOString(),
      };

      storage.addContent(newContent);
      setUploadSuccess(true);

      // Reset form
      setTimeout(() => {
        setIsUploadOpen(false);
        setSubject('');
        setTopic('');
        setContentText('');
        setSelectedFile(null);
        setUploadSuccess(false);
        loadData();
      }, 2000);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload content');
    } finally {
      setUploading(false);
    }
  };

  const handleLanguageToggle = (lang: Language) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang)
        ? prev.filter((l) => l !== lang)
        : [...prev, lang]
    );
  };

  const getStudentProgress = () => {
    const progress = storage.getProgress();
    const contentIds = myContent.map((c) => c.contentId);
    return progress.filter((p: any) => contentIds.includes(p.contentId));
  };

  const stats = {
    totalContent: myContent.length,
    approvedContent: myContent.filter((c) => c.approved).length,
    pendingContent: myContent.filter((c) => !c.approved).length,
    studentEngagement: getStudentProgress().length,
  };

  if (selectedClassId) {
    return (
      <ClassroomView
        classId={selectedClassId}
        role="teacher"
        onBack={() => setSelectedClassId(null)}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {isCreatingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl transform transition-all">
            <CreateClassroom
              onClose={() => setIsCreatingClass(false)}
              onCreated={() => { setIsCreatingClass(false); loadData(); }}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-foreground">
            {t('teacher', selectedLanguage) || 'Faculty'} <span className="text-primary italic">{t('dashboard', selectedLanguage)}</span>
          </h2>
          <p className="text-muted-foreground font-medium mt-1">
            {t('welcome', selectedLanguage)}, {currentUser.name}
          </p>
        </div>
        <div className="flex gap-3">
          <Badge variant="outline" className="px-4 py-1.5 rounded-full text-sm font-bold border-primary/30 text-primary bg-primary/5">
            Teaching Role Active
          </Badge>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Curated Content', value: stats.totalContent, icon: BookOpen, color: 'primary', sub: 'Total lessons created' },
          { label: 'Published Assets', value: stats.approvedContent, icon: CheckCircle, color: 'accent', sub: 'Approved for students' },
          { label: 'Pending Review', value: stats.pendingContent, icon: Upload, color: 'primary', sub: 'Awaiting admin' },
          { label: 'Student Growth', value: stats.studentEngagement, icon: TrendingUp, color: 'accent', sub: 'Engagement indicator' },
        ].map((stat, i) => (
          <Card key={i} className="card-premium overflow-hidden group border-primary/10">
            <div className={`h-1.5 w-full bg-${stat.color}`} />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={`h-5 w-5 text-${stat.color} group-hover:rotate-12 transition-transform`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black mb-1">{stat.value}</div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="bg-muted/30 p-1.5 rounded-2xl border border-border/50 mb-8 max-w-fit">
          {[
            { value: 'classrooms', label: t('classrooms', currentUser.language) || 'Classrooms' },
            { value: 'content', label: t('resources', currentUser.language) },
            { value: 'students', label: t('students', currentUser.language) || 'Engagement' },
          ].map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="px-8 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black transition-all">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="classrooms" className="animate-in fade-in zoom-in-95 duration-500">
          <ClassroomList
            role="teacher"
            onSelectClassroom={setSelectedClassId}
            onCreateClassroom={() => setIsCreatingClass(true)}
          />
        </TabsContent>

        <TabsContent value="content" className="animate-in fade-in zoom-in-95 duration-500">
          <Card className="card-premium border-primary/5 shadow-2xl">
            <CardHeader className="p-8 border-b border-border/50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black">Content Repository</CardTitle>
                <CardDescription className="font-medium text-muted-foreground mt-1">Manage and deploy educational assets with AI enhancement</CardDescription>
              </div>
              <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogTrigger asChild>
                  <Button className="font-black px-8 rounded-xl shadow-lg shadow-primary/20 bg-primary text-white hover:bg-primary/90">
                    <Upload className="mr-2 h-4 w-4" /> Deploy New Asset
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl rounded-3xl border-none shadow-2xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
                  <div className="p-8 bg-primary text-primary-foreground shrink-0">
                    <DialogTitle className="text-2xl font-black">Asset Deployment</DialogTitle>
                    <DialogDescription className="text-primary-foreground/70 font-bold uppercase text-[10px] tracking-widest mt-1">AI-Powered multilingual lesson creation</DialogDescription>
                  </div>

                  <div className="p-8 space-y-6 overflow-y-auto">
                    {uploadSuccess ? (
                      <div className="py-10 text-center animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-black text-green-800">Deployment Initiated!</h3>
                        <p className="text-green-700/70 font-bold mt-2">AI is processing your content. Available after verification.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="subject" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Area of Study</Label>
                            <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g., Quantum Physics" className="h-12 rounded-xl bg-muted/20 border-none font-bold placeholder:text-muted-foreground/50" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="topic" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Focus Topic</Label>
                            <Input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., Wave-Particle Duality" className="h-12 rounded-xl bg-muted/20 border-none font-bold placeholder:text-muted-foreground/50" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="level" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Complexity Baseline</Label>
                          <Select value={level} onValueChange={(value: any) => setLevel(value)}>
                            <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-none font-bold">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border/50">
                              <SelectItem value="beginner" className="font-bold">Entry Level (Simplified)</SelectItem>
                              <SelectItem value="intermediate" className="font-bold">Standard Curriculum</SelectItem>
                              <SelectItem value="advanced" className="font-bold">Advanced Research</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="classroom" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Target Learning Node (Classroom)</Label>
                          <Select value={uploadClassroomId} onValueChange={(value: any) => setUploadClassroomId(value)}>
                            <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-none font-bold">
                              <SelectValue placeholder="General Content (No Class)" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border/50">
                              <SelectItem value="none" className="font-bold italic">Unassigned Resources</SelectItem>
                              {classrooms.map(cls => (
                                <SelectItem key={cls.id} value={cls.id} className="font-bold">{cls.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-4">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Digital Media Assets (Optional)</Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative group cursor-pointer">
                              <Input
                                type="file"
                                accept=".pdf,.docx,.txt,image/*,video/*"
                                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                              />
                              <div className="h-32 rounded-2xl border-2 border-dashed border-muted-foreground/20 group-hover:border-primary/50 transition-colors flex flex-col items-center justify-center p-4 text-center">
                                <Upload className="w-8 h-8 text-muted-foreground/40 mb-2 group-hover:text-primary transition-colors" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                  {selectedFile && !capturedImage ? selectedFile.name : 'Upload Doc/Photo/Video'}
                                </span>
                              </div>
                            </div>
                            <div
                              onClick={capturedImage ? clearCaptured : startCamera}
                              className={`h-32 rounded-2xl bg-muted/20 border-2 border-dashed border-muted-foreground/20 hover:border-accent/50 transition-all flex flex-col items-center justify-center p-4 text-center cursor-pointer relative overflow-hidden`}
                            >
                              {capturedImage ? (
                                <>
                                  <img src={capturedImage} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                                  <X className="w-6 h-6 text-red-500 mb-1 relative z-10" />
                                  <span className="text-[10px] font-black uppercase tracking-widest text-red-500 relative z-10">Clear Photo</span>
                                </>
                              ) : (
                                <>
                                  <Camera className="w-8 h-8 text-muted-foreground/40 mb-2 hover:text-accent transition-colors" />
                                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('captureFromCamera', currentUser.language)}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {showCamera && (
                          <div className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center p-4">
                            <video
                              id="camera-preview"
                              ref={(el) => { if (el && stream) el.srcObject = stream; }}
                              autoPlay
                              playsInline
                              className="w-full max-w-lg rounded-2xl shadow-2xl"
                            />
                            <div className="flex gap-6 mt-8">
                              <Button onClick={stopCamera} variant="outline" className="h-16 w-16 rounded-full border-white/20 text-white hover:bg-white/10">
                                <X className="w-8 h-8" />
                              </Button>
                              <Button onClick={capturePhoto} className="h-20 w-20 rounded-full bg-white text-black hover:bg-gray-200 shadow-xl">
                                <div className="w-14 h-14 rounded-full border-4 border-black" />
                              </Button>
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="content" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Core Narrative (or Extracted Text)</Label>
                          <Textarea id="content" value={contentText} onChange={(e) => setContentText(e.target.value)} placeholder="Synthesize your knowledge or leave empty if using file extraction..." rows={4} className="rounded-xl bg-muted/20 border-none font-bold placeholder:text-muted-foreground/50 resize-none" />
                        </div>

                        <div className="space-y-4 p-6 bg-accent/5 rounded-2xl border border-accent/10">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-2">
                            <Languages className="w-3 h-3" /> Targeted Localizations
                          </Label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                              <button
                                key={code}
                                onClick={() => handleLanguageToggle(code as Language)}
                                className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-xs font-black ${selectedLanguages.includes(code as Language) ? 'bg-accent border-accent text-accent-foreground' : 'bg-transparent border-muted hover:border-accent/30'}`}
                              >
                                <span className="uppercase opacity-50">{code}</span>
                                <span>{name}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-4 p-4 bg-muted/30 rounded-xl border border-border/50">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                            <Loader2 className="w-5 h-5 text-primary animate-spin" />
                          </div>
                          <p className="text-[11px] font-bold text-muted-foreground leading-relaxed">
                            <span className="text-primary">AI Protocol:</span> Our neural models will automatically translate, detect linguistic nuances, and generate adaptive complexity tiers for your content.
                          </p>
                        </div>

                        <Button onClick={handleUploadContent} disabled={uploading} className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90">
                          {uploading ? (
                            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Neural Processing...</>
                          ) : (
                            <><CheckCircle className="mr-2 h-5 w-5" /> Confirm & Transmit</>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              {myContent.length === 0 ? (
                <div className="text-center py-20">
                  <BookOpen className="w-16 h-16 text-muted/30 mx-auto mb-4" />
                  <p className="text-xl font-bold text-muted-foreground">Digital Archive Empty</p>
                  <Button variant="ghost" className="mt-2 font-black text-primary" onClick={() => setIsUploadOpen(true)}>Create First Entry</Button>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="border-border/50">
                      <TableHead className="px-8 text-[10px] font-black uppercase tracking-widest">Digital Asset</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest">Subject Area</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest">Complexity</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest">Verification</TableHead>
                      <TableHead className="px-8 text-right text-[10px] font-black uppercase tracking-widest">Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myContent.map((item) => (
                      <TableRow key={item.contentId} className="border-border/50 hover:bg-muted/10 transition-colors group">
                        <TableCell className="px-8 flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                          </div>
                          <span className="font-black group-hover:text-primary transition-colors">{item.topic}</span>
                        </TableCell>
                        <TableCell className="font-bold text-muted-foreground">{item.subject}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="rounded-lg font-black uppercase text-[9px] border-border/50 px-2 py-0.5">{item.level}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`rounded-full font-black text-[9px] px-3 border-none ${item.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {item.approved ? 'Certified' : 'In Review'}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-8 text-right font-black text-muted-foreground/50 text-[10px] uppercase">
                          {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="animate-in fade-in zoom-in-95 duration-500">
          <Card className="card-premium border-primary/5 shadow-2xl">
            <CardHeader className="p-8">
              <CardTitle className="text-2xl font-black">Linguistic Engagement</CardTitle>
              <CardDescription className="font-medium text-muted-foreground">Monitor cross-lingual student progress and asset interaction</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-border/50">
                    <TableHead className="px-8 text-[10px] font-black uppercase tracking-widest">Participant</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Digital Identifier</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Primary Locale</TableHead>
                    <TableHead className="px-8 text-right text-[10px] font-black uppercase tracking-widest">Asset Engagement</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.slice(0, 10).map((student: any) => {
                    const progress = storage.getProgress().filter(
                      (p: any) => p.studentId === student.id
                    );
                    return (
                      <TableRow key={student.id} className="border-border/50 hover:bg-muted/10 transition-colors">
                        <TableCell className="px-8 font-black">{student.name}</TableCell>
                        <TableCell className="font-medium text-muted-foreground">{student.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="rounded-xl font-black uppercase text-[9px] bg-accent/10 text-accent border-none">{LANGUAGE_NAMES[student.language as Language]}</Badge>
                        </TableCell>
                        <TableCell className="px-8 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-24 h-2 bg-muted/50 rounded-full overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: `${Math.min(progress.length * 20, 100)}%` }} />
                            </div>
                            <span className="font-black text-xs">{progress.length} Items</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
