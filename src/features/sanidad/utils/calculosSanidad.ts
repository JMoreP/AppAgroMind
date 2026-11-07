import { addMonths, differenceInDays, parseISO, format, isValid } from 'date-fns';
import { TipoEventoSanitario } from '../types/EventoSanitario';

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
 * Retorna la frecuencia en meses según el tipo de evento sanitario.
 * Aftosa, clostridiales, rabia → 6 meses
 * Brucelosis → 12 meses
 * Desparasitación, vitaminas → 3 meses
 * Otros → null (no hay frecuencia automática)
 */
export function obtenerFrecuenciaMeses(tipo: TipoEventoSanitario): number | null {
  switch (tipo) {
    case 'aftosa':
    case 'clostridiales':
    case 'rabia':
      return 6;
    case 'brucelosis':
      return 12;
    case 'desparasitacion':
    case 'vitaminas':
      return 3;
    case 'antibiotico':
    case 'antiinflamatorio':
    case 'mastitis':
    case 'otro':
    default:
      return null;
  }
}

/**
 * Calcula la próxima dosis sumando la frecuencia a la fecha del evento.
 * Retorna null si el tipo no tiene frecuencia automática.
 */
export function calcularProximaDosis(fecha: string, tipo: TipoEventoSanitario): string | null {
  const frecuencia = obtenerFrecuenciaMeses(tipo);
  if (frecuencia === null) {
    return null;
  }

  const d = validarYParsearFecha(fecha, 'evento sanitario');
  const dProxima = addMonths(d, frecuencia);
  return format(dProxima, 'yyyy-MM-dd');
}

/**
 * Retorna los días faltantes hasta una fecha (positivo = falta,
 * negativo = pasó, 0 = hoy).
 */
export function diasHastaFecha(fecha: string): number {
  const dDestino = validarYParsearFecha(fecha, 'fecha objetivo');
  const hoyStr = format(new Date(), 'yyyy-MM-dd');
  const dHoy = parseISO(hoyStr);

  return differenceInDays(dDestino, dHoy);
}

/**
 * Indica si un evento está en ventana de alerta (próxima dosis ≤ 7 días
 * y ≥ 0 días, es decir, entre hoy y los próximos 7 días).
 */
export function estaEnAlerta(proximaDosis?: string): boolean {
  if (!proximaDosis) return false;
  try {
    const dias = diasHastaFecha(proximaDosis);
    return dias >= 0 && dias <= 7;
  } catch {
    return false;
  }
}

/**
 * Indica si un evento está vencido (próxima dosis ya pasó).
 */
export function estaVencido(proximaDosis?: string): boolean {
  if (!proximaDosis) return false;
  try {
    const dias = diasHastaFecha(proximaDosis);
    return dias < 0;
  } catch {
    return false;
  }
}

/**
 * Retorna el label en español para un tipo de evento sanitario.
 */
export function labelTipoEvento(tipo: TipoEventoSanitario): string {
  switch (tipo) {
    case 'aftosa':
      return 'Fiebre Aftosa';
    case 'clostridiales':
      return 'Clostridiales';
    case 'rabia':
      return 'Rabia Paresiante';
    case 'brucelosis':
      return 'Brucelosis (Cepa RB51)';
    case 'desparasitacion':
      return 'Desparasitación';
    case 'vitaminas':
      return 'Vitaminas / Minerales';
    case 'antibiotico':
      return 'Antibiótico';
    case 'antiinflamatorio':
      return 'Antiinflamatorio';
    case 'mastitis':
      return 'Tratamiento Mastitis';
    case 'otro':
    default:
      return 'Otro Tratamiento';
  }
}
