import { differenceInDays, differenceInMonths, parseISO, isValid, addDays, format } from 'date-fns';
import { Ceba } from '../types/Ceba';
import { Especie, obtenerPesoFaenaDefault } from '../../../shared/config/configuracionEspecie';

function validarYParsearFecha(fecha: string, nombreCampo: string): Date {
  if (!fecha || typeof fecha !== 'string') {
    throw new Error(`La fecha para ${nombreCampo} es requerida`);
  }
  const fechaParseada = parseISO(fecha);
  if (!isValid(fechaParseada)) {
    throw new Error(`La fecha "${fecha}" para ${nombreCampo} no tiene un formato válido (YYYY-MM-DD)`);
  }
  return fechaParseada;
}

/**
 * Calcula los días transcurridos entre la fecha de inicio de ceba y la fecha de control.
 */
export function calcularDiasCeba(fechaInicio: string, fechaControl: string): number {
  const dInicio = validarYParsearFecha(fechaInicio, 'fecha de inicio');
  const dControl = validarYParsearFecha(fechaControl, 'fecha de control');

  const dias = differenceInDays(dControl, dInicio);
  return Math.max(0, dias);
}

/**
 * Calcula la ganancia de peso diaria (GP Ceba) en kg/día.
 * Si el peso inicial es 0 o indefinido, o los días <= 0, retorna 0.
 */
export function calcularGananciaPesoDiaria(
  pesoInicial: number,
  pesoActual: number,
  dias: number
): number {
  if (!pesoInicial || pesoInicial <= 0 || !pesoActual || dias <= 0) {
    return 0;
  }
  const ganancia = (pesoActual - pesoInicial) / dias;
  return Number(ganancia.toFixed(2));
}

/**
 * Calcula la edad en meses entre la fecha de nacimiento y una fecha de control.
 */
export function calcularEdadMeses(fechaNacimiento: string, fechaControl: string): number {
  const dNac = validarYParsearFecha(fechaNacimiento, 'fecha de nacimiento');
  const dControl = validarYParsearFecha(fechaControl, 'fecha de control');

  const meses = differenceInMonths(dControl, dNac);
  return Math.max(0, meses);
}

/**
 * Calcula la edad en días entre la fecha de nacimiento y una fecha de control.
 */
export function calcularEdadDias(fechaNacimiento: string, fechaControl: string): number {
  const dNac = validarYParsearFecha(fechaNacimiento, 'fecha de nacimiento');
  const dControl = validarYParsearFecha(fechaControl, 'fecha de control');

  const dias = differenceInDays(dControl, dNac);
  return Math.max(0, dias);
}

/**
 * Determina la etapa actual más avanzada con datos completos (fecha y peso registrados).
 */
export function determinarEtapaActual(ceba: Ceba): 'I' | 'II' | 'III' | 'IV' {
  if (ceba.fechaIV && ceba.pesoIV != null && ceba.pesoIV > 0) {
    return 'IV';
  }
  if (ceba.fechaIII && ceba.pesoIII != null && ceba.pesoIII > 0) {
    return 'III';
  }
  if (ceba.fechaII && ceba.pesoII != null && ceba.pesoII > 0) {
    return 'II';
  }
  return 'I';
}

/**
 * Obtiene el peso más reciente registrado en el ciclo de ceba.
 */
export function calcularPesoActual(ceba: Ceba): number {
  if (ceba.pesoIV != null && ceba.pesoIV > 0) return ceba.pesoIV;
  if (ceba.pesoIII != null && ceba.pesoIII > 0) return ceba.pesoIII;
  if (ceba.pesoII != null && ceba.pesoII > 0) return ceba.pesoII;
  if (ceba.pesoI != null && ceba.pesoI > 0) return ceba.pesoI;
  return 0;
}

/**
 * Proyecta la fecha en que el animal alcanzará el peso objetivo,
 * usando la GP actual como ritmo.
 * Si la GP es 0 o el animal ya superó el objetivo, retorna null.
 */
export function proyectarFechaFaena(
  pesoActual: number,
  pesoObjetivo: number,
  gananciaDiaria: number,
  fechaBase: string
): { fechaEstimada: string; diasRestantes: number } | null {
  if (gananciaDiaria <= 0 || pesoActual >= pesoObjetivo) {
    return null;
  }
  const pesoFaltante = pesoObjetivo - pesoActual;
  const diasRestantes = Math.ceil(pesoFaltante / gananciaDiaria);
  if (diasRestantes <= 0) {
    return null;
  }

  const dBase = validarYParsearFecha(fechaBase, 'fecha base');
  const dEstimada = addDays(dBase, diasRestantes);
  const fechaEstimada = format(dEstimada, 'yyyy-MM-dd');

  return {
    fechaEstimada,
    diasRestantes,
  };
}

/**
 * Retorna el progreso del animal hacia el peso objetivo (0-100).
 */
export function calcularProgresoFaena(
  pesoInicial: number,
  pesoActual: number,
  pesoObjetivo: number
): number {
  if (pesoObjetivo <= pesoInicial) {
    return pesoActual >= pesoObjetivo ? 100 : 0;
  }
  const progreso = ((pesoActual - pesoInicial) / (pesoObjetivo - pesoInicial)) * 100;
  return Math.max(0, Math.min(100, Number(progreso.toFixed(1))));
}

/**
 * Construye la serie de puntos (fecha, peso) para la gráfica de crecimiento,
 * a partir de las etapas completadas de una ceba.
 */
export function construirSerieCrecimiento(
  ceba: Ceba
): Array<{ fecha: string; peso: number; etapa: 'I' | 'II' | 'III' | 'IV' }> {
  const puntos: Array<{ fecha: string; peso: number; etapa: 'I' | 'II' | 'III' | 'IV' }> = [];

  if (ceba.fechaInicio && ceba.pesoI != null && ceba.pesoI > 0) {
    puntos.push({ fecha: ceba.fechaInicio, peso: ceba.pesoI, etapa: 'I' });
  }
  if (ceba.fechaII && ceba.pesoII != null && ceba.pesoII > 0) {
    puntos.push({ fecha: ceba.fechaII, peso: ceba.pesoII, etapa: 'II' });
  }
  if (ceba.fechaIII && ceba.pesoIII != null && ceba.pesoIII > 0) {
    puntos.push({ fecha: ceba.fechaIII, peso: ceba.pesoIII, etapa: 'III' });
  }
  if (ceba.fechaIV && ceba.pesoIV != null && ceba.pesoIV > 0) {
    puntos.push({ fecha: ceba.fechaIV, peso: ceba.pesoIV, etapa: 'IV' });
  }

  return puntos;
}

/**
 * Retorna el peso objetivo de faena por defecto según la especie del animal.
 */
export function obtenerPesoObjetivoPorEspecie(especie: Especie): number {
  return obtenerPesoFaenaDefault(especie);
}
