import { useState, useEffect, useCallback } from 'react';
import { DiagnosticoPrenez, DiagnosticoConAnimal } from '../types/DiagnosticoPrenez';
import { DiagnosticoPrenezRepository } from '../repositories/DiagnosticoPrenezRepository';
import { ServicioReproductivoRepository } from '../repositories/ServicioReproductivoRepository';

export interface DatosCrearDiagnostico {
  animalId: string;
  servicioId?: string;
  fecha: string;
  resultado: 'preñada' | 'vacia';
  metodo?: 'palpacion' | 'ecografia' | 'otro';
  veterinario?: string;
  observaciones?: string;
}

export function useDiagnosticosPrenez() {
  const [diagnosticos, setDiagnosticos] = useState<DiagnosticoPrenez[]>([]);
  const [diagnosticosRecientes, setDiagnosticosRecientes] = useState<DiagnosticoConAnimal[]>([]);
  const [kpisMes, setKpisMes] = useState<{ preñadas: number; vacias: number }>({ preñadas: 0, vacias: 0 });
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const [todos, recientes, kpis] = await Promise.all([
        DiagnosticoPrenezRepository.getAll(),
        DiagnosticoPrenezRepository.getRecientes(10),
        DiagnosticoPrenezRepository.contarPorResultado(true),
      ]);
      setDiagnosticos(todos);
      setDiagnosticosRecientes(recientes);
      setKpisMes(kpis);
    } catch (err) {
      if (err instanceof Error) {
        console.warn('Error al cargar diagnósticos de preñez:', err.message);
        setError(err.message);
      } else {
        setError('Error desconocido al cargar diagnósticos de preñez');
      }
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const crearDiagnostico = useCallback(async (datos: DatosCrearDiagnostico) => {
    try {
      const id = Date.now().toString() + Math.random().toString(36).slice(2, 8);
      const ahora = new Date().toISOString();

      const nuevoDiagnostico: DiagnosticoPrenez = {
        id,
        animalId: datos.animalId,
        servicioId: datos.servicioId,
        fecha: datos.fecha,
        resultado: datos.resultado,
        metodo: datos.metodo,
        veterinario: datos.veterinario,
        observaciones: datos.observaciones,
        sincronizado: 0,
        fechaActualizacion: ahora,
      };

      // 1. Persistir diagnóstico en repositorio
      await DiagnosticoPrenezRepository.create(nuevoDiagnostico);

      // 2. Si hay servicioId vinculado, actualizar resultado del servicio
      // (ServicioReproductivoRepository.updateResultado desnormaliza el estado del animal automáticamente)
      if (datos.servicioId) {
        await ServicioReproductivoRepository.updateResultado(datos.servicioId, datos.resultado);
      }

      await recargar();
    } catch (err) {
      if (err instanceof Error) {
        console.warn('Error al crear diagnóstico de preñez:', err.message);
        setError(err.message);
      } else {
        setError('Error desconocido al crear diagnóstico de preñez');
      }
      throw err;
    }
  }, [recargar]);

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
    diagnosticosRecientes,
    kpisMes,
    cargando,
    error,
    recargar,
    crearDiagnostico,
    eliminarDiagnostico,
  };
}
