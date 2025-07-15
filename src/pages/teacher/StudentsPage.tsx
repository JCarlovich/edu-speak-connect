
import React, { useState, useEffect } from 'react';
import { Plus, Search, Mail, Phone, Calendar, MoreVertical, DollarSign, BookOpen, TrendingUp, Video, X, Clock, FileText, CheckCircle2, AlertCircle, CalendarIcon, Users, User, UserCheck, CheckCircle, BarChart, CircleDollarSign, Euro, Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useClasses } from '@/contexts/ClassesContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const students = [
  {
    id: 1,
    name: 'Ana Martínez',
    email: 'ana.martinez@email.com',
    phone: '+34 612 345 678',
    level: 'Intermedio',
    joinDate: '2024-01-15',
    classesCompleted: 12,
    classesPaid: 10,
    classesRemaining: 3,
    totalRevenue: 450,
    averageScore: 8.5,
    lastClass: '2024-03-10',
    nextClass: '2024-03-15',
    homeworkCompleted: 8,
    homeworkPending: 2,
    status: 'Activo',
    paymentStatus: 'Al día',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    classes: [
      {
        id: 1,
        date: '2024-03-10',
        topic: 'Pretérito perfecto vs imperfecto',
        duration: '60 min',
        paid: true,
        amount: 40
      },
      {
        id: 2,
        date: '2024-03-05',
        topic: 'Conversación libre',
        duration: '45 min',
        paid: true,
        amount: 35
      },
      {
        id: 3,
        date: '2024-03-01',
        topic: 'Gramática: ser vs estar',
        duration: '60 min',
        paid: false,
        amount: 40
      }
    ],
    homework: [
      {
        id: 1,
        classId: 1,
        title: 'Conjugación de verbos irregulares',
        assigned: '2024-03-12',
        dueDate: '2024-03-15',
        status: 'Completado',
        score: 9.0,
        type: 'Ejercicios'
      },
      {
        id: 2,
        classId: 1,
        title: 'Redacción: Mi rutina diaria',
        assigned: '2024-03-10',
        dueDate: '2024-03-14',
        status: 'Pendiente',
        score: null,
        type: 'Ensayo'
      }
    ],
    summaries: [
      {
        id: 1,
        classId: 1,
        classDate: '2024-03-10',
        topic: 'Pretérito perfecto vs imperfecto',
        duration: '60 min',
        achievements: ['Dominio de conjugaciones básicas', 'Mejora en pronunciación'],
        weaknesses: ['Confusión en usos específicos', 'Velocidad de habla'],
        nextFocus: 'Práctica conversacional con tiempos pasados'
      },
      {
        id: 2,
        classId: 2,
        classDate: '2024-03-05',
        topic: 'Conversación libre',
        duration: '45 min',
        achievements: ['Fluidez mejorada', 'Vocabulario más rico'],
        weaknesses: ['Algunos errores de concordancia'],
        nextFocus: 'Práctica de concordancia de género y número'
      }
    ]
  },
  {
    id: 2,
    name: 'Carlos López',
    email: 'carlos.lopez@email.com',
    phone: '+34 623 456 789',
    level: 'Avanzado',
    joinDate: '2023-11-20',
    classesCompleted: 28,
    classesPaid: 30,
    classesRemaining: 2,
    totalRevenue: 1200,
    averageScore: 9.2,
    lastClass: '2024-03-08',
    nextClass: '2024-03-14',
    homeworkCompleted: 25,
    homeworkPending: 1,
    status: 'Activo',
    paymentStatus: 'Al día',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    classes: [
      {
        id: 1,
        date: '2024-03-08',
        topic: 'Subjuntivo en cláusulas nominales',
        duration: '60 min',
        paid: true,
        amount: 45
      },
      {
        id: 2,
        date: '2024-03-01',
        topic: 'Literatura española contemporánea',
        duration: '60 min',
        paid: true,
        amount: 45
      }
    ],
    homework: [
      {
        id: 1,
        classId: 1,
        title: 'Análisis de texto literario',
        assigned: '2024-03-08',
        dueDate: '2024-03-14',
        status: 'En progreso',
        score: null,
        type: 'Análisis'
      }
    ],
    summaries: [
      {
        id: 1,
        classId: 1,
        classDate: '2024-03-08',
        topic: 'Subjuntivo en cláusulas nominales',
        duration: '60 min',
        achievements: ['Excelente comprensión teórica', 'Aplicación correcta en ejercicios'],
        weaknesses: ['Dudas en expresiones idiomáticas'],
        nextFocus: 'Subjuntivo en cláusulas adverbiales'
      }
    ]
  },
  {
    id: 3,
    name: 'María González',
    email: 'maria.gonzalez@email.com',
    phone: '+34 634 567 890',
    level: 'Básico',
    joinDate: '2024-02-01',
    classesCompleted: 8,
    classesPaid: 8,
    classesRemaining: 0,
    totalRevenue: 320,
    averageScore: 7.8,
    lastClass: '2024-03-05',
    nextClass: '2024-03-16',
    homeworkCompleted: 6,
    homeworkPending: 3,
    status: 'Activo',
    paymentStatus: 'Pendiente',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    classes: [
      {
        id: 1,
        date: '2024-03-05',
        topic: 'Presente simple - tercera persona',
        duration: '45 min',
        paid: true,
        amount: 35
      },
      {
        id: 2,
        date: '2024-02-28',
        topic: 'Vocabulario: La familia',
        duration: '45 min',
        paid: false,
        amount: 35
      },
      {
        id: 3,
        date: '2024-02-25',
        topic: 'Números y colores',
        duration: '30 min',
        paid: false,
        amount: 25
      }
    ],
    homework: [
      {
        id: 1,
        classId: 1,
        title: 'Vocabulario: La familia',
        assigned: '2024-03-05',
        dueDate: '2024-03-12',
        status: 'Completado',
        score: 7.5,
        type: 'Vocabulario'
      },
      {
        id: 2,
        classId: 2,
        title: 'Diálogo en presente simple',
        assigned: '2024-03-03',
        dueDate: '2024-03-10',
        status: 'Pendiente',
        score: null,
        type: 'Conversación'
      }
    ],
    summaries: [
      {
        id: 1,
        classId: 1,
        classDate: '2024-03-05',
        topic: 'Presente simple - tercera persona',
        duration: '45 min',
        achievements: ['Comprende la estructura básica', 'Buena pronunciación'],
        weaknesses: ['Olvida la -s en tercera persona', 'Vocabulario limitado'],
        nextFocus: 'Práctica intensiva de tercera persona'
      }
    ]
  },
  {
    id: 4,
    name: 'Pedro Ruiz',
    email: 'pedro.ruiz@email.com',
    phone: '+34 645 678 901',
    level: 'Intermedio',
    joinDate: '2023-12-10',
    classesCompleted: 15,
    classesPaid: 12,
    classesRemaining: 5,
    totalRevenue: 480,
    averageScore: 6.9,
    lastClass: '2024-02-28',
    nextClass: null,
    homeworkCompleted: 10,
    homeworkPending: 0,
    status: 'Inactivo',
    paymentStatus: 'Atrasado',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    classes: [
      {
        id: 1,
        date: '2024-02-28',
        topic: 'Repaso general - condicionales',
        duration: '60 min',
        paid: false,
        amount: 40
      },
      {
        id: 2,
        date: '2024-02-20',
        topic: 'Futuro simple',
        duration: '60 min',
        paid: true,
        amount: 40
      }
    ],
    homework: [],
    summaries: [
      {
        id: 1,
        classId: 1,
        classDate: '2024-02-28',
        topic: 'Repaso general - condicionales',
        duration: '60 min',
        achievements: ['Entiende la teoría de condicionales'],
        weaknesses: ['Dificultad en aplicación práctica', 'Falta de práctica'],
        nextFocus: 'Retomar clases regularmente'
      }
    ]
  }
];

