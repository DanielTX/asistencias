import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/Table';
import { Button, cn } from '@/shared/components/Button';
import { ATTENDANCE_COLORS } from '@/shared/constants/attendance';
import type { AttendanceStatus } from '@/shared/types/models';
import { Check, Clock, X, AlertCircle, Loader2 } from 'lucide-react';
import { useStudentStore } from '@/features/students/store/studentStore';
import { useCourseStore } from '@/features/course/store/courseStore';
import { api } from '@/app/config/api';
import toast from 'react-hot-toast';

interface Props {
  date: string;
}

export function AttendanceTable({ date }: Props) {
  const students = useStudentStore(state => state.students);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchAttendance = async () => {
      const courseId = useCourseStore.getState().currentCourseId;
      if (!courseId) return;

      setLoading(true);
      try {
        const { data } = await api.get(`/attendance?date=${date}&courseId=${courseId}`);
        setAttendance(data || {});
      } catch (error) {
        toast.error('Error al cargar la asistencia');
        setAttendance({});
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [date]);

  const handleMark = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    const courseId = useCourseStore.getState().currentCourseId;
    if (!courseId) return toast.error('No hay un curso seleccionado');

    setSaving(true);
    const toastId = toast.loading('Guardando en Firebase...');
    try {
      await api.post('/attendance', {
        date,
        records: attendance,
        courseId
      });
      toast.success(`Asistencia del ${date} guardada`, { id: toastId });
    } catch (error) {
      toast.error('Error al guardar', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
      {loading && (
        <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center backdrop-blur-[1px]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}
      
      <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Registro del {date}</h3>
          <p className="text-sm text-gray-500">Selecciona el estado de cada estudiante.</p>
        </div>
        <div className="flex gap-2 text-xs font-medium">
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500"></span> Asistencia</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-yellow-400"></span> Tardanza</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Falta Justif.</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500"></span> Falta</div>
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16 text-center">N°</TableHead>
            <TableHead className="w-24">ID</TableHead>
            <TableHead>Apellidos y Nombres</TableHead>
            <TableHead className="text-center w-64">Acciones</TableHead>
            <TableHead className="text-center w-32">Estado Actual</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student, index) => {
            const currentStatus = attendance[student.id];
            
            return (
              <TableRow key={student.id}>
                <TableCell className="text-center text-gray-500 font-medium">{index + 1}</TableCell>
                <TableCell className="text-gray-500">{student.id}</TableCell>
                <TableCell className="font-medium text-gray-900">{student.fullName}</TableCell>
                <TableCell>
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={() => handleMark(student.id, 'A')}
                      className={cn("p-2 rounded-md transition-colors", currentStatus === 'A' ? "bg-green-100 text-green-700 ring-1 ring-green-600" : "bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600")}
                    ><Check size={16} /></button>
                    <button 
                      onClick={() => handleMark(student.id, 'T')}
                      className={cn("p-2 rounded-md transition-colors", currentStatus === 'T' ? "bg-yellow-100 text-yellow-700 ring-1 ring-yellow-500" : "bg-gray-100 text-gray-500 hover:bg-yellow-50 hover:text-yellow-600")}
                    ><Clock size={16} /></button>
                    <button 
                      onClick={() => handleMark(student.id, 'FJ')}
                      className={cn("p-2 rounded-md transition-colors", currentStatus === 'FJ' ? "bg-blue-100 text-blue-700 ring-1 ring-blue-600" : "bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600")}
                    ><AlertCircle size={16} /></button>
                    <button 
                      onClick={() => handleMark(student.id, 'FI')}
                      className={cn("p-2 rounded-md transition-colors", currentStatus === 'FI' ? "bg-red-100 text-red-700 ring-1 ring-red-600" : "bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600")}
                    ><X size={16} /></button>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {currentStatus ? (
                    <span className={cn("px-3 py-1 rounded-full text-xs font-semibold shadow-sm", ATTENDANCE_COLORS[currentStatus])}>
                      {currentStatus}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs italic">-</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
        <Button onClick={handleSave} disabled={saving || loading}>
          {saving ? 'Guardando...' : 'Guardar Asistencias'}
        </Button>
      </div>
    </div>
  );
}
