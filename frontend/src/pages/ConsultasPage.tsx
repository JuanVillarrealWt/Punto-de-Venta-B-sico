import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { facturasApi } from '../api';
import type { Factura } from '../api';
import Modal from '../components/Modal';
import { EyeIcon, MagnifyingGlassIcon, ClockIcon, ChevronDownIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import TablePagination from '../components/TablePagination';

export default function ConsultasPage() {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [search, setSearch] = useState('');
  const [searchEntity, setSearchEntity] = useState('factura');
  const [clienteSearchType, setClienteSearchType] = useState('cliente_identificacion');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [detalle, setDetalle] = useState<Factura | null>(null);
  const [confirmAnular, setConfirmAnular] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const buscar = async () => {
    try {
      const { data } = await facturasApi.getAll({
        search: search || undefined,
        searchBy: searchEntity === 'factura' ? 'factura' : clienteSearchType,
        desde: desde || undefined,
        hasta: hasta || undefined,
      });
      setFacturas(Array.isArray(data) ? data : []);
    } catch {}
  };

  useEffect(() => {
    const timer = setTimeout(() => { buscar(); setCurrentPage(1); }, 400);
    return () => clearTimeout(timer);
  }, [search, desde, hasta, searchEntity, clienteSearchType]);

  const totalPages = Math.ceil((facturas?.length || 0) / pageSize);
  const paginatedFacturas = (facturas || []).slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const descargarPdf = async (id: number, numero: string) => {
    try {
      const { data } = await facturasApi.descargarPdf(id);
      const url = window.URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `Factura_${numero}.pdf`;
      a.click();
    } catch {
      toast.error('Error PDF');
    }
  };

  const handleAnular = async () => {
    if (!detalle) return;
    try {
      await facturasApi.anular(detalle.id);
      toast.success('Factura anulada');
      setConfirmAnular(false);
      setDetalle(null);
      buscar();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
             <MagnifyingGlassIcon className="w-7 h-7 text-white" />
           </div>
           <div>
            <h1 className="text-2xl font-black text-zinc-800 tracking-tighter">Consultas de <span className="text-emerald-600">Ventas</span></h1>
            <p className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest">Historial de Comprobantes</p>
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

      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 flex gap-2 p-1.5 bg-zinc-50 border border-zinc-200 rounded-xl">
              <div className="relative">
                <select value={searchEntity} onChange={e => setSearchEntity(e.target.value)} className="appearance-none bg-emerald-600 text-white pl-4 pr-8 py-2.5 rounded-xl text-sm font-bold outline-none cursor-pointer shadow-md shadow-emerald-600/20 h-full w-[150px]">
                  <option value="factura" className="bg-white text-zinc-800">Nº Doc</option>
                  <option value="cliente" className="bg-white text-zinc-800">Cliente</option>
                </select>
                <ChevronDownIcon className="w-3.5 h-3.5 text-white absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {searchEntity === 'cliente' && (
                <div className="relative">
                  <select value={clienteSearchType} onChange={e => setClienteSearchType(e.target.value)} className="appearance-none bg-emerald-600 text-white pl-4 pr-8 py-2.5 rounded-xl text-sm font-bold outline-none cursor-pointer shadow-md shadow-emerald-600/20 h-full w-[150px]">
                    <option value="cliente_identificacion" className="bg-white text-zinc-800">Cédula</option>
                    <option value="cliente_nombre" className="bg-white text-zinc-800">Nombre</option>
                    <option value="cliente_apellido" className="bg-white text-zinc-800">Apellido</option>
                  </select>
                  <ChevronDownIcon className="w-3.5 h-3.5 text-white absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              )}
              <input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-zinc-800 px-3 text-sm font-bold outline-none placeholder:text-zinc-400" />
          </div>
          <input type="date" value={desde} onChange={e => setDesde(e.target.value)} className="bg-zinc-50 border border-zinc-200 px-4 py-2 rounded-xl text-zinc-800 text-xs font-bold" />
          <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} className="bg-zinc-50 border border-zinc-200 px-4 py-2 rounded-xl text-zinc-800 text-xs font-bold" />
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200">
              <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Factura / Fecha</th>
              <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Cliente</th>
              <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Cajero</th>
              <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center">Estado</th>
              <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Total</th>
              <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {paginatedFacturas.map(f => (
              <tr key={f.id} className="hover:bg-emerald-50/50 transition-colors group">
                <td className="px-6 py-5">
                  <p className="text-sm font-black text-zinc-800">{f.numeroFactura}</p>
                  <p className="text-[9px] font-black text-zinc-400 uppercase mt-1">{f.fecha ? new Date(f.fecha).toLocaleDateString() : '---'}</p>
                </td>
                <td className="px-6 py-5">
                  <p className="text-sm font-black text-zinc-800">{f.clienteNombre}</p>
                  <p className="text-[9px] font-black text-zinc-400 uppercase mt-1 font-mono">{f.clienteIdentificacion}</p>
                </td>
                <td className="px-6 py-5 text-[11px] font-black text-zinc-600 uppercase tracking-widest">
                  {f.vendedorNombre}
                </td>
                <td className="px-6 py-5 text-center">
                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] border ${f.estado === 'ANULADA' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                    {f.estado}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                   <p className="text-lg font-black text-emerald-600 font-mono tracking-tighter">${f.total?.toFixed(2)}</p>
                </td>
                <td className="px-6 py-5 flex justify-center gap-2">
                  <button onClick={() => setDetalle(f)} className="p-2.5 text-zinc-400 hover:text-emerald-600 bg-zinc-50 border border-zinc-200 hover:border-emerald-200 hover:bg-emerald-50 rounded-xl transition-all"><EyeIcon className="w-4.5 h-4.5" /></button>
                  <button onClick={() => descargarPdf(f.id, f.numeroFactura)} className="p-2.5 text-zinc-400 hover:text-emerald-600 bg-zinc-50 border border-zinc-200 hover:border-emerald-200 hover:bg-emerald-50 rounded-xl transition-all"><DocumentArrowDownIcon className="w-4.5 h-4.5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <TablePagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} pageSize={pageSize} onPageSizeChange={setPageSize} totalItems={facturas.length} />
      </div>

      <Modal isOpen={!!detalle} onClose={() => setDetalle(null)} title={`RECIBO DE VENTA - ${detalle?.numeroFactura}`}>
        {detalle && (
          <div className="bg-white rounded-2xl p-8 shadow-xl text-zinc-800 relative overflow-hidden">
            
            {/* Elemento de diseño de fondo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>

            {/* Cabecera Principal */}
            <div className="flex justify-between items-center pb-6 border-b-2 border-emerald-500/20 mb-6">
              <div>
                <h2 className="text-3xl font-black text-emerald-700 tracking-tighter">ABARROTES VILLARREAL</h2>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Factura Electrónica</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">Nº {detalle.numeroFactura}</p>
              </div>
            </div>

            {/* Datos Cliente y Factura */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                <p className="text-[10px] text-emerald-600 uppercase font-black tracking-widest mb-2">Facturar A:</p>
                <p className="text-sm font-black text-zinc-800 leading-tight">{detalle.clienteNombre}</p>
                <p className="text-xs font-mono text-zinc-500 mt-1">ID: {detalle.clienteIdentificacion}</p>
              </div>
              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 flex flex-col justify-center">
                <div className="flex justify-between mb-2">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Fecha:</span>
                  <span className="text-xs font-black text-zinc-800">{new Date(detalle.fecha).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Estado:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${detalle.estado === 'ANULADA' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {detalle.estado}
                  </span>
                </div>
              </div>
            </div>

            {/* Tabla de Productos */}
            <div className="border border-zinc-200 rounded-xl overflow-hidden mb-8 shadow-sm">
               <table className="w-full text-left">
                  <thead className="bg-emerald-600">
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-black text-white uppercase tracking-widest">Descripción</th>
                      <th className="px-4 py-3 text-[10px] font-black text-white uppercase tracking-widest text-center">Cant</th>
                      <th className="px-4 py-3 text-[10px] font-black text-white uppercase tracking-widest text-right">P. Unit</th>
                      <th className="px-4 py-3 text-[10px] font-black text-white uppercase tracking-widest text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {detalle.detalles?.map((item: any, i: number) => (
                      <tr key={i} className="hover:bg-emerald-50/50 transition-colors">
                        <td className="px-4 py-3 text-xs font-bold text-zinc-700">{item.productoNombre}</td>
                        <td className="px-4 py-3 text-xs font-mono text-zinc-500 text-center">{item.cantidad}</td>
                        <td className="px-4 py-3 text-xs font-mono text-zinc-500 text-right">${item.precioUnitario.toFixed(2)}</td>
                        <td className="px-4 py-3 text-xs font-mono text-emerald-700 font-black text-right">${item.subtotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>

            {/* Totales y Cajero */}
            <div className="flex justify-between items-end mb-8">
              <div className="bg-zinc-50 px-4 py-3 rounded-xl border border-zinc-100">
                 <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Atendido por:</p>
                 <p className="text-xs font-black text-zinc-700">{detalle.vendedorNombre}</p>
              </div>

              <div className="flex flex-col items-end gap-2 min-w-[200px]">
                 <div className="flex justify-between w-full text-xs font-bold text-zinc-500 uppercase tracking-widest">
                   <span>Subtotal</span>
                   <span className="font-mono text-zinc-700">${detalle.subtotal?.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between w-full text-xs font-bold text-zinc-500 uppercase tracking-widest">
                   <span>IVA ({detalle.porcentajeIva}%)</span>
                   <span className="font-mono text-zinc-700">${detalle.montoIva?.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between w-full text-sm font-black text-emerald-800 uppercase tracking-widest mt-2 bg-emerald-100 px-4 py-2 rounded-xl border border-emerald-200">
                   <span>Total</span>
                   <span className="font-mono">${detalle.total?.toFixed(2)}</span>
                 </div>
              </div>
            </div>

            {/* Acciones */}
            {!confirmAnular ? (
              <div className="flex justify-end gap-3 pt-6 border-t-2 border-emerald-500/10">
                 <button onClick={() => setConfirmAnular(true)} disabled={detalle.estado === 'ANULADA'} className="px-6 py-2.5 border-2 border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 rounded-xl text-[10px] font-black uppercase disabled:opacity-30 transition-all">
                   Anular Factura
                 </button>
                 <button onClick={() => descargarPdf(detalle.id, detalle.numeroFactura)} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2">
                   <DocumentArrowDownIcon className="w-4 h-4" /> Exportar PDF
                 </button>
              </div>
            ) : (
              <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-xl p-5 animate-[fadeIn_0.3s_ease-out]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-red-600 text-lg font-black">!</span>
                  </div>
                  <div>
                    <p className="text-sm font-black text-red-700">¿Anular esta factura?</p>
                    <p className="text-[10px] text-red-400 font-bold">Esta acción no se puede deshacer</p>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button onClick={() => setConfirmAnular(false)} className="px-5 py-2 border-2 border-zinc-200 text-zinc-500 hover:bg-zinc-100 rounded-xl text-[10px] font-black uppercase transition-all">
                    Cancelar
                  </button>
                  <button onClick={handleAnular} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[10px] font-black uppercase transition-all shadow-lg shadow-red-600/20">
                    Sí, Anular
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
