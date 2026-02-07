import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Languages, BookOpen, AlertCircle } from 'lucide-react';
import { login, register } from '@/app/utils/auth';
import { User, UserRole, Language, LANGUAGE_NAMES } from '@/app/types';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerRole, setRegisterRole] = useState<UserRole>('student');
  const [registerLanguage, setRegisterLanguage] = useState<Language>('en');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = login(loginEmail, loginPassword);

    setTimeout(() => {
      setLoading(false);
      if (result.success && result.user && result.token) {
        localStorage.setItem('token', result.token);
        onLogin(result.user);
      } else {
        setError(result.error || 'Login failed');
      }
    }, 500);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = register(
      registerName,
      registerEmail,
      registerPassword,
      registerRole,
      registerLanguage,
      'inst-001'
    );

    setTimeout(() => {
      setLoading(false);
      if (result.success && result.user) {
        // Log in immediately after registration
        const loginResult = login(registerEmail, registerPassword);
        if (loginResult.success && loginResult.token) {
          localStorage.setItem('token', loginResult.token);
          onLogin(result.user);
        } else {
          onLogin(result.user);
        }
      } else {
        setError(result.error || 'Registration failed');
      }
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] animate-pulse"></div>

      <div className="w-full max-w-md relative z-10 transition-all duration-700 ease-out animate-in fade-in zoom-in-95">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl border border-primary/10 transform hover:scale-110 transition-transform cursor-pointer">
              <img src="/logo.png" alt="EquiLearn" className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-foreground mb-2 tracking-tight">
            EquiLearn
          </h1>
          <p className="text-muted-foreground font-medium">
            AI-Powered Multilingual Learning Assistant
          </p>
        </div>

        <Card className="card-premium border-none shadow-2xl backdrop-blur-sm bg-card/90">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50 rounded-lg mb-4">
              <TabsTrigger value="login" className="rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm">Login</TabsTrigger>
              <TabsTrigger value="register" className="rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="animate-in slide-in-from-left-4 duration-300">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                <CardDescription className="text-sm">
                  Enter your credentials to access your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="bg-muted/30 border-muted/50 focus:border-primary transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="bg-muted/30 border-muted/50 focus:border-primary transition-all"
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive" className="animate-in head-shake duration-500">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 shadow-lg transition-all active:scale-[0.98]" disabled={loading}>
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Signing in...
                      </div>
                    ) : 'Sign In'}
                  </Button>
                </form>

                <div className="mt-8 p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Demo Accounts</p>
                  <div className="space-y-2 text-[11px] font-medium text-muted-foreground">
                    <div className="flex justify-between items-center p-1.5 bg-card rounded border border-primary/5">
                      <span>Admin</span>
                      <code className="text-primary">admin@mlassistant.com</code>
                    </div>
                    <div className="flex justify-between items-center p-1.5 bg-card rounded border border-primary/5">
                      <span>Teacher</span>
                      <code className="text-primary">teacher@mlassistant.com</code>
                    </div>
                    <div className="flex justify-between items-center p-1.5 bg-card rounded border border-primary/5">
                      <span>Student</span>
                      <code className="text-primary">student@mlassistant.com</code>
                    </div>
                  </div>
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="register" className="animate-in slide-in-from-right-4 duration-300">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
                <CardDescription className="text-sm">
                  Join EquiLearn and start your journey today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Full Name</Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="John Doe"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      required
                      className="bg-muted/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="your@email.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                      className="bg-muted/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                      className="bg-muted/30"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-role">Role</Label>
                      <Select value={registerRole} onValueChange={(value) => setRegisterRole(value as UserRole)}>
                        <SelectTrigger id="register-role" className="bg-muted/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="teacher">Teacher</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-language">Language</Label>
                      <Select value={registerLanguage} onValueChange={(value) => setRegisterLanguage(value as Language)}>
                        <SelectTrigger id="register-language" className="bg-muted/30">
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
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 mt-2" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
