import { useState, useEffect, useCallback } from 'react';
import { Lote } from '../types/Lote';
import { LoteRepository } from '../repositories/LoteRepository';

export function useLotes() {
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarLotes = useCallback(async () => {
    setCargando(true);
    try {
      const datos = await LoteRepository.getAll();
      setLotes(datos);
    } catch (error) {
      console.error('Error al cargar lotes:', error);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarLotes();
  }, [cargarLotes]);

  const crearLote = async (nuevoLote: Lote) => {
    await LoteRepository.create(nuevoLote);
    await cargarLotes();
  };

  const actualizarLote = async (id: string, cambios: Partial<Lote>) => {
    await LoteRepository.update(id, cambios);
    await cargarLotes();
  };

  const eliminarLote = async (id: string) => {
    await LoteRepository.delete(id);
    await cargarLotes();
  };

  return {
    lotes,
    cargando,
    recargar: cargarLotes,
    crearLote,
    actualizarLote,
    eliminarLote,
  };
}
