-- Añadir campo invitation_id a la tabla students para invitaciones únicas
ALTER TABLE public.students 
ADD COLUMN invitation_id UUID DEFAULT gen_random_uuid() UNIQUE;

-- Actualizar estudiantes existentes para que tengan invitation_id
UPDATE public.students 
SET invitation_id = gen_random_uuid() 
WHERE invitation_id IS NULL;

-- Hacer que invitation_id sea NOT NULL
ALTER TABLE public.students 
ALTER COLUMN invitation_id SET NOT NULL;

-- Añadir campo para saber si el estudiante ya se registró
ALTER TABLE public.students 
ADD COLUMN is_registered BOOLEAN DEFAULT false;