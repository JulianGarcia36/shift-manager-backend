import React, { useState, useEffect } from 'react';
import { Users, Clock, CalendarX2, CheckCircle, XCircle, AlertCircle, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function DashboardView() {
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [requests, setRequests] = useState([]); // <-- Cambiamos absences por requests (shift-swaps)

  // Cargar todos los datos al entrar
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };

        const [resEmp, resShifts, resReq] = await Promise.all([
  fetch(import.meta.env.VITE_API_URL + '/employees`, { headers }),
  fetch(import.meta.env.VITE_API_URL + '/shifts`, { headers }),
  fetch(import.meta.env.VITE_API_URL + '/shift-swaps`, { headers }) 
]);

        if (resEmp.ok) setEmployees(await resEmp.json());
        if (resShifts.ok) setShifts(await resShifts.json());
        if (resReq.ok) setRequests(await resReq.json());
      } catch (error) {
        console.error("Error al cargar dashboard:", error);
      }
    };
    loadDashboardData();
  }, []);

  // Función para aprobar o rechazar el cambio de turno
  const handleAction = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(import.meta.env.VITE_API_URL + '/shift-swaps/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }) // 'approved' o 'rejected'
      });

      if (res.ok) {
        const updatedReq = await res.json();
        // Actualizamos la lista en pantalla instantáneamente
        setRequests(requests.map(r => r.id === id ? updatedReq : r));
      }
    } catch (error) {
      console.error("Error actualizando estado:", error);
    }
  };

  // Convertir hora (Ej: '08:00 AM') a número decimal para calcular totales
  const timeToNumber = (timeStr) => {
    if (!timeStr) return 0;
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return hours + (minutes / 60);
  };

  // Calcular horas trabajadas por empleado
  const employeeStats = employees.map(emp => {
    const empShifts = shifts.filter(s => s.employee_id === emp.id);
    let totalHours = 0;
    empShifts.forEach(s => {
      // Si el turno es de descanso o libre, no sumamos horas
      const shiftTitle = s.title || s.type || '';
      if (shiftTitle.toLowerCase() === 'descanso' || shiftTitle.toLowerCase() === 'libre') {
        return; // Salta este turno sin sumar horas
      }

      const start = timeToNumber(s.start_time);
      const end = timeToNumber(s.end_time);
      let shiftHours = end - start;
      if (shiftHours < 0) shiftHours += 24; // Para turnos que cruzan la medianoche
      totalHours += shiftHours;
    });
    return { ...emp, totalHours, shiftCount: empShifts.length };
  }).sort((a, b) => b.totalHours - a.totalHours);

  // Contamos solo las peticiones pendientes para la burbuja de notificación
  const pendingRequests = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Tarjetas de Resumen (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-state-blue flex items-center justify-center"><Users size={24} /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Empleados</p>
            <p className="text-2xl font-bold text-slate-800">{employees.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-50 text-state-green flex items-center justify-center"><CalendarX2 size={24} /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Turnos Asignados</p>
            <p className="text-2xl font-bold text-slate-800">{shifts.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-50 text-state-orange flex items-center justify-center"><AlertCircle size={24} /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Permisos Pendientes</p>
            <p className="text-2xl font-bold text-slate-800">{pendingRequests}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-50 text-state-purple flex items-center justify-center"><Clock size={24} /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Horas Programadas</p>
            <p className="text-2xl font-bold text-slate-800">
              {employeeStats.reduce((acc, curr) => acc + curr.totalHours, 0).toFixed(1)}h
            </p>
          </div>
        </div>
      </div>

      {/* PANEL: Turnos de Hoy */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="text-state-blue" size={24} />
            <h3 className="text-xl font-bold text-slate-800">Turnos de Hoy</h3>
          </div>
          <span className="text-sm font-medium text-slate-500">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {shifts.filter(s => s.date === format(new Date(), 'yyyy-MM-dd')).length === 0 ? (
            <p className="text-slate-500 text-sm py-4 col-span-full flex items-center justify-center gap-2">
              <CalendarX2 size={16} /> No hay turnos programados para el día de hoy.
            </p>
          ) : (
            shifts
              .filter(s => s.date === format(new Date(), 'yyyy-MM-dd'))
              .sort((a, b) => timeToNumber(a.start_time) - timeToNumber(b.start_time))
              .map(shift => {
                const emp = employees.find(e => e.id === shift.employee_id);
                return (
                  <div key={shift.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50 flex items-center justify-between hover:border-state-blue transition-colors border-l-4" style={{ borderLeftColor: shift.color || '#3b82f6' }}>
                    <div>
                      <p className="font-bold text-slate-800">{emp ? emp.name : 'Cargando...'}</p>
                      <p className="text-xs text-slate-500 font-medium">{shift.start_time} - {shift.end_time}</p>
                    </div>
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{shift.title || shift.type || 'TURNO'}</span>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Izquierda: Gráfico de Horas */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="text-state-blue" size={24} />
            <h3 className="text-xl font-bold text-slate-800">Horas Trabajadas por Empleado</h3>
          </div>
          
          <div className="space-y-4">
            {employeeStats.length === 0 && <p className="text-slate-400 text-sm">No hay datos de turnos aún.</p>}
            {employeeStats.map(emp => (
              <div key={emp.id} className="flex items-center gap-4">
                <div className="w-40 truncate text-sm font-bold text-slate-700">{emp.name}</div>
                <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden relative">
                  <div 
                    className="h-full bg-state-blue rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((emp.totalHours / 48) * 100, 100)}%` }} 
                  ></div>
                </div>
                <div className="w-20 text-right text-sm font-bold text-slate-700">{emp.totalHours.toFixed(1)} h</div>
              </div>
            ))}
          </div>
        </div>

        {/* Columna Derecha: Panel de Ausencias (Buzón Conectado) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-state-orange" size={24} />
              <h3 className="text-xl font-bold text-slate-800">Permisos</h3>
            </div>
            {pendingRequests > 0 && (
              <span className="bg-state-orange text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                {pendingRequests} nuevos
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {requests.length === 0 && (
              <div className="text-center text-slate-400 text-sm py-10 flex flex-col items-center">
                <CheckCircle size={32} className="mb-2 opacity-50" />
                <p>No hay solicitudes de permisos.</p>
              </div>
            )}
            
            {requests.map(req => {
              // Cruzamos datos para saber de quién es el turno
              const emp = employees.find(e => e.id === req.requesting_employee_id);
              const shift = shifts.find(s => s.id === req.shift_id);

              return (
                <div key={req.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50 hover:border-slate-200 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-slate-800 text-sm">{emp ? emp.name : 'Empleado'}</p>
                    <span className="text-xs font-medium text-slate-500">{shift ? shift.date : ''}</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{req.reason}</p>
                  
                  {req.status === 'pending' ? (
                    <div className="flex gap-2">
                      <button onClick={() => handleAction(req.id, 'approved')} className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors">
                        <CheckCircle size={14} /> Aprobar
                      </button>
                      <button onClick={() => handleAction(req.id, 'rejected')} className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors">
                        <XCircle size={14} /> Rechazar
                      </button>
                    </div>
                  ) : (
                    <div className={`text-xs font-bold px-3 py-1.5 rounded-lg text-center ${req.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {req.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}