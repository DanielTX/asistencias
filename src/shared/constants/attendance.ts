export const ATTENDANCE_COLORS = {
  A: 'bg-green-500 text-white',      // Asistencia
  T: 'bg-yellow-400 text-gray-900',  // Tardanza
  F: 'bg-red-500 text-white',        // Falta (Injustificada)
  J: 'bg-blue-500 text-white',       // Falta Justificada
} as const;

export const ATTENDANCE_LABELS = {
  A: 'Asistencia',
  T: 'Tardanza',
  F: 'Falta Injustificada',
  J: 'Falta Justificada',
} as const;
