import { useState, useEffect, useCallback } from 'react';
import { PesajeLecheRepository } from '../repositories/PesajeLecheRepository';
import { MetricaHatoDiaria } from '../types/PesajeLeche';

export function useHistorialHato() {
  const [cargando, setCargando] = useState(true);
  const [metricasHato, setMetricasHato] = useState<MetricaHatoDiaria[]>([]);
  const [totalLitrosHoy, setTotalLitrosHoy] = useState(0);
  const [bufalasHoy, setBufalasHoy] = useState(0);
  const [pdpHatoHoy, setPdpHatoHoy] = useState(0);
  const [pdpHato7Dias, setPdpHato7Dias] = useState(0);
  const [pdpHato30Dias, setPdpHato30Dias] = useState(0);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const hoy = new Date();
      const hace30Dias = new Date();
      hace30Dias.setDate(hoy.getDate() - 30);

      const formatoFecha = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      };

      const desdeISO = formatoFecha(hace30Dias);
      const hastaISO = formatoFecha(hoy);

      const [metricas, resumenHoy] = await Promise.all([
        PesajeLecheRepository.getMetricasHatoPorDiaEnRango(desdeISO, hastaISO),
        PesajeLecheRepository.getResumenFecha(hastaISO),
      ]);

      setMetricasHato(metricas);
      setTotalLitrosHoy(resumenHoy.totalLitrosDia);
      setBufalasHoy(resumenHoy.totalBufalasOrdenadas);
      setPdpHatoHoy(resumenHoy.promedioPorBufala);

      // Calcular PDP promedio del hato de los últimos 7 días con producción
      const ultimas7 = metricas.slice(-7);
      if (ultimas7.length > 0) {
        const sumaPdp = ultimas7.reduce((acc, m) => acc + m.pdp, 0);
        setPdpHato7Dias(Number((sumaPdp / ultimas7.length).toFixed(2)));
      } else {
        setPdpHato7Dias(resumenHoy.promedioPorBufala);
      }

      // Calcular PDP promedio del hato de los últimos 30 días
      if (metricas.length > 0) {
        const sumaPdp30 = metricas.reduce((acc, m) => acc + m.pdp, 0);
        setPdpHato30Dias(Number((sumaPdp30 / metricas.length).toFixed(2)));
      } else {
        setPdpHato30Dias(resumenHoy.promedioPorBufala);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al cargar historial del hato:', error.message);
      }
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  return {
    cargando,
    metricasHato,
    totalLitrosHoy,
    bufalasHoy,
    pdpHatoHoy,
    pdpHato7Dias,
    pdpHato30Dias,
    recargar: cargarDatos,
  };
}
