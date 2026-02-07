import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Users, BookOpen, Languages, TrendingUp, CheckCircle, XCircle, UserPlus, BarChart3, Plus } from 'lucide-react';
import { storage } from '@/app/utils/storage';
import { User, Content, Language, LANGUAGE_NAMES } from '@/app/types';
import { register } from '@/app/utils/auth';
import { classroomService, Classroom } from '@/app/utils/classroom-services';

export function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [content, setContent] = useState<Content[]>([]);
  const [pendingContent, setPendingContent] = useState<Content[]>([]);
  const [institution, setInstitution] = useState<any>(null);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'teacher' | 'student'>('student');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  // Classroom Management State
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassForAssign, setSelectedClassForAssign] = useState<string | null>(null);
  const [targetIdForAssign, setTargetIdForAssign] = useState<string>('');
  const [assignRole, setAssignRole] = useState<'teacher' | 'student'>('teacher');
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassSubject, setNewClassSubject] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setUsers(storage.getUsers());
    const allContent = storage.getContent();
    setContent(allContent);
    setPendingContent(allContent.filter((c: Content) => !c.approved));
    const institutions = storage.getInstitutions();
    if (institutions.length > 0) {
      setInstitution(institutions[0]);
    }

    // Fetch classrooms from backend
    const clss = await classroomService.getClassrooms();
    setClassrooms(clss);
  };

  const handleAddUser = () => {
    const result = register(
      newUserName,
      newUserEmail,
      newUserPassword,
      newUserRole,
      'en',
      'inst-001'
    );

    if (result.success) {
      loadData();
      setIsAddUserOpen(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
    }
  };

  const handleApproveContent = (contentId: string) => {
    storage.updateContent(contentId, { approved: true });
    loadData();
  };

  const handleRejectContent = (contentId: string) => {
    storage.deleteContent(contentId);
    loadData();
  };

  const handleToggleLanguage = (lang: Language) => {
    if (institution) {
      const supported = institution.supportedLanguages || [];
      const updated = supported.includes(lang)
        ? supported.filter((l: Language) => l !== lang)
        : [...supported, lang];

      const institutions = storage.getInstitutions();
      const index = institutions.findIndex((i: any) => i.id === institution.id);
      if (index !== -1) {
        institutions[index].supportedLanguages = updated;
        storage.setInstitutions(institutions);
        setInstitution(institutions[index]);
      }
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      storage.deleteUser(userId);
      loadData();
    }
  };

  const handleCreateClassroom = async () => {
    const res = await classroomService.createClassroom(newClassName, newClassSubject);
    if (res.success) {
      loadData();
      setIsCreateClassOpen(false);
      setNewClassName('');
      setNewClassSubject('');
    } else {
      alert(res.error || "Failed to create class");
    }
  };

  const handleAssignUser = async () => {
    if (!selectedClassForAssign) return;

    let res;
    if (assignRole === 'teacher') {
      res = await classroomService.assignTeacher(selectedClassForAssign, targetIdForAssign);
    } else {
      res = await classroomService.addStudent(selectedClassForAssign, targetIdForAssign);
    }

    if (res.success) {
      alert("Assigned successfully");
      loadData();
      setIsAssignOpen(false);
    } else {
      alert(res.error || "Assignment failed");
    }
  };

  const stats = {
    totalUsers: users.length,
    totalStudents: users.filter((u: any) => u.role === 'student').length,
    totalTeachers: users.filter((u: any) => u.role === 'teacher').length,
    totalContent: content.length,
    approvedContent: content.filter((c: Content) => c.approved).length,
    pendingApproval: pendingContent.length,
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-foreground">
            System <span className="text-primary italic">Console</span>
          </h2>
          <p className="text-muted-foreground font-medium mt-1">
            Institutional Oversight & Governance
          </p>
        </div>
        <div className="flex gap-3">
          <Badge variant="outline" className="px-4 py-1.5 rounded-full text-sm font-bold border-primary/30 text-primary bg-primary/5">
            Admin Access: Verified
          </Badge>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'primary', sub: `${stats.totalStudents}S / ${stats.totalTeachers}T` },
          { label: 'Managed Content', value: stats.totalContent, icon: BookOpen, color: 'accent', sub: `${stats.approvedContent} Approved` },
          { label: 'Pending Review', value: stats.pendingApproval, icon: TrendingUp, color: 'primary', sub: 'Awaiting action' },
          { label: 'Active Languages', value: institution?.supportedLanguages?.length || 7, icon: Languages, color: 'accent', sub: 'Regional dialects' },
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
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="bg-muted/30 p-1.5 rounded-2xl border border-border/50 mb-8 max-w-fit">
          {[
            { value: 'users', label: 'Identity' },
            { value: 'classrooms', label: 'Classrooms' },
            { value: 'content', label: 'Governance' },
            { value: 'languages', label: 'Regional' },
            { value: 'analytics', label: 'Insights' },
          ].map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="px-8 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black transition-all">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="classrooms" className="animate-in fade-in zoom-in-95 duration-500">
          <Card className="card-premium border-primary/5 shadow-2xl">
            <CardHeader className="p-8 border-b border-border/50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black">Classroom Infrastructure</CardTitle>
                <CardDescription className="font-medium text-muted-foreground mt-1">Institutional learning environment management</CardDescription>
              </div>
              <Dialog open={isCreateClassOpen} onOpenChange={setIsCreateClassOpen}>
                <DialogTrigger asChild>
                  <Button className="font-black px-8 rounded-xl shadow-lg shadow-primary/20">
                    <Plus className="mr-2 h-4 w-4" /> Initialize Class
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
                  <div className="p-8 bg-primary text-primary-foreground">
                    <DialogTitle className="text-2xl font-black">New Classroom</DialogTitle>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Class Name</Label>
                      <Input value={newClassName} onChange={e => setNewClassName(e.target.value)} placeholder="e.g. Physics 101" className="h-12 rounded-xl bg-muted/20 border-none font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Subject</Label>
                      <Input value={newClassSubject} onChange={e => setNewClassSubject(e.target.value)} placeholder="e.g. Science" className="h-12 rounded-xl bg-muted/20 border-none font-bold" />
                    </div>
                    <Button onClick={handleCreateClassroom} className="w-full h-14 rounded-2xl font-black text-lg">Create Infrastructure</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-border/50">
                    <TableHead className="px-8 text-[10px] font-black uppercase tracking-widest">Class Name</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Subject</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Participants</TableHead>
                    <TableHead className="px-8 text-right text-[10px] font-black uppercase tracking-widest">Control</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classrooms.map((cls) => (
                    <TableRow key={cls.id} className="border-border/50 hover:bg-muted/10 transition-colors">
                      <TableCell className="px-8 font-bold">{cls.name}</TableCell>
                      <TableCell className="text-muted-foreground font-medium">{cls.subject}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-xl font-bold">{cls.studentCount} Students</Badge>
                      </TableCell>
                      <TableCell className="px-8 text-right">
                        <Button variant="outline" size="sm" onClick={() => { setSelectedClassForAssign(cls.id); setIsAssignOpen(true); }} className="font-black rounded-lg">
                          Assign Personnel
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Assignment Dialogue */}
          <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
            <DialogContent className="rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
              <div className="p-8 bg-black text-white">
                <DialogTitle className="text-2xl font-black">Personnel Assignment</DialogTitle>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Deploying users to learning node</p>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Assignment Role</Label>
                  <Select value={assignRole} onValueChange={(val: any) => setAssignRole(val)}>
                    <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-none font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="teacher" className="font-bold">Faculty Member</SelectItem>
                      <SelectItem value="student" className="font-bold">Student Participant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Target User ID</Label>
                  <Input value={targetIdForAssign} onChange={e => setTargetIdForAssign(e.target.value)} placeholder="e.g. teacher-001" className="h-12 rounded-xl bg-muted/20 border-none font-bold" />
                  <p className="text-[10px] text-muted-foreground italic">Tip: Use IDs from Identity tab (e.g. teacher-1, student-1)</p>
                </div>
                <Button onClick={handleAssignUser} className="w-full h-14 rounded-2xl font-black text-lg bg-primary">Authorize Deployment</Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="users" className="animate-in fade-in zoom-in-95 duration-500">
          <Card className="card-premium border-primary/5 shadow-2xl">
            <CardHeader className="p-8 border-b border-border/50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black">User Registry</CardTitle>
                <CardDescription className="font-medium text-muted-foreground mt-1">Cross-institutional account management</CardDescription>
              </div>
              <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                <DialogTrigger asChild>
                  <Button className="font-black px-8 rounded-xl shadow-lg shadow-primary/20">
                    <UserPlus className="mr-2 h-4 w-4" /> Provision New
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
                  <div className="p-8 bg-primary text-primary-foreground">
                    <DialogTitle className="text-2xl font-black">Provision Account</DialogTitle>
                    <DialogDescription className="text-primary-foreground/70 font-bold uppercase text-[10px] tracking-widest mt-1">New user credential creation</DialogDescription>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Legal Name</Label>
                        <Input id="name" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="Full Name" className="h-12 rounded-xl bg-muted/20 border-none font-bold" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">System Email</Label>
                        <Input id="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="admin@domain.com" className="h-12 rounded-xl bg-muted/20 border-none font-bold" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Designated Role</Label>
                      <Select value={newUserRole} onValueChange={(value: any) => setNewUserRole(value)}>
                        <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-none font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border/50">
                          <SelectItem value="student" className="font-bold">Student Participant</SelectItem>
                          <SelectItem value="teacher" className="font-bold">Teaching Faculty</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Access Key</Label>
                      <Input id="password" type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} placeholder="••••••••" className="h-12 rounded-xl bg-muted/20 border-none font-bold" />
                    </div>
                    <Button onClick={handleAddUser} className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20">Authorize & Create</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-border/50">
                    <TableHead className="px-8 text-[10px] font-black uppercase tracking-widest">Name</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Identifier</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Designation</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Region</TableHead>
                    <TableHead className="px-8 text-right text-[10px] font-black uppercase tracking-widest">Control</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.filter((u: any) => u.role !== 'admin').map((user: any) => (
                    <TableRow key={user.id} className="border-border/50 hover:bg-muted/10 transition-colors">
                      <TableCell className="px-8 font-bold">{user.name}</TableCell>
                      <TableCell className="text-muted-foreground font-medium">{user.email}</TableCell>
                      <TableCell>
                        <Badge className={`rounded-xl font-black uppercase text-[9px] px-3 ${user.role === 'teacher' ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'}`}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold text-muted-foreground">{LANGUAGE_NAMES[user.language as Language]}</TableCell>
                      <TableCell className="px-8 text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 font-black rounded-lg">
                          Terminate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="animate-in fade-in zoom-in-95 duration-500">
          <Card className="card-premium border-primary/5">
            <CardHeader className="p-8">
              <CardTitle className="text-2xl font-black">Content Governance</CardTitle>
              <CardDescription className="font-medium text-muted-foreground">Quality assurance and pedagogical review</CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              {pendingContent.length === 0 ? (
                <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-border/50">
                  <CheckCircle className="w-16 h-16 text-primary/20 mx-auto mb-4" />
                  <p className="text-xl font-bold text-muted-foreground">Compliance Queue Empty</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {pendingContent.map((item) => (
                    <div key={item.contentId} className="p-6 bg-card rounded-2xl border border-border/50 flex items-center justify-between hover:shadow-xl transition-all group">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className="bg-primary/10 text-primary border-none rounded-lg font-black">{item.subject}</Badge>
                          <Badge variant="outline" className="font-bold border-border/50">{item.level}</Badge>
                        </div>
                        <h4 className="text-xl font-black group-hover:text-primary transition-colors">{item.topic}</h4>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Uploaded by: {item.uploadedBy}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => handleApproveContent(item.contentId)} className="rounded-xl font-black px-6 bg-primary shadow-lg shadow-primary/20">Verify</Button>
                        <Button variant="ghost" onClick={() => handleRejectContent(item.contentId)} className="rounded-xl font-black text-red-500 hover:bg-red-50 px-6">Reject</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="languages" className="animate-in fade-in zoom-in-95 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(LANGUAGE_NAMES).map(([code, name]) => {
              const isEnabled = institution?.supportedLanguages?.includes(code);
              return (
                <Card key={code} className={`card-premium group border-none shadow-xl transition-all ${isEnabled ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
                  <CardContent className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black ${isEnabled ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                        {code.toUpperCase()}
                      </div>
                      <div className={`w-4 h-4 rounded-full ${isEnabled ? 'bg-white animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.8)]' : 'bg-muted'}`} />
                    </div>
                    <h3 className="text-2xl font-black mb-1">{name}</h3>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-8 ${isEnabled ? 'text-white/60' : 'text-muted-foreground'}`}>Localization Node</p>
                    <Button
                      onClick={() => handleToggleLanguage(code as Language)}
                      className={`w-full h-12 rounded-xl font-black transition-all ${isEnabled ? 'bg-white text-primary hover:bg-white/90 shadow-2xl' : 'bg-muted/50 text-foreground hover:bg-primary hover:text-white'}`}
                    >
                      {isEnabled ? 'Active Protocol' : 'Initialise Protocol'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="animate-in fade-in zoom-in-95 duration-500">
          <Card className="card-premium border-primary/5 shadow-2xl">
            <CardHeader className="p-8">
              <CardTitle className="text-2xl font-black">Institutional Intelligence</CardTitle>
              <CardDescription className="font-medium text-muted-foreground">High-resolution performance metrics</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Identity Distribution</h4>
                  <div className="space-y-4">
                    {[
                      { label: 'Student Population', value: stats.totalStudents, total: stats.totalUsers, color: 'bg-primary' },
                      { label: 'Faculty Body', value: stats.totalTeachers, total: stats.totalUsers, color: 'bg-accent' },
                    ].map(item => (
                      <div key={item.label} className="space-y-2">
                        <div className="flex justify-between text-sm font-bold">
                          <span>{item.label}</span>
                          <span className="text-primary">{Math.round((item.value / item.total) * 100)}%</span>
                        </div>
                        <div className="h-3 w-full bg-muted/30 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color} transition-all duration-1000 ease-out`} style={{ width: `${(item.value / item.total) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-accent">Knowledge Assets</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Certified Assets', value: stats.approvedContent, color: 'text-primary' },
                      { label: 'Assets In Review', value: stats.pendingApproval, color: 'text-accent' },
                    ].map(item => (
                      <div key={item.label} className="p-6 bg-muted/20 rounded-3xl border border-border/50">
                        <div className={`text-3xl font-black ${item.color} mb-1`}>{item.value}</div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-border/50">
                <Button className="w-full h-16 rounded-2xl font-black text-lg bg-black text-white hover:bg-gray-900 shadow-2xl group transition-all">
                  <BarChart3 className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                  Generate Institutional Intelligence Report (PDF)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div >
  );
}
