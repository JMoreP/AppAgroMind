import { useState, useEffect, useCallback } from 'react';
import { Parto, PartoConAnimal } from '../types/Parto';
import { PartoRepository } from '../repositories/PartoRepository';
import { AnimalRepository } from '../../animales/repositories/AnimalRepository';

export interface DatosCrearParto {
  animalId: string;
  fecha: string;
  sexoCria: 'M' | 'H';
  pesoCria?: number;
  areteCria?: string;
  observaciones?: string;
}

export function usePartos() {
  const [partos, setPartos] = useState<Parto[]>([]);
  const [partosRecientes, setPartosRecientes] = useState<PartoConAnimal[]>([]);
  const [kpisMes, setKpisMes] = useState<{ machos: number; hembras: number; total: number }>({
    machos: 0,
    hembras: 0,
    total: 0,
  });
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const ahora = new Date();
      const anio = ahora.getFullYear();
      const mes = ahora.getMonth() + 1;

      const [todos, recientes, kpis] = await Promise.all([
        PartoRepository.getAll(),
        PartoRepository.getRecientes(10),
        PartoRepository.contarDelMes(anio, mes),
      ]);

      setPartos(todos);
      setPartosRecientes(recientes);
      setKpisMes(kpis);
    } catch (err) {
      if (err instanceof Error) {
        console.warn('Error al cargar partos:', err.message);
        setError(err.message);
      } else {
        setError('Error desconocido al cargar partos');
      }
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const crearParto = useCallback(async (datos: DatosCrearParto) => {
    try {
      const id = Date.now().toString() + Math.random().toString(36).slice(2, 8);
      const ahora = new Date().toISOString();

      const nuevoParto: Parto = {
        id,
        animalId: datos.animalId,
        fecha: datos.fecha,
        sexoCria: datos.sexoCria,
        pesoCria: datos.pesoCria,
        areteCria: datos.areteCria,
        observaciones: datos.observaciones,
        sincronizado: 0,
        fechaActualizacion: ahora,
      };

      // 1. Persistir el parto en SQLite
      await PartoRepository.create(nuevoParto);

      // 2. Actualizar el animal madre: totalPartos++, estado 'lactancia', limpiar fechas de servicio
      const animalActual = await AnimalRepository.getById(datos.animalId);
      const totalPartosActual = animalActual ? animalActual.totalPartos : 0;

      await AnimalRepository.update(datos.animalId, {
        totalPartos: totalPartosActual + 1,
        estadoReproductivo: 'lactancia',
        fechaInseminacion: undefined,
        fechaProbableParto: undefined,
      });

      await recargar();
    } catch (err) {
      if (err instanceof Error) {
        console.warn('Error al registrar parto:', err.message);
        setError(err.message);
      } else {
        setError('Error desconocido al registrar parto');
      }
      throw err;
    }
  }, [recargar]);

  const eliminarParto = useCallback(async (id: string) => {
    try {
      await PartoRepository.delete(id);
      await recargar();
    } catch (err) {
      if (err instanceof Error) {
        console.warn(`Error al eliminar parto ${id}:`, err.message);
        setError(err.message);
      } else {
        setError('Error desconocido al eliminar parto');
      }
      throw err;
    }
  }, [recargar]);

  return {
    partos,
    partosRecientes,
    kpisMes,
    cargando,
    error,
    recargar,
    crearParto,
    eliminarParto,
  };
}
