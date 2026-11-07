export interface Ceba {
  id: string;
  animalId: string;
  fechaNacimiento?: string;
  pesoDestete?: number;
  padreNro?: string;
  raza?: string;
  fechaInicio: string;
  pesoI?: number;
  fechaII?: string;
  pesoII?: number;
  fechaIII?: string;
  pesoIII?: number;
  fechaIV?: string;
  pesoIV?: number;
  pesoObjetivo: number;
  observaciones?: string;
  activo: 0 | 1;
  sincronizado: 0 | 1;
  fechaActualizacion: string;
}

export interface CebaConAnimal extends Ceba {
  areteAnimal: string;
  nombreAnimal?: string;
  especieAnimal?: 'bovino' | 'bufalino';
}
