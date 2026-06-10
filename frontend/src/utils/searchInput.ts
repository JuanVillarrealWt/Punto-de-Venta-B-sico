export type SearchInputKind =
  | 'cedula'
  | 'documento'
  | 'letras'
  | 'codigo'
  | 'producto'
  | 'referencia'
  | 'usuario'
  | 'producto_codigo';

const MAX_LENGTH_BY_KIND: Record<SearchInputKind, number> = {
  cedula: 10,
  documento: 10,
  letras: 20,
  codigo: 10,
  producto: 50,
  referencia: 10,
  usuario: 41,
  producto_codigo: 10,
};

const PLACEHOLDER_BY_KIND: Record<SearchInputKind, string> = {
  cedula: 'Ej: 0912345678',
  documento: 'Ej: 0000000001',
  letras: 'Ej: Juan',
  codigo: 'Ej: PROD001',
  producto: 'Ej: Arroz 2kg',
  referencia: 'Ej: FAC-000001',
  usuario: 'Ej: Juan Perez',
  producto_codigo: 'Ej: PROD001',
};

export function sanitizeSearchValue(value: string, kind: SearchInputKind) {
  let sanitized = value;

  if (kind === 'cedula' || kind === 'documento') {
    sanitized = value.replace(/\D/g, '');
  } else if (kind === 'letras') {
    sanitized = value.replace(/[^\p{L}\s]/gu, '').replace(/\s{2,}/g, ' ');
  } else if (kind === 'codigo') {
    sanitized = value.replace(/[^a-zA-Z0-9_-]/g, '').toUpperCase();
  } else if (kind === 'producto_codigo') {
    sanitized = value.replace(/[^a-zA-Z0-9_-]/g, '').toUpperCase();
  } else if (kind === 'producto') {
    sanitized = value.replace(/[^\p{L}0-9\s.-]/gu, '').replace(/\s{2,}/g, ' ');
  } else if (kind === 'referencia') {
    sanitized = value.replace(/[^a-zA-Z0-9#_-]/g, '').toUpperCase();
  } else if (kind === 'usuario') {
    sanitized = value.replace(/[^\p{L}\s]/gu, '').replace(/\s{2,}/g, ' ');
  }

  return sanitized.slice(0, MAX_LENGTH_BY_KIND[kind]);
}

export function getSearchPlaceholder(kind: SearchInputKind) {
  return PLACEHOLDER_BY_KIND[kind];
}

export function getSearchMaxLength(kind: SearchInputKind) {
  return MAX_LENGTH_BY_KIND[kind];
}

export function getSearchInputMode(kind: SearchInputKind): 'numeric' | 'text' {
  return kind === 'cedula' || kind === 'documento' ? 'numeric' : 'text';
}
