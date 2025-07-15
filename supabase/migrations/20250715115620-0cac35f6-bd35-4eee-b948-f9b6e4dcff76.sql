-- Añadir política para que los profesores puedan insertar estudiantes
CREATE POLICY "Teachers can insert students" 
ON public.students 
FOR INSERT 
WITH CHECK (
  teacher_code IN (
    SELECT teacher_code 
    FROM public.teachers 
    WHERE id = auth.uid()
  )
);

-- Añadir política para que los profesores puedan insertar perfiles de estudiantes
CREATE POLICY "Teachers can insert student profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (role = 'student');