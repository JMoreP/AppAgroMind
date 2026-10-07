import { create } from 'zustand';
import { PesajeLecheRepository } from '../../features/ordeno/repositories/PesajeLecheRepository';

interface OrdenoStore {
  totalLitrosHoy: number;
  actualizarTotalLitrosHoy: (litros: number) => void;
  cargarTotalLitrosHoy: (fecha?: string) => Promise<void>;
}

function obtenerFechaHoyISO(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const useOrdenoStore = create<OrdenoStore>((set) => ({
  totalLitrosHoy: 0,
  actualizarTotalLitrosHoy: (litros: number) => set({ totalLitrosHoy: litros }),
  cargarTotalLitrosHoy: async (fecha?: string) => {
    try {
      const fechaConsulta = fecha || obtenerFechaHoyISO();
      const resumen = await PesajeLecheRepository.getResumenFecha(fechaConsulta);
      set({ totalLitrosHoy: resumen.totalLitrosDia });
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al cargar totalLitrosHoy en useOrdenoStore:', error.message);
      }
    }
  },
}));
