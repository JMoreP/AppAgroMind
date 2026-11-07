import { useState, useEffect, useCallback } from 'react';
import {
  EventoSanitario,
  EventoSanitarioConAnimal,
  TipoEventoSanitario,
} from '../types/EventoSanitario';
import { EventoSanitarioRepository } from '../repositories/EventoSanitarioRepository';
import { calcularProximaDosis } from '../utils/calculosSanidad';

export interface DatosCrearEventoSanitario {
  animalId?: string;
  esGrupal: 0 | 1;
  fecha: string;
  tipo: TipoEventoSanitario;
  producto: string;
  dosis?: string;
  responsable?: string;
  proximaDosis?: string;
  diasRetiroLeche?: number;
  observaciones?: string;
}

export function useEventosSanitarios() {
  const [eventos, setEventos] = useState<EventoSanitario[]>([]);
  const [eventosRecientes, setEventosRecientes] = useState<EventoSanitarioConAnimal[]>([]);
  const [proximasDosis, setProximasDosis] = useState<EventoSanitarioConAnimal[]>([]);
  const [vencidos, setVencidos] = useState<EventoSanitarioConAnimal[]>([]);
  const [totalDelMes, setTotalDelMes] = useState<number>(0);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);

      const [todos, recientes, proximas, venc, totalMes] = await Promise.all([
        EventoSanitarioRepository.getAll(),
        EventoSanitarioRepository.getRecientes(10),
        EventoSanitarioRepository.getProximasDosis(),
        EventoSanitarioRepository.getVencidos(),
        EventoSanitarioRepository.contarDelMes(),
      ]);

      setEventos(todos);
      setEventosRecientes(recientes);
      setProximasDosis(proximas);
      setVencidos(venc);
      setTotalDelMes(totalMes);
    } catch (err) {
      if (err instanceof Error) {
        console.warn('Error al cargar eventos sanitarios:', err.message);
        setError(err.message);
      } else {
        setError('Error desconocido al cargar eventos sanitarios');
      }
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const crearEvento = useCallback(
    async (datos: DatosCrearEventoSanitario) => {
      try {
        const id = Date.now().toString() + Math.random().toString(36).slice(2, 8);
        const ahora = new Date().toISOString();

        const proxima =
          datos.proximaDosis && datos.proximaDosis.trim() !== ''
            ? datos.proximaDosis.trim()
            : calcularProximaDosis(datos.fecha, datos.tipo) || undefined;

        const nuevoEvento: EventoSanitario = {
          id,
          animalId: datos.animalId,
          esGrupal: datos.esGrupal,
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
          console.warn('Error al crear evento sanitario:', err.message);
          setError(err.message);
        } else {
          setError('Error desconocido al crear evento sanitario');
        }
        throw err;
      }
    },
    [recargar]
  );

  const actualizarEvento = useCallback(
    async (id: string, cambios: Partial<EventoSanitario>) => {
      try {
        await EventoSanitarioRepository.update(id, cambios);
        await recargar();
      } catch (err) {
        if (err instanceof Error) {
          console.warn(`Error al actualizar evento sanitario ${id}:`, err.message);
          setError(err.message);
        } else {
          setError('Error desconocido al actualizar evento sanitario');
        }
        throw err;
      }
    },
    [recargar]
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
    eventosRecientes,
    proximasDosis,
    vencidos,
    totalDelMes,
    cargando,
    error,
    recargar,
    crearEvento,
    actualizarEvento,
    eliminarEvento,
  };
}
