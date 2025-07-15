import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Class {
  id: string;
  studentName: string;
  studentAvatar: string;
  studentEmail: string;
  studentLevel: string;
  topic: string;
  date: string;
  time: string;
  duration: string;
  status: string;
  paymentStatus: string;
  meetingLink: string;
  notes: string;
}

interface ClassesContextType {
  classes: Class[];
  addClass: (classData: Omit<Class, 'id'>) => Promise<void>;
  updateClass: (id: string, updates: Partial<Class>) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
  isLoading: boolean;
  refreshClasses: () => Promise<void>;
}

const ClassesContext = createContext<ClassesContextType | undefined>(undefined);

export const useClasses = () => {
  const context = useContext(ClassesContext);
  if (!context) {
    throw new Error('useClasses must be used within a ClassesProvider');
  }
  return context;
};

export const ClassesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('Error getting user:', userError);
        setClasses([]);
        return;
      }

      // Fetch classes for the current teacher
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', user.id)
        .order('class_date', { ascending: true });

      if (classesError) {
        console.error('Error fetching classes:', classesError);
        setClasses([]);
        return;
      }

      // Transform data to match the interface
      const transformedClasses: Class[] = classesData.map(cls => ({
        id: cls.id,
        studentName: cls.student_name,
        studentAvatar: cls.student_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${cls.student_email}`,
        studentEmail: cls.student_email,
        studentLevel: cls.student_level,
        topic: cls.topic,
        date: cls.class_date,
        time: cls.class_time,
        duration: cls.duration.toString(),
        status: cls.status,
        paymentStatus: cls.payment_status,
        meetingLink: cls.meeting_link || '',
        notes: cls.notes || ''
      }));

      setClasses(transformedClasses);
    } catch (error) {
      console.error('Error in fetchClasses:', error);
      setClasses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addClass = async (classData: Omit<Class, 'id'>) => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase
        .from('classes')
        .insert({
          teacher_id: user.id,
          student_name: classData.studentName,
          student_email: classData.studentEmail,
          student_avatar: classData.studentAvatar,
          student_level: classData.studentLevel,
          topic: classData.topic,
          class_date: classData.date,
          class_time: classData.time,
          duration: parseInt(classData.duration),
          status: classData.status,
          payment_status: classData.paymentStatus,
          meeting_link: classData.meetingLink,
          notes: classData.notes
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Refresh classes after adding
      await fetchClasses();
    } catch (error) {
      console.error('Error adding class:', error);
      throw error;
    }
  };

  const updateClass = async (id: string, updates: Partial<Class>) => {
    try {
      const updateData: any = {};
      
      if (updates.studentName) updateData.student_name = updates.studentName;
      if (updates.studentEmail) updateData.student_email = updates.studentEmail;
      if (updates.studentAvatar) updateData.student_avatar = updates.studentAvatar;
      if (updates.studentLevel) updateData.student_level = updates.studentLevel;
      if (updates.topic) updateData.topic = updates.topic;
      if (updates.date) updateData.class_date = updates.date;
      if (updates.time) updateData.class_time = updates.time;
      if (updates.duration) updateData.duration = parseInt(updates.duration);
      if (updates.status) updateData.status = updates.status;
      if (updates.paymentStatus) updateData.payment_status = updates.paymentStatus;
      if (updates.meetingLink !== undefined) updateData.meeting_link = updates.meetingLink;
      if (updates.notes !== undefined) updateData.notes = updates.notes;

      const { error } = await supabase
        .from('classes')
        .update(updateData)
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Update local state
      setClasses(prev => prev.map(cls => 
        cls.id === id ? { ...cls, ...updates } : cls
      ));
    } catch (error) {
      console.error('Error updating class:', error);
      throw error;
    }
  };

  const deleteClass = async (id: string) => {
    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Update local state
      setClasses(prev => prev.filter(cls => cls.id !== id));
    } catch (error) {
      console.error('Error deleting class:', error);
      throw error;
    }
  };

  const refreshClasses = async () => {
    await fetchClasses();
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  return (
    <ClassesContext.Provider value={{ 
      classes, 
      addClass, 
      updateClass, 
      deleteClass, 
      isLoading,
      refreshClasses 
    }}>
      {children}
    </ClassesContext.Provider>
  );
};