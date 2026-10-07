import { useState, useEffect, useCallback } from 'react';
import { PesajeLecheRepository } from '../repositories/PesajeLecheRepository';
import { 
  PesajeLeche, 
  PuntoProduccionDiaria, 
  ResumenPDPAnimal, 
  AlertaCaidaProduccionInfo 
} from '../types/PesajeLeche';

export function useHistorialLeche(animalId?: string) {
  const [cargando, setCargando] = useState(true);
  const [puntosGrafica, setPuntosGrafica] = useState<PuntoProduccionDiaria[]>([]);
  const [pesajesDetallados, setPesajesDetallados] = useState<PesajeLeche[]>([]);
  const [resumenPDP, setResumenPDP] = useState<ResumenPDPAnimal>({
    litrosHoy: 0,
    pdp7Dias: 0,
    totalLitros7Dias: 0,
    diasRegistrados7: 0,
    pdp30Dias: 0,
    totalLitros30Dias: 0,
    diasRegistrados30: 0,
    alertaCaida: {
      hayAlerta: false,
      porcentajeCaida: 0,
      promedioReciente: 0,
      promedioPrevio: 0,
      nivelRiesgo: 'insuficiente',
      mensaje: 'Sin registros para análisis sanitario.',
    },
  });

  const cargarHistorial = useCallback(async () => {
    if (!animalId) {
      setCargando(false);
      return;
    }

    setCargando(true);
    try {
      const hoyISO = new Date().toISOString().split('T')[0];

      // 1. Consultar días con registro (últimos 30 días, ordenados ASC cronológico)
      // y pesajes detallados
      const [diasRegistrados, pesajesRecientes, pesajesHoy] = await Promise.all([
        PesajeLecheRepository.getDiasConRegistro(animalId, 30),
        PesajeLecheRepository.getUltimosPesajesAnimal(animalId, 60),
        PesajeLecheRepository.getByAnimalYFecha(animalId, hoyISO),
      ]);

      setPuntosGrafica(diasRegistrados);
      setPesajesDetallados(pesajesRecientes);

      // 2. Litros del día de hoy
      const litrosHoyCalculado = pesajesHoy.reduce((acc, p) => acc + p.litros, 0);

      // 3. Cálculos de PDP (Promedio Diario de Producción)
      // PDP individual = promedio de (mañana + tarde) sobre N días
      const ultimos7 = diasRegistrados.slice(-7);
      const total7 = ultimos7.reduce((acc, d) => acc + d.litros, 0);
      const pdp7 = ultimos7.length > 0 ? Number((total7 / ultimos7.length).toFixed(2)) : 0;

      const ultimos30 = diasRegistrados.slice(-30);
      const total30 = ultimos30.reduce((acc, d) => acc + d.litros, 0);
      const pdp30 = ultimos30.length > 0 ? Number((total30 / ultimos30.length).toFixed(2)) : 0;

      // 4. Detección automática de caída de producción (>25% vs promedio)
      // "Una caída de producción >25% en los últimos 3 días vs. el promedio de los
      //  7 días previos puede indicar mastitis u otro problema sanitario. Es una alerta temprana."
      const diasDesc = [...diasRegistrados].reverse(); // De más reciente a más antiguo
      let alerta: AlertaCaidaProduccionInfo = {
        hayAlerta: false,
        porcentajeCaida: 0,
        promedioReciente: 0,
        promedioPrevio: 0,
        nivelRiesgo: 'insuficiente',
        mensaje: 'Se requieren al menos 4 días registrados para el cálculo de alertas sanitarias.',
      };

      if (diasDesc.length >= 4) {
        const recientes3 = diasDesc.slice(0, 3);
        const previos7 = diasDesc.slice(3, 10);

        const sumaReciente = recientes3.reduce((acc, d) => acc + d.litros, 0);
        const promReciente = Number((sumaReciente / recientes3.length).toFixed(2));

        const sumaPrevios = previos7.reduce((acc, d) => acc + d.litros, 0);
        const promPrevio = previos7.length > 0 
          ? Number((sumaPrevios / previos7.length).toFixed(2)) 
          : 0;

        if (promPrevio > 0) {
          const diferencia = promPrevio - promReciente;
          const caida = Number(((diferencia / promPrevio) * 100).toFixed(1));

          if (caida > 25) {
            alerta = {
              hayAlerta: true,
              porcentajeCaida: caida,
              promedioReciente: promReciente,
              promedioPrevio: promPrevio,
              nivelRiesgo: 'critico',
              mensaje: `Caída del ${caida}% en los últimos 3 días (${promReciente} L vs ${promPrevio} L base). Riesgo de mastitis u otro problema sanitario.`,
            };
          } else if (caida > 15) {
            alerta = {
              hayAlerta: false,
              porcentajeCaida: caida,
              promedioReciente: promReciente,
              promedioPrevio: promPrevio,
              nivelRiesgo: 'moderado',
              mensaje: `Reducción moderada del ${caida}% (${promReciente} L vs ${promPrevio} L base). Monitorear en los próximos ordeños.`,
            };
          } else {
            alerta = {
              hayAlerta: false,
              porcentajeCaida: caida > 0 ? caida : 0,
              promedioReciente: promReciente,
              promedioPrevio: promPrevio,
              nivelRiesgo: 'normal',
              mensaje: `Producción estable (${promReciente} L promedio reciente vs ${promPrevio} L previo).`,
            };
          }
        }
      }

      setResumenPDP({
        litrosHoy: litrosHoyCalculado,
        pdp7Dias: pdp7,
        totalLitros7Dias: Number(total7.toFixed(1)),
        diasRegistrados7: ultimos7.length,
        pdp30Dias: pdp30,
        totalLitros30Dias: Number(total30.toFixed(1)),
        diasRegistrados30: ultimos30.length,
        alertaCaida: alerta,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al cargar historial de leche para animal ${animalId}:`, error.message);
      }
    } finally {
      setCargando(false);
    }
  }, [animalId]);

  useEffect(() => {
    cargarHistorial();
  }, [cargarHistorial]);

  return {
    cargando,
    puntosGrafica,
    pesajesDetallados,
    resumenPDP,
    recargar: cargarHistorial,
  };
}
