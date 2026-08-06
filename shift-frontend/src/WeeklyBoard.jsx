import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Download, Zap, Plus } from 'lucide-react';
import html2canvas from 'html2canvas';

export default function WeeklyBoard() {
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [shiftTypes, setShiftTypes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const boardRef = useRef(null);
  
  const [newShift, setNewShift] = useState({ 
    employee_id: '', 
    date: format(new Date(), 'yyyy-MM-dd'), 
    start_time: '08:00 AM', 
    end_time: '04:00 PM', 
    type: 'Turno Normal', 
    color: 'bg-state-blue' 
  });

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const resEmp = await fetch('${import.meta.env.VITE_API_URL}/api/employees', { headers });
      setEmployees(await resEmp.json());
      
      const resShifts = await fetch('${import.meta.env.VITE_API_URL}/api/shifts', { headers });
      setShifts(await resShifts.json());

      const resTypes = await fetch('${import.meta.env.VITE_API_URL}/api/shift-types', { headers });
      setShiftTypes(await resTypes.json());
    } catch (error) { console.error("Error cargando datos:", error); }
  };

  useEffect(() => { loadData(); }, []);

  const handleExportImage = async () => {
    if (!boardRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(boardRef.current, { scale: 2, backgroundColor: '#ffffff' });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = `Horario_Calendario.png`;
      link.click();
    } catch (error) {
      console.error("Error al exportar:", error);
      alert("Hubo un problema al generar la imagen.");
    } finally { setIsExporting(false); }
  };

  // Convertidor de clases de Tailwind a Colores Hexadecimales para el Calendario
  const colorMap = {
    'bg-state-blue': '#3b82f6',
    'bg-state-green': '#10b981',
    'bg-state-purple': '#8b5cf6',
    'bg-state-orange': '#f97316',
    'bg-state-red': '#ef4444'
  };

  // Convertidor de horas (08:00 AM -> Formato 24h para el Calendario)
  const convertToISO = (dateStr, timeStr) => {
    if (!timeStr) return null;
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    if (modifier === 'PM' && hours !== '12') hours = (parseInt(hours, 10) + 12).toString();
    if (modifier === 'AM' && hours === '12') hours = '00';
    return `${dateStr}T${hours.padStart(2, '0')}:${minutes}:00`;
  };

  // Preparamos los eventos para inyectarlos en FullCalendar
  const calendarEvents = shifts.map(shift => {
    const emp = employees.find(e => e.id === shift.employee_id);
    return {
      id: shift.id,
      title: `${emp ? emp.name : 'Desc.'} - ${shift.type}`,
      start: convertToISO(shift.date, shift.start_time),
      end: convertToISO(shift.date, shift.end_time),
      backgroundColor: colorMap[shift.color] || '#3b82f6',
      borderColor: 'transparent',
      extendedProps: { ...shift }
    };
  });

  const handleDeleteShift = async (shiftId) => {
    if (!window.confirm("¿Estás seguro de eliminar este turno?")) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/shifts/${shiftId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
      setShifts(prev => prev.filter(s => s.id !== parseInt(shiftId)));
    } catch (error) { console.error("Error eliminando:", error); }
  };

  // Función mágica que guarda los cambios cuando arrastras o estiras un turno en el calendario
  const handleEventChange = async (info) => {
    const shiftId = info.event.id;
    const shift = info.event.extendedProps;
    
    const newStartDate = info.event.start;
    const newEndDate = info.event.end || newStartDate; 

    const newDateStr = format(newStartDate, 'yyyy-MM-dd');
    const newStartTimeStr = format(newStartDate, 'hh:mm aa', { locale: enUS });
    const newEndTimeStr = format(newEndDate, 'hh:mm aa', { locale: enUS });

    // Actualización visual instantánea
    setShifts(prev => prev.map(s => s.id === parseInt(shiftId) ? {
      ...s, date: newDateStr, start_time: newStartTimeStr, end_time: newEndTimeStr
    } : s));

    // Guardado silencioso en la Base de Datos
    const token = localStorage.getItem('token');
    await fetch(`${import.meta.env.VITE_API_URL}/api/shifts/${shiftId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ 
        employee_id: shift.employee_id, 
        date: newDateStr, 
        start_time: newStartTimeStr, 
        end_time: newEndTimeStr,
        type: shift.type,
        color: shift.color
      })
    });
  };

  const handleCreateShift = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await fetch('${import.meta.env.VITE_API_URL}/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newShift)
      });
      setIsModalOpen(false);
      loadData();
    } catch (error) { console.error("Error al guardar:", error); }
  };

  const handleSelectTemplate = (e) => {
    const templateId = e.target.value;
    if (!templateId) return;
    const template = shiftTypes.find(t => t.id === parseInt(templateId));
    if (template) {
      setNewShift({
        ...newShift,
        start_time: template.start_time,
        end_time: template.end_time,
        type: template.name,
        color: template.color
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full relative">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <h2 className="text-lg font-bold text-slate-800">Calendario de Operaciones</h2>
        
        <div className="flex gap-3">
          <button onClick={handleExportImage} disabled={isExporting} className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50">
            <Download size={16} className={isExporting ? 'animate-bounce' : ''} />
            {isExporting ? 'Generando...' : 'Exportar Vista'}
          </button>
          
          <button onClick={() => setIsModalOpen(true)} className="bg-brand-dark hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <Plus size={16} /> Nuevo Turno
          </button>
        </div>
      </div>

      <div className="flex-1 p-4" ref={boardRef}>
        {/* Aquí inyectamos el Súper Calendario */}
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          locale={esLocale}
          events={calendarEvents}
          editable={true} // Permite arrastrar turnos
          droppable={true}
          eventClick={(info) => handleDeleteShift(info.event.id)} // Clic para eliminar
          eventDrop={handleEventChange} // Al soltar el turno arrastrado
          eventResize={handleEventChange} // Al estirar la duración del turno
          slotMinTime="06:00:00" // Hora en la que arranca el calendario visualmente
          slotMaxTime="24:00:00" // Hora en la que cierra
          allDaySlot={false}
          height="100%"
          buttonText={{
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día'
          }}
        />
      </div>

      {/* MODAL DE NUEVO TURNO (Mantenido intacto) */}
      {isModalOpen && (
        <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-slate-800">Asignar Turno</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 text-2xl font-bold">&times;</button>
            </div>
            
            <form onSubmit={handleCreateShift} className="space-y-4">
              {shiftTypes.length > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl mb-4">
                  <label className="text-sm font-bold text-state-blue mb-2 flex items-center gap-1">
                    <Zap size={16} /> Carga Rápida
                  </label>
                  <select 
                    onChange={handleSelectTemplate}
                    defaultValue=""
                    className="w-full p-2 border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-state-blue bg-white text-sm"
                  >
                    <option value="" disabled>Elige un turno predeterminado...</option>
                    {shiftTypes.map(st => (
                      <option key={st.id} value={st.id}>{st.name} ({st.start_time} a {st.end_time})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Empleado</label>
                <select required className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-state-blue bg-white" value={newShift.employee_id} onChange={(e) => setNewShift({...newShift, employee_id: e.target.value})}>
                  <option value="">Selecciona un empleado...</option>
                  {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name} - {emp.role}</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label><input type="date" required className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-state-blue" value={newShift.date} onChange={(e) => setNewShift({...newShift, date: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Hora de Inicio</label><input type="text" required className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-state-blue" value={newShift.start_time} onChange={(e) => setNewShift({...newShift, start_time: e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Hora de Fin</label><input type="text" required className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-state-blue" value={newShift.end_time} onChange={(e) => setNewShift({...newShift, end_time: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Nombre / Tipo</label><input type="text" required className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-state-blue" value={newShift.type} onChange={(e) => setNewShift({...newShift, type: e.target.value})} /></div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Color</label>
                  <select className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-state-blue bg-white" value={newShift.color} onChange={(e) => setNewShift({...newShift, color: e.target.value})}>
                    <option value="bg-state-blue">Azul</option><option value="bg-state-green">Verde</option><option value="bg-state-purple">Morado</option><option value="bg-state-orange">Naranja</option><option value="bg-state-red">Rojo</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-brand-dark hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-lg transition-colors mt-4">Guardar Turno</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}