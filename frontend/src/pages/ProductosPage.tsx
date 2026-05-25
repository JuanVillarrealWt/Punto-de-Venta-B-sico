import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { productosApi } from '../api';
import type { Producto, ProductoForm } from '../api';
import Modal from '../components/Modal';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import ConfirmModal from '../components/ConfirmModal';
import TablePagination from '../components/TablePagination';

import { useDebounce } from '../hooks/useDebounce';

const emptyForm: ProductoForm = { codigo: '', nombre: '', descripcion: '', precio: 0, stock: 0 };

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 150);
  const [searchBy, setSearchBy] = useState('nombre');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Producto | null>(null);
  const [form, setForm] = useState<ProductoForm>(emptyForm);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [productoToDelete, setProductoToDelete] = useState<number | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const load = async () => {
    setLoading(true);
    try { const { data } = await productosApi.getAll(debouncedSearch || undefined, searchBy); setProductos(data); }
    catch { toast.error('Error al cargar productos'); }
    setLoading(false);
  };

  useEffect(() => { load(); setCurrentPage(1); }, [debouncedSearch, searchBy]);

  const totalPages = Math.ceil(productos.length / pageSize);
  const paginatedProductos = productos.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (p: Producto) => {
    setEditing(p);
    setForm({ codigo: p.codigo, nombre: p.nombre, descripcion: p.descripcion || '', precio: p.precio, stock: p.stock });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) { await productosApi.update(editing.id, form); toast.success('Producto actualizado'); }
      else { await productosApi.create(form); toast.success('Producto creado'); }
      setModalOpen(false); load();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error al guardar'); }
  };

  const handleDelete = (id: number) => {
    setProductoToDelete(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!productoToDelete) return;
    try { 
      await productosApi.delete(productoToDelete); 
      toast.success('Producto eliminado'); 
      load(); 
    } catch { toast.error('Error al eliminar'); }
    setProductoToDelete(null);
  };

  const stockBadge = (s: number) => s > 10 ? 'bg-emerald-100 text-emerald-700' : s > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-800">Productos</h1><p className="text-sm text-gray-600 font-medium">Gestión de inventario y precios</p></div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 shadow-lg shadow-teal-600/25"><PlusIcon className="w-4 h-4" />Nuevo Producto</button>
      </div>
      <div className="flex gap-2 mb-4">
        <select value={searchBy} onChange={e => setSearchBy(e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 bg-white">
          <option value="nombre">Por Nombre</option>
          <option value="codigo">Por Código</option>
        </select>
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="text-left px-5 py-3 text-sm font-bold text-gray-700 uppercase tracking-tight">Código</th>
              <th className="text-left px-5 py-3 text-sm font-bold text-gray-700 uppercase tracking-tight">Nombre</th>
              <th className="text-right px-5 py-3 text-sm font-bold text-gray-700 uppercase tracking-tight">Precio</th>
              <th className="text-right px-5 py-3 text-sm font-bold text-gray-700 uppercase tracking-tight">Stock</th>
              <th className="text-left px-5 py-3 text-sm font-bold text-gray-700 uppercase tracking-tight">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">Cargando...</td></tr> :
              paginatedProductos.length === 0 ? <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">Sin resultados</td></tr> :
                paginatedProductos.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-mono font-bold text-gray-700">{p.codigo}</td>
                    <td className="px-5 py-3">
                      <div className="font-bold text-gray-900 text-base">{p.nombre}</div>
                      {p.descripcion && <div className="text-sm text-gray-600 font-medium italic">{p.descripcion}</div>}
                    </td>
                    <td className="px-5 py-3 font-bold text-gray-700 text-base text-right">${p.precio.toFixed(2)}</td>
                    <td className="px-5 py-3 text-right"><span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-tight ${stockBadge(p.stock)}`}>{p.stock} unidades</span></td>
                    <td className="px-5 py-3 flex gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg"><PencilIcon className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><TrashIcon className="w-4 h-4" /></button>
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
          totalItems={productos.length}
        />
      </div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Producto' : 'Nuevo Producto'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Código *</label><input required value={form.codigo} onChange={e => setForm({ ...form, codigo: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label><input required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Precio *</label><input required type="number" step="0.01" min="0.01" value={form.precio} onChange={e => setForm({ ...form, precio: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label><input required type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label><textarea rows={2} value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 resize-none" /></div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium">{editing ? 'Actualizar' : 'Guardar'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Eliminar Producto"
        message="¿Está seguro de eliminar este producto del inventario? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        type="danger"
      />
    </div>
  );
}
