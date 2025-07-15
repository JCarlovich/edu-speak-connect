import React, { useState, useEffect } from 'react';
import { Plus, Search, Users, User, TrendingUp, DollarSign, UserPlus, Copy, Clock, Mail, Phone, Calendar, Settings, MoreVertical, MessageCircle, Video, X, BookOpen, Star, Award, CheckCircle, AlertCircle, Euro } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

      // Get classes data to calculate stats
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', user.id);

      if (classesError) {
        console.error('Error fetching classes:', classesError);
      }

      // Transform registered students with stats
      const registeredStudents = studentsData.map(student => {
        const studentClasses = classesData?.filter(cls => cls.student_email === student.profiles.email) || [];
        const completedClasses = studentClasses.filter(cls => cls.status === 'Completada');
        const paidClasses = studentClasses.filter(cls => cls.payment_status === 'Pagado');
        const nextClass = studentClasses
          .filter(cls => cls.status === 'Programada' && new Date(cls.class_date) >= new Date())
          .sort((a, b) => new Date(a.class_date).getTime() - new Date(b.class_date).getTime())[0];

        return {
          id: student.id,
          name: student.profiles.full_name,
          email: student.profiles.email,
          avatar: student.profiles.avatar_url,
          level: student.grade || 'Básico',
          status: 'Registrado',
          phone: '+34 612 345 678', // Mock data - you can add this to profiles table later
          joinDate: student.created_at,
          nextClass: nextClass ? `${nextClass.class_date} ${nextClass.class_time}` : null,
          totalClasses: studentClasses.length,
          completedClasses: completedClasses.length,
          paidClasses: paidClasses.length,
          unpaidClasses: studentClasses.length - paidClasses.length,
          averageScore: 8.5, // Mock data - you can add scoring system later
          type: 'registered'
        };
      });

      // Transform pending invitations
      const pendingStudents = invitationsData.map(invitation => ({
        id: invitation.id,
        name: invitation.student_name,
        email: invitation.student_email,
        avatar: null,
        level: invitation.student_level || 'Básico',
        status: 'Invitación Pendiente',
        phone: null,
        joinDate: invitation.created_at,
        nextClass: null,
        totalClasses: 0,
        completedClasses: 0,
        paidClasses: 0,
        unpaidClasses: 0,
        averageScore: 0,
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
  const StudentAvatar = ({ student, size = 'md' }: { student: any, size?: 'sm' | 'md' | 'lg' }) => {
    const [imageError, setImageError] = useState(false);
    
    const sizeClasses = {
      sm: 'w-10 h-10',
      md: 'w-16 h-16',
      lg: 'w-20 h-20'
    };

    const textSizes = {
      sm: 'text-sm',
      md: 'text-lg',
      lg: 'text-xl'
    };
    
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
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${gradientClass} flex items-center justify-center ring-2 ring-white shadow-md`}>
          <span className={`text-white font-bold ${textSizes[size]}`}>{initials}</span>
        </div>
      );
    }

    return (
      <img
        src={student.avatar}
        alt={student.name}
        className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-white shadow-md`}
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
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

          {/* Students Grid - Enhanced Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <Card key={student.id} className="bg-white/90 backdrop-blur-sm border-muted hover:shadow-xl transition-all duration-300 group cursor-pointer overflow-hidden"
                    onClick={() => setSelectedStudent(student)}>
                
                {/* Card Header with gradient */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <StudentAvatar student={student} size="md" />
                      <div>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-lg">
                          {student.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Enviar mensaje
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Calendar className="h-4 w-4 mr-2" />
                          Programar clase
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Video className="h-4 w-4 mr-2" />
                          Videollamada
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Card Content */}
                <CardContent className="p-4 space-y-4">
                  {/* Status and Level Badges */}
                  <div className="flex items-center gap-2">
                    <Badge variant={student.status === 'Registrado' ? 'default' : 'secondary'} className="text-xs">
                      {student.status === 'Registrado' ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <Clock className="h-3 w-3 mr-1" />
                      )}
                      {student.status}
                    </Badge>
                    <Badge variant="outline" className={`text-xs ${
                      student.level === 'Básico' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                      student.level === 'Intermedio' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' :
                      'border-green-200 text-green-700 bg-green-50'
                    }`}>
                      <BookOpen className="h-3 w-3 mr-1" />
                      {student.level}
                    </Badge>
                  </div>

                  {/* Statistics Grid */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-600">Clases</span>
                      </div>
                      <div className="font-semibold text-gray-900">
                        {student.completedClasses}/{student.totalClasses}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Euro className="h-4 w-4 text-green-600" />
                        <span className="text-gray-600">Pagadas</span>
                      </div>
                      <div className="font-semibold text-gray-900">
                        {student.paidClasses}
                      </div>
                    </div>
                  </div>

                  {/* Performance */}
                  {student.status === 'Registrado' && (
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm text-gray-600">Promedio</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-lg">{student.averageScore}</span>
                          <span className="text-sm text-gray-500">/10</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Next Class or Join Date */}
                  <div className="pt-2 border-t border-gray-100">
                    {student.nextClass ? (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-600">Próxima:</span>
                        <span className="font-medium">{formatDate(student.nextClass.split(' ')[0])}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {student.status === 'Registrado' ? 'Sin clases programadas' : `Invitado el ${formatDate(student.joinDate)}`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      className="flex-1 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Programar clase action
                      }}
                    >
                      <Calendar className="h-3 w-3 mr-1" />
                      Clase
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Mensaje action
                      }}
                    >
                      <Mail className="h-3 w-3 mr-1" />
                      Mensaje
                    </Button>
                  </div>
                </CardContent>
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
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
              {/* Header with Avatar and Basic Info */}
              <div className="flex items-center gap-6">
                <StudentAvatar student={selectedStudent} size="lg" />
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-foreground mb-2">
                    {selectedStudent.name}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {selectedStudent.email}
                    </div>
                    {selectedStudent.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        {selectedStudent.phone}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <Badge variant={selectedStudent.status === 'Registrado' ? 'default' : 'secondary'}>
                      {selectedStudent.status === 'Registrado' ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <Clock className="h-3 w-3 mr-1" />
                      )}
                      {selectedStudent.status}
                    </Badge>
                    <Badge variant="outline" className={`${
                      selectedStudent.level === 'Básico' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                      selectedStudent.level === 'Intermedio' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' :
                      'border-green-200 text-green-700 bg-green-50'
                    }`}>
                      <BookOpen className="h-4 w-4 mr-1" />
                      {selectedStudent.level}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Total de Clases</p>
                      <p className="text-2xl font-bold text-blue-900">{selectedStudent.totalClasses}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-green-50 border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-green-600 font-medium">Completadas</p>
                      <p className="text-2xl font-bold text-green-900">{selectedStudent.completedClasses}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-purple-50 border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <Star className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Promedio</p>
                      <p className="text-2xl font-bold text-purple-900">{selectedStudent.averageScore}/10</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Payment Information */}
              {selectedStudent.status === 'Registrado' && (
                <Card className="p-4">
                  <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                    <Euro className="h-4 w-4" />
                    Estado de Pagos
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Clases pagadas:</span>
                      <span className="font-medium text-green-600">{selectedStudent.paidClasses}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Clases pendientes:</span>
                      <span className="font-medium text-orange-600">{selectedStudent.unpaidClasses}</span>
                    </div>
                  </div>
                </Card>
              )}

              {/* Next Class Information */}
              <Card className="p-4">
                <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Información de Clases
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Próxima clase:</span>
                    <span className="font-medium">{selectedStudent.nextClass || 'Sin programar'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fecha de registro:</span>
                    <span className="font-medium">{formatDate(selectedStudent.joinDate)}</span>
                  </div>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t">
                <Button className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Nueva Clase
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Mensaje
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Videollamada
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configurar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};