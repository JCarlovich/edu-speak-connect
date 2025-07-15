import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, User, Hash, GraduationCap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();
  const { user } = useAuth();

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerFullName, setRegisterFullName] = useState('');
  const [registerRole, setRegisterRole] = useState<'teacher' | 'student' | ''>('');
  const [teacherCode, setTeacherCode] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate(user.role === 'teacher' ? '/' : '/student');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) throw error;
      
      // Navigation is handled by AuthContext
    } catch (error: any) {
      setError(error.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!registerRole) {
      setError('Por favor selecciona tu rol');
      setIsLoading(false);
      return;
    }


    try {
      // Generate teacher code for teachers
      const generatedTeacherCode = registerRole === 'teacher' ? 
        `PROF${Math.random().toString(36).substr(2, 6).toUpperCase()}` : 
        undefined;

      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: registerFullName,
            role: registerRole,
            teacher_code: registerRole === 'teacher' ? generatedTeacherCode : undefined,
            school_name: schoolName,
            subject: subject,
            grade: grade,
          }
        }
      });

      if (error) throw error;

      // Show success message
      setActiveTab('login');
      setError('');
      alert('Registro exitoso! Por favor revisa tu email para confirmar tu cuenta.');
      
    } catch (error: any) {
      setError(error.message || 'Error al registrarse');
    } finally {
      setIsLoading(false);
    }
  };

  const demoAccounts = [
    { email: 'teacher@demo.com', password: 'demo123', role: 'Profesor' },
    { email: 'student@demo.com', password: 'demo123', role: 'Estudiante' },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-muted">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">EduTranscribe</CardTitle>
          <CardDescription>Accede a tu cuenta educativa</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="tu@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </Button>
              </form>

              {/* Demo accounts */}
              <div className="mt-6 space-y-2">
                <p className="text-sm text-muted-foreground text-center">Cuentas de demostración:</p>
                <div className="grid gap-2">
                  {demoAccounts.map((account, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setLoginEmail(account.email);
                        setLoginPassword(account.password);
                      }}
                      className="text-xs"
                    >
                      {account.role}: {account.email}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Nombre Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="Tu nombre completo"
                      value={registerFullName}
                      onChange={(e) => setRegisterFullName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="tu@email.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="pl-10"
                      minLength={6}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-role">Rol</Label>
                  <Select value={registerRole} onValueChange={(value: 'teacher' | 'student') => setRegisterRole(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="teacher">Profesor</SelectItem>
                      <SelectItem value="student">Estudiante</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Teacher-specific fields */}
                {registerRole === 'teacher' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="school-name">Institución Educativa (Opcional)</Label>
                      <Input
                        id="school-name"
                        type="text"
                        placeholder="Nombre de la institución"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Materia (Opcional)</Label>
                      <Input
                        id="subject"
                        type="text"
                        placeholder="Materia que enseñas"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                      />
                    </div>
                  </>
                )}

                {/* Student-specific fields */}
                {registerRole === 'student' && (
                  <div className="space-y-2">
                    <Label htmlFor="grade">Grado/Curso (Opcional)</Label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="grade"
                        type="text"
                        placeholder="Ej: 5to Grado, 2do Bachillerato"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    'Crear Cuenta'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};