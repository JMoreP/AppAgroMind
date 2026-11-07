export interface DiagnosticoPrenez {
  id: string;
  animalId: string;
  servicioId?: string;
  fecha: string;
  resultado: 'preñada' | 'vacia';
  metodo?: 'palpacion' | 'ecografia' | 'otro';
  veterinario?: string;
  observaciones?: string;
  sincronizado: 0 | 1;
  fechaActualizacion: string;
}

export interface DiagnosticoConAnimal extends DiagnosticoPrenez {
  animalArete?: string;
  animalNombre?: string;
  animalEspecie?: 'bovino' | 'bufalino';
}
