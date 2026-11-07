export type TipoEventoSanitario =
  | 'aftosa'
  | 'clostridiales'
  | 'rabia'
  | 'brucelosis'
  | 'desparasitacion'
  | 'vitaminas'
  | 'antibiotico'
  | 'antiinflamatorio'
  | 'mastitis'
  | 'otro';

export interface EventoSanitario {
  id: string;
  animalId?: string;
  esGrupal: 0 | 1;
  fecha: string;
  tipo: TipoEventoSanitario;
  producto: string;
  dosis?: string;
  responsable?: string;
  proximaDosis?: string;
  diasRetiroLeche?: number;
  observaciones?: string;
  sincronizado: 0 | 1;
  fechaActualizacion: string;
}

export interface EventoSanitarioConAnimal extends EventoSanitario {
  areteAnimal?: string;
  nombreAnimal?: string;
  especieAnimal?: 'bovino' | 'bufalino';
}
