import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from '@/shared/components/Layout';
import { AttendancePage } from '@/features/attendance/pages/AttendancePage';
import { StudentsPage } from '@/features/students/pages/StudentsPage';
import { CoursePage } from '@/features/course/pages/CoursePage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { useAuthStore } from '@/features/auth/store/authStore';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/register",
    element: <RegisterPage />
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/",
        element: <Navigate to="/asistencia" replace />
      },
      {
        path: "asistencia",
        element: <AttendancePage />
      },
      {
        path: "estudiantes",
        element: <StudentsPage />
      },
      {
        path: "curso",
        element: <CoursePage />
      }
    ]
  }
]);
