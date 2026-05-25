import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor para JWT
api.interceptors.request.use(config => {
  const token = useAuthStore.getState().token;
  if (token) {
    if (typeof config.headers.set === 'function') {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// --- PAGINACION ---
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

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
  activo: boolean;
}

export const clientesApi = {
  getAll: (search?: string, searchBy?: string, page: number = 1, pageSize: number = 10) => 
    api.get<PagedResult<Cliente>>('/clientes', { params: { search, searchBy, page, pageSize } }),
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
  activo: boolean;
}

export const productosApi = {
  getAll: (search?: string, searchBy?: string, page: number = 1, pageSize: number = 10) => 
    api.get<PagedResult<Producto>>('/productos', { params: { search, searchBy, page, pageSize } }),
  getById: (id: number) => api.get<Producto>(`/productos/${id}`),
  create: (data: ProductoForm) => api.post<Producto>('/productos', data),
  update: (id: number, data: ProductoForm) => api.put<Producto>(`/productos/${id}`, { id, ...data }),
  delete: (id: number) => api.delete(`/productos/${id}`),
};

// --- USUARIOS ---
export interface Usuario {
  id: number;
  username: string;
  nombre: string;
  apellido: string;
  cedula?: string;
  email: string;
  roleId: number;
  roleNombre: string;
  activo: boolean;
  bloqueado: boolean;
  intentosFallidos: number;
  fechaCreacion: string;
}

export interface Rol {
  id: number;
  nombre: string;
  descripcion?: string;
}

export const usuariosApi = {
  getAll: () => api.get<Usuario[]>('/usuarios'),
  create: (data: any) => api.post<Usuario>('/usuarios', data),
  update: (id: number, data: any) => api.put<Usuario>(`/usuarios/${id}`, data),
  toggleBloqueo: (id: number) => api.post(`/usuarios/${id}/toggle-bloqueo`),
  getRoles: () => api.get<Rol[]>('/usuarios/roles'),
};

// --- ERROR LOGS ---
export interface ErrorLog {
  id: number;
  message: string;
  exceptionType?: string;
  stackTrace?: string;
  source?: string;
  pantalla?: string;
  evento?: string;
  userId?: number;
  createdAt: string;
}

export const errorLogsApi = {
  getAll: () => api.get<ErrorLog[]>('/errorlogs'),
};

// --- MOVIMIENTOS STOCK ---
export interface MovimientoStock {
  id: number;
  productoId: number;
  productoNombre: string;
  tipo: string;
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
  referencia: string;
  usuarioId: number;
  vendedorNombre: string;
  createdAt: string;
}

export const movimientosApi = {
  getAll: () => api.get<MovimientoStock[]>('/movimientos'),
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
  vendedorNombre: string;
  metodoPagoNombre: string;
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
  metodoPagoId: number;
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

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor de errores (Auto-logout / Refresh Token silencioso)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Evitar bucle si la petición de refresco o login falla con 401
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = 'Bearer ' + token;
            }
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { token, refreshToken, user, setAuth, logout } = useAuthStore.getState();

      if (token && refreshToken && user) {
        try {
          // Llamar al endpoint de refresh usando axios base para no heredar headers expirados
          const refreshRes = await axios.post('/api/auth/refresh', {
            accessToken: token,
            refreshToken: refreshToken,
          });

          const { token: newAccessToken, refreshToken: newRefreshToken } = refreshRes.data;

          // Guardar nuevos tokens en el store
          setAuth(user, newAccessToken, newRefreshToken);

          processQueue(null, newAccessToken);
          isRefreshing = false;

          // Reintentar la petición original con el nuevo token
          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
          }
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          isRefreshing = false;
          logout();
          window.location.href = '/';
          return Promise.reject(refreshError);
        }
      } else {
        logout();
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  }
);

export const MetodosPago = [
  { id: 1, name: 'Efectivo' }
];

export default api;
