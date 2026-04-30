import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Course } from '@/shared/types/models';
import { api } from '@/app/config/api';

interface CourseStore {
  courses: Course[];
  currentCourseId: string | null;
  loading: boolean;
  fetchCourses: () => Promise<void>;
  createCourse: (course: Partial<Course>) => Promise<void>;
  updateCourse: (id: string, data: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  setCurrentCourseId: (id: string | null) => void;
}

export const defaultCourseData: Partial<Course> = {
  campus: 'IND - ETI',
  program: 'APRENDIZAJE DUAL',
  career: 'DESARROLLO DE SOFTWARE',
  semester: 'S6',
  instructorId: '1098113',
  instructorName: 'CARLOS MAYNA AGUILAR',
  block: '647',
  nrc: '38538',
  period: '202520',
  courseCode: '202520-PD3D-647-TAL-NRC_38538',
  status: 'Activo'
};

export const useCourseStore = create<CourseStore>()(
  persist(
    (set, get) => ({
      courses: [],
      currentCourseId: null,
      loading: false,

      fetchCourses: async () => {
        set({ loading: true });
        try {
          const res = await api.get('/courses');
          set({ courses: res.data, loading: false });
          // Auto-select first active course if none is selected
          const currentId = get().currentCourseId;
          if (!currentId && res.data.length > 0) {
            const firstActive = res.data.find((c: Course) => c.status === 'Activo');
            if (firstActive) set({ currentCourseId: firstActive.id });
          }
        } catch (error) {
          console.error('Error fetching courses', error);
          set({ loading: false });
        }
      },

      createCourse: async (course) => {
        try {
          const res = await api.post('/courses', course);
          set(state => ({
            courses: [...state.courses, res.data],
            // Auto-select if it's the first course created
            currentCourseId: state.currentCourseId ? state.currentCourseId : res.data.id
          }));
        } catch (error) {
          console.error('Error creating course', error);
          throw error;
        }
      },

      updateCourse: async (id, data) => {
        try {
          await api.put(`/courses/${id}`, data);
          set(state => ({
            courses: state.courses.map(c => c.id === id ? { ...c, ...data } : c)
          }));
        } catch (error) {
          console.error('Error updating course', error);
          throw error;
        }
      },

      deleteCourse: async (id) => {
        try {
          await api.delete(`/courses/${id}`);
          set(state => ({
            courses: state.courses.filter(c => c.id !== id),
            currentCourseId: state.currentCourseId === id ? null : state.currentCourseId
          }));
        } catch (error) {
          console.error('Error deleting course', error);
          throw error;
        }
      },

      setCurrentCourseId: (id) => set({ currentCourseId: id }),
    }),
    {
      name: 'course-storage',
      partialize: (state) => ({ currentCourseId: state.currentCourseId }), // Solo persistimos el id seleccionado
    }
  )
);
