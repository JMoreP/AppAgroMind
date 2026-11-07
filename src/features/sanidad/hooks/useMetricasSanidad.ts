import { useState, useEffect, useCallback } from 'react';
import {
  EventoMortalidadConAnimal,
  EventoDescarteConAnimal,
} from '../types/BajaAnimal';
import { AnimalRepository } from '../../animales/repositories/AnimalRepository';
import { MortalidadRepository } from '../repositories/MortalidadRepository';
import { DescarteRepository } from '../repositories/DescarteRepository';

export function useMetricasSanidad() {
  const [productivos, setProductivos] = useState<number>(0);
  const [muertosMes, setMuertosMes] = useState<number>(0);
  const [muertosTotal, setMuertosTotal] = useState<number>(0);
  const [descartadosMes, setDescartadosMes] = useState<number>(0);
  const [descartadosTotal, setDescartadosTotal] = useState<number>(0);
  const [ingresosDescarteMes, setIngresosDescarteMes] = useState<number>(0);
  const [mortalidadReciente, setMortalidadReciente] = useState<EventoMortalidadConAnimal[]>([]);
  const [descarteReciente, setDescarteReciente] = useState<EventoDescarteConAnimal[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const ahora = new Date();
      const anio = ahora.getFullYear();
      const mes = ahora.getMonth() + 1;

      const [
        conteoEstados,
        mMes,
        mTotal,
        dMes,
        dTotal,
        ingresosMes,
        mRecientes,
        dRecientes,
      ] = await Promise.all([
        AnimalRepository.contarPorEstadoVida(),
        MortalidadRepository.contarDelMes(anio, mes),
        MortalidadRepository.contarTotal(),
        DescarteRepository.contarDelMes(anio, mes),
        DescarteRepository.contarTotal(),
        DescarteRepository.sumarPreciosDelMes(anio, mes),
        MortalidadRepository.getRecientes(10),
        DescarteRepository.getRecientes(10),
      ]);

      setProductivos(conteoEstados.activa);
      setMuertosMes(mMes);
      setMuertosTotal(mTotal);
      setDescartadosMes(dMes);
      setDescartadosTotal(dTotal);
      setIngresosDescarteMes(ingresosMes);
      setMortalidadReciente(mRecientes);
      setDescarteReciente(dRecientes);
    } catch (err) {
      if (err instanceof Error) {
        console.warn('Error al cargar métricas de sanidad:', err.message);
        setError(err.message);
      } else {
        setError('Error desconocido al cargar métricas de sanidad');
      }
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  return {
    productivos,
    muertosMes,
    muertosTotal,
    descartadosMes,
    descartadosTotal,
    ingresosDescarteMes,
    mortalidadReciente,
    descarteReciente,
    cargando,
    error,
    recargar,
  };
}
