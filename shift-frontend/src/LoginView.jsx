import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle } from 'lucide-react';

export default function LoginView() {
  const [email, setEmail] = useState('admin@empresa.com');
  const [password, setPassword] = useState('12345678');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json' // <-- Esto obliga a Laravel a responder siempre los errores en texto claro
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('userName', data.user.name);
        navigate('/');
      } else {
        setError(data.message || 'Credenciales incorrectas');
      }
    } catch (error) {
      console.error(error);
      setError('Error interno: Verifica la consola para más detalles.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        
        <div className="bg-brand-dark p-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">ShiftMaster</h1>
          <p className="text-slate-400 text-sm">Panel de Administración</p>
        </div>

        <div className="p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Lock className="text-state-blue" size={24} />
            Iniciar Sesión
          </h2>

          {error && (
            <div className="mb-6 p-3 bg-state-red/10 border border-state-red/20 text-state-red rounded-lg flex items-center gap-2 text-sm font-medium">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
                <input 
                  type="email" 
                  required
                  className="w-full pl-10 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-state-blue outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
                <input 
                  type="password" 
                  required
                  className="w-full pl-10 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-state-blue outline-none transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-state-blue hover:bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl transition-colors shadow-lg shadow-blue-500/30 mt-4"
            >
              {isLoading ? 'Verificando...' : 'Entrar al Sistema'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}