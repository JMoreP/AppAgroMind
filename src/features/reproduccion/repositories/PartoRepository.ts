import { db } from '../../../database/sqlite/db';
import { Parto, PartoConAnimal } from '../types/Parto';

interface FilaParto {
  id: string;
  animalId: string;
  fecha: string;
  sexoCria: string;
  pesoCria?: number | null;
  areteCria?: string | null;
  observaciones?: string | null;
  sincronizado: number;
  fechaActualizacion: string;
}

interface FilaPartoConAnimal extends FilaParto {
  areteMadre?: string | null;
  nombreMadre?: string | null;
  especieMadre?: 'bovino' | 'bufalino' | null;
}

function mapearFilaAParto(row: FilaParto): Parto {
  return {
    id: row.id,
    animalId: row.animalId,
    fecha: row.fecha,
    sexoCria: (row.sexoCria as 'M' | 'H') || 'H',
    pesoCria: row.pesoCria != null ? Number(row.pesoCria) : undefined,
    areteCria: row.areteCria || undefined,
    observaciones: row.observaciones || undefined,
    sincronizado: row.sincronizado === 1 ? 1 : 0,
    fechaActualizacion: row.fechaActualizacion || new Date().toISOString(),
  };
}

export const PartoRepository = {
  /**
   * Obtiene todos los partos registrados ordenados por fecha descendente.
   */
  async getAll(): Promise<Parto[]> {
    if (!db) return [];
    try {
      const filas = await db.getAllAsync<FilaParto>(
        'SELECT * FROM partos ORDER BY fecha DESC, fechaActualizacion DESC;'
      );
      return filas.map(mapearFilaAParto);
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al obtener partos:', error.message);
      }
      return [];
    }
  },

  /**
   * Obtiene un parto por su ID único.
   */
  async getById(id: string): Promise<Parto | null> {
    if (!db) return null;
    try {
      const fila = await db.getFirstAsync<FilaParto>(
        'SELECT * FROM partos WHERE id = ?;',
        [id]
      );
      return fila ? mapearFilaAParto(fila) : null;
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al obtener parto ${id}:`, error.message);
      }
      return null;
    }
  },

  /**
   * Obtiene todos los partos de una búfala.
   */
  async getByAnimal(animalId: string): Promise<Parto[]> {
    if (!db) return [];
    try {
      const filas = await db.getAllAsync<FilaParto>(
        'SELECT * FROM partos WHERE animalId = ? ORDER BY fecha DESC;',
        [animalId]
      );
      return filas.map(mapearFilaAParto);
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al obtener partos del animal ${animalId}:`, error.message);
      }
      return [];
    }
  },

  /**
   * Obtiene los partos de una búfala ordenados cronológicamente (más reciente primero).
   */
  async getByAnimalOrdenado(animalId: string): Promise<Parto[]> {
    return this.getByAnimal(animalId);
  },

  /**
   * Obtiene los partos más recientes con arete y nombre de la madre.
   */
  async getRecientes(limite: number = 10): Promise<PartoConAnimal[]> {
    if (!db) return [];
    try {
      const filas = await db.getAllAsync<FilaPartoConAnimal>(
        `SELECT p.*, a.arete as areteMadre, a.nombre as nombreMadre, a.especie as especieMadre
         FROM partos p
         LEFT JOIN animales a ON p.animalId = a.id
         ORDER BY p.fecha DESC, p.fechaActualizacion DESC
         LIMIT ?;`,
        [limite]
      );
      return filas.map((row) => ({
        ...mapearFilaAParto(row),
        areteMadre: row.areteMadre || 'Sin arete',
        nombreMadre: row.nombreMadre || undefined,
        especieMadre: (row.especieMadre as 'bovino' | 'bufalino') || undefined,
      }));
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al obtener partos recientes:', error.message);
      }
      return [];
    }
  },

  /**
   * Cuenta los partos de un mes y año específicos agrupando por sexo de la cría.
   */
  async contarDelMes(
    anio: number,
    mes: number
  ): Promise<{ machos: number; hembras: number; total: number }> {
    if (!db) return { machos: 0, hembras: 0, total: 0 };
    try {
      const mesStr = mes.toString().padStart(2, '0');
      const prefijoMes = `${anio}-${mesStr}`;

      const fila = await db.getFirstAsync<{
        machos: number;
        hembras: number;
        total: number;
      }>(
        `SELECT 
          COALESCE(SUM(CASE WHEN sexoCria = 'M' THEN 1 ELSE 0 END), 0) as machos,
          COALESCE(SUM(CASE WHEN sexoCria = 'H' THEN 1 ELSE 0 END), 0) as hembras,
          COUNT(*) as total
        FROM partos
        WHERE fecha LIKE ?;`,
        [`${prefijoMes}%`]
      );

      return {
        machos: Number(fila?.machos ?? 0),
        hembras: Number(fila?.hembras ?? 0),
        total: Number(fila?.total ?? 0),
      };
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al contar partos del mes:', error.message);
      }
      return { machos: 0, hembras: 0, total: 0 };
    }
  },

  /**
   * Registra un nuevo parto en SQLite.
   */
  async create(parto: Parto): Promise<void> {
    if (!db) {
      throw new Error('Base de datos no inicializada');
    }
    try {
      const ahora = new Date().toISOString();
      await db.runAsync(
        `INSERT INTO partos (
          id, animalId, fecha, sexoCria, pesoCria,
          areteCria, observaciones, sincronizado, fechaActualizacion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?);`,
        [
          parto.id,
          parto.animalId,
          parto.fecha,
          parto.sexoCria,
          parto.pesoCria ?? null,
          parto.areteCria ?? null,
          parto.observaciones ?? null,
          ahora,
        ]
      );
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al registrar parto:', error.message);
      }
      throw error;
    }
  },

  /**
   * Actualiza campos de un parto existente.
   */
  async update(id: string, cambios: Partial<Parto>): Promise<void> {
    if (!db) {
      throw new Error('Base de datos no inicializada');
    }
    try {
      const fechaActualizacion = new Date().toISOString();
      const camposActualizar: string[] = [];
      const valores: (string | number | null)[] = [];

      if (cambios.fecha !== undefined) {
        camposActualizar.push('fecha = ?');
        valores.push(cambios.fecha);
      }
      if (cambios.sexoCria !== undefined) {
        camposActualizar.push('sexoCria = ?');
        valores.push(cambios.sexoCria);
      }
      if (cambios.pesoCria !== undefined) {
        camposActualizar.push('pesoCria = ?');
        valores.push(cambios.pesoCria ?? null);
      }
      if (cambios.areteCria !== undefined) {
        camposActualizar.push('areteCria = ?');
        valores.push(cambios.areteCria ?? null);
      }
      if (cambios.observaciones !== undefined) {
        camposActualizar.push('observaciones = ?');
        valores.push(cambios.observaciones ?? null);
      }

      camposActualizar.push('sincronizado = 0');
      camposActualizar.push('fechaActualizacion = ?');
      valores.push(fechaActualizacion);

      valores.push(id);

      await db.runAsync(
        `UPDATE partos SET ${camposActualizar.join(', ')} WHERE id = ?;`,
        valores
      );
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al actualizar parto ${id}:`, error.message);
      }
      throw error;
    }
  },

  /**
   * TAREA 10: Elimina un registro de parto y recalcula automáticamente
   * totalPartos del animal madre para mantener consistencia de desnormalización.
   */
  async delete(id: string): Promise<void> {
    if (!db) {
      throw new Error('Base de datos no inicializada');
    }
    try {
      // 1. Obtener el parto antes de eliminarlo para conocer el animalId
      const parto = await this.getById(id);
      if (!parto) return;

      // 2. Eliminar el registro de parto
      await db.runAsync('DELETE FROM partos WHERE id = ?;', [id]);

      // 3. Recalcular totalPartos contando los partos restantes
      const conteoFila = await db.getFirstAsync<{ total: number }>(
        'SELECT COUNT(*) as total FROM partos WHERE animalId = ?;',
        [parto.animalId]
      );
      const nuevoTotalPartos = Number(conteoFila?.total ?? 0);

      // 4. Actualizar desnormalización en la tabla de animales
      const ahora = new Date().toISOString();
      await db.runAsync(
        `UPDATE animales 
         SET totalPartos = ?, sincronizado = 0, fechaActualizacion = ? 
         WHERE id = ?;`,
        [nuevoTotalPartos, ahora, parto.animalId]
      );
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al eliminar parto ${id}:`, error.message);
      }
      throw error;
    }
  },
};
