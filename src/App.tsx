import { Outlet, Link } from 'react-router-dom';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-4xl w-full">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">
          Sistema de Asistencias (SENATI)
        </h1>
        <p className="text-gray-600 mb-6">
          Selecciona un módulo para comenzar a trabajar (Arquitectura Modular):
        </p>
        
        {/* Navegación Principal */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-left mb-8">
          <Link to="/estudiantes" className="bg-green-50 p-3 rounded-lg border border-green-100 hover:bg-green-100 transition cursor-pointer">
            <span className="font-semibold text-green-700 block">👨‍💻 DEV 1</span>
            Gestión Estudiantes
          </Link>
          <Link to="/asistencia" className="bg-blue-50 p-3 rounded-lg border border-blue-100 hover:bg-blue-100 transition cursor-pointer">
            <span className="font-semibold text-blue-700 block">📊 DEV 2</span>
            Registro Asistencia
          </Link>
          <Link to="/curso" className="bg-purple-50 p-3 rounded-lg border border-purple-100 hover:bg-purple-100 transition cursor-pointer">
            <span className="font-semibold text-purple-700 block">🏫 DEV 3</span>
            Datos del Curso
          </Link>
          <Link to="/reportes" className="bg-orange-50 p-3 rounded-lg border border-orange-100 hover:bg-orange-100 transition cursor-pointer">
            <span className="font-semibold text-orange-700 block">📈 DEV 4</span>
            Reportes / Resumen
          </Link>
        </div>
        
        {/* Área de trabajo donde se montan las rutas */}
        <div className="border-t pt-6 text-left">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Área de Trabajo Actual:</h2>
          </div>
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 min-h-[300px] flex items-center justify-center">
            {/* Aquí React Router inyecta el componente según la URL */}
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
