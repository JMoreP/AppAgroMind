export interface Parto {
  id: string;
  animalId: string;
  fecha: string;
  sexoCria: 'M' | 'H';
  pesoCria?: number;
  areteCria?: string;
  observaciones?: string;
  sincronizado: 0 | 1;
  fechaActualizacion: string;
}

export interface PartoConAnimal extends Parto {
  areteMadre: string;
  nombreMadre?: string;
  especieMadre?: 'bovino' | 'bufalino';
}
