import { db } from '../../../database/sqlite/db';
import {
  ConfiguracionFinca,
  CONFIGURACION_DEFAULT,
} from '../types/ConfiguracionFinca';

interface FilaConfiguracion {
  clave: string;
  valor: string;
  fechaActualizacion: string;
}

export const ConfiguracionRepository = {
  /**
   * Obtiene el valor en texto de una clave específica.
   */
  async obtenerClave(clave: string): Promise<string | null> {
    if (!db) {
      throw new Error('Base de datos SQLite no inicializada');
    }
    try {
      const fila = await db.getFirstAsync<FilaConfiguracion>(
        'SELECT * FROM configuracion WHERE clave = ?;',
        [clave]
      );
      return fila ? fila.valor : null;
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al obtener clave ${clave} de configuración:`, error.message);
      }
      return null;
    }
  },

  /**
   * Guarda o actualiza una clave individual en la tabla key-value.
   */
  async guardarClave(clave: string, valor: string): Promise<void> {
    if (!db) {
      throw new Error('Base de datos SQLite no inicializada');
    }
    try {
      const ahora = new Date().toISOString();
      await db.runAsync(
        `INSERT OR REPLACE INTO configuracion (clave, valor, fechaActualizacion)
         VALUES (?, ?, ?);`,
        [clave, valor, ahora]
      );
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al guardar clave ${clave} de configuración:`, error.message);
      }
      throw error;
    }
  },

  /**
   * Obtiene la configuración consolidada de la finca.
   */
  async obtenerConfiguracion(): Promise<ConfiguracionFinca> {
    if (!db) {
      throw new Error('Base de datos SQLite no inicializada');
    }
    try {
      const filas = await db.getAllAsync<FilaConfiguracion>(
        "SELECT * FROM configuracion WHERE clave LIKE 'finca.%';"
      );

      const mapaValores: Record<string, string> = {};
      for (const f of filas) {
        mapaValores[f.clave] = f.valor;
      }

      let especies: Array<'bovino' | 'bufalino'> = CONFIGURACION_DEFAULT.especies;
      if (mapaValores['finca.especies']) {
        try {
          const parsed = JSON.parse(mapaValores['finca.especies']);
          if (Array.isArray(parsed) && parsed.length > 0) {
            especies = parsed;
          }
        } catch {
          especies = CONFIGURACION_DEFAULT.especies;
        }
      }

      let precioLeche = CONFIGURACION_DEFAULT.precioLeche;
      if (mapaValores['finca.precioLeche'] !== undefined) {
        const parsedPrecio = parseFloat(mapaValores['finca.precioLeche']);
        if (!isNaN(parsedPrecio)) {
          precioLeche = parsedPrecio;
        }
      }

      return {
        nombre: mapaValores['finca.nombre'] ?? CONFIGURACION_DEFAULT.nombre,
        propietario: mapaValores['finca.propietario'] ?? CONFIGURACION_DEFAULT.propietario,
        ubicacion: mapaValores['finca.ubicacion'] ?? CONFIGURACION_DEFAULT.ubicacion,
        moneda: mapaValores['finca.moneda'] ?? CONFIGURACION_DEFAULT.moneda,
        precioLeche,
        especies,
      };
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al obtener configuración de la finca:', error.message);
      }
      return CONFIGURACION_DEFAULT;
    }
  },

  /**
   * Guarda o actualiza los datos de la configuración de la finca.
   */
  async guardarConfiguracion(config: ConfiguracionFinca): Promise<void> {
    if (!db) {
      throw new Error('Base de datos SQLite no inicializada');
    }
    try {
      const ahora = new Date().toISOString();
      const operaciones = [
        { clave: 'finca.nombre', valor: config.nombre.trim() },
        { clave: 'finca.propietario', valor: config.propietario.trim() },
        { clave: 'finca.ubicacion', valor: config.ubicacion.trim() },
        { clave: 'finca.moneda', valor: config.moneda },
        { clave: 'finca.precioLeche', valor: config.precioLeche.toString() },
        { clave: 'finca.especies', valor: JSON.stringify(config.especies) },
      ];

      for (const op of operaciones) {
        await db.runAsync(
          `INSERT OR REPLACE INTO configuracion (clave, valor, fechaActualizacion)
           VALUES (?, ?, ?);`,
          [op.clave, op.valor, ahora]
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al guardar configuración de finca en SQLite:', error.message);
      }
      throw error;
    }
  },

  /**
   * Retorna true si el onboarding inicial ya fue completado.
   */
  async onboardingCompletado(): Promise<boolean> {
    if (!db) return false;
    try {
      const valor = await this.obtenerClave('app.onboardingCompletado');
      return valor === '1';
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al verificar estado de onboarding:', error.message);
      }
      return false;
    }
  },

  /**
   * Marca el onboarding como completado.
   */
  async marcarOnboardingCompletado(): Promise<void> {
    await this.guardarClave('app.onboardingCompletado', '1');
  },

  /**
   * Elimina toda la configuración para testing o reseteo general.
   */
  async eliminarConfiguracion(): Promise<void> {
    if (!db) {
      throw new Error('Base de datos SQLite no inicializada');
    }
    try {
      await db.runAsync('DELETE FROM configuracion;');
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al eliminar configuración de SQLite:', error.message);
      }
      throw error;
    }
  },
};
