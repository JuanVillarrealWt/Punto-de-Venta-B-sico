import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// --- CLIENTES ---
export interface Cliente {
  id: number;
  identificacion: string;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  activo: boolean;
}

export interface ClienteForm {
  identificacion: string;
  nombre: string;
  apellido: string;
  direccion?: string;
  telefono?: string;
  email?: string;
}

export const clientesApi = {
  getAll: (search?: string, searchBy?: string) => api.get<Cliente[]>('/clientes', { params: { search, searchBy } }),
  getById: (id: number) => api.get<Cliente>(`/clientes/${id}`),
  create: (data: ClienteForm) => api.post<Cliente>('/clientes', data),
  update: (id: number, data: ClienteForm) => api.put<Cliente>(`/clientes/${id}`, { id, ...data }),
  delete: (id: number) => api.delete(`/clientes/${id}`),
};

// --- PRODUCTOS ---
export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  activo: boolean;
}

export interface ProductoForm {
  codigo: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
}

export const productosApi = {
  getAll: (search?: string, searchBy?: string) => api.get<Producto[]>('/productos', { params: { search, searchBy } }),
  getById: (id: number) => api.get<Producto>(`/productos/${id}`),
  create: (data: ProductoForm) => api.post<Producto>('/productos', data),
  update: (id: number, data: ProductoForm) => api.put<Producto>(`/productos/${id}`, { id, ...data }),
  delete: (id: number) => api.delete(`/productos/${id}`),
};

// --- FACTURAS ---
export interface FacturaDetalle {
  id: number;
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Factura {
  id: number;
  numeroFactura: string;
  fecha: string;
  clienteId: number;
  clienteNombre: string;
  clienteIdentificacion: string;
  subtotal: number;
  porcentajeIva: number;
  montoIva: number;
  total: number;
  observaciones?: string;
  estado: string;
  detalles: FacturaDetalle[];
}

export interface CrearFacturaRequest {
  clienteId: number;
  porcentajeIva: number;
  observaciones?: string;
  items: { productoId: number; cantidad: number }[];
}

export const facturasApi = {
  getAll: (params?: { desde?: string; hasta?: string; search?: string; searchBy?: string }) =>
    api.get<Factura[]>('/facturas', { params }),
  getById: (id: number) => api.get<Factura>(`/facturas/${id}`),
  crear: (data: CrearFacturaRequest) => api.post<Factura>('/facturas', data),
  anular: (id: number) => api.delete<Factura>(`/facturas/${id}`),
  descargarPdf: (id: number) =>
    api.get(`/facturas/${id}/pdf`, { responseType: 'blob' }),
};

export default api;
