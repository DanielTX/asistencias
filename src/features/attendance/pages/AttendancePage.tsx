import React, { useState } from 'react';
import { AttendanceTable } from '../components/AttendanceTable';
import { Input } from '@/shared/components/Input';
import { Calendar } from 'lucide-react';
import { useCourseStore } from '@/features/course/store/courseStore';

export function AttendancePage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const { courses, currentCourseId, setCurrentCourseId, fetchCourses } = useCourseStore();

  React.useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return (
    <div className="space-y-6">
      {/* Cabecera / Filtros */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Control de Asistencia</h2>
          <p className="text-gray-500 text-sm mt-1">Registra la asistencia diaria de los alumnos de Desarrollo de Software.</p>
        </div>
        
        <div className="flex flex-col items-end gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-sm w-full md:w-auto">
            <span className="font-semibold text-gray-700 whitespace-nowrap">Curso Activo:</span>
            <select 
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:min-w-[200px]"
              value={currentCourseId || ''}
              onChange={(e) => setCurrentCourseId(e.target.value)}
            >
              <option value="" disabled>Seleccione un curso...</option>
              {courses.filter(c => c.status !== 'Borrador').map(c => (
                <option key={c.id} value={c.id}>{c.name || c.career} ({c.period})</option>
              ))}
            </select>
          </div>
          
          <div className="relative flex-1 w-full md:w-48">
            <Input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="pl-10 w-full"
            />
            <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </div>
        </div>
      </div>

      {/* Tabla Principal */}
      <AttendanceTable date={date} />
    </div>
  );
}
