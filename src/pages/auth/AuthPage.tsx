import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const invitationId = searchParams.get('invitation');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(invitationId ? 'invitation' : 'login');
  const navigate = useNavigate();
  const { user } = useAuth();

  // Student invitation data
  const [invitationData, setInvitationData] = useState<any>(null);
  const [invitationPassword, setInvitationPassword] = useState('');

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form for teachers
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerFullName, setRegisterFullName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [subject, setSubject] = useState('');

  // Check for invitation on load
  useEffect(() => {
    if (invitationId) {
      fetchInvitationData();
    }
  }, [invitationId]);

  const fetchInvitationData = async () => {
    if (!invitationId) return;

    try {
      const { data: studentData, error } = await supabase
        .from('students')
        .select(`
          *,
          profiles!inner(*)
        `)
        .eq('invitation_id', invitationId)
        .eq('is_registered', false)
        .single();

      if (error || !studentData) {
        setError('Invitación no válida o ya utilizada');
        return;
      }

      setInvitationData({
        id: studentData.id,
        name: studentData.profiles.full_name,
        email: studentData.profiles.email,
        grade: studentData.grade
      });
    } catch (error) {
      console.error('Error fetching invitation:', error);
      setError('Error al cargar la invitación');
    }
  };

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

  const handleTeacherRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Generate teacher code
      const generatedTeacherCode = `PROF${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: registerFullName,
            role: 'teacher',
            teacher_code: generatedTeacherCode,
            school_name: schoolName,
            subject: subject,
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

  const handleInvitationRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitationData || !invitationPassword) return;

    setIsLoading(true);
    setError('');

    try {
      // Register the user with Supabase Auth using the existing email
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invitationData.email,
        password: invitationPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/student`,
          data: {
            full_name: invitationData.name,
            role: 'student',
            grade: invitationData.grade
          }
        }
      });

      if (authError) {
        if (authError.message.includes('already been registered')) {
          // User already exists, try to sign in instead
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: invitationData.email,
            password: invitationPassword,
          });

          if (signInError) {
            throw new Error('Este email ya está registrado. Si olvidaste tu contraseña, contacta a tu profesor.');
          }
        } else {
          throw authError;
        }
      }

      // Mark student as registered
      const { error: updateError } = await supabase
        .from('students')
        .update({ is_registered: true })
        .eq('id', invitationData.id);

      if (updateError) {
        console.error('Error updating student registration status:', updateError);
      }

      // Show success message
      alert('¡Registro completado! Ya puedes acceder a tu cuenta de estudiante.');
      
    } catch (error: any) {
      setError(error.message || 'Error al completar el registro');
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
            <TabsList className={`grid w-full ${invitationId ? 'grid-cols-2' : 'grid-cols-2'}`}>
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              {invitationId ? (
                <TabsTrigger value="invitation">Completar Registro</TabsTrigger>
              ) : (
                <TabsTrigger value="register">Registro Profesores</TabsTrigger>
              )}
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

            {/* Student Invitation Registration */}
            {invitationId && (
              <TabsContent value="invitation" className="space-y-4">
                {invitationData ? (
                  <form onSubmit={handleInvitationRegister} className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <h3 className="font-semibold text-blue-900 mb-2">Completar Registro</h3>
                      <p className="text-sm text-blue-800">
                        Has sido invitado como: <strong>{invitationData.name}</strong>
                      </p>
                      <p className="text-sm text-blue-600">
                        Email: {invitationData.email}
                      </p>
                      {invitationData.grade && (
                        <p className="text-sm text-blue-600">
                          Grado: {invitationData.grade}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="invitation-password">Crear Contraseña</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="invitation-password"
                          type="password"
                          placeholder="••••••••"
                          value={invitationPassword}
                          onChange={(e) => setInvitationPassword(e.target.value)}
                          className="pl-10"
                          minLength={6}
                          required
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        La contraseña debe tener al menos 6 caracteres
                      </p>
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
                          Completando registro...
                        </>
                      ) : (
                        'Completar mi Registro'
                      )}
                    </Button>
                  </form>
                ) : (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Cargando invitación...</p>
                  </div>
                )}
              </TabsContent>
            )}

            {/* Teacher Registration */}
            {!invitationId && (
              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleTeacherRegister} className="space-y-4">
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

                  {/* Teacher-specific fields */}
                  <div className="space-y-4">
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
                        Registrando...
                      </>
                    ) : (
                      'Crear Cuenta de Profesor'
                    )}
                  </Button>
                </form>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};