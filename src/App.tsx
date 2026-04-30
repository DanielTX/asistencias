// En este proyecto se trabajará con estilos de Tailwind CSS.

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* 
        NOTA: La estructura de componentes y layouts se montará aquí. 
        Este es solo el punto de entrada principal.
      */}
      <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">
          Sistema de Asistencias
        </h1>
        <p className="text-gray-600 mb-6">
          Configuración inicial completada. El proyecto utiliza <strong>Tailwind CSS</strong> para los estilos.
        </p>
        <div className="grid grid-cols-2 gap-4 text-sm text-left">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <span className="font-semibold text-blue-700 block">Módulo 1</span>
            Registro y Asistencias
          </div>
          <div className="bg-green-50 p-3 rounded-lg border border-green-100">
            <span className="font-semibold text-green-700 block">Módulo 2</span>
            Gestión de Alumnos
          </div>
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
            <span className="font-semibold text-purple-700 block">Módulo 3</span>
            Actividades y Charlas
          </div>
          <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
            <span className="font-semibold text-orange-700 block">Módulo 4</span>
            Reportes y Acumulados
          </div>
        </div>
      </div>
    </div>
  )
}
