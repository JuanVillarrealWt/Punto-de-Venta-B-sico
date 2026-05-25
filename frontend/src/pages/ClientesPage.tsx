import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { clientesApi } from '../api';
import type { Cliente, ClienteForm } from '../api';
import Modal from '../components/Modal';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, UserGroupIcon, ClockIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import ConfirmModal from '../components/ConfirmModal';
import TablePagination from '../components/TablePagination';
import { useDebounce } from '../hooks/useDebounce';

const emptyForm: ClienteForm = { identificacion: '', nombre: '', apellido: '', direccion: '', telefono: '', email: '', activo: true };

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [searchBy, setSearchBy] = useState('identificacion');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [form, setForm] = useState<ClienteForm>(emptyForm);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadClientes = async () => {
    setLoading(true);
    try {
      const { data } = await clientesApi.getAll(debouncedSearch || undefined, searchBy, currentPage, pageSize);
      setClientes(data.items || []);
      setTotalItems(data.totalCount || 0);
    } catch { toast.error('Error al cargar clientes'); }
    setLoading(false);
  };

  useEffect(() => { loadClientes(); }, [debouncedSearch, searchBy, currentPage, pageSize]);
  
  // Si hay búsqueda o cambia el filtro de búsqueda, se reseteará la página a 1
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, searchBy]);

  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedClientes = clientes;

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (c: Cliente) => {
    setEditing(c);
    setForm({ identificacion: c.identificacion, nombre: c.nombre, apellido: c.apellido, direccion: c.direccion || '', telefono: c.telefono || '', email: c.email || '', activo: c.activo });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      if (editing) {
        await clientesApi.update(editing.id, form);
        toast.success('Actualizado');
      } else {
        await clientesApi.create(form);
        toast.success('Creado');
      }
      setModalOpen(false);
      loadClientes();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number) => {
    setClienteToDelete(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!clienteToDelete) return;
    try {
      await clientesApi.delete(clienteToDelete);
      toast.success('Eliminado');
      loadClientes();
    } catch { toast.error('Error'); }
    setClienteToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
             <UserGroupIcon className="w-7 h-7 text-white" />
           </div>
           <div>
            <h1 className="text-2xl font-black text-zinc-800 tracking-tighter">Directorio de <span className="text-emerald-600">Clientes</span></h1>
            <p className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest">Base de Datos de Clientes</p>
           </div>
        </div>
        
        <div className="flex items-center gap-6">
          <button onClick={openCreate} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black flex items-center gap-2 hover:bg-emerald-700 transition-all text-[11px] uppercase tracking-widest shadow-lg shadow-emerald-600/20">
            <PlusIcon className="w-4 h-4" /> NUEVO
          </button>
          
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
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-1.5 border border-zinc-200 rounded-2xl flex items-center gap-2 shadow-sm">
        <div className="relative">
          <select value={searchBy} onChange={e => setSearchBy(e.target.value)} className="appearance-none bg-emerald-600 text-white pl-4 pr-8 py-2.5 rounded-xl text-sm font-bold outline-none cursor-pointer shadow-md shadow-emerald-600/20 w-[150px]">
            <option value="identificacion" className="bg-white text-zinc-800">Cédula</option>
            <option value="nombre" className="bg-white text-zinc-800">Nombre</option>
            <option value="apellido" className="bg-white text-zinc-800">Apellido</option>
          </select>
          <ChevronDownIcon className="w-3.5 h-3.5 text-white absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-transparent text-zinc-800 text-sm font-bold placeholder:text-zinc-400 outline-none"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200">
              <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Cédula</th>
              <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Nombre Completo</th>
              <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Dirección</th>
              <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Teléfono</th>
              <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Correo</th>
              <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-20 text-center text-zinc-400 font-black uppercase text-xs animate-pulse">Cargando Directorio...</td></tr>
            ) : paginatedClientes.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-20 text-center text-zinc-400 font-black uppercase text-xs">Sin registros</td></tr>
            ) : paginatedClientes.map((c) => (
              <tr key={c.id} className="hover:bg-emerald-50/50 transition-colors group">
                <td className="px-6 py-5 font-mono text-zinc-500 text-sm tracking-widest">{c.identificacion}</td>
                <td className="px-6 py-5 font-black text-zinc-800 tracking-tighter text-sm">{c.nombre} {c.apellido}</td>
                <td className="px-6 py-5 text-sm text-zinc-500 truncate max-w-[150px]" title={c.direccion}>{c.direccion || '---'}</td>
                <td className="px-6 py-5 font-mono text-zinc-500 text-sm">{c.telefono || '---'}</td>
                <td className="px-6 py-5 text-sm text-zinc-500 truncate max-w-[150px]" title={c.email}>{c.email || '---'}</td>
                <td className="px-6 py-5">
                  <div className="flex gap-2 justify-center">
                    <button onClick={() => openEdit(c)} className="p-2.5 text-zinc-400 hover:text-emerald-600 transition-colors bg-zinc-50 rounded-xl border border-zinc-200 hover:border-emerald-200 hover:bg-emerald-50">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="p-2.5 text-zinc-400 hover:text-red-600 transition-all bg-zinc-50 rounded-xl border border-zinc-200 hover:border-red-200 hover:bg-red-50">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="REGISTRO DE CLIENTE">
        <div className="bg-white rounded-2xl p-8 shadow-xl text-zinc-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>

          <div className="flex justify-between items-center pb-6 border-b-2 border-emerald-500/20 mb-6">
            <div>
              <h2 className="text-2xl font-black text-emerald-700 tracking-tighter">ABARROTES VILLARREAL</h2>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">{editing ? 'Editar Cliente' : 'Nuevo Cliente'}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-[10px] font-black text-zinc-800 uppercase tracking-widest block mb-2 ml-1">Cédula / Identificación</label>
                <input required value={form.identificacion} onChange={e => setForm({ ...form, identificacion: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-3.5 rounded-xl text-zinc-800 text-sm font-bold outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-black text-zinc-800 uppercase tracking-widest block mb-2 ml-1">Nombre</label>
                <input required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-3.5 rounded-xl text-zinc-800 text-sm font-bold outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-black text-zinc-800 uppercase tracking-widest block mb-2 ml-1">Apellido</label>
                <input required value={form.apellido} onChange={e => setForm({ ...form, apellido: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-3.5 rounded-xl text-zinc-800 text-sm font-bold outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-black text-zinc-800 uppercase tracking-widest block mb-2 ml-1">Teléfono</label>
                <input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-3.5 rounded-xl text-zinc-800 text-sm font-bold outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-black text-zinc-800 uppercase tracking-widest block mb-2 ml-1">Correo Electrónico</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-3.5 rounded-xl text-zinc-800 text-sm font-bold outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all" />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-black text-zinc-800 uppercase tracking-widest block mb-2 ml-1">Dirección</label>
                <input value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-3.5 rounded-xl text-zinc-800 text-sm font-bold outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all" />
              </div>
            </div>
            <div className="flex gap-4 pt-4 border-t-2 border-emerald-500/10">
              <button type="button" onClick={() => setModalOpen(false)} disabled={saving} className="flex-1 py-3.5 border-2 border-zinc-200 text-zinc-500 hover:bg-zinc-50 rounded-xl text-[10px] font-black uppercase transition-all disabled:opacity-50">CANCELAR</button>
              <button type="submit" disabled={saving} className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-300 disabled:text-zinc-500 disabled:shadow-none text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-emerald-600/20 transition-all">
                {saving ? 'GUARDANDO...' : 'GUARDAR'}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="ELIMINAR"
        message="¿Confirmar?"
        confirmText="ELIMINAR"
        type="danger"
      />
    </div>
  );
}
