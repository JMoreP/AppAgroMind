import { useState, useEffect, useCallback } from 'react';
import {
  DestinoDescarte,
  EventoMortalidad,
  EventoDescarte,
} from '../types/BajaAnimal';
import { MortalidadRepository } from '../repositories/MortalidadRepository';
import { DescarteRepository } from '../repositories/DescarteRepository';
import { AnimalRepository } from '../../animales/repositories/AnimalRepository';

export interface DatosRegistrarMuerte {
  fecha: string;
  causa: string;
  observaciones?: string;
}

export interface DatosRegistrarDescarte {
  fecha: string;
  destino: DestinoDescarte;
  precio?: number;
  observaciones?: string;
}

export function useBajasAnimal(animalId: string) {
  const [mortalidad, setMortalidad] = useState<EventoMortalidad | null>(null);
  const [descarte, setDescarte] = useState<EventoDescarte | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    if (!animalId) {
      setMortalidad(null);
      setDescarte(null);
      setCargando(false);
      return;
    }

    setCargando(true);
    setError(null);
    try {
      const [listaMortalidad, listaDescarte] = await Promise.all([
        MortalidadRepository.getByAnimal(animalId),
        DescarteRepository.getByAnimal(animalId),
      ]);

      setMortalidad(listaMortalidad.length > 0 ? listaMortalidad[0] : null);
      setDescarte(listaDescarte.length > 0 ? listaDescarte[0] : null);
    } catch (err) {
      if (err instanceof Error) {
        console.warn(`Error al cargar bajas para animal ${animalId}:`, err.message);
        setError(err.message);
      } else {
        setError('Error desconocido al cargar bajas del animal');
      }
    } finally {
      setCargando(false);
    }
  }, [animalId]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const registrarMuerte = async (datos: DatosRegistrarMuerte): Promise<void> => {
    try {
      const idUnico = 'mort-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
      const ahora = new Date().toISOString();

      const nuevoEvento: EventoMortalidad = {
        id: idUnico,
        animalId,
        fecha: datos.fecha,
        causa: datos.causa,
        observaciones: datos.observaciones,
        sincronizado: 0,
        fechaActualizacion: ahora,
      };

      await MortalidadRepository.create(nuevoEvento);
      await AnimalRepository.update(animalId, { estadoVida: 'muerta' });
      await recargar();
    } catch (err) {
      if (err instanceof Error) {
        console.warn(`Error al registrar muerte del animal ${animalId}:`, err.message);
        throw err;
      }
      throw new Error('Error al registrar muerte');
    }
  };

  const registrarDescarte = async (datos: DatosRegistrarDescarte): Promise<void> => {
    try {
      const idUnico = 'desc-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
      const ahora = new Date().toISOString();

      const nuevoEvento: EventoDescarte = {
        id: idUnico,
        animalId,
        fecha: datos.fecha,
        destino: datos.destino,
        precio: datos.precio,
        observaciones: datos.observaciones,
        sincronizado: 0,
        fechaActualizacion: ahora,
      };

      await DescarteRepository.create(nuevoEvento);
      await AnimalRepository.update(animalId, { estadoVida: 'descartada' });
      await recargar();
    } catch (err) {
      if (err instanceof Error) {
        console.warn(`Error al registrar descarte del animal ${animalId}:`, err.message);
        throw err;
      }
      throw new Error('Error al registrar descarte');
    }
  };

  const eliminarBaja = async (): Promise<void> => {
    try {
      if (mortalidad) {
        await MortalidadRepository.delete(mortalidad.id);
      }
      if (descarte) {
        await DescarteRepository.delete(descarte.id);
      }

      await AnimalRepository.update(animalId, { estadoVida: 'activa' });
      await recargar();
    } catch (err) {
      if (err instanceof Error) {
        console.warn(`Error al eliminar baja del animal ${animalId}:`, err.message);
        throw err;
      }
      throw new Error('Error al eliminar baja');
    }
  };

  const estaMuerta = Boolean(mortalidad);
  const estaDescartada = !mortalidad && Boolean(descarte);
  const estaActiva = !mortalidad && !descarte;

  return {
    mortalidad,
    descarte,
    estaMuerta,
    estaDescartada,
    estaActiva,
    cargando,
    error,
    recargar,
    registrarMuerte,
    registrarDescarte,
    eliminarBaja,
  };
}
