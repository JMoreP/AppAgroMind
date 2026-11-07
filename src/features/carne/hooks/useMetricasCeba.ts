import { useState, useEffect, useCallback } from 'react';
import { CebaConAnimal } from '../types/Ceba';
import { CebaRepository } from '../repositories/CebaRepository';
import {
  calcularPesoActual,
  determinarEtapaActual,
  calcularDiasCeba,
  calcularGananciaPesoDiaria,
  proyectarFechaFaena,
} from '../utils/calculosCeba';

export interface ProximoFaenaItem {
  ceba: CebaConAnimal;
  diasRestantes: number;
  fechaEstimada: string;
}

export interface MetricasCebaResult {
  activos: number;
  listosFaena: number;
  gpPromedio: number;
  diasPromedio: number;
  topGanancia: CebaConAnimal[];
  proximosFaena: ProximoFaenaItem[];
  cargando: boolean;
  error: string | null;
  recargar: () => Promise<void>;
}

export function useMetricasCeba(): MetricasCebaResult {
  const [activos, setActivos] = useState<number>(0);
  const [listosFaena, setListosFaena] = useState<number>(0);
  const [gpPromedio, setGpPromedio] = useState<number>(0);
  const [diasPromedio, setDiasPromedio] = useState<number>(0);
  const [topGanancia, setTopGanancia] = useState<CebaConAnimal[]>([]);
  const [proximosFaena, setProximosFaena] = useState<ProximoFaenaItem[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);

      const [todasActivas, top10] = await Promise.all([
        CebaRepository.getAllActivosConAnimal(),
        CebaRepository.getTopGanancia(10),
      ]);

      const totalActivos = todasActivas.length;
      let contadorListos = 0;
      let sumaGP = 0;
      let contadorConGP = 0;
      let sumaDias = 0;

      const itemsProximos: ProximoFaenaItem[] = [];

      for (const ceba of todasActivas) {
        const pesoActual = calcularPesoActual(ceba);
        const pesoObjetivo = ceba.pesoObjetivo || 450;
        const etapa = determinarEtapaActual(ceba);

        const fechaUltimo =
          etapa === 'IV' && ceba.fechaIV
            ? ceba.fechaIV
            : etapa === 'III' && ceba.fechaIII
            ? ceba.fechaIII
            : etapa === 'II' && ceba.fechaII
            ? ceba.fechaII
            : ceba.fechaInicio;

        let dias = 0;
        try {
          dias = calcularDiasCeba(ceba.fechaInicio, fechaUltimo);
        } catch {
          dias = 0;
        }

        sumaDias += dias;

        const gp = ceba.pesoI ? calcularGananciaPesoDiaria(ceba.pesoI, pesoActual, dias) : 0;
        if (gp > 0) {
          sumaGP += gp;
          contadorConGP++;
        }

        if (pesoActual >= pesoObjetivo) {
          contadorListos++;
        } else if (gp > 0) {
          const proy = proyectarFechaFaena(pesoActual, pesoObjetivo, gp, fechaUltimo);
          if (proy) {
            itemsProximos.push({
              ceba,
              diasRestantes: proy.diasRestantes,
              fechaEstimada: proy.fechaEstimada,
            });
          }
        }
      }

      // Ordenar próximos a faena por menor días restantes primero
      itemsProximos.sort((a, b) => a.diasRestantes - b.diasRestantes);

      const promedioGP = contadorConGP > 0 ? Number((sumaGP / contadorConGP).toFixed(2)) : 0;
      const promedioDias = totalActivos > 0 ? Math.round(sumaDias / totalActivos) : 0;

      setActivos(totalActivos);
      setListosFaena(contadorListos);
      setGpPromedio(promedioGP);
      setDiasPromedio(promedioDias);
      setTopGanancia(top10);
      setProximosFaena(itemsProximos);
    } catch (err) {
      if (err instanceof Error) {
        console.warn('Error al calcular métricas de ceba:', err.message);
        setError(err.message);
      } else {
        setError('Error desconocido al calcular métricas de ceba');
      }
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  return {
    activos,
    listosFaena,
    gpPromedio,
    diasPromedio,
    topGanancia,
    proximosFaena,
    cargando,
    error,
    recargar,
  };
}
