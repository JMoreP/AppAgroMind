export interface PesajeLeche {
  id: string;
  animalId: string;
  fecha: string; // YYYY-MM-DD
  turno: 'mañana' | 'tarde';
  litros: number;
  observaciones?: string;
  sincronizado: 0 | 1;
  fechaActualizacion: string;
}

export interface PesajeConAnimal extends PesajeLeche {
  arete: string;
  nombre?: string;
  raza?: string;
  loteId?: string;
}

export interface PuntoProduccionDiaria {
  fecha: string; // YYYY-MM-DD
  litros: number;
}

export interface AlertaCaidaProduccionInfo {
  hayAlerta: boolean;
  porcentajeCaida: number;
  promedioReciente: number;
  promedioPrevio: number;
  nivelRiesgo: 'critico' | 'moderado' | 'normal' | 'insuficiente';
  mensaje: string;
}

export interface ResumenPDPAnimal {
  litrosHoy: number;
  pdp7Dias: number;
  totalLitros7Dias: number;
  diasRegistrados7: number;
  pdp30Dias: number;
  totalLitros30Dias: number;
  diasRegistrados30: number;
  alertaCaida: AlertaCaidaProduccionInfo;
}

export interface MetricaHatoDiaria {
  fecha: string;
  litros: number;
  bufalas: number;
  pdp: number;
}

export interface ProductoraTopRanking {
  posicion: number;
  animalId: string;
  arete: string;
  nombre?: string;
  raza?: string;
  totalLitros: number;
  pdpIndividual: number;
  diasRegistrados: number;
}

export interface AlertaHatoProduccion {
  animalId: string;
  arete: string;
  nombre?: string;
  porcentajeCaida: number;
  promedioReciente: number;
  promedioPrevio: number;
}

