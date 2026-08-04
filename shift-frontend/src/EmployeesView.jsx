import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, X } from 'lucide-react';

export default function EmployeesView() {
  const [employees, setEmployees] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    color: '#3B82F6'
  });

  const loadEmployees = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/employees');
      setEmployees(await response.json());
    } catch (error) {
      console.error("Error al cargar empleados:", error);
    }
  };

  useEffect(() => { loadEmployees(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const url = editingId ? `http://127.0.0.1:8000/api/employees/${editingId}` : 'http://127.0.0.1:8000/api/employees';
    const method = editingId ? 'PUT' : 'POST';
    const token = localStorage.getItem('token'); // Sacamos la llave

    try {
      await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Mostramos la llave a Laravel
        },
        body: JSON.stringify(formData)
      });
      
      cancelEdit();
      loadEmployees();
    } catch (error) {
      console.error("Error al guardar:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (emp) => {
    setEditingId(emp.id);
    setFormData({ name: emp.name, role: emp.role, color: emp.color });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', role: '', color: '#3B82F6' });
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`⚠️ ¿Estás seguro de eliminar a ${name}? Esto también borrará todos sus turnos.`)) return;
    const token = localStorage.getItem('token');

    try {
      await fetch(`http://127.0.0.1:8000/api/employees/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` } // Mostramos la llave para borrar
      });
      loadEmployees();
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Users className="text-state-blue" size={28} />
        <h2 className="text-2xl font-bold text-slate-800">Gestión de Empleados</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className={`bg-white p-6 rounded-2xl shadow-sm border ${editingId ? 'border-state-orange ring-2 ring-state-orange/20' : 'border-slate-200'} sticky top-6 transition-all`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-bold flex items-center gap-2 ${editingId ? 'text-state-orange' : 'text-slate-800'}`}>
                {editingId ? <Edit2 size={20} /> : <Plus size={20} className="text-state-green" />}
                {editingId ? 'Editar Empleado' : 'Nuevo Empleado'}
              </h3>
              {editingId && (
                <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-700 p-1"><X size={20} /></button>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre completo</label>
                <input type="text" required className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-state-blue outline-none" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cargo / Rol</label>
                <input type="text" required className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-state-blue outline-none" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Color en el calendario</label>
                <div className="flex items-center gap-3">
                  <input type="color" className="h-10 w-16 p-1 border border-slate-300 rounded-lg cursor-pointer" value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})} />
                  <span className="text-sm text-slate-500 uppercase font-mono">{formData.color}</span>
                </div>
              </div>
              <button type="submit" disabled={isSubmitting} className={`w-full text-white font-bold py-3 px-4 rounded-lg transition-colors mt-2 ${editingId ? 'bg-state-orange hover:bg-orange-600' : 'bg-brand-dark hover:bg-slate-800'}`}>
                {isSubmitting ? 'Guardando...' : (editingId ? 'Actualizar Datos' : 'Registrar Empleado')}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6">
              {employees.length === 0 && <p className="col-span-2 text-center text-slate-500 py-8">Aún no tienes empleados registrados.</p>}
              {employees.map((emp) => (
                <div key={emp.id} className="border border-slate-100 rounded-xl p-4 flex items-center justify-between group hover:border-slate-300 transition-colors bg-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-sm" style={{ backgroundColor: emp.color }}>
                      {emp.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{emp.name}</h4>
                      <p className="text-sm font-medium text-slate-500">{emp.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(emp)} className="p-2 text-slate-400 hover:text-state-blue bg-white rounded-lg border border-slate-200 hover:border-state-blue transition-colors" title="Editar"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(emp.id, emp.name)} className="p-2 text-slate-400 hover:text-state-red bg-white rounded-lg border border-slate-200 hover:border-state-red transition-colors" title="Eliminar"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}