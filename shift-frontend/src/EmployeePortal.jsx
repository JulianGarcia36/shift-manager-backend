import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

export default function EmployeePortal() {
  const employeeId = window.location.pathname.split('/').pop();

  const [employee, setEmployee] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [reason, setReason] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const resEmp = await fetch(import.meta.env.VITE_API_URL + '/employees');
        const allEmps = await resEmp.json();
        const myEmp = allEmps.find(e => e.id === parseInt(employeeId));
        setEmployee(myEmp);

        const resShifts = await fetch(import.meta.env.VITE_API_URL + '/shifts');
        const allShifts = await resShifts.json();
        const myShifts = allShifts.filter(s => s.employee_id === parseInt(employeeId));
        
        myShifts.sort((a, b) => new Date(a.date) - new Date(b.date));
        setShifts(myShifts);
      } catch(error) { 
        console.error("Error cargando portal:", error); 
      }
    };
    if(employeeId) loadData();
  }, [employeeId]);

  const handleRequestSwap = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/public-shift-swaps', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json', 
            'Accept': 'application/json' 
        },
        body: JSON.stringify({
          shift_id: selectedShift.id,
          requesting_employee_id: employee.id,
          reason: reason
        })
      });

      if(res.ok) {
        setIsModalOpen(false);
        setSuccessMsg(true);
        setTimeout(() => setSuccessMsg(false), 4000);
        setReason('');
      } else {
        const errorData = await res.text();
        console.error("Error devuelto por el servidor:", errorData);
        alert(`⚠️ El servidor rechazó la solicitud. Revisa la consola.`);
      }
    } catch(error) {
      alert("⚠️ Hubo un error crítico de conexión con el servidor.");
    }
  };

  if (!employee) return <div className="p-8 text-center text-slate-500 font-medium">Cargando tu portal...</div>;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 relative pb-10">
      
      {successMsg && (
        <div className="absolute top-4 left-4 right-4 bg-state-green text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in z-50">
          <CheckCircle size={20} />
          <span className="font-bold text-sm">¡Solicitud enviada al administrador!</span>
        </div>
      )}

      <div className="bg-brand-dark p-6 rounded-b-3xl shadow-md text-white mb-6">
        <h1 className="text-2xl font-bold mb-1">Hola, {employee.name} 👋</h1>
        <p className="text-slate-300 text-sm">{employee.role}</p>
      </div>

      <div className="px-4 space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Calendar size={20} className="text-state-blue" />
          Tus Próximos Turnos
        </h2>

        {shifts.length === 0 && (
          <p className="text-center text-slate-400 py-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
            No tienes turnos asignados aún.
          </p>
        )}

        {shifts.map(shift => (
          <div key={shift.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-bold text-slate-800">{shift.date}</p>
                <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                  <Clock size={14} /> 
                  {shift.start_time === '00:00:00' ? 'Día Libre / Descanso' : `${shift.start_time} - ${shift.end_time}`}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full text-white font-medium ${shift.start_time === '00:00:00' ? 'bg-slate-500' : shift.color}`}>
                {shift.start_time === '00:00:00' ? 'DESCANSO' : (shift.type || 'TURNO')}
              </span>
            </div>
            
            <button 
              onClick={() => { setSelectedShift(shift); setIsModalOpen(true); }}
              className="w-full mt-2 py-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-sm font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <AlertTriangle size={16} /> Solicitar Relevo
            </button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Solicitar Cambio</h3>
            <p className="text-sm text-slate-500 mb-4">
              Turno del <strong>{selectedShift?.date}</strong> ({selectedShift?.start_time} - {selectedShift?.end_time})
            </p>
            
            <form onSubmit={handleRequestSwap}>
              <label className="block text-sm font-medium text-slate-700 mb-1">Motivo de la ausencia</label>
              <textarea 
                required
                rows="3"
                className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-state-blue mb-4 resize-none"
                placeholder="Ej: Tengo una cita médica de urgencia..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              ></textarea>
              
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-state-blue text-white font-bold hover:bg-blue-600 shadow-md transition-colors">Enviar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}