import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, Settings, LogOut, Bell } from 'lucide-react';

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const userName = localStorage.getItem('userName') || 'Administrador';
  
  // 1. Estado para guardar el nombre de tu empresa
  const [companyName, setCompanyName] = useState('Cargando...');

  // 2. Buscamos el nombre en la base de datos al iniciar
  useEffect(() => {
    const loadCompanyData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch('http://127.0.0.1:8000/api/settings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data && data.company_name) {
          setCompanyName(data.company_name);
        }
      } catch (error) {
        console.error("Error al cargar el nombre de la empresa:", error);
        setCompanyName('Mi Negocio');
      }
    };
    
    loadCompanyData();
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    try {
      if (token) {
        await fetch('http://127.0.0.1:8000/api/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      navigate('/login');
    }
  };

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/calendar', icon: Calendar, label: 'Turnos' },
    { path: '/employees', icon: Users, label: 'Empleados' },
    { path: '/settings', icon: Settings, label: 'Configuración' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* MENÚ LATERAL IZQUIERDO */}
      <aside className="w-64 bg-brand-dark text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-state-green tracking-tight">ShiftMaster</h1>
          <p className="text-slate-400 text-xs font-semibold tracking-widest uppercase mt-1">Panel de Control</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive ? 'bg-state-blue text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* BOTÓN DE CERRAR SESIÓN */}
        <div className="p-4 border-t border-slate-700/50">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-state-red hover:bg-state-red/10 hover:text-red-400 w-full"
          >
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* BARRA SUPERIOR (HEADER) */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <h2 className="text-xl font-bold text-slate-700">
            {navItems.find(item => item.path === location.pathname)?.label || 'Resumen'}
          </h2>
          
          <div className="flex items-center gap-6">
            <button className="text-slate-400 hover:text-state-blue transition-colors relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-state-red rounded-full border-2 border-white"></span>
            </button>
            
            <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-700">{userName}</p>
                {/* 3. Aquí colocamos el nombre real de tu empresa */}
                <p className="text-xs text-state-blue font-bold uppercase tracking-wider">{companyName}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-state-blue flex items-center justify-center text-white font-bold shadow-sm">
                {userName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* CONTENIDO DE LA PÁGINA */}
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
        
      </main>
    </div>
  );
}