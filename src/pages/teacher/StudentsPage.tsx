import React, { useState, useEffect } from 'react';
import { Plus, Search, Users, User, TrendingUp, DollarSign, UserPlus, Copy, Clock, Mail, Phone, Calendar, Settings, MoreVertical, MessageCircle, Video, X, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

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
        return;
      }

      // Get pending invitations
      const { data: invitationsData, error: invitationsError } = await supabase
        .from('student_invitations')
        .select('*')
        .eq('teacher_id', user.id)
        .eq('is_accepted', false);

      if (invitationsError) {
        console.error('Error fetching invitations:', invitationsError);
        return;
      }

      // Transform registered students
      const registeredStudents = studentsData.map(student => ({
        id: student.id,
        name: student.profiles.full_name,
        email: student.profiles.email,
        avatar: student.profiles.avatar_url,
        level: student.grade || 'Básico',
        status: 'Registrado',
        nextClass: null,
        totalClasses: 0,
        completedClasses: 0,
        type: 'registered'
      }));

      // Transform pending invitations
      const pendingStudents = invitationsData.map(invitation => ({
        id: invitation.id,
        name: invitation.student_name,
        email: invitation.student_email,
        avatar: null,
        level: invitation.student_level || 'Básico',
        status: 'Invitación Pendiente',
        nextClass: null,
        totalClasses: 0,
        completedClasses: 0,
        type: 'invitation'
      }));

      // Combine both arrays
      setStudents([...registeredStudents, ...pendingStudents]);

    } catch (error) {
      console.error('Error in fetchStudents:', error);
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
                  <User className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registrados</p>
                  <p className="text-2xl font-bold text-foreground">
                    {students.filter(s => s.status === 'Registrado').length}
                  </p>
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
                  <p className="text-2xl font-bold text-foreground">
                    {students.filter(s => s.status === 'Invitación Pendiente').length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-muted p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Crecimiento</p>
                  <p className="text-2xl font-bold text-foreground">+12%</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Teacher Code Section */}
          <Card className="bg-white/80 backdrop-blur-sm border-muted p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Tu Código de Profesor</h3>
                <p className="text-muted-foreground">Comparte este código con tus estudiantes para que puedan registrarse</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-primary text-white px-6 py-3 rounded-lg font-mono text-xl font-bold tracking-wider">
                  {teacherCode}
                </div>
                <Button 
                  variant="outline"
                  onClick={copyTeacherCode}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copiar
                </Button>
              </div>
            </div>
          </Card>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar estudiantes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Students Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <Card key={student.id} className="bg-white/80 backdrop-blur-sm border-muted hover:shadow-lg transition-all duration-300 group cursor-pointer"
                    onClick={() => setSelectedStudent(student)}>
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <StudentAvatar student={student} />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {student.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          student.level === 'Básico' ? 'bg-blue-100 text-blue-700' :
                          student.level === 'Intermedio' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {student.level}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          student.status === 'Registrado' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {student.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-muted">
                    <div className="text-sm text-muted-foreground">
                      Próxima clase: {student.nextClass || 'Sin programar'}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStudent(student);
                      }}
                    >
                      Ver perfil
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredStudents.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No hay estudiantes</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'No se encontraron estudiantes con ese término de búsqueda.' : 'Aún no tienes estudiantes registrados.'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Dar de Alta Primer Estudiante
                </Button>
              )}
            </div>
          )}
        </>
      )}

      {/* Create Student Dialog */}
      <CreateStudentForm 
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onStudentCreated={() => {
          setIsCreateDialogOpen(false);
          fetchStudents();
        }}
      />

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white rounded-t-2xl border-b p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Perfil de Estudiante</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedStudent(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Header with Avatar */}
              <div className="flex items-center gap-6">
                <StudentAvatar student={selectedStudent} />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-1">
                    {selectedStudent.name}
                  </h3>
                  <p className="text-muted-foreground mb-2">{selectedStudent.email}</p>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                      selectedStudent.level === 'Básico' ? 'bg-blue-100 text-blue-700' :
                      selectedStudent.level === 'Intermedio' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      <BookOpen className="h-4 w-4" />
                      {selectedStudent.level}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                      selectedStudent.status === 'Registrado' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      <User className="h-4 w-4" />
                      {selectedStudent.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Información de Clases
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Próxima clase:</span>
                      <span className="font-medium">{selectedStudent.nextClass || 'Sin programar'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total clases:</span>
                      <span className="font-medium">{selectedStudent.totalClasses || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Clases completadas:</span>
                      <span className="font-medium">{selectedStudent.completedClasses || 0}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Contacto
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{selectedStudent.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estado:</span>
                      <span className={`font-medium ${
                        selectedStudent.status === 'Registrado' ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {selectedStudent.status}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button className="flex-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  Programar Clase
                </Button>
                <Button variant="outline" className="flex-1">
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Mensaje
                </Button>
                <Button variant="outline">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};