import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { productosApi, type Producto, type ProductoForm } from '../api';
import Modal from '../components/Modal';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, CubeIcon, BanknotesIcon, Square3Stack3DIcon, ClockIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import ConfirmModal from '../components/ConfirmModal';
import TablePagination from '../components/TablePagination';
import { useDebounce } from '../hooks/useDebounce';
import { getSearchInputMode, getSearchMaxLength, getSearchPlaceholder, sanitizeSearchValue, type SearchInputKind } from '../utils/searchInput';
import { FIELD_LENGTHS } from '../utils/fieldLengths';

const emptyForm: ProductoForm = { codigo: '', nombre: '', descripcion: '', precio: 0, stock: 0, activo: true };
const MAX_PRECIO = 999.99;
const MAX_STOCK = 999;
const capitalizeFirst = (s: string) => s.length === 0 ? '' : s.charAt(0).toUpperCase() + s.slice(1);

function validarCampos(form: ProductoForm): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!form.codigo) errors.codigo = 'El código es requerido.';
  if (!form.nombre) errors.nombre = 'El nombre es requerido.';
  if (!(form.precio > 0)) errors.precio = 'El precio debe ser mayor a 0.';
  else if (form.precio > MAX_PRECIO) errors.precio = `El precio no puede superar ${MAX_PRECIO.toFixed(2)}.`;
  if (!Number.isInteger(form.stock) || form.stock < 0) errors.stock = 'El stock no puede ser negativo.';
  else if (form.stock === 0) errors.stock = 'El stock debe ser mayor a 0.';
  else if (form.stock > MAX_STOCK) errors.stock = `El stock no puede superar ${MAX_STOCK}.`;

  return errors;
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-[10px] font-bold text-red-500 mt-1 ml-1">{msg}</p>;
}

