import { useState, useEffect, useCallback } from 'react';
import { Ceba } from '../types/Ceba';
import { CebaRepository } from '../repositories/CebaRepository';

export interface DatosCrearCeba {
  animalId: string;
  fechaNacimiento?: string;
  pesoDestete?: number;
  padreNro?: string;
  raza?: string;
  fechaInicio: string;
  pesoI?: number;
  fechaII?: string;
  pesoII?: number;
  fechaIII?: string;
  pesoIII?: number;
  fechaIV?: string;
  pesoIV?: number;
  pesoObjetivo?: number;
  observaciones?: string;
}

export function useCeba() {
  const [cebas, setCebas] = useState<Ceba[]>([]);
  const [cebasActivas, setCebasActivas] = useState<Ceba[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const [todas, activas] = await Promise.all([
        CebaRepository.getAll(),
        CebaRepository.getAllActivos(),
      ]);
      setCebas(todas);
      setCebasActivas(activas);
    } catch (err) {
      if (err instanceof Error) {
        console.warn('Error al cargar datos de ceba:', err.message);
        setError(err.message);
      } else {
        setError('Error desconocido al cargar datos de ceba');
      }
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const crearCeba = useCallback(
    async (datos: DatosCrearCeba) => {
      try {
        const id = Date.now().toString() + Math.random().toString(36).slice(2, 8);
        const ahora = new Date().toISOString();

        const nuevaCeba: Ceba = {
          id,
          animalId: datos.animalId,
          fechaNacimiento: datos.fechaNacimiento,
          pesoDestete: datos.pesoDestete,
          padreNro: datos.padreNro,
          raza: datos.raza,
          fechaInicio: datos.fechaInicio,
          pesoI: datos.pesoI,
          fechaII: datos.fechaII,
          pesoII: datos.pesoII,
          fechaIII: datos.fechaIII,
          pesoIII: datos.pesoIII,
          fechaIV: datos.fechaIV,
          pesoIV: datos.pesoIV,
          pesoObjetivo: datos.pesoObjetivo ?? 450,
          observaciones: datos.observaciones,
          activo: 1,
          sincronizado: 0,
          fechaActualizacion: ahora,
        };

        await CebaRepository.create(nuevaCeba);
        await recargar();
      } catch (err) {
        if (err instanceof Error) {
          console.warn('Error al crear registro de ceba:', err.message);
          setError(err.message);
        } else {
          setError('Error desconocido al crear registro de ceba');
        }
        throw err;
      }
    },
    [recargar]
  );

  const actualizarCeba = useCallback(
    async (id: string, cambios: Partial<Ceba>) => {
      try {
        await CebaRepository.update(id, cambios);
        await recargar();
      } catch (err) {
        if (err instanceof Error) {
          console.warn(`Error al actualizar ceba ${id}:`, err.message);
          setError(err.message);
        } else {
          setError('Error desconocido al actualizar ceba');
        }
        throw err;
      }
    },
    [recargar]
  );

  const eliminarCeba = useCallback(
    async (id: string) => {
      try {
        await CebaRepository.delete(id);
        await recargar();
      } catch (err) {
        if (err instanceof Error) {
          console.warn(`Error al eliminar ceba ${id}:`, err.message);
          setError(err.message);
        } else {
          setError('Error desconocido al eliminar ceba');
        }
        throw err;
      }
    },
    [recargar]
  );

  return {
    cebas,
    cebasActivas,
    cargando,
    error,
    recargar,
    crearCeba,
    actualizarCeba,
    eliminarCeba,
  };
}
