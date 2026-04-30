export type StudentStatus = 'Activo' | 'Inactivo' | 'Retirado';

export interface Student {
  id: string; // SENATI ID (ej. 1537058)
  firstName: string;
  lastName: string;
  fullName: string;
  status: StudentStatus;
}

export interface Course {
  id: string;
  name?: string;
  campus: string; // IND - ETI
  program: string; // APRENDIZAJE DUAL
  career: string; // DESARROLLO DE SOFTWARE
  semester: string; // S6
  instructorId: string; // 1008119
  instructorName: string; // CARLOS MAYNA AGUILAR
  block: string;
  nrc: string;
  period: string; // 202520
  courseCode: string; // 202520-PD3D-647-TAL-NRC_38538
  status?: 'Activo' | 'Inactivo' | 'Cerrado' | 'Borrador';
}

export type AttendanceStatus = 'A' | 'T' | 'FJ' | 'FI';
// A: Asistencia
// T: Tardanza
// FJ: Falta Justificada
// FI: Falta Injustificada

export interface AttendanceRecord {
  id?: string;
  courseId: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  createdAt: number;
}
