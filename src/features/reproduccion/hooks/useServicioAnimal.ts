import { useState, useEffect, useCallback } from 'react';
import { ServicioReproductivo } from '../types/ServicioReproductivo';
import { ServicioReproductivoRepository } from '../repositories/ServicioReproductivoRepository';
import { 
  calcularFechaProbableParto, 
  diasDesdeServicio as calcularDiasDesdeServicio, 
  estaEnVentanaPalpacion as calcularEstaEnVentana 
} from '../utils/calculosReproductivos';

interface DatosServicioAnimal {
  fecha: string;
  tipo: 'inseminacion' | 'monta';
  numeroPajuela?: string;
  razaToro?: string;
  veterinario?: string;
  toroNumero?: string;
  toroRaza?: string;
  observaciones?: string;
}

export function useServicioAnimal(animalId?: string) {
  const [servicios, setServicios] = useState<ServicioReproductivo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    if (!animalId) {
      setServicios([]);
      setCargando(false);
      return;
    }

    setCargando(true);
    setError(null);
    try {
      const lista = await ServicioReproductivoRepository.getByAnimalOrdenado(animalId);
      setServicios(lista);
    } catch (err) {
      if (err instanceof Error) {
        console.warn(`Error al cargar servicios para animal ${animalId}:`, err.message);
        setError(err.message);
      } else {
        setError('Error desconocido al cargar servicios del animal');
      }
    } finally {
      setCargando(false);
    }
  }, [animalId]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const ultimoServicio = servicios.length > 0 ? servicios[0] : null;
  const tieneServicioPendiente = ultimoServicio?.resultado === 'pendiente';

  const diasDesdeUltimo = ultimoServicio 
    ? calcularDiasDesdeServicio(ultimoServicio.fecha) 
    : null;

  const enVentanaPalpacion = tieneServicioPendiente && ultimoServicio
    ? calcularEstaEnVentana(ultimoServicio.fecha)
    : false;

  const crearServicio = useCallback(async (datos: DatosServicioAnimal) => {
    if (!animalId) return;
    try {
      const id = Date.now().toString() + Math.random().toString(36).slice(2, 8);
      const fpp = calcularFechaProbableParto(datos.fecha);
      const nuevoServicio: ServicioReproductivo = {
        id,
        animalId,
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
        console.warn(`Error al crear servicio para animal ${animalId}:`, err.message);
        throw err;
      }
    }
  }, [animalId, recargar]);

  const eliminarServicio = useCallback(async (id: string) => {
    try {
      await ServicioReproductivoRepository.delete(id);
      await recargar();
    } catch (err) {
      if (err instanceof Error) {
        console.warn(`Error al eliminar servicio ${id}:`, err.message);
        throw err;
      }
    }
  }, [recargar]);

  return {
    servicios,
    ultimoServicio,
    tieneServicioPendiente,
    diasDesdeServicio: diasDesdeUltimo,
    enVentanaPalpacion,
    cargando,
    error,
    recargar,
    crearServicio,
    eliminarServicio,
  };
}
