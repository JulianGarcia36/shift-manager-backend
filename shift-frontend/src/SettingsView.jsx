import React, { useState, useEffect } from 'react';
import { Settings, Building2, Calendar, ShieldCheck, Save, CheckCircle, Plus, Trash2, Lock } from 'lucide-react';

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState('company');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    company_name: '', industry: '', start_day: '1', open_time: '08:00', close_time: '22:00', logo: ''
  });

  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  const [subAdmins, setSubAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });

  // Cargar sub-administradores al abrir la pestaña
  useEffect(() => {
    if (activeTab === 'security') {
      fetch(`${import.meta.env.VITE_API_URL}/users`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Accept': 'application/json' }
      }).then(res => res.json()).then(data => setSubAdmins(data));
    }
  }, [activeTab]);

  const [shiftTypes, setShiftTypes] = useState([]);
  const [newShiftType, setNewShiftType] = useState({ 
    name: '', start_time: '08:00 AM', end_time: '04:00 PM', color: 'bg-state-blue' 
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json' 
        };
        
        const resSettings = await fetch(`${import.meta.env.VITE_API_URL}/settings`, { headers });
        if (resSettings.ok) {
          const dataSettings = await resSettings.json();
          if (dataSettings.id) setFormData(dataSettings);
        }

        const resTypes = await fetch(`${import.meta.env.VITE_API_URL}/shift-types`, { headers });
        if (resTypes.ok) {
          setShiftTypes(await resTypes.json());
        }
      } catch (error) {
        console.error("Error al cargar configuración:", error);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setShowSuccess(false);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/settings`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        // Solo mostramos éxito si el backend realmente lo aceptó
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        // Si el backend lo rechaza, damos la alerta real
        alert('⚠️ El servidor rechazó los cambios. Si subiste un logo, es probable que la imagen sea demasiado pesada (intenta que sea menor a 500 KB).');
      }
    } catch (error) { 
      console.error("Error guardando:", error); 
      alert('Hubo un error de conexión con el servidor.');
    } finally { 
      setIsSaving(false); 
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert('Las contraseñas nuevas no coinciden');
      return;
    }
    
    setIsChangingPwd(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/user/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: passwords.current,
          new_password: passwords.new
        })
      });

      if (res.ok) {
        alert('¡Contraseña actualizada con éxito!');
        setPasswords({ current: '', new: '', confirm: '' });
      } else {
        const data = await res.json();
        alert(data.message || 'Error al cambiar la contraseña. Verifica tu clave actual.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un error de conexión');
    } finally {
      setIsChangingPwd(false);
    }
  };

  const handleAddSubAdmin = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const res = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(newAdmin)
    });
    if (res.ok) {
      const addedUser = await res.json();
      setSubAdmins([...subAdmins, addedUser]);
      setNewAdmin({ name: '', email: '', password: '' });
    } else {
      alert('Error: El correo ya existe o la contraseña es muy corta.');
    }
  };

  const handleDeleteSubAdmin = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este acceso?')) return;
    const token = localStorage.getItem('token');
    await fetch(`${import.meta.env.VITE_API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    });
    setSubAdmins(subAdmins.filter(admin => admin.id !== id));
  };

  const handleAddShiftType = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/shift-types`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(newShiftType)
      });
      
      if (!response.ok) {
        alert("Hubo un problema al guardar. Revisa que tu servidor backend esté encendido.");
        return;
      }

      const added = await response.json();
      setShiftTypes([...shiftTypes, added]);
      setNewShiftType({ name: '', start_time: '08:00 AM', end_time: '04:00 PM', color: 'bg-state-blue' });
    } catch (error) { 
      console.error("Error agregando plantilla:", error); 
      alert("Error de conexión con el servidor.");
    }
  };

  const handleDeleteShiftType = async (id) => {
    if(!window.confirm("¿Eliminar esta plantilla predeterminada?")) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL}/shift-types/${id}`, {
        method: 'DELETE',
        headers: { 
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      setShiftTypes(shiftTypes.filter(st => st.id !== id));
    } catch (error) { console.error("Error eliminando plantilla:", error); }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 relative">
      
      {showSuccess && (
        <div className="absolute top-0 right-0 bg-state-green text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2 fade-in duration-300 z-50">
          <CheckCircle size={20} />
          <span className="font-bold">¡Configuración guardada correctamente!</span>
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        <Settings className="text-state-blue" size={28} />
        <h2 className="text-2xl font-bold text-slate-800">Configuración del Sistema</h2>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Menú lateral */}
        <div className="w-full md:w-64 shrink-0 space-y-2">
          <button onClick={() => setActiveTab('company')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'company' ? 'bg-white shadow-sm border border-slate-200 text-state-blue' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>
            <Building2 size={20} /> Datos del Negocio
          </button>
          <button onClick={() => setActiveTab('calendar')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'calendar' ? 'bg-white shadow-sm border border-slate-200 text-state-blue' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>
            <Calendar size={20} /> Calendario
          </button>
          <button onClick={() => setActiveTab('security')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'security' ? 'bg-white shadow-sm border border-slate-200 text-state-blue' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>
            <ShieldCheck size={20} /> Seguridad
          </button>
        </div>

        {/* Área de contenido */}
        <div className="flex-1">
          
          {activeTab === 'company' && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in duration-300">
              <form onSubmit={handleSave} className="space-y-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Información de la Empresa</h3>
                
                {/* Fila 1: Nombre y Sector */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Local</label>
                    <input type="text" required value={formData.company_name} onChange={(e) => setFormData({...formData, company_name: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-state-blue" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Sector / Industria</label>
                    <input type="text" required value={formData.industry} onChange={(e) => setFormData({...formData, industry: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-state-blue" />
                  </div>
                </div>

                {/* Fila 2: NUEVO BLOQUE DEL LOGO */}
                <div className="mt-4 p-4 border border-slate-200 rounded-xl bg-slate-50">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Logo de la Empresa</label>
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-white overflow-hidden shrink-0">
                      {formData.logo ? (
                        <img src={formData.logo} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                        <Building2 size={24} className="text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 mb-2">Sube una imagen (JPG, PNG). El tamaño ideal es de 256x256px.</p>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setFormData({...formData, logo: reader.result});
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-state-blue hover:file:bg-blue-100 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Botón de Guardar */}
                <div className="pt-4 border-t border-slate-100">
                  <button type="submit" disabled={isSaving} className="bg-brand-dark hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors disabled:opacity-50">
                    <Save size={18} /> {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <form onSubmit={handleSave} className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">Reglas del Calendario</h3>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Primer día de la semana</label>
                    <select value={formData.start_day} onChange={(e) => setFormData({...formData, start_day: e.target.value})} className="w-full md:w-1/2 p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-state-blue bg-white">
                      <option value="1">Lunes</option>
                      <option value="0">Domingo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Horario de Operación (Apertura y Cierre)</label>
                    <div className="flex gap-4 w-full md:w-1/2">
                      <input type="time" required value={formData.open_time} onChange={(e) => setFormData({...formData, open_time: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-state-blue" />
                      <input type="time" required value={formData.close_time} onChange={(e) => setFormData({...formData, close_time: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-state-blue" />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-100">
                    <button type="submit" disabled={isSaving} className="bg-brand-dark hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors disabled:opacity-50">
                      <Save size={18} /> {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-xl font-bold text-slate-800 mb-2">Tipos de Turnos Predeterminados</h3>
                <p className="text-sm text-slate-500 mb-6">Guarda tus horarios más frecuentes para agilizar la asignación en el calendario.</p>
                
                <form onSubmit={handleAddShiftType} className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Nombre</label>
                    <input type="text" placeholder="Ej: Mañana" required value={newShiftType.name} onChange={(e) => setNewShiftType({...newShiftType, name: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-state-blue text-sm" />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Inicio</label>
                    <input type="text" placeholder="08:00 AM" required value={newShiftType.start_time} onChange={(e) => setNewShiftType({...newShiftType, start_time: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-state-blue text-sm" />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Fin</label>
                    <input type="text" placeholder="04:00 PM" required value={newShiftType.end_time} onChange={(e) => setNewShiftType({...newShiftType, end_time: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-state-blue text-sm" />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Color</label>
                    <select value={newShiftType.color} onChange={(e) => setNewShiftType({...newShiftType, color: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-state-blue text-sm bg-white">
                      <option value="bg-state-blue">Azul</option>
                      <option value="bg-state-green">Verde</option>
                      <option value="bg-state-purple">Morado</option>
                      <option value="bg-state-orange">Naranja</option>
                      <option value="bg-state-red">Rojo</option>
                    </select>
                  </div>
                  <div className="sm:col-span-1 flex items-end">
                    <button type="submit" className="w-full bg-state-green hover:bg-green-600 text-white px-3 py-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-colors text-sm">
                      <Plus size={16} /> Agregar
                    </button>
                  </div>
                </form>

                <div className="space-y-3">
                  {shiftTypes.length === 0 && <p className="text-center text-slate-400 text-sm py-4">No has guardado ninguna plantilla de turno aún.</p>}
                  {shiftTypes.map((st) => (
                    <div key={st.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:border-slate-300 transition-colors bg-white">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-10 rounded-full ${st.color}`}></div>
                        <div>
                          <p className="font-bold text-slate-800">{st.name}</p>
                          <p className="text-xs text-slate-500 font-medium">{st.start_time} - {st.end_time}</p>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteShiftType(st.id)} className="p-2 text-slate-400 hover:text-state-red hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          )}

          {/* ----- PESTAÑA DE SEGURIDAD ----- */}
          {activeTab === 'security' && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in duration-300">
              
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Cambiar Contraseña</h3>
                
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña Actual</label>
                    <input 
                      type="password" 
                      required 
                      value={passwords.current} 
                      onChange={(e) => setPasswords({...passwords, current: e.target.value})} 
                      className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-state-blue" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nueva Contraseña (mínimo 6 caracteres)</label>
                    <input 
                      type="password" 
                      required 
                      minLength="6"
                      value={passwords.new} 
                      onChange={(e) => setPasswords({...passwords, new: e.target.value})} 
                      className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-state-blue" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar Nueva Contraseña</label>
                    <input 
                      type="password" 
                      required 
                      value={passwords.confirm} 
                      onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} 
                      className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-state-blue" 
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <button type="submit" disabled={isChangingPwd} className="bg-brand-dark hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors disabled:opacity-50">
                    <Lock size={18} /> {isChangingPwd ? 'Actualizando...' : 'Actualizar Contraseña'}
                  </button>
                </div>
              </form>

              {/* LÍNEA DIVISORIA Y SECCIÓN DE SUB-ADMINISTRADORES */}
              <div className="mt-10 pt-8 border-t border-slate-200">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <ShieldCheck className="text-state-blue" size={24} /> 
                  Cuentas de Sub-Administradores
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Formulario para agregar */}
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <h4 className="text-sm font-bold text-slate-700 mb-4">Crear Nuevo Acceso</h4>
                    <form onSubmit={handleAddSubAdmin} className="space-y-3">
                      <input type="text" placeholder="Nombre (Ej: Gerente Noche)" required value={newAdmin.name} onChange={e => setNewAdmin({...newAdmin, name: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-state-blue" />
                      <input type="email" placeholder="Correo electrónico" required value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-state-blue" />
                      <input type="password" placeholder="Contraseña temporal" required minLength="6" value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-state-blue" />
                      <button type="submit" className="w-full bg-state-blue hover:bg-blue-700 text-white p-2.5 rounded-lg text-sm font-bold flex justify-center items-center gap-2 transition-colors">
                        <Plus size={16} /> Crear Sub-Administrador
                      </button>
                    </form>
                  </div>

                  {/* Lista de sub-administradores */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-4">Usuarios Activos</h4>
                    <div className="space-y-3">
                      {subAdmins.length === 0 && <p className="text-sm text-slate-500 italic">No hay sub-administradores creados.</p>}
                      {subAdmins.map(admin => (
                        <div key={admin.id} className="flex justify-between items-center p-3 border border-slate-200 rounded-lg bg-white">
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{admin.name}</p>
                            <p className="text-xs text-slate-500">{admin.email}</p>
                          </div>
                          <button onClick={() => handleDeleteSubAdmin(admin.id)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}