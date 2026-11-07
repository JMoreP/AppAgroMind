import { useState, useEffect, useCallback } from 'react';
import { Ceba } from '../types/Ceba';
import { CebaRepository } from '../repositories/CebaRepository';

export interface DatosCrearCebaAnimal {
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

export function useCebaAnimal(animalId: string) {
  const [cebas, setCebas] = useState<Ceba[]>([]);
  const [cebaActual, setCebaActual] = useState<Ceba | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    if (!animalId) {
      setCebas([]);
      setCebaActual(null);
      setCargando(false);
      return;
    }

    try {
      setCargando(true);
      setError(null);
      const lista = await CebaRepository.getByAnimal(animalId);
      setCebas(lista);
      const activa = lista.find((c) => c.activo === 1) || null;
      setCebaActual(activa);
    } catch (err) {
      if (err instanceof Error) {
        console.warn(`Error al cargar cebas del animal ${animalId}:`, err.message);
        setError(err.message);
      } else {
        setError('Error desconocido al cargar cebas del animal');
      }
    } finally {
      setCargando(false);
    }
  }, [animalId]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const crearCeba = useCallback(
    async (datos: DatosCrearCebaAnimal) => {
      try {
        const id = Date.now().toString() + Math.random().toString(36).slice(2, 8);
        const ahora = new Date().toISOString();

        const nuevaCeba: Ceba = {
          id,
          animalId,
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
          console.warn(`Error al registrar ceba para el animal ${animalId}:`, err.message);
          setError(err.message);
        } else {
          setError('Error desconocido al registrar ceba');
        }
        throw err;
      }
    },
    [animalId, recargar]
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
    cebaActual,
    cargando,
    error,
    recargar,
    crearCeba,
    actualizarCeba,
    eliminarCeba,
  };
}
