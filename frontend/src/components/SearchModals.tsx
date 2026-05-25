import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Modal from './Modal';
import TablePagination from './TablePagination';
import { clientesApi, productosApi } from '../api';
import type { Cliente, Producto } from '../api';
import { useDebounce } from '../hooks/useDebounce';

interface ClienteSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (c: Cliente) => void;
}

export function ClienteSearchModal({ isOpen, onClose, onSelect }: ClienteSearchModalProps) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 150);
  const [searchBy, setSearchBy] = useState('nombre');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(25);

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await clientesApi.getAll(debouncedSearch || undefined, searchBy);
        setClientes(data);
        setPage(1);
      } catch {}
      setLoading(false);
    };
    load();
  }, [debouncedSearch, searchBy, isOpen]);

  const paginated = clientes.slice((page - 1) * size, page * size);
  const totalPages = Math.ceil(clientes.length / size);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Buscar Cliente">
      <div className="flex gap-2 mb-4">
        <select value={searchBy} onChange={e => setSearchBy(e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 bg-white">
          <option value="nombre">Por Nombre</option>
          <option value="identificacion">Por Identificación</option>
        </select>
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input autoFocus placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500" />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>
      <div className="max-h-96 overflow-auto divide-y divide-gray-100">
        {paginated.map(c => (
          <button key={c.id} onClick={() => onSelect(c)} className="w-full text-left px-5 py-4 hover:bg-teal-50 transition-colors group">
            <div className="font-bold text-gray-800 text-base group-hover:text-teal-700">{c.nombre} {c.apellido}</div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
              <span className="text-sm text-gray-600 font-medium">ID: <span className="text-gray-900">{c.identificacion}</span></span>
              <span className="text-sm text-gray-600 font-medium">Tel: <span className="text-gray-900">{c.telefono || 'S/N'}</span></span>
              <span className="text-sm text-teal-600 font-medium italic">{c.email || ''}</span>
            </div>
          </button>
        ))}
      </div>
      <TablePagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        pageSize={size}
        onPageSizeChange={s => { setSize(s); setPage(1); }}
        totalItems={clientes.length}
      />
    </Modal>
  );
}

interface ProductoSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (p: Producto) => void;
}

export function ProductoSearchModal({ isOpen, onClose, onSelect }: ProductoSearchModalProps) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 150);
  const [searchBy, setSearchBy] = useState('nombre');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(25);

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await productosApi.getAll(debouncedSearch || undefined, searchBy);
        setProductos(data.filter(p => p.stock > 0));
        setPage(1);
      } catch {}
      setLoading(false);
    };
    load();
  }, [debouncedSearch, searchBy, isOpen]);

  const paginated = productos.slice((page - 1) * size, page * size);
  const totalPages = Math.ceil(productos.length / size);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Buscar Producto">
      <div className="flex gap-2 mb-4">
        <select value={searchBy} onChange={e => setSearchBy(e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 bg-white">
          <option value="nombre">Por Nombre</option>
          <option value="codigo">Por Código</option>
        </select>
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input autoFocus placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500" />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>
      <div className="max-h-96 overflow-auto divide-y divide-gray-100">
        {paginated.map(p => (
          <button key={p.id} onClick={() => onSelect(p)} className="w-full text-left px-5 py-4 hover:bg-teal-50 transition-colors flex justify-between items-center group">
            <div>
              <div className="font-bold text-gray-800 text-base group-hover:text-teal-700">{p.nombre}</div>
              <div className="flex gap-4 mt-1">
                <span className="text-sm text-gray-600 font-medium">Código: <span className="text-gray-900">{p.codigo}</span></span>
                <span className="text-sm text-gray-600 font-medium">Stock: <span className={p.stock < 5 ? 'text-red-600' : 'text-emerald-600'}>{p.stock}</span></span>
              </div>
            </div>
            <span className="font-bold text-teal-600 text-lg">${p.precio.toFixed(2)}</span>
          </button>
        ))}
      </div>
      <TablePagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        pageSize={size}
        onPageSizeChange={s => { setSize(s); setPage(1); }}
        totalItems={productos.length}
      />
    </Modal>
  );
}
