import { useState, useEffect, useCallback } from 'react';
import { DiagnosticoPrenez } from '../types/DiagnosticoPrenez';
import { DiagnosticoPrenezRepository } from '../repositories/DiagnosticoPrenezRepository';
import { ServicioReproductivoRepository } from '../repositories/ServicioReproductivoRepository';

export interface DatosCrearDiagnosticoAnimal {
  servicioId?: string;
  fecha: string;
  resultado: 'preñada' | 'vacia';
  metodo?: 'palpacion' | 'ecografia' | 'otro';
  veterinario?: string;
  observaciones?: string;
}

export function useDiagnosticoAnimal(animalId: string) {
  const [diagnosticos, setDiagnosticos] = useState<DiagnosticoPrenez[]>([]);
  const [ultimoDiagnostico, setUltimoDiagnostico] = useState<DiagnosticoPrenez | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    if (!animalId) {
      setDiagnosticos([]);
      setUltimoDiagnostico(null);
      setCargando(false);
      return;
    }

    try {
      setCargando(true);
      setError(null);
      const lista = await DiagnosticoPrenezRepository.getByAnimalOrdenado(animalId);
      setDiagnosticos(lista);
      setUltimoDiagnostico(lista.length > 0 ? lista[0] : null);
    } catch (err) {
      if (err instanceof Error) {
        console.warn(`Error al cargar diagnósticos del animal ${animalId}:`, err.message);
        setError(err.message);
      } else {
        setError('Error desconocido al cargar diagnósticos del animal');
      }
    } finally {
      setCargando(false);
    }
  }, [animalId]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const crearDiagnostico = useCallback(async (datos: DatosCrearDiagnosticoAnimal) => {
    try {
      const id = Date.now().toString() + Math.random().toString(36).slice(2, 8);
      const ahora = new Date().toISOString();

      const nuevoDiagnostico: DiagnosticoPrenez = {
        id,
        animalId,
        servicioId: datos.servicioId,
        fecha: datos.fecha,
        resultado: datos.resultado,
        metodo: datos.metodo,
        veterinario: datos.veterinario,
        observaciones: datos.observaciones,
        sincronizado: 0,
        fechaActualizacion: ahora,
      };

      await DiagnosticoPrenezRepository.create(nuevoDiagnostico);

      if (datos.servicioId) {
        await ServicioReproductivoRepository.updateResultado(datos.servicioId, datos.resultado);
      }

      await recargar();
    } catch (err) {
      if (err instanceof Error) {
        console.warn(`Error al registrar diagnóstico para el animal ${animalId}:`, err.message);
        setError(err.message);
      } else {
        setError('Error desconocido al registrar diagnóstico');
      }
      throw err;
    }
  }, [animalId, recargar]);

  const eliminarDiagnostico = useCallback(async (id: string) => {
    try {
      await DiagnosticoPrenezRepository.delete(id);
      await recargar();
    } catch (err) {
      if (err instanceof Error) {
        console.warn(`Error al eliminar diagnóstico ${id}:`, err.message);
        setError(err.message);
      } else {
        setError('Error desconocido al eliminar diagnóstico');
      }
      throw err;
    }
  }, [recargar]);

  return {
    diagnosticos,
    ultimoDiagnostico,
    cargando,
    error,
    recargar,
    crearDiagnostico,
    eliminarDiagnostico,
  };
}
