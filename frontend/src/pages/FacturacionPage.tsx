import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { clientesApi, productosApi, facturasApi } from '../api';
import type { Cliente, Producto } from '../api';
import { useCartStore } from '../store/cartStore';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { UserIcon, CubeIcon, TrashIcon, MagnifyingGlassIcon, ClockIcon, CheckCircleIcon, DocumentArrowDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import TablePagination from '../components/TablePagination';
import { ClienteSearchModal, ProductoSearchModal } from '../components/SearchModals';

import { useDebounce } from '../hooks/useDebounce';

export default function FacturacionPage() {
  const cart = useCartStore();
  const [clienteModal, setClienteModal] = useState(false);
  const [productoModal, setProductoModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<{ id: number; name: string } | null>(null);
  const [ventaExitosa, setVentaExitosa] = useState<any>(null);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const selectCliente = (c: Cliente) => {
    cart.setCliente(c.id, `${c.nombre} ${c.apellido}`);
    setClienteModal(false);
  };

  const selectProducto = (p: Producto) => {
    if (p.stock <= 0) { toast.error('Sin stock'); return; }
    cart.addItem(p);
    setProductoModal(false);
    toast.success(`${p.nombre} agregado`);
  };

  const finalizarVenta = async () => {
    if (!cart.clienteId) { toast.error('Seleccione un cliente'); return; }
    if (cart.items.length === 0) { toast.error('Agregue productos'); return; }
    setProcessing(true);
    try {
      const res = await facturasApi.crear({
        clienteId: cart.clienteId,
        porcentajeIva: cart.porcentajeIva,
        observaciones: cart.observaciones,
        items: cart.items.map(i => ({ productoId: i.productoId, cantidad: i.cantidad })),
      });
      setVentaExitosa(res.data);
      toast.success('¡Venta realizada con éxito!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al procesar');
    }
    setProcessing(false);
  };

  const descargarPdf = async () => {
    if (!ventaExitosa) return;
    try {
      const { data } = await facturasApi.descargarPdf(ventaExitosa.id);
      const url = window.URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `Factura_${ventaExitosa.numeroFactura}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF descargado');
    } catch {
      toast.error('Error al descargar PDF');
    }
  };

  const nuevaVenta = () => {
    cart.clearCart();
    setVentaExitosa(null);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Facturación</h1>
          <p className="text-sm text-gray-500">Abarrotes Villarreal • Punto de Venta</p>
        </div>
        <div className="flex items-center gap-4 bg-teal-50 px-4 py-2 rounded-xl border border-teal-100">
          <ClockIcon className="w-8 h-8 text-teal-600 animate-pulse" />
          <div className="text-right">
            <div className="text-2xl font-mono font-bold text-teal-700 leading-none">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-[10px] text-teal-600 uppercase tracking-widest font-bold mt-1">
              {currentTime.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-6 min-h-0">
        {/* Left: Cart */}
        <div className="col-span-2 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Cliente bar */}
          <div className="p-4 border-b border-gray-200 flex items-center gap-3">
            <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden border border-transparent focus-within:border-teal-500 transition-all">
              <button onClick={() => setClienteModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-200 text-sm transition-colors">
                <UserIcon className="w-4 h-4 text-gray-500" />
                <span className="font-bold text-gray-700">{cart.clienteNombre || 'Seleccionar Cliente'}</span>
              </button>
              {!!cart.clienteId && (
                <button 
                  onClick={() => cart.setCliente(0, '')}
                  className="pr-3 pl-1 py-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors border-l border-gray-200"
                  title="Quitar cliente"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
            </div>
            <button onClick={() => setProductoModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-600 rounded-xl text-sm font-bold transition-colors">
              <CubeIcon className="w-4 h-4" /> Agregar Producto
            </button>
          </div>

          {/* Items table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b sticky top-0">
                <tr>
                  <th className="text-left px-4 py-2.5 text-sm font-bold text-gray-700 uppercase tracking-tight">Producto</th>
                  <th className="text-right px-4 py-2.5 text-sm font-bold text-gray-700 uppercase tracking-tight">Precio</th>
                  <th className="text-center px-4 py-2.5 text-sm font-bold text-gray-700 uppercase tracking-tight">Cantidad</th>
                  <th className="text-right px-4 py-2.5 text-sm font-bold text-gray-700 uppercase tracking-tight">Subtotal</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cart.items.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-16 text-center text-gray-400">
                    <CubeIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    Agregue productos para comenzar
                  </td></tr>
                ) : cart.items.map(item => (
                  <tr key={item.productoId} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-bold text-gray-800 text-base">{item.nombre}</div>
                      <div className="text-sm text-gray-600 font-medium">{item.codigo} • Stock: <span className="text-gray-800">{item.stockDisponible}</span></div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-700">${item.precio.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      <input type="number" min={1} max={item.stockDisponible} value={item.cantidad}
                        onChange={e => cart.updateCantidad(item.productoId, Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm text-center font-bold focus:ring-2 focus:ring-teal-500" />
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-700">${item.subtotal.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => {
                          setItemToRemove({ id: item.productoId, name: item.nombre });
                          setConfirmOpen(true);
                        }} 
                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Summary */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-4">
            <h2 className="font-semibold text-gray-800">Resumen</h2>
            <div className="space-y-2 text-base">
              <div className="flex justify-between text-gray-600 font-medium"><span>Subtotal</span><span>${cart.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-600 font-medium"><span>IVA ({cart.porcentajeIva}%)</span><span>${cart.montoIva.toFixed(2)}</span></div>
              <div className="border-t border-gray-200 pt-2 flex justify-between text-lg font-bold text-gray-800">
                <span>Total</span><span>${cart.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">Observaciones</label>
            <textarea rows={3} value={cart.observaciones} onChange={e => cart.setObservaciones(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium resize-none focus:ring-2 focus:ring-teal-500" placeholder="Opcional..." />
          </div>
          <button onClick={finalizarVenta} disabled={processing || cart.items.length === 0}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-emerald-500/25">
            {processing ? 'Procesando...' : '✓ Finalizar Venta'}
          </button>
          <button 
            onClick={() => setCancelConfirmOpen(true)} 
            disabled={processing || (cart.items.length === 0 && !cart.clienteId)}
            className="w-full py-2.5 mt-2 bg-white border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-xl font-bold text-xs transition-all uppercase tracking-wider"
          >
            Limpiar / Cancelar
          </button>
        </div>
      </div>

      {/* Modal Buscar Cliente */}
      <ClienteSearchModal
        isOpen={clienteModal}
        onClose={() => setClienteModal(false)}
        onSelect={selectCliente}
      />

      {/* Modal Buscar Producto */}
      <ProductoSearchModal
        isOpen={productoModal}
        onClose={() => setProductoModal(false)}
        onSelect={selectProducto}
      />

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => { setConfirmOpen(false); setItemToRemove(null); }}
        onConfirm={() => itemToRemove && cart.removeItem(itemToRemove.id)}
        title="Quitar Producto"
        message={`¿Está seguro de quitar "${itemToRemove?.name}" del carrito?`}
        confirmText="Quitar"
        type="warning"
      />

      <ConfirmModal
        isOpen={cancelConfirmOpen}
        onClose={() => setCancelConfirmOpen(false)}
        onConfirm={() => { nuevaVenta(); setCancelConfirmOpen(false); }}
        title="¿Cancelar Venta?"
        message="Se borrarán todos los productos del carrito y el cliente seleccionado. Esta acción no se puede deshacer."
        confirmText="Sí, Cancelar"
        type="danger"
      />

      {/* Modal Venta Exitosa */}
      <Modal isOpen={!!ventaExitosa} onClose={nuevaVenta} title="¡Venta Completada!" size="md">
        <div className="flex flex-col items-center text-center max-h-[75vh] overflow-y-auto px-1">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircleIcon className="w-12 h-12 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">¡Transacción Exitosa!</h2>
          <p className="text-gray-500 mb-6">La factura ha sido generada correctamente.</p>
          
          <div className="w-full bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100 text-left space-y-3">
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500 text-sm font-medium">Nº Factura</span>
              <span className="font-mono font-bold text-teal-600">{ventaExitosa?.numeroFactura}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Cliente</span>
              <span className="font-semibold text-gray-700">{ventaExitosa?.clienteNombre}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Fecha</span>
              <span className="font-medium text-gray-700">{ventaExitosa && new Date(ventaExitosa.fecha).toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-2 text-lg font-bold text-gray-800">
              <span>Total Pagado</span>
              <span className="text-emerald-600">${ventaExitosa?.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="w-full text-left mb-6">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Detalle de Productos</h4>
            <div className="h-48 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-200 border border-gray-50 rounded-2xl p-2">
              {ventaExitosa?.detalles.map((d: any) => (
                <div key={d.id} className="flex justify-between items-center text-sm bg-gray-50/50 p-2 rounded-xl border border-gray-100/50">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-700">{d.productoNombre}</span>
                    <span className="text-[10px] text-gray-400">Cant: {d.cantidad} • P.U: ${d.precioUnitario.toFixed(2)}</span>
                  </div>
                  <span className="font-bold text-gray-700">${d.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full">
            <button
              onClick={descargarPdf}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white border-2 border-emerald-500 text-emerald-600 rounded-2xl font-bold hover:bg-emerald-50 transition-all active:scale-95"
            >
              <DocumentArrowDownIcon className="w-5 h-5" />
              Descargar PDF
            </button>
            <button
              onClick={nuevaVenta}
              className="px-6 py-3.5 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 active:scale-95"
            >
              Nueva Venta
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
