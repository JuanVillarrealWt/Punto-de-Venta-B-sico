import { useState, useEffect } from 'react';
import { movimientosApi, type MovimientoStock } from '../api';
import {
  ArrowsRightLeftIcon,
  ClockIcon,
  CubeIcon,
  UserIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import TablePagination from '../components/TablePagination';
import { getSearchInputMode, getSearchMaxLength, getSearchPlaceholder, sanitizeSearchValue, type SearchInputKind } from '../utils/searchInput';

export default function AuditoriaPage() {
  const [movimientos, setMovimientos] = useState<MovimientoStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Filter States
  const [search, setSearch] = useState('');
  const [searchBy, setSearchBy] = useState('producto');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const searchKind: SearchInputKind =
    searchBy === 'usuario' ? 'letras' :
    searchBy === 'referencia' ? 'referencia' :
    'producto';

  const getAuditoriaSearchKind = (value: string): SearchInputKind => {
    if (value === 'usuario') return 'letras';
    if (value === 'referencia') return 'referencia';
    return 'producto';
  };

  const handleSearchByChange = (value: string) => {
    const nextKind = getAuditoriaSearchKind(value);
    setSearchBy(value);
    setSearch(sanitizeSearchValue(search, nextKind));
  };

  const handleSearchChange = (value: string) => {
    setSearch(sanitizeSearchValue(value, searchKind));
  };

  const loadMovimientos = async () => {
    try {
      const { data } = await movimientosApi.getAll();
      setMovimientos(data || []);
    } catch { } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovimientos();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, searchBy, desde, hasta]);

  // Client-side filtering
  const filteredMovimientos = movimientos.filter(m => {
    if (search) {
      const term = search.toLowerCase();
      if (searchBy === 'producto') {
        if (!m.productoNombre.toLowerCase().includes(term)) return false;
      } else if (searchBy === 'usuario') {
        if (!(m.vendedorNombre || '').toLowerCase().includes(term)) return false;
      } else if (searchBy === 'referencia') {
        if (!(m.referencia || '').toLowerCase().includes(term)) return false;
      }
    }

    if (desde) {
      const desdeDate = new Date(desde + 'T00:00:00');
      const itemDate = new Date(m.createdAt);
      if (itemDate < desdeDate) return false;
    }

    if (hasta) {
      const hastaDate = new Date(hasta + 'T23:59:59');
      const itemDate = new Date(m.createdAt);
      if (itemDate > hastaDate) return false;
    }

    return true;
  });

  const totalItems = filteredMovimientos.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedMovimientos = filteredMovimientos.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
      <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      <p className="text-zinc-400 font-bold animate-pulse uppercase tracking-widest text-[10px]">Analizando Kardex...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
             <ArrowsRightLeftIcon className="w-7 h-7 text-white" />
           </div>
           <div>
            <h1 className="text-2xl font-black text-zinc-800 tracking-tighter">Auditoría de <span className="text-emerald-600">Stock</span></h1>
            <p className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest">Movimientos de Inventario</p>
           </div>
        </div>
        
        <div className="flex items-center gap-3 bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100">
          <ClockIcon className="w-6 h-6 text-emerald-600 animate-pulse" />
          <div className="text-right">
            <div className="text-xl font-black text-zinc-800 font-mono leading-none tracking-tighter">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-black mt-1">
              {currentTime.toLocaleDateString([], { day: 'numeric', month: 'short' })}
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 flex gap-2 p-1.5 bg-zinc-50 border border-zinc-200 rounded-xl">
            <div className="relative shrink-0">
              <select
                value={searchBy}
                onChange={e => handleSearchByChange(e.target.value)}
                className="appearance-none bg-emerald-600 text-white pl-4 pr-8 py-2.5 rounded-xl text-sm font-bold outline-none cursor-pointer shadow-md shadow-emerald-600/20 w-[150px]"
              >
                <option value="producto" className="bg-white text-zinc-800">Producto</option>
                <option value="usuario" className="bg-white text-zinc-800">Usuario</option>
                <option value="referencia" className="bg-white text-zinc-800">Referencia</option>
              </select>
              <ChevronDownIcon className="w-3.5 h-3.5 text-white absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder={getSearchPlaceholder(searchKind)}
                value={search}
                onChange={e => handleSearchChange(e.target.value)}
                maxLength={getSearchMaxLength(searchKind)}
                inputMode={getSearchInputMode(searchKind)}
                className="w-full pl-12 pr-4 py-2.5 bg-transparent text-zinc-800 text-sm font-bold placeholder:text-zinc-400 outline-none"
              />
            </div>
          </div>
          <input
            type="date"
            value={desde}
            onChange={e => setDesde(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 px-4 py-2 rounded-xl text-zinc-800 text-xs font-bold cursor-pointer"
          />
          <input
            type="date"
            value={hasta}
            onChange={e => setHasta(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 px-4 py-2 rounded-xl text-zinc-800 text-xs font-bold cursor-pointer"
          />
        </div>
      </div>

      {/* Tabla de Movimientos */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200">
              <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Fecha / Hora</th>
              <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Producto / Detalle</th>
              <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center">Tipo</th>
              <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Cantidad</th>
              <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Stock Final</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {paginatedMovimientos.map(m => (
              <tr key={m.id} className="hover:bg-emerald-50/50 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <p className="text-xs font-black text-zinc-800">{new Date(m.createdAt).toLocaleDateString()}</p>
                    <p className="text-[10px] font-bold text-zinc-400 font-mono">{new Date(m.createdAt).toLocaleTimeString()}</p>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <CubeIcon className="w-4 h-4 text-zinc-400 shrink-0" />
                    <div>
                      <p className="text-sm font-black text-zinc-800">{m.productoNombre}</p>
                      <div className="flex items-center gap-2.5 mt-1.5">
                        <span className="flex items-center gap-1 text-[9px] text-zinc-400 font-black uppercase">
                          <UserIcon className="w-3 h-3" /> {m.vendedorNombre || 'SISTEMA'}
                        </span>
                        {m.referencia && (
                          <span className="text-[9px] font-black text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200 uppercase tracking-wide">
                            {m.referencia}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${m.tipo === 'SALIDA' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
                    {m.tipo}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <p className={`text-sm font-black ${m.tipo === 'SALIDA' ? 'text-red-600' : 'text-emerald-600'}`}>
                    {m.tipo === 'SALIDA' ? '-' : '+'}{m.cantidad}
                  </p>
                </td>
                <td className="px-6 py-5 text-right">
                  <p className="text-sm font-black text-zinc-800 font-mono">{m.stockNuevo}</p>
                </td>
              </tr>
            ))}
            {filteredMovimientos.length === 0 && (
              <tr><td colSpan={5} className="py-24 text-center text-zinc-400 font-black text-[10px] uppercase tracking-widest">Sin movimientos registrados</td></tr>
            )}
          </tbody>
        </table>

        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
          totalItems={totalItems}
        />
      </div>
    </div>
  );
}
