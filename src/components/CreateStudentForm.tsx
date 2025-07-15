import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { User, Mail, GraduationCap, Calendar as CalendarIcon, Clock, BookOpen, UserPlus, Send } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CreateStudentFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onStudentCreated: () => void;
}

export const CreateStudentForm: React.FC<CreateStudentFormProps> = ({
  isOpen,
  onOpenChange,
  onStudentCreated
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Student form data
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentLevel, setStudentLevel] = useState('');
  
  // Class form data (optional)
  const [scheduleClass, setScheduleClass] = useState(false);
  const [topic, setTopic] = useState('');
  const [classDate, setClassDate] = useState<Date>();
  const [classTime, setClassTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [meetingLink, setMeetingLink] = useState('');
  const [notes, setNotes] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setStudentName('');
    setStudentEmail('');
    setStudentLevel('');
    setScheduleClass(false);
    setTopic('');
    setClassDate(undefined);
    setClassTime('');
    setDuration('60');
    setMeetingLink('');
    setNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    try {
      // Get teacher data
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('teacher_code')
        .eq('id', user.id)
        .single();

      if (teacherError) {
        throw new Error('Error al obtener datos del profesor');
      }

      // Generate a unique ID for the student
      const studentId = crypto.randomUUID();

      // Create student record
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .insert({
          id: studentId,
          teacher_code: teacherData.teacher_code,
          grade: studentLevel,
          is_registered: false
        })
        .select()
        .single();

      if (studentError) {
        throw new Error('Error al crear el estudiante');
      }

      // Create profile for the student
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: studentData.id,
          email: studentEmail,
          full_name: studentName,
          role: 'student'
        });

      if (profileError) {
        throw new Error('Error al crear el perfil del estudiante');
      }

      // If scheduling a class, create it
      if (scheduleClass && classDate && classTime && topic) {
        const { error: classError } = await supabase
          .from('classes')
          .insert({
            teacher_id: user.id,
            student_name: studentName,
            student_email: studentEmail,
            student_level: studentLevel,
            topic,
            class_date: format(classDate, 'yyyy-MM-dd'),
            class_time: classTime,
            duration: parseInt(duration),
            meeting_link: meetingLink || null,
            notes: notes || null,
            status: 'Programada',
            payment_status: 'No Pagado'
          });

        if (classError) {
          console.error('Error creating class:', classError);
          // Don't throw error here, student is already created
        }
      }

      // Send invitation email
      try {
        const response = await fetch('/functions/v1/send-student-invitation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          },
          body: JSON.stringify({
            studentName,
            studentEmail,
            invitationId: studentData.invitation_id,
            teacherName: user.name
          })
        });

        if (!response.ok) {
          throw new Error('Error al enviar invitación');
        }
      } catch (emailError) {
        console.error('Error sending invitation email:', emailError);
        toast({
          title: "Estudiante creado",
          description: "Estudiante creado correctamente, pero no se pudo enviar la invitación por email. Puedes reenviarla más tarde.",
          variant: "default",
        });
      }

      toast({
        title: "¡Estudiante creado!",
        description: `${studentName} ha sido dado de alta y se le ha enviado una invitación por email.`,
      });

      resetForm();
      onOpenChange(false);
      onStudentCreated();

    } catch (error: any) {
      console.error('Error creating student:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el estudiante",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Dar de Alta Nuevo Estudiante
          </DialogTitle>
          <DialogDescription>
            Crea un nuevo estudiante y opcionalmente programa una clase con él.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4" />
                Información del Estudiante
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="student-name">Nombre Completo *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="student-name"
                      type="text"
                      placeholder="Nombre del estudiante"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="student-email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="student-email"
                      type="email"
                      placeholder="email@ejemplo.com"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="student-level">Nivel/Grado</Label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="student-level"
                    type="text"
                    placeholder="Ej: 5to Grado, 2do Bachillerato, Universitario"
                    value={studentLevel}
                    onChange={(e) => setStudentLevel(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule Class Option */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Programar Clase (Opcional)
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="schedule-class"
                  checked={scheduleClass}
                  onCheckedChange={(checked) => setScheduleClass(checked === true)}
                />
                <Label htmlFor="schedule-class" className="text-sm">
                  Programar una clase con este estudiante
                </Label>
              </div>
            </CardHeader>

            {scheduleClass && (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Tema de la Clase *</Label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="topic"
                      type="text"
                      placeholder="Ej: Matemáticas - Fracciones"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="pl-10"
                      required={scheduleClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Fecha de la Clase *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {classDate ? format(classDate, 'PPP', { locale: es }) : 'Seleccionar fecha'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={classDate}
                          onSelect={setClassDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="class-time">Hora *</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="class-time"
                        type="time"
                        value={classTime}
                        onChange={(e) => setClassTime(e.target.value)}
                        className="pl-10"
                        required={scheduleClass}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duración (min)</Label>
                    <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="45">45 minutos</SelectItem>
                        <SelectItem value="60">60 minutos</SelectItem>
                        <SelectItem value="90">90 minutos</SelectItem>
                        <SelectItem value="120">120 minutos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meeting-link">Enlace de Reunión (Opcional)</Label>
                  <Input
                    id="meeting-link"
                    type="url"
                    placeholder="https://meet.google.com/... o https://zoom.us/..."
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas Adicionales (Opcional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Cualquier información adicional sobre la clase..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            )}
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Crear Estudiante e Invitar
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};