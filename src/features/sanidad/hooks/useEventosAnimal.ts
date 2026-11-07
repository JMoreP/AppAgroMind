import { useState, useEffect, useCallback } from 'react';
import { EventoSanitario, TipoEventoSanitario } from '../types/EventoSanitario';
import { EventoSanitarioRepository } from '../repositories/EventoSanitarioRepository';
import {
  calcularProximaDosis,
  estaEnAlerta,
  estaVencido,
} from '../utils/calculosSanidad';

export interface DatosCrearEventoAnimal {
  esGrupal?: 0 | 1;
  fecha: string;
  tipo: TipoEventoSanitario;
  producto: string;
  dosis?: string;
  responsable?: string;
  proximaDosis?: string;
  diasRetiroLeche?: number;
  observaciones?: string;
}

export function useEventosAnimal(animalId: string) {
  const [eventos, setEventos] = useState<EventoSanitario[]>([]);
  const [proximaDosis, setProximaDosis] = useState<EventoSanitario | null>(null);
  const [tieneAlertaActiva, setTieneAlertaActiva] = useState<boolean>(false);
  const [tieneEventoVencido, setTieneEventoVencido] = useState<boolean>(false);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    if (!animalId) {
      setEventos([]);
      setProximaDosis(null);
      setTieneAlertaActiva(false);
      setTieneEventoVencido(false);
      setCargando(false);
      return;
    }

    try {
      setCargando(true);
      setError(null);

      const lista = await EventoSanitarioRepository.getByAnimalOrdenado(animalId);
      setEventos(lista);

      // Buscar eventos con próxima dosis
      const conProxima = lista.filter(
        (e) => e.proximaDosis != null && e.proximaDosis.trim() !== ''
      );

      if (conProxima.length > 0) {
        // Ordenar por proximaDosis ascendente
        const ordenados = [...conProxima].sort((a, b) =>
          (a.proximaDosis || '').localeCompare(b.proximaDosis || '')
        );

        // Preferir el próximo pendiente en el futuro o hoy, si no el más reciente
        const futuro = ordenados.find((e) => !estaVencido(e.proximaDosis));
        const eventoObjetivo = futuro || ordenados[0];

        setProximaDosis(eventoObjetivo);
        setTieneAlertaActiva(
          lista.some((e) => estaEnAlerta(e.proximaDosis))
        );
        setTieneEventoVencido(
          lista.some((e) => estaVencido(e.proximaDosis))
        );
      } else {
        setProximaDosis(null);
        setTieneAlertaActiva(false);
        setTieneEventoVencido(false);
      }
    } catch (err) {
      if (err instanceof Error) {
        console.warn(`Error al cargar eventos sanitarios del animal ${animalId}:`, err.message);
        setError(err.message);
      } else {
        setError('Error desconocido al cargar eventos sanitarios del animal');
      }
    } finally {
      setCargando(false);
    }
  }, [animalId]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const crearEvento = useCallback(
    async (datos: DatosCrearEventoAnimal) => {
      try {
        const id = Date.now().toString() + Math.random().toString(36).slice(2, 8);
        const ahora = new Date().toISOString();

        const proxima =
          datos.proximaDosis && datos.proximaDosis.trim() !== ''
            ? datos.proximaDosis.trim()
            : calcularProximaDosis(datos.fecha, datos.tipo) || undefined;

        const nuevoEvento: EventoSanitario = {
          id,
          animalId: datos.esGrupal === 1 ? undefined : animalId,
          esGrupal: datos.esGrupal ?? 0,
          fecha: datos.fecha,
          tipo: datos.tipo,
          producto: datos.producto.trim(),
          dosis: datos.dosis?.trim() || undefined,
          responsable: datos.responsable?.trim() || undefined,
          proximaDosis: proxima,
          diasRetiroLeche: datos.diasRetiroLeche,
          observaciones: datos.observaciones?.trim() || undefined,
          sincronizado: 0,
          fechaActualizacion: ahora,
        };

        await EventoSanitarioRepository.create(nuevoEvento);
        await recargar();
      } catch (err) {
        if (err instanceof Error) {
          console.warn('Error al registrar evento sanitario del animal:', err.message);
          setError(err.message);
        } else {
          setError('Error desconocido al registrar evento sanitario del animal');
        }
        throw err;
      }
    },
    [animalId, recargar]
  );

  const eliminarEvento = useCallback(
    async (id: string) => {
      try {
        await EventoSanitarioRepository.delete(id);
        await recargar();
      } catch (err) {
        if (err instanceof Error) {
          console.warn(`Error al eliminar evento sanitario ${id}:`, err.message);
          setError(err.message);
        } else {
          setError('Error desconocido al eliminar evento sanitario');
        }
        throw err;
      }
    },
    [recargar]
  );

  return {
    eventos,
    proximaDosis,
    tieneAlertaActiva,
    tieneEventoVencido,
    cargando,
    error,
    recargar,
    crearEvento,
    eliminarEvento,
  };
}
