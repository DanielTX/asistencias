import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Users, CalendarCheck, BookOpen, Menu, Bell, LogOut } from 'lucide-react';
import { cn } from './Button';
import { useAuthStore } from '@/features/auth/store/authStore';

const navigation = [
  { name: 'Gestión Estudiantes', href: '/estudiantes', icon: Users },
  { name: 'Registro Asistencia', href: '/asistencia', icon: CalendarCheck },
  { name: 'Datos del Curso', href: '/curso', icon: BookOpen },
];

export function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col shadow-sm z-10">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="flex items-center gap-2 text-blue-600">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <CalendarCheck className="text-white w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">SENATI Auth</span>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">
            Módulos del Sistema
          </div>
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-blue-600" : "text-gray-400")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
              CM
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">Carlos Mayna</span>
              <span className="text-xs text-gray-500">Instructor</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 shadow-sm z-0">
          <div className="flex items-center md:hidden">
            <button className="text-gray-500 hover:text-gray-700 p-2">
              <Menu className="w-6 h-6" />
            </button>
            <span className="ml-2 text-lg font-bold text-blue-600">SENATI</span>
          </div>
          <div className="hidden md:block">
            <h1 className="text-xl font-semibold text-gray-800">
              {navigation.find(n => location.pathname.startsWith(n.href))?.name || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-gray-600 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="h-6 w-px bg-gray-200"></div>
            <button 
              onClick={() => useAuthStore.getState().logout()}
              className="text-gray-500 hover:text-red-600 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </header>

        {/* Main Area */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
