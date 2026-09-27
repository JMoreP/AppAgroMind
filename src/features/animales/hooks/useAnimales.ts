import { useState, useEffect } from 'react';
import { Animal } from '../types/Animal';

// TODO: Conectar con SQLite a través de AnimalRepository
const MOCK_ANIMALES: Animal[] = [
  {
    id: '1',
    arete: '045',
    nombre: 'Bella',
    fechaNacimiento: '2020-05-12',
    sexo: 'H',
    estadoReproductivo: 'lactancia',
    ultimoPesajeLitros: 8.5,
    ultimoPesajeCarne: 550,
    sincronizado: 1,
    fechaActualizacion: new Date().toISOString()
  },
  {
    id: '2',
    arete: '112',
    nombre: 'Luna',
    fechaNacimiento: '2019-11-20',
    sexo: 'H',
    estadoReproductivo: 'preñada',
    ultimoPesajeLitros: 0,
    ultimoPesajeCarne: 610,
    sincronizado: 1,
    fechaActualizacion: new Date().toISOString()
  },
  {
    id: '3',
    arete: '089',
    nombre: 'Estrella',
    fechaNacimiento: '2021-02-15',
    sexo: 'H',
    estadoReproductivo: 'vacia',
    ultimoPesajeLitros: 0,
    ultimoPesajeCarne: 490,
    sincronizado: 0,
    fechaActualizacion: new Date().toISOString()
  },
  {
    id: '4',
    arete: '201',
    nombre: 'Toro Max',
    fechaNacimiento: '2018-08-10',
    sexo: 'M',
    estadoReproductivo: 'ninguno',
    ultimoPesajeLitros: 0,
    ultimoPesajeCarne: 850,
    sincronizado: 1,
    fechaActualizacion: new Date().toISOString()
  }
];

export function useAnimales() {
  const [animales, setAnimales] = useState<Animal[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Simular carga desde SQLite
    setTimeout(() => {
      setAnimales(MOCK_ANIMALES);
      setCargando(false);
    }, 300);
  }, []);

  const animalesFiltrados = animales.filter(a => 
    a.arete.includes(busqueda) || 
    (a.nombre && a.nombre.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return {
    animales: animalesFiltrados,
    busqueda,
    setBusqueda,
    cargando
  };
}
