export interface Lote {
  id: string;
  nombre: string;
  descripcion?: string;
  colorHex: string;
  sincronizado: 0 | 1;
  fechaActualizacion: string;
}
