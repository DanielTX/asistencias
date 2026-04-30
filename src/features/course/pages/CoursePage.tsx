import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { useCourseStore, defaultCourseData } from '../store/courseStore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/Table';
import { Button, cn } from '@/shared/components/Button';
import type { Course, Student } from '@/shared/types/models';
import { Pencil, Trash2, CheckCircle2, PlayCircle, Plus } from 'lucide-react';
import { api } from '@/app/config/api';

// Validation Schema
const courseSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  campus: z.string().min(1, 'Requerido'),
  program: z.string().min(1, 'Requerido'),
  career: z.string().min(1, 'Requerido'),
  semester: z.string().min(1, 'Requerido'),
  instructorCombined: z.string().min(1, 'Requerido'),
  block: z.string().min(1, 'Requerido'),
  nrc: z.string().min(1, 'Requerido'),
  period: z.string().min(1, 'Requerido'),
  courseCode: z.string().min(1, 'Requerido'),
  status: z.enum(['Activo', 'Inactivo', 'Cerrado', 'Borrador']).default('Borrador'),
});

type CourseFormValues = z.infer<typeof courseSchema>;

export function CoursePage() {
  const { courses, currentCourseId, fetchCourses, createCourse, updateCourse, deleteCourse, setCurrentCourseId } = useCourseStore();
  const [view, setView] = useState<'list' | 'form'>('list');
  const [step, setStep] = useState(1);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  
  // Estado local para Paso 2 (Participantes)
  const [participants, setParticipants] = useState<Student[]>([]);
  const [participantId, setParticipantId] = useState('');
  const [participantName, setParticipantName] = useState('');

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    if (courses.length === 0 && view === 'list') {
      setView('form');
      setStep(1);
    }
  }, [courses.length, view]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: { ...defaultCourseData, instructorCombined: `${defaultCourseData.instructorId} ${defaultCourseData.instructorName}` }
  });

  const handleOpenForm = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      reset({
        ...course,
        instructorCombined: `${course.instructorId} ${course.instructorName}`,
      });
      // Cargar participantes del curso existente (para simplificar, asumimos paso 1)
    } else {
      setEditingCourse(null);
      reset({
        ...defaultCourseData,
        instructorCombined: `${defaultCourseData.instructorId} ${defaultCourseData.instructorName}`,
      });
    }
    setParticipants([]);
    setStep(1);
    setView('form');
  };

  const onSubmitStep1 = async (data: CourseFormValues) => {
    const instructorParts = data.instructorCombined.split(' ');
    const instructorId = instructorParts[0];
    const instructorName = instructorParts.slice(1).join(' ');

    const finalCourseData: Partial<Course> = {
      name: data.name || `${data.career} - ${data.semester} - ${data.period}`,
      campus: data.campus,
      program: data.program,
      career: data.career,
      semester: data.semester,
      instructorId,
      instructorName,
      block: data.block,
      nrc: data.nrc,
      period: data.period,
      courseCode: data.courseCode,
      status: 'Borrador', // En paso 1 siempre es borrador
    };

    try {
      if (editingCourse) {
        await updateCourse(editingCourse.id, finalCourseData);
        setEditingCourse({ ...editingCourse, ...finalCourseData } as Course);
        toast.success('Datos actualizados. Continúa con los participantes.');
      } else {
        // Al crear, el store maneja el POST y lo inserta en la lista. 
        // Para simplificar, le damos un ID temporal o dejamos que lo genere y recargamos.
        await createCourse(finalCourseData);
        // Necesitamos el curso recién creado para asignarle estudiantes. 
        // Como workaround, recargamos la lista y asumimos que es el currentCourseId (el store lo auto-selecciona)
        toast.success('Curso creado en borrador');
      }
      setStep(2);
    } catch (error) {
      toast.error('Error al guardar el curso');
    }
  };

  const handleAddParticipant = async () => {
    if (!participantId || !participantName) return toast.error('Ingresa ID y Nombre');
    if (participants.some(p => p.id === participantId)) return toast.error('El ID ya está en la lista');

    // Usamos el ID del curso recién creado (que el store guardó como currentCourseId)
    // O si estamos editando, usamos el ID del editingCourse
    const activeId = editingCourse?.id || currentCourseId;
    if (!activeId) return toast.error('No se detecta el curso activo');

    const newStudent: Student = {
      id: participantId,
      firstName: '', // Lo unificaremos todo en fullName por simplicidad o podríamos separarlo
      lastName: '',
      fullName: participantName.toUpperCase(),
      status: 'Activo'
    };

    try {
      await api.post('/students', { ...newStudent, courseId: activeId });
      setParticipants([...participants, newStudent]);
      setParticipantId('');
      setParticipantName('');
      toast.success('Estudiante añadido al curso');
    } catch (error) {
      toast.error('Error al guardar estudiante');
    }
  };

  const handleDeleteParticipant = async (id: string) => {
    try {
      await api.delete(`/students/${id}`);
      setParticipants(participants.filter(p => p.id !== id));
      toast.success('Estudiante removido');
    } catch (error) {
      toast.error('Error al eliminar estudiante');
    }
  };

  const handleCompleteStep2 = () => {
    setStep(3);
  };

  const handlePublishCourse = async () => {
    const activeId = editingCourse?.id || currentCourseId;
    if (!activeId) return;

    try {
      await updateCourse(activeId, { status: 'Activo' });
      toast.success('¡Curso Publicado Exitosamente!');
      fetchCourses();
      setView('list');
    } catch (error) {
      toast.error('Error al publicar el curso');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este curso?')) {
      await deleteCourse(id);
      toast.success('Curso eliminado');
    }
  };

  if (view === 'list' && courses.length > 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Gestión de Cursos</h2>
              <p className="text-gray-500 text-sm mt-1">Administra los cursos asignados y selecciona el curso activo.</p>
            </div>
            <Button onClick={() => handleOpenForm()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <Plus size={16} /> Nuevo Curso
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Curso / Carrera</TableHead>
                <TableHead>Periodo</TableHead>
                <TableHead>Código BB</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map(course => (
                <TableRow key={course.id} className={currentCourseId === course.id ? "bg-blue-50/50" : ""}>
                  <TableCell>
                    <div className="font-semibold text-gray-900 flex items-center gap-2">
                      {currentCourseId === course.id && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
                      {course.name || course.career}
                    </div>
                    <div className="text-xs text-gray-500">{course.instructorName}</div>
                  </TableCell>
                  <TableCell>{course.period}</TableCell>
                  <TableCell className="text-sm font-mono">{course.courseCode}</TableCell>
                  <TableCell className="text-center">
                    <span className={cn("px-2.5 py-1 text-xs font-semibold rounded-full", {
                      "bg-green-100 text-green-700": course.status === 'Activo',
                      "bg-yellow-100 text-yellow-700": course.status === 'Inactivo',
                      "bg-red-100 text-red-700": course.status === 'Cerrado',
                      "bg-gray-100 text-gray-700": course.status === 'Borrador',
                    })}>
                      {course.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center items-center gap-2">
                      {currentCourseId !== course.id && (course.status === 'Activo' || course.status === 'Borrador') && (
                        <button 
                          onClick={() => { setCurrentCourseId(course.id); toast.success('Curso activo cambiado'); }}
                          className="px-3 py-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-md text-xs font-medium transition-colors"
                        >
                          Seleccionar
                        </button>
                      )}
                      {currentCourseId === course.id && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium flex items-center gap-1">
                          <CheckCircle2 size={14} /> Activo
                        </span>
                      )}
                      <button onClick={() => handleOpenForm(course)} className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(course.id)} className="p-1.5 text-gray-500 hover:text-red-600 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  // VISTA WIZARD (Crear/Editar o Primer curso)
  return (
    <div className="max-w-5xl mx-auto mt-4">
      {courses.length === 0 && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 flex items-start gap-3">
          <PlayCircle className="w-5 h-5 mt-0.5 text-blue-600" />
          <div>
            <h3 className="font-semibold text-blue-900">Bienvenido al Sistema de Asistencias</h3>
            <p className="text-sm">Aún no has configurado ningún curso. Por favor, crea tu primer curso para poder habilitar los demás módulos.</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        
        {/* Encabezado Superior */}
        <div className="px-8 py-6 flex justify-between items-center border-b-[3px] border-blue-600">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight uppercase">
            Sistema de Asistencias
          </h1>
          <span className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wider shadow-sm">
            {step === 3 ? 'Abierto' : 'Borrador'}
          </span>
        </div>

        <div className="p-8">
          
          {/* PASO 1: DATOS DEL CURSO */}
          {step === 1 && (
            <form onSubmit={handleSubmit(onSubmitStep1)}>
              <div className="flex justify-between items-center bg-gray-100 rounded-md px-4 py-3 mb-8 border border-gray-200">
                <h2 className="text-base font-semibold text-slate-700">1. Datos del Curso</h2>
                {courses.length > 0 && (
                  <button type="button" onClick={() => setView('list')} className="text-sm text-blue-600 font-medium hover:underline">
                    Cancelar
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Campus</label>
                  <select className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500" {...register('campus')}>
                    <option value="IND - ETI">IND - ETI</option>
                    <option value="NORTE - ETI">NORTE - ETI</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Programa</label>
                  <select className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500" {...register('program')}>
                    <option value="APRENDIZAJE DUAL">APRENDIZAJE DUAL</option>
                    <option value="DIPLOMADO">DIPLOMADO</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Carrera</label>
                  <select className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500" {...register('career')}>
                    <option value="DESARROLLO DE SOFTWARE">Desarrollo de Software</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Semestre</label>
                  <select className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500" {...register('semester')}>
                    <option value="S6">S6</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Instructor</label>
                  <select className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500" {...register('instructorCombined')}>
                    <option value="1098113 CARLOS MAYNA AGUILAR">1098113 CARLOS MAYNA AGUILAR</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Bloque</label>
                  <select className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500" {...register('block')}>
                    <option value="647">647</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">NRC</label>
                  <select className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500" {...register('nrc')}>
                    <option value="38538">38538 - DESARROLLO DE SOFTWARE</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Periodo</label>
                  <select className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500" {...register('period')}>
                    <option value="202520">202520</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Código BB</label>
                  <input 
                    className="w-full rounded-md border border-orange-400 bg-white px-3 py-2 text-sm focus:border-blue-500 shadow-sm"
                    {...register('courseCode')}
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-md shadow transition-colors">
                  Guardar y Continuar
                </button>
              </div>
            </form>
          )}

          {/* PASO 2: LISTA DE PARTICIPANTES */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-gray-100 rounded-md px-4 py-3 border border-gray-200">
                <h2 className="text-base font-semibold text-slate-700">2. Lista de Participantes</h2>
                <button onClick={() => setStep(1)} className="text-sm text-gray-500 font-medium hover:underline">
                  Volver al Encabezado
                </button>
              </div>

              <div className="flex gap-4 items-end bg-white p-4 border border-gray-200 rounded-md">
                <div className="space-y-1 w-48">
                  <label className="text-xs font-semibold text-gray-500 uppercase">ID del Alumno</label>
                  <input 
                    value={participantId}
                    onChange={e => setParticipantId(e.target.value)}
                    className="w-full rounded-md border border-blue-400 bg-white px-3 py-2 text-sm focus:border-blue-500 shadow-sm" 
                    placeholder="Ej: 1537058"
                  />
                </div>
                <div className="space-y-1 flex-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Apellidos y Nombres</label>
                  <input 
                    value={participantName}
                    onChange={e => setParticipantName(e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                    placeholder="Ej: AGÜERO BOTIQUIN PATRICK ANDERSSON"
                  />
                </div>
                <button 
                  onClick={handleAddParticipant}
                  className="bg-black hover:bg-gray-800 text-white font-semibold py-2 px-6 rounded-md shadow h-[38px]"
                >
                  Añadir
                </button>
              </div>

              <div className="border border-gray-200 rounded-md overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#1e293b] text-white uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-center w-16">N°</th>
                      <th className="px-4 py-3 font-semibold w-32">ID</th>
                      <th className="px-4 py-3 font-semibold">Apellidos y Nombres</th>
                      <th className="px-4 py-3 font-semibold text-center w-32">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500 italic">
                          No hay alumnos registrados.
                        </td>
                      </tr>
                    ) : (
                      participants.map((p, idx) => (
                        <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="px-4 py-3 text-center text-gray-500">{idx + 1}</td>
                          <td className="px-4 py-3 font-medium">{p.id}</td>
                          <td className="px-4 py-3">{p.fullName}</td>
                          <td className="px-4 py-3 text-center">
                            <button onClick={() => handleDeleteParticipant(p.id)} className="text-red-600 hover:text-red-800 p-1">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  onClick={handleCompleteStep2}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2.5 px-6 rounded-md shadow transition-colors"
                >
                  Guardar Datos e ir al Calendario
                </button>
              </div>
            </div>
          )}

          {/* PASO 3: PUBLICAR CURSO */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-gray-100 rounded-md px-4 py-3 border border-gray-200">
                <h2 className="text-base font-semibold text-slate-700">3. Publicar Curso</h2>
                <button onClick={() => setStep(2)} className="text-sm text-blue-600 font-medium hover:underline">
                  Volver a Participantes
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-100 p-6 rounded-lg text-center space-y-4">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                <h3 className="text-xl font-bold text-gray-900">¡Curso configurado con éxito!</h3>
                <p className="text-gray-600">
                  Has registrado los datos del curso y tienes <strong>{participants.length}</strong> alumnos inscritos. 
                  Para empezar a tomar asistencia, necesitas publicar el curso.
                </p>
                
                <div className="pt-4">
                  <button 
                    onClick={handlePublishCourse}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-md shadow-lg text-lg transition-colors"
                  >
                    Publicar Curso (Abrir)
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
