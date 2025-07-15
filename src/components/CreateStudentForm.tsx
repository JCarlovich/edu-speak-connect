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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User, Mail, GraduationCap, Calendar as CalendarIcon, Clock, BookOpen, Send, X } from 'lucide-react';
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

      // Check if a profile with this email already exists
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('email', studentEmail)
        .maybeSingle();

      if (profileCheckError) {
        console.error('Error checking profile:', profileCheckError);
        throw new Error('Error al verificar si el perfil existe');
      }

      let finalStudentId: string;

      // If profile exists and is already a student, check if they're already linked to this teacher
      if (existingProfile) {
        finalStudentId = existingProfile.id;
        
        // Check if student is already linked to this teacher
        const { data: existingStudent, error: studentCheckError } = await supabase
          .from('students')
          .select('id')
          .eq('id', finalStudentId)
          .eq('teacher_code', teacherData.teacher_code)
          .maybeSingle();

        if (studentCheckError) {
          console.error('Error checking existing student:', studentCheckError);
          throw new Error('Error al verificar el estudiante existente');
        }

        if (existingStudent) {
          throw new Error('Este estudiante ya está registrado con este profesor');
        }
      } else {
        // Create new profile since it doesn't exist
        finalStudentId = crypto.randomUUID();
        
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: finalStudentId,
            email: studentEmail,
            full_name: studentName,
            role: 'student'
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          throw new Error(`Error al crear el perfil: ${profileError.message}`);
        }
      }

      // Create student record
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .insert({
          id: finalStudentId,
          teacher_code: teacherData.teacher_code,
          grade: studentLevel,
          is_registered: false
        })
        .select()
        .single();

      if (studentError) {
        console.error('Student creation error:', studentError);
        throw new Error(`Error al crear el estudiante: ${studentError.message}`);
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
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Dar de Alta Nuevo Estudiante
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onOpenChange(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Completa la información del estudiante y opcionalmente programa una primera clase.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-gradient-subtle min-h-[600px] p-6 -mx-6 -mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Student Information Card */}
            <Card className="bg-white/90 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-primary flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información del Estudiante
                </CardTitle>
                <CardDescription>Datos básicos para crear el perfil del estudiante</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="student-name" className="text-sm font-semibold">Nombre Completo *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="student-name"
                        type="text"
                        placeholder="Nombre del estudiante"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        className="pl-10 h-12 border-muted focus:border-primary focus:ring-primary/20"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="student-email" className="text-sm font-semibold">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="student-email"
                        type="email"
                        placeholder="email@ejemplo.com"
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        className="pl-10 h-12 border-muted focus:border-primary focus:ring-primary/20"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="student-level" className="text-sm font-semibold">Nivel/Grado</Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="student-level"
                      type="text"
                      placeholder="Ej: 5to Grado, 2do Bachillerato, Universitario"
                      value={studentLevel}
                      onChange={(e) => setStudentLevel(e.target.value)}
                      className="pl-10 h-12 border-muted focus:border-primary focus:ring-primary/20"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Schedule Class Card */}
            <Card className="bg-white/90 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-primary flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Programar Primera Clase (Opcional)
                </CardTitle>
                <div className="flex items-center space-x-3 mt-2">
                  <Checkbox
                    id="schedule-class"
                    checked={scheduleClass}
                    onCheckedChange={(checked) => setScheduleClass(checked === true)}
                    className="h-5 w-5"
                  />
                  <Label htmlFor="schedule-class" className="text-base font-medium cursor-pointer">
                    Programar una clase con este estudiante
                  </Label>
                </div>
              </CardHeader>

              {scheduleClass && (
                <CardContent className="space-y-6 animate-fade-in">
                  <div className="space-y-2">
                    <Label htmlFor="topic" className="text-sm font-semibold">Tema de la Clase *</Label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="topic"
                        type="text"
                        placeholder="Ej: Matemáticas - Fracciones, Inglés - Present Tense"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="pl-10 h-12 border-muted focus:border-primary focus:ring-primary/20"
                        required={scheduleClass}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Fecha de la Clase *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal h-12 border-muted hover:border-primary"
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
                      <Label htmlFor="class-time" className="text-sm font-semibold">Hora *</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                        <Select value={classTime} onValueChange={setClassTime} required={scheduleClass}>
                          <SelectTrigger className="pl-10 h-12 border-muted focus:border-primary focus:ring-primary/20">
                            <SelectValue placeholder="Seleccionar hora" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="08:00">08:00</SelectItem>
                            <SelectItem value="08:30">08:30</SelectItem>
                            <SelectItem value="09:00">09:00</SelectItem>
                            <SelectItem value="09:30">09:30</SelectItem>
                            <SelectItem value="10:00">10:00</SelectItem>
                            <SelectItem value="10:30">10:30</SelectItem>
                            <SelectItem value="11:00">11:00</SelectItem>
                            <SelectItem value="11:30">11:30</SelectItem>
                            <SelectItem value="12:00">12:00</SelectItem>
                            <SelectItem value="12:30">12:30</SelectItem>
                            <SelectItem value="13:00">13:00</SelectItem>
                            <SelectItem value="13:30">13:30</SelectItem>
                            <SelectItem value="14:00">14:00</SelectItem>
                            <SelectItem value="14:30">14:30</SelectItem>
                            <SelectItem value="15:00">15:00</SelectItem>
                            <SelectItem value="15:30">15:30</SelectItem>
                            <SelectItem value="16:00">16:00</SelectItem>
                            <SelectItem value="16:30">16:30</SelectItem>
                            <SelectItem value="17:00">17:00</SelectItem>
                            <SelectItem value="17:30">17:30</SelectItem>
                            <SelectItem value="18:00">18:00</SelectItem>
                            <SelectItem value="18:30">18:30</SelectItem>
                            <SelectItem value="19:00">19:00</SelectItem>
                            <SelectItem value="19:30">19:30</SelectItem>
                            <SelectItem value="20:00">20:00</SelectItem>
                            <SelectItem value="20:30">20:30</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration" className="text-sm font-semibold">Duración</Label>
                      <Select value={duration} onValueChange={setDuration}>
                        <SelectTrigger className="h-12 border-muted focus:border-primary focus:ring-primary/20">
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
                    <Label htmlFor="meeting-link" className="text-sm font-semibold">Enlace de Reunión (Opcional)</Label>
                    <Input
                      id="meeting-link"
                      type="url"
                      placeholder="https://meet.google.com/... o https://zoom.us/..."
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      className="h-12 border-muted focus:border-primary focus:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-semibold">Notas Adicionales (Opcional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Cualquier información adicional sobre la clase..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      className="border-muted focus:border-primary focus:ring-primary/20 resize-none"
                    />
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="px-8 py-3 h-12"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="px-8 py-3 h-12 bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creando estudiante...
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
        </div>
      </DialogContent>
    </Dialog>
  );
};