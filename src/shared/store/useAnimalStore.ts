import { create } from 'zustand';
import { Animal } from '../../features/animales/types/Animal';

interface AnimalStore {
  animalSeleccionado: Animal | null;
  seleccionarAnimal: (animal: Animal) => void;
  limpiarSeleccion: () => void;
}

export const useAnimalStore = create<AnimalStore>((set) => ({
  animalSeleccionado: null,
  seleccionarAnimal: (animal) => set({ animalSeleccionado: animal }),
  limpiarSeleccion: () => set({ animalSeleccionado: null }),
}));
