import { useState, useEffect, useCallback, useMemo } from 'react';
import { PesajeConAnimal } from '../types/PesajeLeche';
import { PesajeLecheRepository } from '../repositories/PesajeLecheRepository';
import { AnimalRepository } from '../../animales/repositories/AnimalRepository';
import { Animal } from '../../animales/types/Animal';
import { useOrdenoStore } from '../../../shared/store/useOrdenoStore';

function obtenerFechaHoyISO(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function obtenerTurnoInicial(): 'mañana' | 'tarde' {
  const hora = new Date().getHours();
  return hora < 13 ? 'mañana' : 'tarde';
}

export function useOrdenoLote() {
  const [fecha, setFecha] = useState<string>(obtenerFechaHoyISO);
  const [turno, setTurno] = useState<'mañana' | 'tarde'>(obtenerTurnoInicial);
  const [loteSeleccionado, setLoteSeleccionado] = useState<string>('todos');

  const [todosAnimales, setTodosAnimales] = useState<Animal[]>([]);
  const [pesajesDelTurno, setPesajesDelTurno] = useState<PesajeConAnimal[]>([]);
  const [resumenFecha, setResumenFecha] = useState({
    totalLitrosDia: 0,
    totalLitrosManana: 0,
    totalLitrosTarde: 0,
    totalBufalasOrdenadas: 0,
    promedioPorBufala: 0,
  });
  const [cargando, setCargando] = useState<boolean>(true);

  // Carga de datos de la sesión de ordeño
  const recargar = useCallback(async () => {
    setCargando(true);
    try {
      const [animales, pesajes, resumen] = await Promise.all([
        AnimalRepository.getAll(),
        PesajeLecheRepository.getByFechaYTurno(fecha, turno),
        PesajeLecheRepository.getResumenFecha(fecha),
      ]);

      setTodosAnimales(animales);
      setPesajesDelTurno(pesajes);
      setResumenFecha(resumen);

      // Notificar al store global para reactividad instantánea del Dashboard (Bug 2)
      const hoyISO = obtenerFechaHoyISO();
      if (fecha === hoyISO) {
        useOrdenoStore.getState().actualizarTotalLitrosHoy(resumen.totalLitrosDia);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al recargar sesión de ordeño:', error.message);
      }
    } finally {
      setCargando(false);
    }
  }, [fecha, turno]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  // Filtrar animales hembras activas que pertenecen al lote seleccionado (si aplica)
  const animalesDisponibles = useMemo(() => {
    return todosAnimales.filter((a) => {
      if (a.sexo !== 'H' || a.estadoVida !== 'activa') return false;
      if (loteSeleccionado !== 'todos') {
        if (loteSeleccionado === 'sin_lote' && a.loteId) return false;
        if (loteSeleccionado !== 'sin_lote' && a.loteId !== loteSeleccionado) return false;
      }
      return true;
    });
  }, [todosAnimales, loteSeleccionado]);

  // Conjunto de IDs de animales ya ordeñados en este turno
  const ordenadosIdsSet = useMemo(() => {
    return new Set(pesajesDelTurno.map((p) => p.animalId));
  }, [pesajesDelTurno]);

  // Animales pendientes de ordeño en este turno
  const animalesPendientes = useMemo(() => {
    return animalesDisponibles.filter((a) => !ordenadosIdsSet.has(a.id));
  }, [animalesDisponibles, ordenadosIdsSet]);

  // Cálculos rápidos del turno actual
  const resumenTurnoActual = useMemo(() => {
    const totalLitros = pesajesDelTurno.reduce((acc, curr) => acc + curr.litros, 0);
    const cabezas = pesajesDelTurno.length;
    const promedio = cabezas > 0 ? Number((totalLitros / cabezas).toFixed(2)) : 0;
    return {
      totalLitrosTurno: Number(totalLitros.toFixed(1)),
      totalBufalasTurno: cabezas,
      promedioTurno: promedio,
    };
  }, [pesajesDelTurno]);

  /**
   * Registra rápidamente un pesaje por número de arete o ID de animal.
   */
  const registrarPesaje = async (
    areteOId: string,
    litros: number,
    observaciones?: string
  ): Promise<{ exito: boolean; mensaje?: string; animal?: Animal }> => {
    const query = areteOId.trim().toUpperCase();
    if (!query) {
      return { exito: false, mensaje: 'Debes ingresar el número de arete.' };
    }
    if (isNaN(litros) || litros <= 0) {
      return { exito: false, mensaje: 'Ingresa una cantidad de litros válida (> 0).' };
    }

    // Buscar el animal por arete o ID
    const animal = todosAnimales.find(
      (a) => a.arete.toUpperCase() === query || a.id === areteOId
    );

    if (!animal) {
      return { exito: false, mensaje: `No se encontró ningún animal con arete "${query}".` };
    }

    if (animal.sexo === 'M') {
      return { exito: false, mensaje: `El animal #${animal.arete} es macho.` };
    }

    // Verificar si ya fue registrado en este turno (advertencia de duplicado)
    const yaRegistrado = pesajesDelTurno.find((p) => p.animalId === animal.id);
    if (yaRegistrado) {
      return {
        exito: false,
        mensaje: `La búfala #${animal.arete} ya tiene un pesaje de ${yaRegistrado.litros} L en el turno de la ${turno}.`,
        animal,
      };
    }

    const idUnico = 'pesaje-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
    const nuevoPesaje = {
      id: idUnico,
      animalId: animal.id,
      fecha,
      turno,
      litros: Number(litros.toFixed(1)),
      observaciones: observaciones?.trim() || undefined,
      sincronizado: 0 as const,
      fechaActualizacion: new Date().toISOString(),
    };

    try {
      await PesajeLecheRepository.create(nuevoPesaje);
      await recargar();
      return { exito: true, animal };
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al guardar pesaje en useOrdenoLote:', error.message);
      }
      return { exito: false, mensaje: 'Error al persistir pesaje en SQLite.' };
    }
  };

  /**
   * Elimina un pesaje erróneo registrado en la sesión
   */
  const eliminarPesaje = async (id: string): Promise<void> => {
    try {
      await PesajeLecheRepository.delete(id);
      await recargar();
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al eliminar pesaje en useOrdenoLote:', error.message);
      }
    }
  };

  return {
    fecha,
    setFecha,
    turno,
    setTurno,
    loteSeleccionado,
    setLoteSeleccionado,
    animalesDisponibles,
    animalesPendientes,
    pesajesDelTurno,
    resumenTurnoActual,
    resumenFecha,
    cargando,
    recargar,
    registrarPesaje,
    eliminarPesaje,
  };
}
