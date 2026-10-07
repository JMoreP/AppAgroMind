import { useState, useEffect, useCallback, useMemo } from 'react';
import { Animal } from '../types/Animal';
import { AnimalRepository } from '../repositories/AnimalRepository';

export function useAnimales() {
  const [todosAnimales, setTodosAnimales] = useState<Animal[]>([]);
  const [cargando, setCargando] = useState(true);

  // Estados de Búsqueda y Filtros
  const [busqueda, setBusqueda] = useState('');
  const [busquedaDebounced, setBusquedaDebounced] = useState('');
  const [filtroEstadoVida, setFiltroEstadoVida] = useState<'activa' | 'muerta' | 'descartada' | 'todos'>('activa');
  const [filtroEstadoReproductivo, setFiltroEstadoReproductivo] = useState<'vacia' | 'preñada' | 'lactancia' | 'secado' | 'ninguno' | 'todos'>('todos');
  const [filtroRaza, setFiltroRaza] = useState<string>('todos');
  const [filtroLoteId, setFiltroLoteId] = useState<string>('todos');

  // Debounce para búsqueda (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setBusquedaDebounced(busqueda);
    }, 300);

    return () => clearTimeout(handler);
  }, [busqueda]);

  const cargarAnimales = useCallback(async () => {
    setCargando(true);
    try {
      const datos = await AnimalRepository.getAll();
      setTodosAnimales(datos);
    } catch (error) {
      console.error('Error al cargar animales:', error);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarAnimales();
  }, [cargarAnimales]);

  const crearAnimal = async (nuevoAnimal: Animal) => {
    await AnimalRepository.create(nuevoAnimal);
    await cargarAnimales();
  };

  const actualizarAnimal = async (id: string, cambios: Partial<Animal>) => {
    await AnimalRepository.update(id, cambios);
    await cargarAnimales();
  };

  const eliminarAnimal = async (id: string) => {
    // Soft-delete: actualiza el estado de vida a descartada
    await AnimalRepository.update(id, { estadoVida: 'descartada' });
    await cargarAnimales();
  };

  // Obtener lista de razas únicas presentes en el rebaño
  const razasDisponibles = useMemo(() => {
    const razas = new Set<string>();
    todosAnimales.forEach(a => {
      if (a.raza && a.raza.trim()) razas.add(a.raza.trim());
    });
    return Array.from(razas);
  }, [todosAnimales]);

  // Filtrado combinado
  const animalesFiltrados = useMemo(() => {
    return todosAnimales.filter(a => {
      // 1. Filtro por Estado de Vida
      if (filtroEstadoVida !== 'todos' && a.estadoVida !== filtroEstadoVida) {
        return false;
      }

      // 2. Filtro por Estado Reproductivo
      if (filtroEstadoReproductivo !== 'todos' && a.estadoReproductivo !== filtroEstadoReproductivo) {
        return false;
      }

      // 3. Filtro por Raza
      if (filtroRaza !== 'todos' && a.raza !== filtroRaza) {
        return false;
      }

      // 4. Filtro por Lote
      if (filtroLoteId !== 'todos') {
        if (filtroLoteId === 'sin_lote' && a.loteId) return false;
        if (filtroLoteId !== 'sin_lote' && a.loteId !== filtroLoteId) return false;
      }

      // 5. Búsqueda por Texto (Arete o Nombre) con Debounce
      if (busquedaDebounced.trim() !== '') {
        const query = busquedaDebounced.trim().toLowerCase();
        const coincideArete = a.arete.toLowerCase().includes(query);
        const coincideNombre = a.nombre ? a.nombre.toLowerCase().includes(query) : false;
        if (!coincideArete && !coincideNombre) {
          return false;
        }
      }

      return true;
    });
  }, [todosAnimales, filtroEstadoVida, filtroEstadoReproductivo, filtroRaza, filtroLoteId, busquedaDebounced]);

  const resetFiltros = () => {
    setBusqueda('');
    setFiltroEstadoVida('activa');
    setFiltroEstadoReproductivo('todos');
    setFiltroRaza('todos');
    setFiltroLoteId('todos');
  };

  const hayFiltrosActivos = 
    filtroEstadoVida !== 'activa' ||
    filtroEstadoReproductivo !== 'todos' ||
    filtroRaza !== 'todos' ||
    filtroLoteId !== 'todos' ||
    busqueda.trim() !== '';

  return {
    animales: animalesFiltrados,
    todosAnimalesCount: todosAnimales.length,
    busqueda,
    setBusqueda,
    filtroEstadoVida,
    setFiltroEstadoVida,
    filtroEstadoReproductivo,
    setFiltroEstadoReproductivo,
    filtroRaza,
    setFiltroRaza,
    filtroLoteId,
    setFiltroLoteId,
    razasDisponibles,
    hayFiltrosActivos,
    resetFiltros,
    cargando,
    recargar: cargarAnimales,
    crearAnimal,
    actualizarAnimal,
    eliminarAnimal,
  };
}
