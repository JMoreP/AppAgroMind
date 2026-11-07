import { create } from 'zustand';
import { ConfiguracionRepository } from '../repositories/ConfiguracionRepository';
import { ConfiguracionFinca, CONFIGURACION_DEFAULT } from '../types/ConfiguracionFinca';

interface ConfiguracionState {
  configuracion: ConfiguracionFinca;
  onboardingCompletado: boolean;
  cargando: boolean;
  error: string | null;
  inicializado: boolean;

  inicializar: () => Promise<void>;
  recargar: () => Promise<void>;
  guardarConfiguracion: (config: ConfiguracionFinca) => Promise<void>;
  actualizarPrecioLeche: (precio: number) => Promise<void>;
  completarOnboarding: (config: ConfiguracionFinca) => Promise<void>;
  resetearConfiguracion: () => Promise<void>;
}

export const useConfiguracion = create<ConfiguracionState>((set, get) => ({
  configuracion: CONFIGURACION_DEFAULT,
  onboardingCompletado: false,
  cargando: false,
  error: null,
  inicializado: false,

  inicializar: async () => {
    if (get().inicializado) return;
    set({ cargando: true, error: null });
    try {
      const config = await ConfiguracionRepository.obtenerConfiguracion();
      const completado = await ConfiguracionRepository.onboardingCompletado();
      set({
        configuracion: config,
        onboardingCompletado: completado,
        cargando: false,
        inicializado: true,
      });
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al cargar configuración';
      set({ error: mensaje, cargando: false, inicializado: true });
    }
  },

  recargar: async () => {
    set({ cargando: true, error: null });
    try {
      const config = await ConfiguracionRepository.obtenerConfiguracion();
      const completado = await ConfiguracionRepository.onboardingCompletado();
      set({ configuracion: config, onboardingCompletado: completado, cargando: false });
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al recargar configuración';
      set({ error: mensaje, cargando: false });
    }
  },

  guardarConfiguracion: async (nuevaConfig) => {
    set({ cargando: true, error: null });
    try {
      await ConfiguracionRepository.guardarConfiguracion(nuevaConfig);
      set({ configuracion: nuevaConfig, cargando: false });
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al guardar configuración';
      set({ error: mensaje, cargando: false });
      throw err;
    }
  },

  actualizarPrecioLeche: async (precio) => {
    const actual = get().configuracion;
    const nuevaConfig = { ...actual, precioLeche: precio };
    await get().guardarConfiguracion(nuevaConfig);
  },

  completarOnboarding: async (nuevaConfig) => {
    set({ cargando: true, error: null });
    try {
      await ConfiguracionRepository.guardarConfiguracion(nuevaConfig);
      await ConfiguracionRepository.marcarOnboardingCompletado();
      set({
        configuracion: nuevaConfig,
        onboardingCompletado: true,
        cargando: false,
        inicializado: true,
      });
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al completar onboarding';
      console.warn('Error en completarOnboarding:', mensaje);
      set({ error: mensaje, cargando: false });
      throw err;
    }
  },

  resetearConfiguracion: async () => {
    set({ cargando: true, error: null });
    try {
      await ConfiguracionRepository.eliminarConfiguracion();
      set({
        configuracion: CONFIGURACION_DEFAULT,
        onboardingCompletado: false,
        cargando: false,
        inicializado: false,
      });
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al resetear';
      set({ error: mensaje, cargando: false });
      throw err;
    }
  },
}));
