export interface ServicioReproductivo {
  id: string;
  animalId: string;
  fecha: string;
  tipo: 'inseminacion' | 'monta';
  
  // Inseminación
  numeroPajuela?: string;
  razaToro?: string;
  veterinario?: string;
  
  // Monta
  toroNumero?: string;
  toroRaza?: string;
  
  // Resultado
  resultado: 'pendiente' | 'preñada' | 'vacia';
  fechaProbableParto?: string;
  
  observaciones?: string;
  sincronizado: 0 | 1;
  fechaActualizacion: string;
}

export interface ServicioConAnimal extends ServicioReproductivo {
  arete: string;
  nombre?: string;
  raza?: string;
  loteId?: string;
  especie?: 'bovino' | 'bufalino';
}
