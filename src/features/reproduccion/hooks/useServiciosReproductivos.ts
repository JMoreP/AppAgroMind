import { useState, useEffect, useCallback } from 'react';
import { ServicioReproductivo, ServicioConAnimal } from '../types/ServicioReproductivo';
import { ServicioReproductivoRepository } from '../repositories/ServicioReproductivoRepository';
import { calcularFechaProbableParto } from '../utils/calculosReproductivos';

interface DatosCrearServicio {
  animalId: string;
  fecha: string;
  tipo: 'inseminacion' | 'monta';
  numeroPajuela?: string;
  razaToro?: string;
  veterinario?: string;
  toroNumero?: string;
  toroRaza?: string;
  observaciones?: string;
}

export function useServiciosReproductivos() {
  const [servicios, setServicios] = useState<ServicioReproductivo[]>([]);
  const [serviciosPendientes, setServiciosPendientes] = useState<ServicioReproductivo[]>([]);
  const [serviciosPendientesConAnimal, setServiciosPendientesConAnimal] = useState<ServicioConAnimal[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const [todos, pendientes, pendientesConAnimal] = await Promise.all([
        ServicioReproductivoRepository.getAll(),
        ServicioReproductivoRepository.getPendientes(),
        ServicioReproductivoRepository.getPendientesConAnimal(),
      ]);
      setServicios(todos);
      setServiciosPendientes(pendientes);
      setServiciosPendientesConAnimal(pendientesConAnimal);
    } catch (err) {
      if (err instanceof Error) {
        console.warn('Error al cargar servicios reproductivos:', err.message);
        setError(err.message);
      } else {
        setError('Error desconocido al cargar servicios reproductivos');
      }
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const crearServicio = useCallback(async (datos: DatosCrearServicio) => {
    try {
      const id = Date.now().toString() + Math.random().toString(36).slice(2, 8);
      const fpp = calcularFechaProbableParto(datos.fecha);
      const nuevoServicio: ServicioReproductivo = {
        id,
        animalId: datos.animalId,
        fecha: datos.fecha,
        tipo: datos.tipo,
        numeroPajuela: datos.numeroPajuela,
        razaToro: datos.razaToro,
        veterinario: datos.veterinario,
        toroNumero: datos.toroNumero,
        toroRaza: datos.toroRaza,
        resultado: 'pendiente',
        fechaProbableParto: fpp,
        observaciones: datos.observaciones,
        sincronizado: 0,
        fechaActualizacion: new Date().toISOString(),
      };

      await ServicioReproductivoRepository.create(nuevoServicio);
      await recargar();
    } catch (err) {
      if (err instanceof Error) {
        console.warn('Error al crear servicio reproductivo:', err.message);
        throw err;
      }
    }
  }, [recargar]);

  const actualizarServicio = useCallback(async (id: string, cambios: Partial<ServicioReproductivo>) => {
    try {
      await ServicioReproductivoRepository.update(id, cambios);
      await recargar();
    } catch (err) {
      if (err instanceof Error) {
        console.warn(`Error al actualizar servicio reproductivo ${id}:`, err.message);
        throw err;
      }
    }
  }, [recargar]);

  const eliminarServicio = useCallback(async (id: string) => {
    try {
      await ServicioReproductivoRepository.delete(id);
      await recargar();
    } catch (err) {
      if (err instanceof Error) {
        console.warn(`Error al eliminar servicio reproductivo ${id}:`, err.message);
        throw err;
      }
    }
  }, [recargar]);

  return {
    servicios,
    serviciosPendientes,
    serviciosPendientesConAnimal,
    cargando,
    error,
    recargar,
    crearServicio,
    actualizarServicio,
    eliminarServicio,
  };
}
