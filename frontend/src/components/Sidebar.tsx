import { NavLink } from 'react-router-dom';
import {
  ShoppingCartIcon,
  UsersIcon,
  CubeIcon,
  MagnifyingGlassIcon,
  BuildingStorefrontIcon,
  BugAntIcon,
  ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline';

import { useAuthStore } from '../store/authStore';

const links = [
  { to: '/facturacion', label: 'Facturación', icon: ShoppingCartIcon, roles: ['Vendedor'] },
  { to: '/clientes', label: 'Clientes', icon: UsersIcon, roles: ['Administrador'] },
  { to: '/productos', label: 'Productos', icon: CubeIcon, roles: ['Administrador'] },
  { to: '/usuarios', label: 'Usuarios', icon: BuildingStorefrontIcon, roles: ['Administrador'] },
  { to: '/consultas', label: 'Consultas', icon: MagnifyingGlassIcon, roles: ['Administrador', 'Vendedor'] },
  { to: '/auditoria', label: 'Auditoría', icon: ArrowsRightLeftIcon, roles: ['Administrador'] },
  { to: '/logs', label: 'Bitácora', icon: BugAntIcon, roles: ['Administrador'] },
];

export default function Sidebar() {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);

  const filteredLinks = links.filter(link => !link.roles || (user && link.roles.includes(user.role)));

  return (
    <aside className="w-80 bg-white border-r border-zinc-200 flex flex-col shadow-sm z-10">
      {/* Logo */}
      <div className="p-8 flex items-center gap-4">
        <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20 text-white shrink-0">
           <BuildingStorefrontIcon className="w-8 h-8" />
        </div>
        <div className="overflow-hidden">
          <h1 className="text-2xl font-black tracking-tighter text-zinc-800 leading-none">
            Abarrotes <span className="text-emerald-600">Villarreal</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1.5 uppercase tracking-widest font-bold">POS System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-4 mb-4">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Menú Principal</p>
        </div>
        {filteredLinks.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 border border-transparent'
              }`
            }
          >
            <Icon className={`w-5 h-5 stroke-2`} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="p-6 border-t border-zinc-100 bg-zinc-50/50">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black shadow-md shadow-emerald-600/20">
              {user?.nombre.charAt(0)}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-black text-zinc-800 truncate" title={user?.nombre}>{user?.nombre}</p>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{user?.role}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="group w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-black bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300 border border-red-100 hover:border-red-600"
        >
          Cerrar Sesión
        </button>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-100 bg-white">
        <p className="text-xs text-zinc-400 text-center font-semibold tracking-wide">v1.0</p>
      </div>
    </aside>
  );
}
