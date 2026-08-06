import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, Download, CalendarPlus } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export default function EmployeePublicView() {
  const { employeeId } = useParams(); // Captura el nombre de la URL
  const [employee, setEmployee] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEmployeeData = async () => {
      try {
        // 1. Buscamos al empleado
        const resEmp = await fetch('http://${import.meta.env.VITE_API_URL}/api/employees');
        const employees = await resEmp.json();
        
        // Encontramos al empleado cuyo nombre coincida con el enlace (ignorando mayúsculas)
        const foundEmp = employees.find(e => e.name.toLowerCase() === employeeId.toLowerCase());
        
        if (foundEmp) {
          setEmployee(foundEmp);
          
          // 2. Si existe, buscamos sus turnos
          const resShifts = await fetch('http://${import.meta.env.VITE_API_URL}/api/shifts');
          const allShifts = await resShifts.json();
          
          // Filtramos solo los turnos de este empleado y los ordenamos por fecha
          const empShifts = allShifts
            .filter(s => s.employee_id === foundEmp.id)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
            
          setShifts(empShifts);
        }
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEmployeeData();
  }, [employeeId]);

  // Pantallas de carga y error
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500 font-medium">Cargando tu horario...</div>;
  if (!employee) return <div className="min-h-screen flex items-center justify-center text-state-red font-bold text-xl">Empleado no encontrado. Verifica tu enlace.</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-md">
        
        {/* Tarjeta de Perfil */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 text-center mb-6 mt-4">
          <div 
            className="w-24 h-24 mx-auto text-white rounded-full flex items-center justify-center text-4xl font-bold shadow-lg mb-4"
            style={{ backgroundColor: employee.color }}
          >
            {employee.name[0].toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold text-slate-800">{employee.name}</h1>
          <p className="text-slate-500 font-medium">{employee.role}</p>
          
          <div className="mt-5 inline-block bg-state-blue/10 text-state-blue px-5 py-2 rounded-full font-semibold text-sm">
            {shifts.length} Turnos programados
          </div>
        </div>

        {/* Lista de Turnos */}
        <div className="flex items-center gap-2 mb-4 px-2">
          <CalendarIcon size={20} className="text-slate-400" />
          <h2 className="text-lg font-bold text-slate-700">Tus turnos asignados</h2>
        </div>
        
        {shifts.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center text-slate-500">
            No tienes turnos programados aún.
          </div>
        ) : (
          <div className="space-y-3">
            {shifts.map((shift) => (
              <div key={shift.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center group hover:border-state-blue/30 transition-colors">
                <div>
                  <p className="font-bold text-slate-700 capitalize text-base">
                    {format(parseISO(shift.date), 'EEEE d MMMM', { locale: es })}
                  </p>
                  <p className="text-slate-500 text-sm font-medium flex items-center gap-1.5 mt-1">
                    <Clock size={14} className="text-state-blue" /> 
                    {shift.start_time} - {shift.end_time}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">{shift.type}</p>
                </div>
                
                <div className={`h-12 w-1.5 rounded-full ${shift.color}`}></div>
              </div>
            ))}
          </div>
        )}
        
        <p className="text-center text-xs text-slate-400 mt-8 font-medium">
          Powered by ShiftMaster
        </p>
      </div>
    </div>
  );
}