const inputClass = (field: string, touched: Record<string, boolean>, fieldErrors: Record<string, string>, extra = '') =>
  `w-full bg-zinc-50 border px-5 py-3.5 rounded-xl text-zinc-800 text-sm font-bold outline-none transition-all ${extra} ${
    touched[field] && fieldErrors[field]
      ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
      : 'border-zinc-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
  }`;

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [searchBy, setSearchBy] = useState('codigo');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Producto | null>(null);
  const [form, setForm] = useState<ProductoForm>(emptyForm);
  const [precioStr, setPrecioStr] = useState('0');
  const [stockStr, setStockStr] = useState('0');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [productoToDelete, setProductoToDelete] = useState<number | null>(null);
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadProductos = async () => {
    setLoading(true);
    try {
      // Usar currentPage y pageSize en la llamada a la API
      const { data } = await productosApi.getAll(debouncedSearch || undefined, searchBy, currentPage, pageSize);
      setProductos(data.items || []);
      setTotalItems(data.totalCount || 0);
    } catch { toast.error('Error al cargar productos'); }
    setLoading(false);
  };

  useEffect(() => { loadProductos(); }, [debouncedSearch, searchBy, currentPage, pageSize]);

  // Si hay búsqueda, se reseteará la página a 1
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, searchBy]);

  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedProductos = productos; // La API ya devuelve los paginados
  const searchKind: SearchInputKind = searchBy === 'codigo' ? 'producto_codigo' : 'producto';

  const handleSearchByChange = (value: string) => {
    const nextKind: SearchInputKind = value === 'codigo' ? 'producto_codigo' : 'producto';
    setSearchBy(value);
    setSearch(sanitizeSearchValue(search, nextKind));
  };

  const handleSearchChange = (value: string) => {
    setSearch(sanitizeSearchValue(value, searchKind));
  };

  const handleFormChange = (field: keyof ProductoForm, value: string | number | boolean) => {
    if (field === 'nombre' || field === 'descripcion') {
      const text = typeof value === 'string' ? value : '';
      const limited = field === 'nombre'
        ? text.slice(0, FIELD_LENGTHS.productoNombre)
        : text.slice(0, FIELD_LENGTHS.productoDescripcion);
      setForm(prev => ({ ...prev, [field]: capitalizeFirst(limited) }));
      setFieldErrors(validarCampos({ ...form, [field]: capitalizeFirst(limited) }));
      return;
    }
    setForm(prev => ({ ...prev, [field]: value as never }));
  };

  const handleBlur = (field: keyof ProductoForm) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setFieldErrors(validarCampos(form));
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setPrecioStr('0');
    setStockStr('0');
    setFieldErrors({});
    setTouched({});
    setModalOpen(true);
  };
  const openEdit = (p: Producto) => {
    setEditing(p);
    setForm({ codigo: p.codigo, nombre: p.nombre, descripcion: p.descripcion || '', precio: p.precio, stock: p.stock, activo: p.activo });
    setPrecioStr(String(p.precio));
    setStockStr(String(p.stock));
    setFieldErrors({});
    setTouched({});
    setModalOpen(true);
  };

  const requestCloseModal = () => {
    setConfirmCloseOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setConfirmCloseOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    const errors = validarCampos(form);
    setFieldErrors(errors);
    setTouched({ codigo: true, nombre: true, descripcion: true, precio: true, stock: true, activo: true });
    if (Object.keys(errors).length > 0) {
      toast.error('Corrige los errores antes de guardar.');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await productosApi.update(editing.id, form);
        toast.success('Producto actualizado');
      } else {
        await productosApi.create(form);
        toast.success('Producto creado');
      }
      setModalOpen(false);
      loadProductos();
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.isWarning) {
        toast(data.error, { icon: '⚠️', style: { background: '#fef9c3', color: '#a16207', fontWeight: 'bold' } });
      } else {
        toast.error(data?.error || 'Error al guardar');
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePrecioChange = (value: string) => {
    let cleaned = value.replace(/[^0-9.]/g, '');
    cleaned = cleaned.replace(/^0+(?=\d)/, '');
    if (cleaned.startsWith('0') && cleaned.length > 1 && cleaned[1] !== '.') {
      cleaned = cleaned.replace(/^0+/, '');
    }
    const [integerPartRaw, ...decimalParts] = cleaned.split('.');
    const decimalPartRaw = decimalParts.join('');
    const integerPart = integerPartRaw.slice(0, 3);
    const decimalPart = decimalPartRaw.slice(0, 2);
    const nextValue = cleaned.includes('.') ? `${integerPart || '0'}.${decimalPart}` : integerPart;
    if (nextValue === '0') {
      setPrecioStr('');
      setForm(prev => ({ ...prev, precio: 0 }));
      setFieldErrors(validarCampos({ ...form, precio: 0 }));
      return;
    }
    setPrecioStr(nextValue);
    const nextPrecio = nextValue === '' || nextValue === '.' ? 0 : parseFloat(nextValue);
    const nextForm = { ...form, precio: Number.isFinite(nextPrecio) ? nextPrecio : 0 };
    setForm(nextForm);
    setFieldErrors(validarCampos(nextForm));
  };

  const handleStockChange = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '').slice(0, 4);
    setStockStr(cleaned);
    const nextStock = cleaned === '' ? 0 : parseInt(cleaned, 10);
    const nextForm = { ...form, stock: Number.isFinite(nextStock) ? nextStock : 0 };
    setForm(nextForm);
    setFieldErrors(validarCampos(nextForm));
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
      loadProductos();
    } catch { toast.error('Error al eliminar'); }
    setProductoToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
             <CubeIcon className="w-7 h-7 text-white" />
           </div>
           <div>
            <h1 className="text-2xl font-black text-zinc-800 tracking-tighter">Inventario de <span className="text-emerald-600">Productos</span></h1>
            <p className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest">Catálogo y Existencias</p>
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

      {/* Search & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 bg-white p-1.5 border border-zinc-200 rounded-2xl flex items-center gap-2 shadow-sm">
           <div className="relative">
             <select value={searchBy} onChange={e => handleSearchByChange(e.target.value)} className="appearance-none bg-emerald-600 text-white pl-4 pr-8 py-2.5 rounded-xl text-sm font-bold outline-none cursor-pointer shadow-md shadow-emerald-600/20 w-[150px]">
               <option value="codigo" className="bg-white text-zinc-800">Código</option>
               <option value="nombre" className="bg-white text-zinc-800">Nombre</option>
             </select>
             <ChevronDownIcon className="w-3.5 h-3.5 text-white absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
           </div>
           <div className="relative flex-1">
             <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
             <input
                type="text"
                placeholder={getSearchPlaceholder(searchKind)}
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                maxLength={getSearchMaxLength(searchKind)}
                inputMode={getSearchInputMode(searchKind)}
                className="w-full pl-12 pr-4 py-2.5 bg-transparent text-zinc-800 text-sm font-bold placeholder:text-zinc-400 outline-none"
              />
           </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 flex items-center justify-between shadow-sm">
           <div className="flex items-center gap-3">
              <Square3Stack3DIcon className="w-5 h-5 text-emerald-600" />
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total</span>
           </div>
           <span className="text-xl font-black text-emerald-600 font-mono">{totalItems}</span>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200">
              <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Código</th>
              <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Nombre</th>
              <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Descripción</th>
              <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Precio</th>
              <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Stock</th>
              <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-20 text-center text-zinc-400 font-black uppercase text-xs animate-pulse">Consultando Inventario...</td></tr>
            ) : paginatedProductos.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-20 text-center text-zinc-400 font-black uppercase text-xs">Sin coincidencias</td></tr>
            ) : paginatedProductos.map((p) => (
              <tr key={p.id} className="hover:bg-emerald-50/50 transition-colors group">
                <td className="px-6 py-5 font-mono text-zinc-500 text-sm tracking-widest">{p.codigo}</td>
                <td className="px-6 py-5 font-black text-zinc-800 tracking-tighter text-sm">{p.nombre}</td>
                <td className="px-6 py-5 text-sm text-zinc-500 truncate max-w-[200px]" title={p.descripcion}>{p.descripcion || '---'}</td>
                <td className="px-6 py-5 font-mono text-zinc-700 text-sm font-bold">${p.precio.toFixed(2)}</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${p.stock <= 5 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                    <span className="text-sm font-black text-zinc-700 font-mono">{p.stock}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex gap-2 justify-center">
                    <button onClick={() => openEdit(p)} className="p-2.5 text-zinc-400 hover:text-emerald-600 transition-colors bg-zinc-50 rounded-xl border border-zinc-200 hover:border-emerald-200 hover:bg-emerald-50">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-2.5 text-zinc-400 hover:text-red-600 transition-all bg-zinc-50 rounded-xl border border-zinc-200 hover:border-red-200 hover:bg-red-50">
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

      <Modal isOpen={modalOpen} onClose={requestCloseModal} title={editing ? 'EDITAR PRODUCTO' : 'NUEVO PRODUCTO'}>
        <div className="bg-white rounded-2xl p-8 shadow-xl text-zinc-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>

          <div className="flex justify-between items-center pb-6 border-b-2 border-emerald-500/20 mb-6">
            <div>
              <h2 className="text-2xl font-black text-emerald-700 tracking-tighter">ABARROTES VILLARREAL</h2>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">{editing ? 'Editar Producto' : 'Nuevo Producto'}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-zinc-800 uppercase tracking-widest mb-2">Nombre del producto</label>
                <input required value={form.nombre}
                  onChange={e => handleFormChange('nombre', e.target.value)}
                  onBlur={() => handleBlur('nombre')}
                  maxLength={FIELD_LENGTHS.productoNombre}
                  className={inputClass('nombre', touched, fieldErrors)} placeholder="Ej: Arroz 1kg" />
                <FieldError msg={touched.nombre ? fieldErrors.nombre : undefined} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-zinc-800 uppercase tracking-widest mb-2">Código de Barras / Ref</label>
                <input required value={form.codigo}
                  onChange={e => handleFormChange('codigo', e.target.value)}
                  onBlur={() => handleBlur('codigo')}
                  maxLength={FIELD_LENGTHS.codigo}
                  className={inputClass('codigo', touched, fieldErrors)} placeholder="Ej: 1234567890" />
                <FieldError msg={touched.codigo ? fieldErrors.codigo : undefined} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-zinc-800 uppercase tracking-widest mb-2">Precio PVP ($)</label>
                <div className="relative">
                  <BanknotesIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    required
                    type="text"
                    inputMode="decimal"
                    value={precioStr}
                    onFocus={() => { if (precioStr === '0') setPrecioStr(''); }}
                  onBlur={() => {
                      if (precioStr === '') {
                        setPrecioStr('0');
                        setForm(f => ({ ...f, precio: 0 }));
                      }
                      handleBlur('precio');
                    }}
                    onChange={e => handlePrecioChange(e.target.value)}
                    maxLength={6}
                    className={inputClass('precio', touched, fieldErrors, 'pl-12 pr-5')} placeholder="Ej: 1.25" />
                </div>
                <FieldError msg={touched.precio ? fieldErrors.precio : undefined} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-zinc-800 uppercase tracking-widest mb-2">Stock Inicial</label>
                <input
                  required
                  type="text"
                  inputMode="numeric"
                  value={stockStr}
                  onFocus={() => { if (stockStr === '0') setStockStr(''); }}
                  onBlur={() => {
                    if (stockStr === '') {
                      setStockStr('0');
                      setForm(f => ({ ...f, stock: 0 }));
                    }
                    handleBlur('stock');
                  }}
                  onChange={e => handleStockChange(e.target.value)}
                  maxLength={3}
                  className={inputClass('stock', touched, fieldErrors)} placeholder="Ej: 50" />
                <FieldError msg={touched.stock ? fieldErrors.stock : undefined} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-zinc-800 uppercase tracking-widest mb-2">Descripción Detallada</label>
                <textarea value={form.descripcion} onChange={e => handleFormChange('descripcion', e.target.value)} onBlur={() => handleBlur('descripcion')} maxLength={FIELD_LENGTHS.productoDescripcion}
                  className={inputClass('descripcion', touched, fieldErrors, 'resize-none h-24')} placeholder="Ej: Producto de 1 kilogramo" />
              </div>
            </div>
            <div className="flex gap-4 pt-4 border-t-2 border-emerald-500/10">
              <button type="button" onClick={requestCloseModal} disabled={saving} className="flex-1 px-8 py-3.5 border-2 border-zinc-200 text-zinc-500 hover:bg-zinc-50 rounded-xl text-xs font-black uppercase transition-all disabled:opacity-50">CANCELAR</button>
              <button type="submit" disabled={saving} className="flex-1 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-300 disabled:text-zinc-500 disabled:shadow-none text-white rounded-xl text-xs font-black uppercase shadow-lg shadow-emerald-600/20 transition-all">
                {saving ? 'GUARDANDO...' : 'GUARDAR'}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={confirmCloseOpen}
        onClose={() => setConfirmCloseOpen(false)}
        onConfirm={closeModal}
        title="SALIR"
        message="¿Seguro que deseas salir? Se borrarán los datos ingresados."
        confirmText="SÍ, SALIR"
        type="warning"
      />

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="ELIMINAR"
        message="¿Confirmar eliminación?"
        confirmText="ELIMINAR"
        type="danger"
      />
    </div>
  );
}



