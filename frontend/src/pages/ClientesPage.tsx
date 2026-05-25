import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { clientesApi } from '../api';
import type { Cliente, ClienteForm } from '../api';
import Modal from '../components/Modal';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import ConfirmModal from '../components/ConfirmModal';
import TablePagination from '../components/TablePagination';

import { useDebounce } from '../hooks/useDebounce';

const emptyForm: ClienteForm = { identificacion: '', nombre: '', apellido: '', direccion: '', telefono: '', email: '' };

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 150);
  const [searchBy, setSearchBy] = useState('nombre');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [form, setForm] = useState<ClienteForm>(emptyForm);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState<number | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const loadClientes = async () => {
    setLoading(true);
    try {
      const { data } = await clientesApi.getAll(debouncedSearch || undefined, searchBy);
      setClientes(data);
    } catch { toast.error('Error al cargar clientes'); }
    setLoading(false);
  };

  useEffect(() => { loadClientes(); setCurrentPage(1); }, [debouncedSearch, searchBy]);

  const totalPages = Math.ceil(clientes.length / pageSize);
  const paginatedClientes = clientes.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (c: Cliente) => {
    setEditing(c);
    setForm({ identificacion: c.identificacion, nombre: c.nombre, apellido: c.apellido, direccion: c.direccion || '', telefono: c.telefono || '', email: c.email || '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await clientesApi.update(editing.id, form);
        toast.success('Cliente actualizado');
      } else {
        await clientesApi.create(form);
        toast.success('Cliente creado');
      }
      setModalOpen(false);
      loadClientes();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al guardar');
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
      toast.success('Cliente eliminado');
      loadClientes();
    } catch { toast.error('Error al eliminar'); }
    setClienteToDelete(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
          <p className="text-sm text-gray-600 font-medium">Gestión de clientes del sistema</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/25">
          <PlusIcon className="w-4 h-4" />Nuevo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-4">
        <select value={searchBy} onChange={e => setSearchBy(e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 bg-white">
          <option value="nombre">Por Nombre</option>
          <option value="identificacion">Por Identificación</option>
        </select>
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Identificación', 'Nombre', 'Teléfono', 'Email', 'Acciones'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">Cargando...</td></tr>
            ) : paginatedClientes.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">No se encontraron clientes</td></tr>
            ) : paginatedClientes.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 font-mono font-bold text-gray-700">{c.identificacion}</td>
                <td className="px-5 py-3">
                  <div className="font-bold text-gray-900 text-base">{c.nombre} {c.apellido}</div>
                </td>
                <td className="px-5 py-3 text-gray-800 font-medium">{c.telefono || '—'}</td>
                <td className="px-5 py-3 text-teal-600 font-bold">{c.email || '—'}</td>
                <td className="px-5 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(c)} className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" title="Editar">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
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
          totalItems={clientes.length}
        />
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Cliente' : 'Nuevo Cliente'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Identificación *</label>
              <input required value={form.identificacion} onChange={e => setForm({ ...form, identificacion: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
              <input required value={form.apellido} onChange={e => setForm({ ...form, apellido: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <input value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium">
              {editing ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Eliminar Cliente"
        message="¿Está seguro de eliminar este cliente? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        type="danger"
      />
    </div>
  );
}
