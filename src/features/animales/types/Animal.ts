export interface Animal {
  id: string;
  arete: string;
  nombre?: string;
  sexo: 'M' | 'H';
  fechaNacimiento: string;
  raza?: string;
  
  // Pesos (kg)
  pesoInicial: number;      // Peso al nacer/destete
  pesoActual: number;       // Peso corporal actual
  
  // Genealogía
  padreNro?: string;
  madreNro?: string;
  
  // Estado reproductivo (machos siempre 'ninguno')
  estadoReproductivo: 'vacia' | 'preñada' | 'lactancia' | 'secado' | 'ninguno';
  totalPartos: number;
  fechaInseminacion?: string;
  fechaProbableParto?: string;
  
  // Producción de leche (desnormalizado)
  ultimoPesajeLitros: number;
  promedioLitros: number;
  
  // Estado general
  estadoVida: 'activa' | 'muerta' | 'descartada';
  loteId?: string;
  
  // Sincronización
  sincronizado: 0 | 1;
  fechaActualizacion: string;
}