export const StudentsPage: React.FC = () => {
  const { addClass, updateClass, classes } = useClasses();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para el formulario de agregar estudiante + clase
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [createClassToo, setCreateClassToo] = useState(false);
  const [studentData, setStudentData] = useState({
    name: '',
    email: '',
    phone: '',
    level: 'Básico'
  });
  const [classData, setClassData] = useState({
    topic: '',
    time: '',
    duration: '60',
    notes: ''
  });

  // Fetch students from Supabase
  useEffect(() => {
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

        // Get students with teacher's code
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

        // Transform data to match expected format
        const transformedStudents = studentsData.map(student => ({
          id: student.id,
          name: student.profiles.full_name,
          email: student.profiles.email,
          phone: '', // You can add phone to profiles table if needed
          level: student.grade || 'Básico',
          joinDate: student.created_at.split('T')[0],
          classesCompleted: 0, // Calculate from classes
          classesPaid: 0, // Calculate from classes
          classesRemaining: 0, // Calculate from classes
          totalRevenue: 0, // Calculate from classes
          averageScore: 0, // Calculate from homework
          lastClass: null, // Calculate from classes
          nextClass: null, // Calculate from classes
          homeworkCompleted: 0,
          homeworkPending: 0,
          status: 'Activo',
          paymentStatus: 'Al día',
          avatar: student.profiles.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${student.profiles.email}`,
          classes: [],
          homework: [],
          summaries: []
        }));

        setStudents(transformedStudents);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [user]);

  // Calculate KPIs
  const activeStudents = students.filter(student => student.status === 'Activo').length;
  
  const averageProgress = students.reduce((acc, student) => {
    return acc + student.averageScore;
  }, 0) / students.length;
  
  const totalRevenue = students.reduce((acc, student) => {
    return acc + student.totalRevenue;
  }, 0);

  // Generar opciones de hora (00:00 a 23:00)
  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return {
      value: `${hour}:00`,
      label: `${hour}:00`
    };
  });

  
  // Function to find and update corresponding class in context
  const updatePaymentInContext = (studentName: string, classDate: string, classTopic: string, newPaymentStatus: string) => {
    // Find the corresponding class in the context
    const matchingClass = classes.find(contextClass => 
      contextClass.studentName === studentName &&
      contextClass.date === classDate &&
      contextClass.topic === classTopic
    );
    
    if (matchingClass) {
      updateClass(matchingClass.id, { paymentStatus: newPaymentStatus });
    }
  };

  const generateMeetingLink = () => {
    const randomId = Math.random().toString(36).substring(2, 15);
    return `https://meet.google.com/${randomId}`;
  };

  const handleAddStudent = () => {
    // Crear el estudiante (aquí normalmente se haría una llamada a la API)
    console.log('Nuevo estudiante:', studentData);
    
    // Si también quiere crear una clase
    if (createClassToo && selectedDate && classData.topic && classData.time) {
      const meetingLink = generateMeetingLink();
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      addClass({
        studentName: studentData.name,
        studentAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', // Avatar por defecto
        studentEmail: studentData.email,
        studentLevel: studentData.level,
        topic: classData.topic,
        date: formattedDate,
        time: classData.time,
        duration: classData.duration,
        status: 'Programada',
        paymentStatus: 'No Pagado',
        meetingLink: meetingLink,
        notes: classData.notes || ''
      });
      
      alert(`Estudiante agregado y clase programada exitosamente!\nLink de reunión: ${meetingLink}`);
    } else {
      alert('Estudiante agregado exitosamente!');
    }
    
    // Resetear formulario
    setStudentData({ name: '', email: '', phone: '', level: 'Básico' });
    setClassData({ topic: '', time: '', duration: '60', notes: '' });
    setSelectedDate(undefined);
    setCreateClassToo(false);
    setShowAddStudent(false);
  };

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
      sm: 'w-12 h-12',
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
      
      // Use name hash to consistently pick same color for same student
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

  // Calculate dynamic payment information
  const calculatePaymentInfo = (student: any) => {
    if (!student.classes) return { totalRevenue: 0, classesPaid: 0, totalClasses: 0, paymentStatus: 'Al día' };
    
    const paidClasses = student.classes.filter((cls: any) => cls.paid);
    const totalRevenue = paidClasses.reduce((sum: number, cls: any) => sum + cls.amount, 0);
    const classesPaid = paidClasses.length;
    const totalClasses = student.classes.length;
    const pendingClasses = student.classes.filter((cls: any) => !cls.paid);
    
    let paymentStatus = 'Al día';
    if (pendingClasses.length > 0) {
      paymentStatus = 'Pendiente';
    }
    
    return { totalRevenue, classesPaid, totalClasses, paymentStatus };
  };

  // Calculate classes stats based on Classes context
  const calculateClassStats = (studentName: string) => {
    const studentClasses = classes.filter(cls => cls.studentName === studentName);
    const completedClasses = studentClasses.filter(cls => cls.status === 'Completada').length;
    const remainingClasses = studentClasses.filter(cls => cls.status === 'Programada').length;
    
    return { completedClasses, remainingClasses };
  };

  // Calculate next scheduled class for a student
  const getNextClass = (studentName: string) => {
    const today = new Date();
    console.log('=== DEBUG getNextClass ===');
    console.log('Fecha actual:', today.toISOString());
    console.log('Buscando próxima clase para:', studentName);
    console.log('Total clases disponibles:', classes.length);
    
    // Log all classes for debugging
    classes.forEach(cls => {
      const classDate = new Date(cls.date);
      console.log(`Clase completa: ${cls.studentName} - ${cls.date} - ${cls.status} - ¿Futura?: ${classDate >= today}`);
    });
    
    const studentClasses = classes.filter(cls => {
      const classDate = new Date(cls.date);
      const nameMatch = cls.studentName.trim() === studentName.trim();
      const isScheduled = cls.status === 'Programada';
      const isFuture = classDate >= today;
      
      console.log(`Evaluando: ${cls.studentName} === ${studentName}? ${nameMatch}, Status: ${cls.status} === 'Programada'? ${isScheduled}, Date: ${cls.date} >= ${today.toDateString()}? ${isFuture}`);
      
      return nameMatch && isScheduled && isFuture;
    });
    
    console.log('Clases filtradas para', studentName, ':', studentClasses);
    
    if (studentClasses.length === 0) {
      console.log('No hay clases futuras programadas para', studentName);
      return null;
    }
    
    // Sort by date and time to get the nearest one
    const sortedClasses = studentClasses.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });
    
    console.log('Próxima clase encontrada:', sortedClasses[0]);
    console.log('=== FIN DEBUG ===');
    return sortedClasses[0];
  };

  // Check for student parameter in URL and auto-open modal
  useEffect(() => {
    const studentName = searchParams.get('student');
    if (studentName) {
      const foundStudent = students.find(student => 
        student.name === decodeURIComponent(studentName)
      );
      if (foundStudent) {
        setSelectedStudent(foundStudent);
      }
    }
  }, [searchParams]);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'Todos' || student.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Estudiantes</h1>
          <p className="text-gray-600">Administra tu lista de estudiantes y su información</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6 py-3"
          onClick={() => setShowAddStudent(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Estudiante
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Buscar estudiantes por nombre o email..."
              className="pl-12 h-12 rounded-xl border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-gray-400" />
            <select 
              className="px-4 py-3 border border-gray-200 rounded-xl bg-white/90 hover:border-blue-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all min-w-[140px]"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="Todos">Todos</option>
              <option value="Activo">Activos</option>
              <option value="Inactivo">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <Card 
            key={student.id} 
            className="group relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-3xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:bg-white/90 cursor-pointer"
            onClick={() => setSelectedStudent(student)}
          >
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative p-6">
              {/* Header with Avatar and Status */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <StudentAvatar student={student} size="md" />
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-700 transition-colors">
                      {student.name}
                    </h3>
                    <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
                      student.status === 'Activo' 
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        student.status === 'Activo' ? 'bg-emerald-500' : 'bg-gray-400'
                      }`} />
                      {student.status}
                    </span>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-blue-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Aquí iría el menú de opciones
                  }}
                >
                  <MoreVertical className="h-4 w-4 text-gray-400 hover:text-blue-600" />
                </Button>
              </div>

              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-blue-500" />
                  </div>
                  <span className="text-sm">{student.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 hover:text-green-600 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                    <Phone className="h-4 w-4 text-green-500" />
                  </div>
                  <span className="text-sm">{student.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 hover:text-purple-600 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-purple-500" />
                  </div>
                  <span className="text-sm">Desde: {new Date(student.joinDate).toLocaleDateString('es-ES')}</span>
                </div>
              </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Nivel</p>
                  <p className="font-medium text-gray-900">{student.level}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Clases</p>
                  <p className="font-medium text-gray-900">{calculateClassStats(student.name).completedClasses}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Tareas</p>
                  <p className="font-medium text-purple-600">{student.homeworkCompleted}/{student.homeworkCompleted + student.homeworkPending}</p>
                </div>
              </div>

              {/* Next Class Info - Summary */}
              {(() => {
                const nextClass = getNextClass(student.name);
                return nextClass ? (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium text-blue-700">Próxima Clase</span>
                    </div>
                    <p className="text-sm text-blue-600">
                      {new Date(nextClass.date).toLocaleDateString('es-ES', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })} - {nextClass.time}
                    </p>
                    <p className="text-xs text-blue-500 mt-1">{nextClass.topic}</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Sin clases programadas</span>
                    </div>
                  </div>
                );
              })()}
            </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Student Modal with Class Creation */}
      {showAddStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl max-h-[95vh] overflow-y-auto bg-white/95 backdrop-blur-md border-0 shadow-2xl rounded-3xl">
            <div className="relative">
              {/* Gradient Header */}
              <div className="bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 p-8 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">✨ Nuevo Estudiante</h2>
                    <p className="text-emerald-100">Agrega un nuevo estudiante a tu lista</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowAddStudent(false)}
                    className="text-white hover:bg-white/20 rounded-full w-10 h-10 p-0"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-8">
                <div className="space-y-8">
                  {/* Student Information Section */}
                  <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-6 rounded-2xl border border-emerald-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <User className="h-5 w-5 text-emerald-500" />
                      Información del Estudiante
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="studentName" className="text-sm font-medium text-gray-700">Nombre Completo *</Label>
                        <Input
                          id="studentName"
                          type="text"
                          placeholder="Ej: Juan Pérez"
                          value={studentData.name}
                          onChange={(e) => setStudentData({...studentData, name: e.target.value})}
                          className="h-12 rounded-xl border-gray-200 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="studentEmail" className="text-sm font-medium text-gray-700">Email *</Label>
                        <Input
                          id="studentEmail"
                          type="email"
                          placeholder="juan@email.com"
                          value={studentData.email}
                          onChange={(e) => setStudentData({...studentData, email: e.target.value})}
                          className="h-12 rounded-xl border-gray-200 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="studentPhone" className="text-sm font-medium text-gray-700">Teléfono</Label>
                        <Input
                          id="studentPhone"
                          type="tel"
                          placeholder="+34 612 345 678"
                          value={studentData.phone}
                          onChange={(e) => setStudentData({...studentData, phone: e.target.value})}
                          className="h-12 rounded-xl border-gray-200 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="studentLevel" className="text-sm font-medium text-gray-700">Nivel *</Label>
                        <select 
                          id="studentLevel"
                          className="w-full h-12 px-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-400/20 focus:border-emerald-400 transition-all"
                          value={studentData.level}
                          onChange={(e) => setStudentData({...studentData, level: e.target.value})}
                        >
                          <option value="Básico">🟢 Básico</option>
                          <option value="Intermedio">🟡 Intermedio</option>
                          <option value="Avanzado">🔴 Avanzado</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Option to create class */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      Primera Clase (Opcional)
                    </h3>
                    <div className="flex items-center gap-3 mb-4">
                      <input
                        type="checkbox"
                        id="createClass"
                        checked={createClassToo}
                        onChange={(e) => setCreateClassToo(e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <Label htmlFor="createClass" className="text-sm font-medium text-gray-700">
                        También programar primera clase
                      </Label>
                    </div>

                    {createClassToo && (
                      <div className="space-y-4 bg-white/70 p-4 rounded-xl border border-blue-200">
                        <h4 className="text-md font-semibold text-blue-900 flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Información de la Clase
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Date */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Fecha *
                            </Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full h-12 justify-start text-left font-normal rounded-xl border-gray-200 focus:border-blue-400 focus:ring-blue-400/20",
                                    !selectedDate && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {selectedDate ? format(selectedDate, "PPPP") : "Selecciona una fecha"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                  mode="single"
                                  selected={selectedDate}
                                  onSelect={setSelectedDate}
                                  disabled={(date) => date < new Date()}
                                  initialFocus
                                  className="p-3 pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
                          </div>

                          {/* Time */}
                          <div className="space-y-2">
                            <Label htmlFor="classTime" className="text-sm font-medium text-gray-700">
                          Hora *
                        </Label>
                        <select 
                          id="classTime"
                          className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={classData.time}
                          onChange={(e) => setClassData({...classData, time: e.target.value})}
                        >
                          <option value="">-- Selecciona una hora --</option>
                          {timeOptions.map((time) => (
                            <option key={time.value} value={time.value}>
                              {time.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Topic */}
                    <div>
                      <Label htmlFor="classTopic" className="text-sm font-medium text-gray-700 mb-2 block">
                        Tema de la Clase *
                      </Label>
                      <Input
                        id="classTopic"
                        type="text"
                        placeholder="Ej: Clase introductoria, Evaluación de nivel"
                        value={classData.topic}
                        onChange={(e) => setClassData({...classData, topic: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Duration */}
                      <div>
                        <Label htmlFor="classDuration" className="text-sm font-medium text-gray-700 mb-2 block">
                          Duración (minutos) *
                        </Label>
                        <select 
                          id="classDuration"
                          className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={classData.duration}
                          onChange={(e) => setClassData({...classData, duration: e.target.value})}
                        >
                          <option value="30">30 minutos</option>
                          <option value="45">45 minutos</option>
                          <option value="60">60 minutos</option>
                          <option value="90">90 minutos</option>
                        </select>
                      </div>

                      {/* Notes */}
                      <div>
                        <Label htmlFor="classNotes" className="text-sm font-medium text-gray-700 mb-2 block">
                          Notas
                        </Label>
                        <Input
                          id="classNotes"
                          type="text"
                          placeholder="Objetivos, preparación, etc."
                          value={classData.notes}
                          onChange={(e) => setClassData({...classData, notes: e.target.value})}
                        />
                      </div>
                    </div>

                    {/* Info Box */}
                    <div className="bg-emerald-50 p-3 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Video className="h-4 w-4 text-emerald-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-emerald-800">Link de Videollamada</p>
                          <p className="text-sm text-emerald-700">
                            Se generará automáticamente un enlace cuando crees la clase.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

                {/* Actions */}
                <div className="flex gap-4 mt-8">
                  <Button 
                    variant="outline" 
                    className="flex-1 h-12 rounded-xl border-gray-200 hover:bg-gray-50 transition-all"
                    onClick={() => {
                      setStudentData({ name: '', email: '', phone: '', level: 'Básico' });
                      setClassData({ topic: '', time: '', duration: '60', notes: '' });
                      setSelectedDate(undefined);
                      setCreateClassToo(false);
                      setShowAddStudent(false);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={handleAddStudent}
                    disabled={!studentData.name || !studentData.email || (createClassToo && (!selectedDate || !classData.topic || !classData.time))}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    {createClassToo ? 'Crear Estudiante y Clase' : 'Crear Estudiante'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-4">
                <StudentAvatar student={selectedStudent} size="lg" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedStudent.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-3 py-1 text-sm rounded-full ${
                      selectedStudent.status === 'Activo' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {selectedStudent.status}
                    </span>
                    <span className={`px-3 py-1 text-sm rounded-full ${
                      calculatePaymentInfo(selectedStudent).paymentStatus === 'Al día' 
                        ? 'bg-emerald-100 text-emerald-700'
                        : calculatePaymentInfo(selectedStudent).paymentStatus === 'Pendiente'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {calculatePaymentInfo(selectedStudent).paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedStudent(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content with Tabs */}
            <div className="p-6">
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="general">Información General</TabsTrigger>
                  <TabsTrigger value="payments">Pagos</TabsTrigger>
                  <TabsTrigger value="homework">Deberes y Resúmenes</TabsTrigger>
                </TabsList>

                {/* General Information Tab */}
                <TabsContent value="general" className="mt-6">
                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-700">{selectedStudent.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-700">{selectedStudent.phone}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-700">
                            Desde: {new Date(selectedStudent.joinDate).toLocaleDateString("es-ES")}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-700">Nivel: {selectedStudent.level}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Próxima Clase</h3>
                      {(() => {
                        const nextClass = getNextClass(selectedStudent.name);
                        return nextClass ? (
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="h-5 w-5 text-blue-500" />
                              <span className="font-medium text-blue-700">
                                {new Date(nextClass.date).toLocaleDateString("es-ES", { 
                                  weekday: "long", 
                                  year: "numeric", 
                                  month: "long", 
                                  day: "numeric" 
                                })} - {nextClass.time}
                              </span>
                            </div>
                            <p className="text-sm text-blue-600 mb-3">{nextClass.topic}</p>
                            {nextClass.meetingLink && (
                              <Button 
                                size="sm"
                                className="bg-blue-500 hover:bg-blue-600"
                                onClick={() => window.open(nextClass.meetingLink, '_blank')}
                              >
                                <Video className="h-4 w-4 mr-2" />
                                Unirse a Clase
                              </Button>
                            )}
                          </div>
                        ) : (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-600 mb-3">Sin clases programadas</p>
                            <Button 
                              size="sm"
                              className="bg-blue-500 hover:bg-blue-600"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Programar Clase
                            </Button>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <p className="text-sm text-gray-600">Clases Completadas</p>
                        <p className="text-2xl font-bold text-gray-900">{calculateClassStats(selectedStudent.name).completedClasses}</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <p className="text-sm text-gray-600">Clases Restantes</p>
                        <p className="text-2xl font-bold text-blue-600">{calculateClassStats(selectedStudent.name).remainingClasses}</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg text-center">
                        <p className="text-sm text-gray-600">Tareas</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {selectedStudent.homeworkCompleted}/{selectedStudent.homeworkCompleted + selectedStudent.homeworkPending}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button 
                    className="bg-blue-500 hover:bg-blue-600"
                    onClick={() => {
                      console.log("Crear clase para:", selectedStudent.name);
                    }}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Crear Nueva Clase
                  </Button>
                </TabsContent>

                {/* Payments Tab */}
                <TabsContent value="payments" className="mt-6">
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Información de Pagos</h3>
                    
                    {/* Payment Overview */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="h-5 w-5 text-emerald-500" />
                            <span className="font-medium text-gray-700">Total Generado</span>
                          </div>
                          <p className="text-2xl font-bold text-emerald-600">€{calculatePaymentInfo(selectedStudent).totalRevenue}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Clases Pagadas</p>
                          <p className="text-2xl font-bold text-gray-900">{calculatePaymentInfo(selectedStudent).classesPaid}</p>
                          <p className="text-sm text-gray-500">de {calculatePaymentInfo(selectedStudent).totalClasses} totales</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Estado</p>
                          <span className={`inline-block px-3 py-2 text-sm font-medium rounded-lg ${
                            calculatePaymentInfo(selectedStudent).paymentStatus === "Al día" 
                              ? "bg-emerald-100 text-emerald-700"
                              : calculatePaymentInfo(selectedStudent).paymentStatus === "Pendiente"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}>
                            {calculatePaymentInfo(selectedStudent).paymentStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Classes Payment Table */}
                    <div>
                      <h4 className="text-md font-semibold text-gray-900 mb-4">Estado de Pagos por Clase</h4>
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Fecha</TableHead>
                              <TableHead>Tema</TableHead>
                              <TableHead>Duración</TableHead>
                              <TableHead>Monto</TableHead>
                              <TableHead>Estado</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedStudent.classes && selectedStudent.classes.map((cls: any) => (
                              <TableRow key={cls.id}>
                                <TableCell className="font-medium">
                                  {new Date(cls.date).toLocaleDateString("es-ES")}
                                </TableCell>
                                <TableCell>{cls.topic}</TableCell>
                                <TableCell>{cls.duration}</TableCell>
                                <TableCell className="font-medium">€{cls.amount}</TableCell>
                                <TableCell>
                                  <button 
                                    onClick={() => {
                                      // Toggle payment status locally
                                      const updatedClasses = selectedStudent.classes.map((c: any) => 
                                        c.id === cls.id ? { ...c, paid: !c.paid } : c
                                      );
                                      setSelectedStudent({
                                        ...selectedStudent,
                                        classes: updatedClasses
                                      });
                                      
                                      // Sync with Classes context
                                      const newPaymentStatus = cls.paid ? 'No Pagado' : 'Pagado';
                                      updatePaymentInContext(
                                        selectedStudent.name, 
                                        cls.date, 
                                        cls.topic, 
                                        newPaymentStatus
                                      );
                                    }}
                                    className={`px-3 py-1 text-xs rounded-full transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                                      cls.paid 
                                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 focus:ring-emerald-400" 
                                        : "bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-400"
                                    }`}
                                  >
                                    <span className="flex items-center gap-1">
                                      {cls.paid ? (
                                        <>
                                          <CheckCircle2 className="h-3 w-3" />
                                          Pagado
                                        </>
                                      ) : (
                                        <>
                                          <Clock className="h-3 w-3" />
                                          Pendiente
                                        </>
                                      )}
                                    </span>
                                  </button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Homework & Summaries Tab */}
                <TabsContent value="homework" className="mt-6">
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Clases, Deberes y Resúmenes</h3>
                    
                    {selectedStudent.classes && selectedStudent.classes.length > 0 ? (
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Fecha de Clase</TableHead>
                              <TableHead>Tema</TableHead>
                              <TableHead>Deberes</TableHead>
                              <TableHead>Resumen</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedStudent.classes.map((cls: any) => {
                              const classHomework = selectedStudent.homework?.filter((hw: any) => hw.classId === cls.id) || [];
                              const classSummary = selectedStudent.summaries?.find((s: any) => s.classId === cls.id);
                              
                              return (
                                <TableRow key={cls.id}>
                                  <TableCell className="font-medium">
                                    {new Date(cls.date).toLocaleDateString("es-ES")}
                                  </TableCell>
                                  <TableCell>
                                    <div>
                                      <p className="font-medium">{cls.topic}</p>
                                      <p className="text-sm text-gray-500">{cls.duration}</p>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {classHomework.length > 0 ? (
                                      <div className="space-y-1">
                                        {classHomework.map((hw: any) => (
                                          <div key={hw.id} className="text-sm">
                                            <div className="flex items-center gap-2">
                                              <span className="font-medium">{hw.title}</span>
                                              {hw.status === "Completado" ? (
                                                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                              ) : hw.status === "En progreso" ? (
                                                <Clock className="h-3 w-3 text-blue-500" />
                                              ) : (
                                                <AlertCircle className="h-3 w-3 text-yellow-500" />
                                              )}
                                            </div>
                                            <p className="text-gray-500">{hw.type}</p>
                                            {hw.score && (
                                              <p className="text-emerald-600 font-medium">Nota: {hw.score}/10</p>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-gray-500 text-sm">Sin deberes</span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {classSummary ? (
                                      <div className="text-sm">
                                        <div className="p-2 bg-blue-50 rounded text-blue-700">
                                          <p className="font-medium text-xs">Próximo enfoque:</p>
                                          <p className="text-xs">{classSummary.nextFocus}</p>
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="text-gray-500 text-sm">Sin resumen</span>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <p className="text-gray-600 text-center py-8">No hay clases registradas</p>
                    )}

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      <div className="bg-purple-50 p-4 rounded-lg text-center">
                        <p className="text-sm text-purple-600">Total Deberes</p>
                        <p className="text-2xl font-bold text-purple-700">
                          {selectedStudent.homework?.length || 0}
                        </p>
                      </div>
                      <div className="bg-emerald-50 p-4 rounded-lg text-center">
                        <p className="text-sm text-emerald-600">Deberes Completados</p>
                        <p className="text-2xl font-bold text-emerald-700">
                          {selectedStudent.homework?.filter((hw: any) => hw.status === "Completado").length || 0}
                        </p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <p className="text-sm text-blue-600">Resúmenes Disponibles</p>
                        <p className="text-2xl font-bold text-blue-700">
                          {selectedStudent.summaries?.length || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
