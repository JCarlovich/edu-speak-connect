-- Modificar la función handle_new_user para que los estudiantes no necesiten código del profesor al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Usuario'),
        COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'student'::public.user_role)
    );
    
    -- Si es un profesor, crear registro en tabla teachers
    IF (NEW.raw_user_meta_data ->> 'role') = 'teacher' THEN
        INSERT INTO public.teachers (id, teacher_code, school_name, subject)
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data ->> 'teacher_code', 'PROF' || substr(replace(NEW.id::text, '-', ''), 1, 6)),
            NEW.raw_user_meta_data ->> 'school_name',
            NEW.raw_user_meta_data ->> 'subject'
        );
    END IF;
    
    -- Si es un estudiante, crear registro en tabla students SIN código del profesor
    IF (NEW.raw_user_meta_data ->> 'role') = 'student' THEN
        INSERT INTO public.students (id, teacher_code, grade)
        VALUES (
            NEW.id,
            'UNASSIGNED', -- Valor temporal hasta que el profesor lo asigne
            NEW.raw_user_meta_data ->> 'grade'
        );
    END IF;
    
    RETURN NEW;
END;
$function$;