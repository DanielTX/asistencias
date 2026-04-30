import { create } from 'zustand';
import type { Student } from '@/shared/types/models';
import { api } from '@/app/config/api';
import { useCourseStore } from '@/features/course/store/courseStore';

interface StudentStore {
  students: Student[];
  loading: boolean;
  fetchStudents: () => Promise<void>;
  addStudent: (student: Student) => Promise<void>;
  updateStudent: (id: string, data: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  setStudents: (students: Student[]) => void;
}

export const useStudentStore = create<StudentStore>((set, get) => ({
  students: [],
  loading: false,

  fetchStudents: async () => {
    const courseId = useCourseStore.getState().currentCourseId;
    if (!courseId) return set({ students: [] }); // No hay curso activo

    set({ loading: true });
    try {
      const response = await api.get(`/students?courseId=${courseId}`);
      set({ students: response.data, loading: false });
    } catch (error) {
      console.error('Error fetching students:', error);
      set({ loading: false });
    }
  },

  addStudent: async (student) => {
    const courseId = useCourseStore.getState().currentCourseId;
    if (!courseId) throw new Error("No active course");

    try {
      await api.post('/students', { ...student, courseId });
      set((state) => ({ students: [...state.students, { ...student, courseId }] }));
    } catch (error) {
      console.error('Error adding student:', error);
      throw error;
    }
  },

  updateStudent: async (id, data) => {
    try {
      await api.put(`/students/${id}`, data);
      set((state) => ({
        students: state.students.map(s => s.id === id ? { ...s, ...data } : s)
      }));
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  },

  deleteStudent: async (id) => {
    try {
      await api.delete(`/students/${id}`);
      set((state) => ({
        students: state.students.filter(s => s.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  },

  setStudents: (students) => set({ students }),
}));
