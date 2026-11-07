import { Especie, obtenerGestacionDias } from '../../../shared/config/configuracionEspecie';

/**
 * Utilidades de cálculo reproductivo para bovinos y bufalinos.
 * Funciones puras sin efectos secundarios ni dependencias de repositorios.
 */

/**
 * Calcula la fecha probable de parto sumando los días de gestación correspondientes a la especie:
 * - Bovino: 283 días
 * - Bufalino: 310 días
 * @param fechaServicio - Fecha en formato YYYY-MM-DD
 * @param especie - Especie ('bovino' | 'bufalino')
 * @returns Fecha probable de parto en formato YYYY-MM-DD
 */
export function calcularFechaProbableParto(fechaServicio: string, especie: Especie = 'bufalino'): string {
  try {
    const diasGestacion = obtenerGestacionDias(especie);
    const [año, mes, día] = fechaServicio.split('-').map(Number);
    const fecha = new Date(año, mes - 1, día);
    fecha.setDate(fecha.getDate() + diasGestacion);
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const d = String(fecha.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  } catch {
    return fechaServicio;
  }
}

/**
 * Calcula los días transcurridos desde el servicio hasta hoy.
 * Positivo si la fecha ya pasó, 0 si es hoy.
 * @param fechaServicio - Fecha en formato YYYY-MM-DD
 * @returns Días transcurridos
 */
export function diasDesdeServicio(fechaServicio: string): number {
  try {
    const [año, mes, día] = fechaServicio.split('-').map(Number);
    const fechaInicio = new Date(año, mes - 1, día);
    const hoy = new Date();
    const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const diferenciaMs = hoySinHora.getTime() - fechaInicio.getTime();
    const dias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));
    return Math.max(dias, 0);
  } catch {
    return 0;
  }
}

/**
 * Calcula los días que faltan hasta el parto probable.
 * Positivo si aún falta, 0 si es hoy, negativo si ya pasó.
 * @param fechaProbableParto - Fecha en formato YYYY-MM-DD
 * @returns Días restantes (positivo si falta, negativo si ya pasó)
 */
export function diasHastaParto(fechaProbableParto: string): number {
  try {
    const [año, mes, día] = fechaProbableParto.split('-').map(Number);
    const fechaParto = new Date(año, mes - 1, día);
    const hoy = new Date();
    const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const diferenciaMs = fechaParto.getTime() - hoySinHora.getTime();
    return Math.round(diferenciaMs / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

/**
 * Indica si un servicio está en la ventana óptima de palpación
 * (45 a 60 días después del servicio, inclusive).
 * @param fechaServicio - Fecha en formato YYYY-MM-DD
 * @returns true si está entre los 45 y 60 días
 */
export function estaEnVentanaPalpacion(fechaServicio: string): boolean {
  const dias = diasDesdeServicio(fechaServicio);
  return dias >= 45 && dias <= 60;
}
