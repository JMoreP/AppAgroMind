export type DestinoDescarte = 'matadero' | 'venta' | 'consumo_interno' | 'otro';

export interface EventoMortalidad {
  id: string;
  animalId: string;
  fecha: string;
  causa: string;
  observaciones?: string;
  sincronizado: 0 | 1;
  fechaActualizacion: string;
}

export interface EventoDescarte {
  id: string;
  animalId: string;
  fecha: string;
  destino: DestinoDescarte;
  precio?: number;
  observaciones?: string;
  sincronizado: 0 | 1;
  fechaActualizacion: string;
}

export interface EventoMortalidadConAnimal extends EventoMortalidad {
  areteAnimal: string;
  nombreAnimal?: string;
  especieAnimal?: 'bovino' | 'bufalino';
  sexoAnimal?: 'M' | 'H';
}

export interface EventoDescarteConAnimal extends EventoDescarte {
  areteAnimal: string;
  nombreAnimal?: string;
  especieAnimal?: 'bovino' | 'bufalino';
  sexoAnimal?: 'M' | 'H';
}
