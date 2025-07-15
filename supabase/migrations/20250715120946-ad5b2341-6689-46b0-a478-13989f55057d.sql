-- Crear tabla de invitaciones de estudiantes que no dependa de auth.users
CREATE TABLE public.student_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  student_level TEXT,
  invitation_token UUID NOT NULL DEFAULT gen_random_uuid(),
  is_accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT fk_teacher_invitations FOREIGN KEY (teacher_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT unique_teacher_student_email UNIQUE (teacher_id, student_email)
);

-- Enable RLS
ALTER TABLE public.student_invitations ENABLE ROW LEVEL SECURITY;

-- Teachers can manage their own invitations
CREATE POLICY "Teachers can view their invitations" 
ON public.student_invitations 
FOR SELECT 
USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can create invitations" 
ON public.student_invitations 
FOR INSERT 
WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can update their invitations" 
ON public.student_invitations 
FOR UPDATE 
USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can delete their invitations" 
ON public.student_invitations 
FOR DELETE 
USING (teacher_id = auth.uid());

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_student_invitations_updated_at
BEFORE UPDATE ON public.student_invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();