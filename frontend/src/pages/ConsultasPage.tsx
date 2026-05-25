import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { facturasApi } from '../api';
import type { Factura } from '../api';
import Modal from '../components/Modal';
import {
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import ConfirmModal from '../components/ConfirmModal';
import TablePagination from '../components/TablePagination';

export default function ConsultasPage() {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [search, setSearch] = useState('');
  const [searchEntity, setSearchEntity] = useState('factura');
  const [searchClientBy, setSearchClientBy] = useState('cliente_nombre');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [loading, setLoading] = useState(false);
  const [detalle, setDetalle] = useState<Factura | null>(null);
  const [confirmAnular, setConfirmAnular] = useState(false);
  const [anulando, setAnulando] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const buscar = async () => {
    setLoading(true);
    const finalSearchBy = searchEntity === 'factura' ? 'factura' : searchClientBy;
    try {
      const { data } = await facturasApi.getAll({
        search: search || undefined,
        searchBy: finalSearchBy,
        desde: desde || undefined,
        hasta: hasta || undefined,
      });
      setFacturas(data);
    } catch {
      toast.error('Error al buscar');
    }
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => { buscar(); setCurrentPage(1); }, 150);
    return () => clearTimeout(timer);
  }, [search, desde, hasta, searchEntity, searchClientBy]);

  const totalPages = Math.ceil(facturas.length / pageSize);
  const paginatedFacturas = facturas.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const descargarPdf = async (id: number, numero: string) => {
    try {
      const { data } = await facturasApi.descargarPdf(id);
      const url = window.URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `Factura_${numero}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF descargado');
    } catch {
      toast.error('Error al descargar PDF');
    }
  };

  const handleAnular = async () => {
    if (!detalle) return;
    setAnulando(true);
    try {
      await facturasApi.anular(detalle.id);
      toast.success(`Factura ${detalle.numeroFactura} anulada. El stock fue revertido.`);
      setConfirmAnular(false);
      setDetalle(null);
      buscar(); // Refrescar lista
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al anular la factura');
    }
    setAnulando(false);
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Consultas</h1>
          <p className="text-sm text-gray-600 font-medium">Abarrotes Villarreal • Historial de facturas</p>
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

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4 flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[350px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Buscar por</label>
          <div className="flex gap-2">
            <select
              value={searchEntity}
              onChange={e => setSearchEntity(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="factura">Nº Factura</option>
              <option value="cliente">Cliente</option>
            </select>
            {searchEntity === 'cliente' && (
              <select
                value={searchClientBy}
                onChange={e => setSearchClientBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="cliente_nombre">Nombre</option>
                <option value="cliente_identificacion">Identificación</option>
              </select>
            )}
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Buscar..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Desde</label>
          <input type="date" value={desde} onChange={e => setDesde(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Hasta</label>
          <input type="date" value={hasta} onChange={e => setHasta(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500" />
        </div>
        {loading && (
          <span className="text-xs text-teal-600 font-medium animate-pulse">Buscando...</span>
        )}
      </div>

      {/* Tabla de resultados */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="text-left px-5 py-3 text-sm font-bold text-gray-700 uppercase tracking-wider">Factura</th>
              <th className="text-left px-5 py-3 text-sm font-bold text-gray-700 uppercase tracking-wider">Fecha</th>
              <th className="text-left px-5 py-3 text-sm font-bold text-gray-700 uppercase tracking-wider">Cliente</th>
              <th className="text-right px-5 py-3 text-sm font-bold text-gray-700 uppercase tracking-wider">Total</th>
              <th className="text-left px-5 py-3 text-sm font-bold text-gray-700 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {facturas.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-gray-400">
                  {loading ? 'Cargando...' : 'No hay facturas activas'}
                </td>
              </tr>
            ) : paginatedFacturas.map(f => (
              <tr key={f.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-mono font-bold text-teal-600">{f.numeroFactura}</td>
                <td className="px-5 py-3 text-gray-800 font-medium">{new Date(f.fecha).toLocaleDateString('es-EC')}</td>
                <td className="px-5 py-3">
                  <div className="font-bold text-gray-900">{f.clienteNombre}</div>
                  <div className="text-sm text-gray-600 font-semibold">{f.clienteIdentificacion}</div>
                </td>
                <td className="px-5 py-3 text-right font-bold text-gray-700 text-base">${f.total.toFixed(2)}</td>
                <td className="px-5 py-3 flex gap-1">
                  <button
                    onClick={() => setDetalle(f)}
                    className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg"
                    title="Ver detalle"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => descargarPdf(f.id, f.numeroFactura)}
                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                    title="Descargar PDF"
                  >
                    <DocumentArrowDownIcon className="w-4 h-4" />
                  </button>
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
          totalItems={facturas.length}
        />
      </div>

      {/* Modal de Detalle */}
      <Modal
        isOpen={!!detalle}
        onClose={() => { setDetalle(null); setConfirmAnular(false); }}
        title={`Factura ${detalle?.numeroFactura || ''}`}
        size="lg"
      >
        {detalle && (
          <div>
            {/* Info cliente/fecha */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100"><span className="text-[10px] text-gray-500 font-black uppercase block mb-1">Cliente</span> <span className="font-bold text-gray-800 text-base">{detalle.clienteNombre}</span></div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100"><span className="text-[10px] text-gray-500 font-black uppercase block mb-1">Fecha de Emisión</span> <span className="font-bold text-gray-800">{new Date(detalle.fecha).toLocaleString('es-EC')}</span></div>
            </div>

            {/* Tabla de productos */}
            <table className="w-full text-sm mb-4">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-black text-gray-600 uppercase tracking-wider">Producto</th>
                  <th className="text-right px-4 py-2.5 text-xs font-black text-gray-600 uppercase tracking-wider">Cant</th>
                  <th className="text-right px-4 py-2.5 text-xs font-black text-gray-600 uppercase tracking-wider">P. Unit</th>
                  <th className="text-right px-4 py-2.5 text-xs font-black text-gray-600 uppercase tracking-wider">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {detalle.detalles.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-gray-800">{d.productoNombre}</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-700">{d.cantidad}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-600">${d.precioUnitario.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-700">${d.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Observaciones */}
            {detalle.observaciones && (
              <div className="mb-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="font-semibold text-gray-700">Observaciones:</span> {detalle.observaciones}
              </div>
            )}

            {/* Totales */}
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-2">
              <div className="flex justify-between text-sm text-gray-600 font-medium">Subtotal: <span className="font-bold text-gray-700">${detalle.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm text-gray-600 font-medium">IVA ({detalle.porcentajeIva}%): <span className="font-bold text-gray-700">${detalle.montoIva.toFixed(2)}</span></div>
              <div className="flex justify-between text-lg font-bold text-teal-600 pt-2 border-t border-gray-200">Total: <span>${detalle.total.toFixed(2)}</span></div>
            </div>

            {/* Sección de Anulación */}
            <div className="mt-5 border-t pt-4">
              <button
                onClick={() => setConfirmAnular(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg text-sm font-medium transition-colors"
              >
                <XCircleIcon className="w-4 h-4" />
                Anular Factura
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={confirmAnular}
        onClose={() => setConfirmAnular(false)}
        onConfirm={handleAnular}
        title="Anular Factura"
        message={`¿Está seguro de anular la factura ${detalle?.numeroFactura}? Esta acción revertirá el stock y no se puede deshacer.`}
        confirmText="Sí, Anular"
        type="danger"
      />
    </div>
  );
}
