import { useState, useEffect, useCallback } from 'react';
import { Parto } from '../types/Parto';
import { PartoRepository } from '../repositories/PartoRepository';
import { AnimalRepository } from '../../animales/repositories/AnimalRepository';

export interface DatosCrearPartoAnimal {
  fecha: string;
  sexoCria: 'M' | 'H';
  pesoCria?: number;
  areteCria?: string;
  observaciones?: string;
}

export function usePartosAnimal(animalId: string) {
  const [partos, setPartos] = useState<Parto[]>([]);
  const [ultimoParto, setUltimoParto] = useState<Parto | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    if (!animalId) {
      setPartos([]);
      setUltimoParto(null);
      setCargando(false);
      return;
    }

    try {
      setCargando(true);
      setError(null);
      const lista = await PartoRepository.getByAnimalOrdenado(animalId);
      setPartos(lista);
      setUltimoParto(lista.length > 0 ? lista[0] : null);
    } catch (err) {
      if (err instanceof Error) {
        console.warn(`Error al cargar partos del animal ${animalId}:`, err.message);
        setError(err.message);
      } else {
        setError('Error desconocido al cargar partos');
      }
    } finally {
      setCargando(false);
    }
  }, [animalId]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const crearParto = useCallback(
    async (datos: DatosCrearPartoAnimal) => {
      try {
        const id = Date.now().toString() + Math.random().toString(36).slice(2, 8);
        const ahora = new Date().toISOString();

        const nuevoParto: Parto = {
          id,
          animalId,
          fecha: datos.fecha,
          sexoCria: datos.sexoCria,
          pesoCria: datos.pesoCria,
          areteCria: datos.areteCria,
          observaciones: datos.observaciones,
          sincronizado: 0,
          fechaActualizacion: ahora,
        };

        // 1. Guardar parto en SQLite
        await PartoRepository.create(nuevoParto);

        // 2. Actualizar estado y partos del animal
        const animalActual = await AnimalRepository.getById(animalId);
        const totalPartosActual = animalActual ? animalActual.totalPartos : 0;

        await AnimalRepository.update(animalId, {
          totalPartos: totalPartosActual + 1,
          estadoReproductivo: 'lactancia',
          fechaInseminacion: undefined,
          fechaProbableParto: undefined,
        });

        await recargar();
      } catch (err) {
        if (err instanceof Error) {
          console.warn(`Error al registrar parto del animal ${animalId}:`, err.message);
          setError(err.message);
        } else {
          setError('Error desconocido al registrar parto');
        }
        throw err;
      }
    },
    [animalId, recargar]
  );

  const eliminarParto = useCallback(
    async (id: string) => {
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
    },
    [recargar]
  );

  return {
    partos,
    ultimoParto,
    cargando,
    error,
    recargar,
    crearParto,
    eliminarParto,
  };
}
