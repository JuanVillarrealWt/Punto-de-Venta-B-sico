import { NavLink } from 'react-router-dom';
import {
  ShoppingCartIcon,
  UsersIcon,
  CubeIcon,
  MagnifyingGlassIcon,
  BuildingStorefrontIcon,
} from '@heroicons/react/24/outline';

const links = [
  { to: '/facturacion', label: 'Facturación', icon: ShoppingCartIcon },
  { to: '/clientes', label: 'Clientes', icon: UsersIcon },
  { to: '/productos', label: 'Productos', icon: CubeIcon },
  { to: '/consultas', label: 'Consultas', icon: MagnifyingGlassIcon },
];

export default function Sidebar() {
  return (
    <aside className="w-72 bg-zinc-950 border-r border-zinc-900 flex flex-col shadow-2xl z-10">
      {/* Logo */}
      <div className="p-8 border-b border-zinc-900 flex items-center justify-center flex-col">
        <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(16,185,129,0.15)] border border-emerald-500/20 text-emerald-400">
           <BuildingStorefrontIcon className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white text-center">
          <span className="text-emerald-400">Abarrotes</span><br/>Villarreal
        </h1>
        <p className="text-[11px] text-zinc-500 mt-2 uppercase tracking-widest font-bold">Compra y Venta</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-5 space-y-2">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/30 translate-x-1'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 border border-transparent hover:translate-x-1'
              }`
            }
          >
            <Icon className="w-5 h-5 stroke-2" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-900 bg-zinc-950/50">
        <p className="text-xs text-zinc-600 text-center font-semibold tracking-wide">v1.0</p>
      </div>
    </aside>
  );
}
