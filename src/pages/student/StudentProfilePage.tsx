import React, { useState } from 'react';
import { Calendar, Mail, Phone, BookOpen, BarChart3, Clock, Euro, TrendingUp, CheckCircle2, AlertCircle, Award, Target, Video, X, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Mock data for the current student (this would come from auth context in real app)
const currentStudent = {
  id: 1,
  name: 'Ana Martínez',
  email: 'ana.martinez@email.com',
  phone: '+34 612 345 678',
  level: 'Intermedio',
  joinDate: '2024-01-15',
  classesCompleted: 0,
  classesPaid: 10,
  classesRemaining: 2,
  totalRevenue: 450,
  averageScore: 8.5,
  lastClass: '2024-03-10',
  nextClass: {
    date: 'viernes, 18 de julio de 2025',
    time: '11:00',
    topic: 'Práctica de Pronunciación',
    meetingLink: 'https://meet.google.com/abc-defg-hij'
  },
  homeworkCompleted: 8,
  homeworkPending: 2,
  status: 'Activo',
  paymentStatus: 'Pendiente',
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
};

export const StudentProfilePage: React.FC = () => {
  const [imageError, setImageError] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const StudentAvatar = ({ size = 'lg' }: { size?: 'sm' | 'md' | 'lg' }) => {
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
    
    if (!currentStudent.avatar || imageError) {
      const initials = getInitials(currentStudent.name);
      return (
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center ring-2 ring-white shadow-md`}>
          <span className={`text-white font-bold ${textSizes[size]}`}>{initials}</span>
        </div>
      );
    }

    return (
      <img
        src={currentStudent.avatar}
        alt={currentStudent.name}
        className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-white shadow-md`}
        onError={() => setImageError(true)}
      />
    );
  };

  const joinClass = () => {
    window.open(currentStudent.nextClass.meetingLink, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header with Student Info */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <StudentAvatar />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{currentStudent.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                  {currentStudent.status}
                </Badge>
                <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                  {currentStudent.paymentStatus}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">Información General</TabsTrigger>
            <TabsTrigger value="payments">Pagos</TabsTrigger>
          </TabsList>

          {/* General Information Tab */}
          <TabsContent value="general" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">{currentStudent.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">{currentStudent.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">Desde: {new Date(currentStudent.joinDate).toLocaleDateString('es-ES')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">Nivel: {currentStudent.level}</span>
                  </div>
                </div>
              </div>

              {/* Next Class */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Próxima Clase</h3>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">{currentStudent.nextClass.date} - {currentStudent.nextClass.time}</span>
                  </div>
                  <p className="text-gray-700 mb-3">{currentStudent.nextClass.topic}</p>
                  <Button onClick={joinClass} className="bg-blue-500 hover:bg-blue-600">
                    <Video className="h-4 w-4 mr-2" />
                    Unirse a Clase
                  </Button>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 text-center">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Clases Completadas</h4>
                  <p className="text-3xl font-bold text-gray-900">{currentStudent.classesCompleted}</p>
                </Card>
                <Card className="p-6 text-center">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Clases Restantes</h4>
                  <p className="text-3xl font-bold text-blue-600">{currentStudent.classesRemaining}</p>
                </Card>
                <Card className="p-6 text-center">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Tareas</h4>
                  <p className="text-3xl font-bold text-purple-600">{currentStudent.homeworkCompleted}/{currentStudent.homeworkCompleted + currentStudent.homeworkPending}</p>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Pagos</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tema</TableHead>
                    <TableHead>Duración</TableHead>
                    <TableHead>Estado de Pago</TableHead>
                    <TableHead>Importe</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentStudent.classes.map((classItem) => (
                    <TableRow key={classItem.id}>
                      <TableCell>{new Date(classItem.date).toLocaleDateString('es-ES')}</TableCell>
                      <TableCell className="font-medium">{classItem.topic}</TableCell>
                      <TableCell>{classItem.duration}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={classItem.paid ? "default" : "destructive"}
                          className={classItem.paid ? "bg-emerald-100 text-emerald-800" : ""}
                        >
                          {classItem.paid ? 'Pagado' : 'Pendiente'}
                        </Badge>
                      </TableCell>
                      <TableCell>{classItem.amount}€</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};