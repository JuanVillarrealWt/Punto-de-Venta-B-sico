import { create } from 'zustand';
import type { Producto } from '../api';

export interface CartItem {
  productoId: number;
  codigo: string;
  nombre: string;
  precio: number;
  cantidad: number;
  subtotal: number;
  stockDisponible: number;
}

interface CartState {
  items: CartItem[];
  clienteId: number | null;
  clienteNombre: string;
  porcentajeIva: number;
  observaciones: string;

  // Computed
  subtotal: number;
  montoIva: number;
  total: number;

  // Actions
  addItem: (producto: Producto, cantidad?: number) => void;
  removeItem: (productoId: number) => void;
  updateCantidad: (productoId: number, cantidad: number) => void;
  setCliente: (id: number, nombre: string) => void;
  setObservaciones: (obs: string) => void;
  clearCart: () => void;
  recalculate: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  clienteId: null,
  clienteNombre: '',
  porcentajeIva: 15,
  observaciones: '',
  subtotal: 0,
  montoIva: 0,
  total: 0,

  addItem: (producto, cantidad = 1) => {
    const items = [...get().items];
    const existing = items.find(i => i.productoId === producto.id);

    if (existing) {
      existing.cantidad += cantidad;
      existing.subtotal = existing.precio * existing.cantidad;
    } else {
      items.push({
        productoId: producto.id,
        codigo: producto.codigo,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad,
        subtotal: producto.precio * cantidad,
        stockDisponible: producto.stock,
      });
    }

    set({ items });
    get().recalculate();
  },

  removeItem: (productoId) => {
    set({ items: get().items.filter(i => i.productoId !== productoId) });
    get().recalculate();
  },

  updateCantidad: (productoId, cantidad) => {
    const items = get().items.map(i =>
      i.productoId === productoId
        ? { ...i, cantidad, subtotal: i.precio * cantidad }
        : i
    );
    set({ items });
    get().recalculate();
  },

  setCliente: (id, nombre) => set({ clienteId: id, clienteNombre: nombre }),
  setObservaciones: (obs) => set({ observaciones: obs }),

  clearCart: () =>
    set({
      items: [],
      clienteId: null,
      clienteNombre: '',
      observaciones: '',
      subtotal: 0,
      montoIva: 0,
      total: 0,
    }),

  recalculate: () => {
    const { items, porcentajeIva } = get();
    const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
    const montoIva = Math.round(subtotal * (porcentajeIva / 100) * 100) / 100;
    set({ subtotal, montoIva, total: subtotal + montoIva });
  },
}));
