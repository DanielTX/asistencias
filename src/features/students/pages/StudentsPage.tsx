import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/Table';
import { Button, cn } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { useStudentStore } from '../store/studentStore';
import { useCourseStore } from '@/features/course/store/courseStore';
import { StudentModal } from '../components/StudentModal';
import type { Student } from '@/shared/types/models';
import { Search, Plus, Upload, Download, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

export function StudentsPage() {
  const { students, loading, fetchStudents, addStudent, updateStudent, deleteStudent, setStudents } = useStudentStore();
  const { courses, currentCourseId, setCurrentCourseId, fetchCourses } = useCourseStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  React.useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  React.useEffect(() => {
    if (currentCourseId) {
      fetchStudents();
    }
  }, [fetchStudents, currentCourseId]);

  const filteredStudents = students.filter(s => 
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id.includes(searchTerm)
  );

  const handleSave = (data: Student) => {
    if (editingStudent) {
      updateStudent(data.id, data);
      toast.success('Estudiante actualizado');
    } else {
      if (students.some(s => s.id === data.id)) {
        toast.error('Ya existe un estudiante con ese ID');
        return;
      }
      addStudent(data);
      toast.success('Estudiante registrado');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este estudiante?')) {
      deleteStudent(id);
      toast.success('Estudiante eliminado');
    }
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Parse raw data (skip header rows)
        const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const newStudents: Student[] = [];
        // Empezamos asumiendo que los datos de alumnos inician aprox en fila 12-13 según SENATI
        for (let i = 10; i < json.length; i++) {
          const row = json[i];
          if (row[1] && row[2]) { // ID y Apellidos Nombres
            const id = String(row[1]).trim();
            const fullName = String(row[2]).trim();
            if (id !== "ID" && fullName) {
              const parts = fullName.split(' ');
              const lastName = parts.slice(0, 2).join(' ');
              const firstName = parts.slice(2).join(' ');
              
              newStudents.push({
                id,
                lastName,
                firstName,
                fullName,
                status: 'Activo'
              });
            }
          }
        }
        
        if (newStudents.length > 0) {
          setStudents(newStudents);
          toast.success(`${newStudents.length} estudiantes importados exitosamente`);
        } else {
          toast.error("No se encontraron estudiantes válidos en el archivo");
        }
      } catch (error) {
        toast.error("Error procesando el archivo Excel");
        console.error(error);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = ''; // Reset input
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Estudiantes</h2>
            <p className="text-gray-500 text-sm mt-1">Administración de la lista de participantes del curso.</p>
          </div>
          
          <div className="flex flex-col items-end gap-2 w-full md:w-auto">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-gray-700">Curso Activo:</span>
              <select 
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
                value={currentCourseId || ''}
                onChange={(e) => setCurrentCourseId(e.target.value)}
              >
                <option value="" disabled>Seleccione un curso...</option>
                {courses.filter(c => c.status !== 'Borrador').map(c => (
                  <option key={c.id} value={c.id}>{c.name || c.career} ({c.period})</option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium text-sm transition-colors flex items-center gap-2">
                <Upload size={16} /> Importar Excel
                <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImportExcel} />
              </label>
              <Button variant="outline" className="flex items-center gap-2" onClick={() => toast("Exportación pendiente de implementar", { icon: "🚧" })}>
                <Download size={16} /> Exportar
              </Button>
              <Button className="flex items-center gap-2" onClick={() => { setEditingStudent(null); setIsModalOpen(true); }} disabled={!currentCourseId}>
                <Plus size={16} /> Nuevo Estudiante
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="relative w-full max-w-sm mb-4">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <Input 
              placeholder="Buscar por ID o nombres..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 text-center">N°</TableHead>
                <TableHead className="w-32">ID</TableHead>
                <TableHead>Apellidos y Nombres</TableHead>
                <TableHead className="w-32 text-center">Estado</TableHead>
                <TableHead className="w-24 text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No se encontraron estudiantes.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student, index) => (
                  <TableRow key={student.id}>
                    <TableCell className="text-center text-gray-500 font-medium">{index + 1}</TableCell>
                    <TableCell className="font-medium text-gray-900">{student.id}</TableCell>
                    <TableCell>{student.fullName}</TableCell>
                    <TableCell className="text-center">
                      <span className={cn("px-2.5 py-1 text-xs font-semibold rounded-full", {
                        "bg-green-100 text-green-700": student.status === 'Activo',
                        "bg-red-100 text-red-700": student.status === 'Inactivo',
                        "bg-gray-100 text-gray-700": student.status === 'Retirado',
                      })}>
                        {student.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => { setEditingStudent(student); setIsModalOpen(true); }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        ><Pencil size={16} /></button>
                        <button 
                          onClick={() => handleDelete(student.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        ><Trash2 size={16} /></button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <StudentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        student={editingStudent}
        onSave={handleSave}
      />
    </div>
  );
}
