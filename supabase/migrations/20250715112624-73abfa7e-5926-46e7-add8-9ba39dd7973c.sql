-- Crear tabla de clases
CREATE TABLE public.classes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    student_avatar TEXT,
    student_level TEXT NOT NULL DEFAULT 'Básico',
    topic TEXT NOT NULL,
    class_date DATE NOT NULL,
    class_time TIME NOT NULL,
    duration INTEGER NOT NULL DEFAULT 60,
    status TEXT NOT NULL DEFAULT 'Programada' CHECK (status IN ('Programada', 'Completada', 'No Realizada')),
    payment_status TEXT NOT NULL DEFAULT 'No Pagado' CHECK (payment_status IN ('Pagado', 'No Pagado')),
    meeting_link TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para classes - solo el profesor puede ver sus propias clases
CREATE POLICY "Teachers can view their own classes" 
ON public.classes 
FOR SELECT 
USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can insert their own classes" 
ON public.classes 
FOR INSERT 
WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can update their own classes" 
ON public.classes 
FOR UPDATE 
USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can delete their own classes" 
ON public.classes 
FOR DELETE 
USING (teacher_id = auth.uid());

-- Trigger para actualizar timestamps en classes
CREATE TRIGGER update_classes_updated_at
    BEFORE UPDATE ON public.classes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Crear índices para mejor rendimiento
CREATE INDEX idx_classes_teacher_id ON public.classes(teacher_id);
CREATE INDEX idx_classes_date ON public.classes(class_date);
CREATE INDEX idx_classes_status ON public.classes(status);