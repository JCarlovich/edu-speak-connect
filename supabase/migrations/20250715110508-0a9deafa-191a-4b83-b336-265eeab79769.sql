-- Crear enum para roles de usuario
CREATE TYPE public.user_role AS ENUM ('teacher', 'student');

-- Crear tabla de perfiles de usuario
CREATE TABLE public.profiles (
    id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    PRIMARY KEY (id)
);

-- Crear tabla de profesores
CREATE TABLE public.teachers (
    id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    teacher_code TEXT NOT NULL UNIQUE,
    school_name TEXT,
    subject TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    PRIMARY KEY (id)
);

-- Crear tabla de estudiantes
CREATE TABLE public.students (
    id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    teacher_code TEXT NOT NULL REFERENCES public.teachers(teacher_code) ON DELETE CASCADE,
    grade TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    PRIMARY KEY (id)
);

-- Habilitar Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Políticas RLS para teachers
CREATE POLICY "Teachers can view their own data" 
ON public.teachers 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Teachers can update their own data" 
ON public.teachers 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Teachers can insert their own data" 
ON public.teachers 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Políticas RLS para students
CREATE POLICY "Students can view their own data" 
ON public.students 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Students can update their own data" 
ON public.students 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Students can insert their own data" 
ON public.students 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Función para actualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar timestamps en profiles
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Función para manejar nuevos usuarios registrados
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Usuario'),
        COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'student')
    );
    RETURN NEW;
END;
$$;

-- Trigger para crear perfil automáticamente al registrarse
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();