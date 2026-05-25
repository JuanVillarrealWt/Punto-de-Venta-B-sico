import { useState, useEffect } from 'react';
import { useCartStore } from '../store/cartStore';
import { facturasApi, clientesApi, MetodosPago, type Factura } from '../api';
import { 
  UserIcon, 
  ShoppingCartIcon, 
  TrashIcon, 
  PlusIcon, 
  MinusIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon,
  ChatBubbleBottomCenterTextIcon,
  TagIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { ClienteSearchModal, ProductoSearchModal } from '../components/SearchModals';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';

export default function FacturacionPage() {
  const cart = useCartStore();
  const [clienteModal, setClienteModal] = useState(false);
  const [nuevoClienteModal, setNuevoClienteModal] = useState(false);
  const [nuevoClienteForm, setNuevoClienteForm] = useState({
    identificacion: '',
    nombre: '',
    apellido: '',
    direccion: '',
    telefono: '',
    email: ''
  });
  const [productoModal, setProductoModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savingCliente, setSavingCliente] = useState(false);
  const [ventaExitosa, setVentaExitosa] = useState<Factura | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [confirmEliminarItem, setConfirmEliminarItem] = useState<number | null>(null);
  const [confirmCancelarVenta, setConfirmCancelarVenta] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleFinalizar = async () => {
    if (cart.items.length === 0) return toast.error('La venta está vacía');
    if (!cart.clienteId) return toast.error('Debe seleccionar un cliente');
    
    const stockError = cart.items.find(i => i.cantidad > i.stockDisponible);
    if (stockError) return toast.error(`Stock insuficiente para: ${stockError.nombre}`);

    setLoading(true);
    try {
      const { data } = await facturasApi.crear({
        clienteId: cart.clienteId,
        metodoPagoId: cart.metodoPagoId,
        porcentajeIva: cart.porcentajeIva,
        observaciones: cart.observaciones,
        items: cart.items.map(i => ({ productoId: i.productoId, cantidad: i.cantidad }))
      });
      setVentaExitosa(data);
      cart.clearCart();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al procesar la venta');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCantidad = (id: number, cant: number, stock: number) => {
    if (cant > stock) {
      toast.error('Cantidad supera el stock disponible');
      return;
    }
    cart.updateCantidad(id, Math.max(1, cant));
  };

  const descargarFactura = async () => {
    if (!ventaExitosa) return;
    try {
      const { data } = await facturasApi.descargarPdf(ventaExitosa.id);
      const url = window.URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `Factura_${ventaExitosa.numeroFactura}.pdf`;
      a.click();
      setVentaExitosa(null);
    } catch { toast.error('Error al generar PDF'); }
  };

  const handleCrearClienteRapido = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingCliente) return;
    setSavingCliente(true);
    try {
      const { data } = await clientesApi.create({
        ...nuevoClienteForm,
        activo: true
      });
      cart.setCliente(data.id, `${data.nombre} ${data.apellido}`);
      setNuevoClienteModal(false);
      setNuevoClienteForm({ identificacion: '', nombre: '', apellido: '', direccion: '', telefono: '', email: '' });
      toast.success('Cliente creado y seleccionado');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al crear cliente');
    } finally {
      setSavingCliente(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
             <ShoppingCartIcon className="w-7 h-7 text-white" />
           </div>
           <div>
            <h1 className="text-2xl font-black text-zinc-800 tracking-tighter">Nueva <span className="text-emerald-600">Venta</span></h1>
            <p className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest">Punto de Venta Villarreal</p>
           </div>
        </div>
        
        <div className="flex items-center gap-3 bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100">
          <ClockIcon className="w-6 h-6 text-emerald-600 animate-pulse" />
          <div className="text-right">
            <div className="text-xl font-black text-zinc-800 font-mono leading-none tracking-tighter">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
            <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-black mt-1">{currentTime.toLocaleDateString([], { day: 'numeric', month: 'short' })}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 flex flex-col bg-white rounded-2xl border border-zinc-200 overflow-hidden min-h-[550px] shadow-sm">
          <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex items-center gap-3">
            {cart.clienteId ? (
              <div className="flex items-center gap-3 px-5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                <UserIcon className="w-4 h-4 text-emerald-600" />
                <span className="text-[10px] font-black uppercase text-zinc-800 truncate max-w-[150px]">{cart.clienteNombre}</span>
                <button onClick={() => cart.setCliente(null, '')} className="p-1 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all text-zinc-400"><XMarkIcon className="w-3.5 h-3.5" /></button>
              </div>
            ) : (
              <>
                <button onClick={() => setClienteModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-white text-zinc-500 border border-zinc-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-emerald-300 hover:text-emerald-600 transition-all active:scale-95"><UserIcon className="w-4 h-4" /> SELECCIONAR CLIENTE</button>
                <button onClick={() => setNuevoClienteModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-white text-zinc-500 border border-zinc-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-emerald-300 hover:text-emerald-600 transition-all active:scale-95"><PlusIcon className="w-4 h-4" /> NUEVO CLIENTE</button>
              </>
            )}
            <button onClick={() => setProductoModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"><PlusIcon className="w-4 h-4" /> AGREGAR ARTÍCULO</button>
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead className="bg-zinc-50 border-b border-zinc-200 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Artículo / Detalle</th>
                  <th className="px-4 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">P. Unit</th>
                  <th className="px-4 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center">Cant.</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Subtotal</th>
                  <th className="px-4 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {cart.items.map(item => (
                  <tr key={item.productoId} className="hover:bg-emerald-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <p className="font-black text-zinc-800 text-sm uppercase">{item.nombre}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                         <span className="text-[9px] font-black text-zinc-500 font-mono bg-zinc-50 px-2 py-0.5 rounded border border-zinc-200">{item.codigo}</span>
                         <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${item.stockDisponible <= 5 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                           {item.stockDisponible} EN STOCK
                         </span>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-right font-black text-zinc-500 text-sm">${item.precio.toFixed(2)}</td>
                    <td className="px-4 py-5 text-center">
                      <div className="inline-flex items-center bg-zinc-50 rounded-xl p-1 border border-zinc-200">
                        <button onClick={() => handleUpdateCantidad(item.productoId, item.cantidad - 1, item.stockDisponible)} className="p-1.5 text-zinc-400 hover:text-zinc-700 transition-colors"><MinusIcon className="w-3.5 h-3.5" /></button>
                        <input 
                          type="number"
                          min="1"
                          max={item.stockDisponible}
                          value={item.cantidad}
                          onChange={(e) => {
                             const val = parseInt(e.target.value);
                             if (!isNaN(val)) handleUpdateCantidad(item.productoId, val, item.stockDisponible);
                          }}
                          className="w-12 text-center font-black text-sm text-zinc-800 font-mono bg-transparent outline-none hide-spin-button"
                        />
                        <button onClick={() => handleUpdateCantidad(item.productoId, item.cantidad + 1, item.stockDisponible)} className="p-1.5 text-zinc-400 hover:text-emerald-600 transition-colors"><PlusIcon className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right font-black text-zinc-800 text-sm font-mono">${item.subtotal.toFixed(2)}</td>
                    <td className="px-4 py-5 text-center">
                      <button onClick={() => setConfirmEliminarItem(item.productoId)} className="p-2 text-zinc-300 hover:text-red-600 transition-all"><TrashIcon className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Panel Lateral */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm flex flex-col">
           <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6">Configuración de Cobro</h2>
           <div className="space-y-3 mb-8">
              {MetodosPago.map((m: any) => (
                <button key={m.id} onClick={() => cart.setMetodoPago(m.id)} className={`w-full flex items-center justify-between px-6 py-4 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${cart.metodoPagoId === m.id ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/20' : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:border-emerald-200'}`}>
                  {m.name} {cart.metodoPagoId === m.id && <CheckCircleIcon className="w-4 h-4" />}
                </button>
              ))}
           </div>
           <div className="space-y-2 mb-8">
              <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-2"><ChatBubbleBottomCenterTextIcon className="w-3 h-3" /> Observaciones</label>
              <textarea rows={2} value={cart.observaciones} onChange={(e) => cart.setObservaciones(e.target.value)} placeholder="Notas..." className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-xs font-bold text-zinc-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all resize-none" />
           </div>
           <div className="mt-auto pt-6 border-t border-zinc-200 space-y-4">
              <div className="py-4 border-y border-emerald-100 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Subtotal</span>
                  <span className="text-lg font-black text-zinc-700 font-mono tracking-tighter">${cart.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">IVA ({cart.porcentajeIva}%)</span>
                  <span className="text-lg font-black text-zinc-700 font-mono tracking-tighter">${cart.montoIva.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-emerald-50">
                  <span className="text-[10px] font-black text-zinc-800 uppercase tracking-widest">Total a Cobrar</span>
                  <span className="text-3xl font-black text-emerald-600 font-mono tracking-tighter">${cart.total.toFixed(2)}</span>
                </div>
              </div>
              <button onClick={handleFinalizar} disabled={loading || cart.items.length === 0} className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition-all shadow-xl shadow-emerald-600/20 active:scale-95 text-[10px] uppercase tracking-widest disabled:opacity-30">
                {loading ? 'PROCESANDO...' : 'FINALIZAR VENTA'}
              </button>
              <button onClick={() => setConfirmCancelarVenta(true)} className="w-full py-3.5 bg-transparent border-2 border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all">
                CANCELAR VENTA ACTUAL
              </button>
           </div>
        </div>
      </div>

      <ClienteSearchModal 
        isOpen={clienteModal} 
        onClose={() => setClienteModal(false)} 
        onSelect={(c) => { cart.setCliente(c.id, `${c.nombre} ${c.apellido}`); setClienteModal(false); }} 
        onCreateNew={() => { setClienteModal(false); setNuevoClienteModal(true); }}
      />
      <ProductoSearchModal isOpen={productoModal} onClose={() => setProductoModal(false)} onSelect={(p) => { cart.addItem(p); setProductoModal(false); }} />
      
      <Modal isOpen={nuevoClienteModal} onClose={() => setNuevoClienteModal(false)} title="REGISTRO DE CLIENTE (RÁPIDO)">
        <div className="bg-white rounded-2xl p-8 shadow-xl text-zinc-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>

          <div className="flex justify-between items-center pb-6 border-b-2 border-emerald-500/20 mb-6">
            <div>
              <h2 className="text-2xl font-black text-emerald-700 tracking-tighter">ABARROTES VILLARREAL</h2>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Nuevo Registro de Cliente</p>
            </div>
          </div>

          <form onSubmit={handleCrearClienteRapido} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-[10px] font-black text-zinc-800 uppercase tracking-widest block mb-2 ml-1">Cédula / Identificación</label>
                <input required autoFocus value={nuevoClienteForm.identificacion} onChange={e => setNuevoClienteForm({ ...nuevoClienteForm, identificacion: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-3.5 rounded-xl text-zinc-800 text-sm font-bold outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-black text-zinc-800 uppercase tracking-widest block mb-2 ml-1">Nombre</label>
                <input required value={nuevoClienteForm.nombre} onChange={e => setNuevoClienteForm({ ...nuevoClienteForm, nombre: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-3.5 rounded-xl text-zinc-800 text-sm font-bold outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-black text-zinc-800 uppercase tracking-widest block mb-2 ml-1">Apellido</label>
                <input required value={nuevoClienteForm.apellido} onChange={e => setNuevoClienteForm({ ...nuevoClienteForm, apellido: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-3.5 rounded-xl text-zinc-800 text-sm font-bold outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-black text-zinc-800 uppercase tracking-widest block mb-2 ml-1">Teléfono</label>
                <input value={nuevoClienteForm.telefono} onChange={e => setNuevoClienteForm({ ...nuevoClienteForm, telefono: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-3.5 rounded-xl text-zinc-800 text-sm font-bold outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-black text-zinc-800 uppercase tracking-widest block mb-2 ml-1">Correo Electrónico</label>
                <input type="email" value={nuevoClienteForm.email} onChange={e => setNuevoClienteForm({ ...nuevoClienteForm, email: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-3.5 rounded-xl text-zinc-800 text-sm font-bold outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all" />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-black text-zinc-800 uppercase tracking-widest block mb-2 ml-1">Dirección</label>
                <input value={nuevoClienteForm.direccion} onChange={e => setNuevoClienteForm({ ...nuevoClienteForm, direccion: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-3.5 rounded-xl text-zinc-800 text-sm font-bold outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all" />
              </div>
            </div>
            <div className="flex gap-4 pt-4 border-t-2 border-emerald-500/10">
              <button type="button" onClick={() => setNuevoClienteModal(false)} disabled={savingCliente} className="flex-1 py-3.5 border-2 border-zinc-200 text-zinc-500 hover:bg-zinc-50 rounded-xl text-[10px] font-black uppercase transition-all disabled:opacity-50">CANCELAR</button>
              <button type="submit" disabled={savingCliente} className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-300 disabled:text-zinc-500 disabled:shadow-none text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-emerald-600/20 transition-all">
                {savingCliente ? 'GUARDANDO...' : 'GUARDAR Y SELECCIONAR'}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      <Modal isOpen={!!ventaExitosa} onClose={() => setVentaExitosa(null)} title="COMPROBANTE GENERADO">
        {ventaExitosa && (
          <div className="bg-white rounded-2xl p-8 shadow-xl text-zinc-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>

            {/* Cabecera */}
            <div className="flex justify-between items-center pb-6 border-b-2 border-emerald-500/20 mb-6">
              <div>
                <h2 className="text-2xl font-black text-emerald-700 tracking-tighter">ABARROTES VILLARREAL</h2>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Comprobante de Venta</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">Nº {ventaExitosa.numeroFactura}</p>
              </div>
            </div>

            {/* Mensaje de éxito */}
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-center mb-6">
              <p className="text-sm font-black text-emerald-700">✓ Venta Procesada Exitosamente</p>
            </div>

            {/* Información del Cliente y Vendedor */}
            <div className="grid grid-cols-2 gap-4 mb-6">
               <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                 <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Cliente</p>
                 <p className="text-xs font-bold text-zinc-800 truncate">{ventaExitosa.clienteNombre}</p>
                 <p className="text-[10px] font-mono text-zinc-500 mt-0.5">{ventaExitosa.clienteIdentificacion}</p>
               </div>
               <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                 <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Atendido por</p>
                 <p className="text-xs font-bold text-zinc-800 truncate">{ventaExitosa.vendedorNombre}</p>
                 <p className="text-[10px] font-mono text-zinc-500 mt-0.5">Venta en mostrador</p>
               </div>
            </div>

            {/* Tabla de Productos */}
            <div className="border border-zinc-200 rounded-xl overflow-hidden mb-6 shadow-sm">
               <div className="px-4 py-3 bg-emerald-600 flex items-center gap-2">
                 <TagIcon className="w-4 h-4 text-white" />
                 <span className="text-[10px] font-black text-white uppercase tracking-widest">Resumen de Artículos</span>
               </div>
               <div className="max-h-48 overflow-auto">
                 <table className="w-full text-left text-[11px]">
                   <tbody className="divide-y divide-zinc-100">
                     {ventaExitosa.detalles.map(d => (
                       <tr key={d.id} className="hover:bg-emerald-50/50 transition-colors">
                         <td className="px-4 py-3 font-bold text-zinc-700">{d.productoNombre}</td>
                         <td className="px-4 py-3 text-center text-zinc-500 font-mono">x{d.cantidad}</td>
                         <td className="px-4 py-3 text-right font-black text-emerald-700 font-mono">${d.subtotal.toFixed(2)}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
               <div className="bg-zinc-50 p-4 border-t border-zinc-200 space-y-2">
                 <div className="flex justify-between items-center">
                   <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Subtotal</span>
                   <span className="text-sm font-bold text-zinc-700 font-mono">${ventaExitosa.subtotal.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">IVA ({ventaExitosa.porcentajeIva}%)</span>
                   <span className="text-sm font-bold text-zinc-700 font-mono">${ventaExitosa.montoIva.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-center pt-2 border-t border-zinc-200/50 mt-2">
                   <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Total</span>
                   <span className="text-xl font-black text-emerald-800 font-mono">${ventaExitosa.total.toFixed(2)}</span>
                 </div>
               </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-4 pt-4 border-t-2 border-emerald-500/10">
               <button onClick={() => setVentaExitosa(null)} className="flex-1 py-3.5 border-2 border-zinc-200 text-zinc-500 hover:bg-zinc-50 font-black rounded-xl text-[10px] uppercase transition-all">CERRAR</button>
               <button onClick={descargarFactura} className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-[10px] uppercase flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"><DocumentTextIcon className="w-4 h-4" /> IMPRIMIR</button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal isOpen={!!confirmEliminarItem} onClose={() => setConfirmEliminarItem(null)} onConfirm={() => { if(confirmEliminarItem) cart.removeItem(confirmEliminarItem); setConfirmEliminarItem(null); }} title="QUITAR" message="¿Eliminar artículo?" confirmText="QUITAR" type="danger" />
      <ConfirmModal isOpen={confirmCancelarVenta} onClose={() => setConfirmCancelarVenta(false)} onConfirm={() => { cart.clearCart(); setConfirmCancelarVenta(false); }} title="CANCELAR" message="¿Limpiar venta?" confirmText="SÍ, CANCELAR" type="danger" />
    </div>
  );
}
