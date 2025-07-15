import React, { useState, useEffect } from 'react';
import { Plus, Search, Users, User, TrendingUp, DollarSign, UserPlus, Copy, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CreateStudentForm } from '@/components/CreateStudentForm';

export const StudentsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [teacherCode, setTeacherCode] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const fetchStudents = async () => {
    if (!user || user.role !== 'teacher') return;
    
    try {
      setIsLoading(true);
      
      // Get teacher's code first
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('teacher_code')
        .eq('id', user.id)
        .single();

      if (teacherError) {
        console.error('Error fetching teacher data:', teacherError);
        return;
      }

      setTeacherCode(teacherData.teacher_code);

      // Get registered students with teacher's code
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          *,
          profiles!inner(id, email, full_name, avatar_url)
        `)
        .eq('teacher_code', teacherData.teacher_code);

      if (studentsError) {
        console.error('Error fetching students:', studentsError);
      }

      // Get pending invitations
      const { data: invitationsData, error: invitationsError } = await supabase
        .from('student_invitations')
        .select('*')
        .eq('teacher_id', user.id);

      if (invitationsError) {
        console.error('Error fetching invitations:', invitationsError);
      }

      // Transform registered students data
      const transformedStudents = (studentsData || []).map(student => ({
        id: student.id,
        name: student.profiles.full_name,
        email: student.profiles.email,
        level: student.grade || 'Básico',
        joinDate: student.created_at.split('T')[0],
        status: 'Activo',
        avatar: student.profiles.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${student.profiles.email}`,
        isRegistered: true,
        type: 'student'
      }));

      // Transform invitation data
      const transformedInvitations = (invitationsData || []).map(invitation => ({
        id: invitation.id,
        name: invitation.student_name,
        email: invitation.student_email,
        level: invitation.student_level || 'Básico',
        joinDate: invitation.created_at.split('T')[0],
        status: 'Pendiente de Registro',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${invitation.student_email}`,
        isRegistered: false,
        type: 'invitation'
      }));

      // Combine both arrays
      const allStudents = [...transformedStudents, ...transformedInvitations];
      setStudents(allStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch students from Supabase
  useEffect(() => {
    fetchStudents();
  }, [user]);

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  // Avatar component with fallback to initials
  const StudentAvatar = ({ student }: { student: any }) => {
    const [imageError, setImageError] = useState(false);
    
    if (!student.avatar || imageError) {
      const initials = getInitials(student.name);
      const colors = [
        'from-blue-400 to-blue-600',
        'from-purple-400 to-purple-600', 
        'from-pink-400 to-pink-600',
        'from-green-400 to-green-600',
        'from-orange-400 to-orange-600',
        'from-red-400 to-red-600',
        'from-indigo-400 to-indigo-600',
        'from-teal-400 to-teal-600'
      ];
      
      const colorIndex = student.name.length % colors.length;
      const gradientClass = colors[colorIndex];
      
      return (
        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${gradientClass} flex items-center justify-center ring-2 ring-white shadow-md`}>
          <span className="text-white font-bold text-lg">{initials}</span>
        </div>
      );
    }

    return (
      <img
        src={student.avatar}
        alt={student.name}
        className="w-16 h-16 rounded-full object-cover ring-2 ring-white shadow-md"
        onError={() => setImageError(true)}
      />
    );
  };

  const copyTeacherCode = async () => {
    try {
      await navigator.clipboard.writeText(teacherCode);
      toast({
        title: "Código copiado",
        description: "El código del profesor ha sido copiado al portapapeles",
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando estudiantes...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Gestión de Estudiantes</h1>
              <p className="text-muted-foreground">Administra tu lista de estudiantes y su información</p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Dar de Alta Estudiante
            </Button>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/80 backdrop-blur-sm border-muted p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Estudiantes</p>
                  <p className="text-2xl font-bold text-foreground">{students.length}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-muted p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registrados</p>
                  <p className="text-2xl font-bold text-foreground">{students.filter(s => s.isRegistered).length}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-muted p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pendientes</p>
                  <p className="text-2xl font-bold text-foreground">{students.filter(s => !s.isRegistered).length}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-muted p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nuevos este mes</p>
                  <p className="text-2xl font-bold text-foreground">
                    {students.filter(s => {
                      const joinDate = new Date(s.joinDate);
                      const now = new Date();
                      return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Search */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Buscar estudiantes por nombre o email..."
                className="pl-12 h-12 rounded-xl border-muted focus:border-primary focus:ring-primary/20 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Students Grid */}
          {filteredStudents.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-sm border-muted p-12 text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {students.length === 0 ? 'No tienes estudiantes registrados' : 'No se encontraron estudiantes'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {students.length === 0 
                  ? 'Comienza creando tu primer estudiante usando el botón "Dar de Alta Estudiante".'
                  : 'Intenta con otros términos de búsqueda.'
                }
              </p>
              {students.length === 0 && teacherCode && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>Tu código de profesor:</strong>
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="bg-blue-100 text-blue-900 px-3 py-2 rounded font-mono text-lg font-bold">
                      {teacherCode}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={copyTeacherCode}
                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    Usa el botón "Dar de Alta Estudiante" para crear estudiantes y enviarles invitaciones automáticamente.
                  </p>
                </div>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.map((student) => (
                <Card key={student.id} className="bg-white/80 backdrop-blur-sm border-muted hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <StudentAvatar student={student} />
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground text-lg">{student.name}</h3>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                        <span className="inline-block mt-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                          {student.level}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Estado:</span>
                        <span className={`font-medium ${student.isRegistered ? 'text-green-600' : 'text-orange-600'}`}>
                          {student.status}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Registrado:</span>
                        <span className="font-medium text-foreground">
                          {new Date(student.joinDate).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Create Student Dialog */}
          <CreateStudentForm
            isOpen={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            onStudentCreated={fetchStudents}
          />
        </>
      )}
    </div>
  );
};