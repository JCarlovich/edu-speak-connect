-- Permitir que los profesores vean los perfiles de sus estudiantes
CREATE POLICY "Teachers can view their students profiles" 
ON public.profiles 
FOR SELECT 
USING (
  role = 'student' AND 
  id IN (
    SELECT s.id 
    FROM public.students s 
    INNER JOIN public.teachers t ON s.teacher_code = t.teacher_code 
    WHERE t.id = auth.uid()
  )
);

-- Permitir que los profesores vean los datos de sus estudiantes
CREATE POLICY "Teachers can view their students data" 
ON public.students 
FOR SELECT 
USING (
  teacher_code IN (
    SELECT teacher_code 
    FROM public.teachers 
    WHERE id = auth.uid()
  )
);

-- Permitir que los profesores vean todos los códigos de profesor (para validación)
CREATE POLICY "Anyone can view teacher codes" 
ON public.teachers 
FOR SELECT 
USING (true);

-- Función auxiliar para verificar si un código de profesor existe
CREATE OR REPLACE FUNCTION public.teacher_code_exists(code TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.teachers WHERE teacher_code = code
  );
$$;