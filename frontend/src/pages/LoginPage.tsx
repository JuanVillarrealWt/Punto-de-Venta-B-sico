import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { BuildingStorefrontIcon, EyeIcon, EyeSlashIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';
import api from '../api';
import { FIELD_LENGTHS } from '../utils/fieldLengths';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore(state => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, refreshToken, userId, nombre, apellido, role, username: userName } = response.data;
      
      setAuth({ id: userId, username: userName, nombre, apellido: apellido ?? '', role }, token, refreshToken);
      window.location.href = role === 'Administrador' ? '/consultas' : '/facturacion';
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-zinc-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-200/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-100/20 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md bg-white border border-zinc-200 p-10 rounded-2xl shadow-xl relative z-10">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-600/20 text-white">
            <BuildingStorefrontIcon className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-800 text-center">
            Abarrotes <span className="text-emerald-600">Villarreal</span>
          </h1>
          <p className="text-zinc-400 mt-2 text-sm font-medium">Sistema de Punto de Venta</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">Usuario</label>
            <div className="relative">
              <UserIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                maxLength={FIELD_LENGTHS.username}
                className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-800 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none transition-all placeholder:text-zinc-400 font-medium"
                placeholder="Ingresa tu usuario"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">Contraseña</label>
            <div className="relative">
              <LockClosedIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value.slice(0, FIELD_LENGTHS.password))}
                maxLength={FIELD_LENGTHS.password}
                className="w-full pl-12 pr-12 py-4 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-800 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none transition-all placeholder:text-zinc-400 font-medium"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-emerald-600 transition-colors"
                aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                title={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
              >
                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-200 disabled:text-zinc-400 text-white font-black rounded-xl transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98] mt-4 uppercase tracking-widest"
          >
            {loading ? 'Validando...' : 'Entrar al Sistema'}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
            © 2026 Universidad • Proyecto Final
          </p>
        </div>
      </div>
    </div>
  );
}
