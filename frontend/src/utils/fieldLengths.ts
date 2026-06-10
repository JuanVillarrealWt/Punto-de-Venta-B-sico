export const FIELD_LENGTHS = {
  username: 20,
  password: 10,
  cedula: 10,
  telefono: 10,
  nombrePersona: 20,
  apellidoPersona: 20,
  email: 50,
  direccion: 80,
  productoNombre: 50,
  productoDescripcion: 100,
  codigo: 10,
  observaciones: 120,
  searchPersona: 20,
  searchProducto: 50,
  searchDocumento: 10,
  searchReferencia: 10,
  searchCodigo: 10,
} as const;

export type FieldLengthKey = keyof typeof FIELD_LENGTHS;

export const getFieldMaxLength = (key: FieldLengthKey) => FIELD_LENGTHS[key];

export const sliceToMaxLength = (value: string, key: FieldLengthKey) =>
  value.slice(0, FIELD_LENGTHS[key]);
