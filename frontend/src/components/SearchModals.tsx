import { useState, useEffect } from 'react';
import { clientesApi, productosApi, type Cliente, type Producto } from '../api';
import Modal from './Modal';
import { MagnifyingGlassIcon, ArchiveBoxIcon, PlusIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useDebounce } from '../hooks/useDebounce';

interface SearchModalProps<T> {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: T) => void;
  onCreateNew?: () => void;
}

export function ClienteSearchModal({ isOpen, onClose, onSelect, onCreateNew }: SearchModalProps<Cliente>) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [searchBy, setSearchBy] = useState('identificacion');
  const [results, setResults] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await clientesApi.getAll(debouncedSearch || undefined, searchBy, 1, 50);
        setResults(data.items || []);
      } catch {}
      setLoading(false);
    };
    load();
  }, [debouncedSearch, searchBy, isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="BÚSQUEDA DE CLIENTES">
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative">
            <select value={searchBy} onChange={e => setSearchBy(e.target.value)} className="appearance-none bg-emerald-600 text-white pl-4 pr-8 py-2.5 rounded-xl text-sm font-bold outline-none cursor-pointer h-full shadow-md shadow-emerald-600/20 w-[150px]">
              <option value="identificacion" className="bg-white text-zinc-800">Cédula</option>
              <option value="nombre" className="bg-white text-zinc-800">Nombre</option>
              <option value="apellido" className="bg-white text-zinc-800">Apellido</option>
            </select>
            <ChevronDownIcon className="w-3.5 h-3.5 text-white absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input autoFocus placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-800 text-sm font-bold outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </div>
        </div>
        <div className="max-h-[400px] overflow-auto space-y-2 custom-scrollbar">
          {loading && <p className="text-center py-4 text-zinc-400 animate-pulse text-xs font-black uppercase">Buscando...</p>}
          {results.map(c => (
            <button key={c.id} onClick={() => onSelect(c)} className="w-full flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 transition-all group text-left">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm font-black text-zinc-800">{c.nombre} {c.apellido}</p>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase">{c.identificacion}</p>
                </div>
              </div>
              <PlusIcon className="w-5 h-5 text-zinc-300 group-hover:text-emerald-600" />
            </button>
          ))}
          {!loading && results.length === 0 && search && (
            <div className="text-center py-8">
              <p className="text-zinc-400 text-xs font-black uppercase mb-4">No hay resultados</p>
              {onCreateNew && (
                 <button onClick={onCreateNew} className="bg-emerald-600 text-white px-6 py-2 rounded-xl text-xs font-black uppercase shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all">Crear Nuevo Cliente</button>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export function ProductoSearchModal({ isOpen, onClose, onSelect }: SearchModalProps<Producto>) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [searchBy, setSearchBy] = useState('codigo');
  const [results, setResults] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await productosApi.getAll(debouncedSearch || undefined, searchBy, 1, 50);
        setResults((data.items || []).filter(p => p.activo && p.stock > 0));
      } catch {}
      setLoading(false);
    };
    load();
  }, [debouncedSearch, searchBy, isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="BÚSQUEDA DE ARTÍCULOS">
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative">
            <select value={searchBy} onChange={e => setSearchBy(e.target.value)} className="appearance-none bg-emerald-600 text-white pl-4 pr-8 py-2.5 rounded-xl text-sm font-bold outline-none cursor-pointer h-full shadow-md shadow-emerald-600/20 w-[150px]">
              <option value="codigo" className="bg-white text-zinc-800">Código</option>
              <option value="nombre" className="bg-white text-zinc-800">Nombre</option>
            </select>
            <ChevronDownIcon className="w-3.5 h-3.5 text-white absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input autoFocus placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-800 text-sm font-bold outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </div>
        </div>
        <div className="max-h-[400px] overflow-auto space-y-2 custom-scrollbar">
          {loading && <p className="text-center py-4 text-zinc-400 animate-pulse text-xs font-black uppercase">Consultando inventario...</p>}
          {results.map(p => (
            <button key={p.id} onClick={() => onSelect(p)} className="w-full flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 transition-all group text-left">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm font-black text-zinc-800">{p.nombre}</p>
                  <p className="text-[10px] font-bold text-zinc-500 font-mono">{p.codigo}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-emerald-600 font-mono tracking-tighter">${p.precio.toFixed(2)}</p>
                <div className="flex items-center justify-end gap-1.5 mt-1">
                   <ArchiveBoxIcon className="w-3 h-3 text-zinc-400" />
                   <span className={`text-[10px] font-black uppercase ${p.stock <= 5 ? 'text-red-600 animate-pulse' : 'text-zinc-500'}`}>
                    Stock: {p.stock}
                   </span>
                </div>
              </div>
            </button>
          ))}
          {!loading && results.length === 0 && search && <p className="text-center py-8 text-zinc-400 text-xs font-black uppercase">Producto no encontrado</p>}
        </div>
      </div>
    </Modal>
  );
}
