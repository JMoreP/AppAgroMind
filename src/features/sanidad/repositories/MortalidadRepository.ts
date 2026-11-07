import { db } from '../../../database/sqlite/db';
import {
  EventoMortalidad,
  EventoMortalidadConAnimal,
} from '../types/BajaAnimal';

interface FilaMortalidad {
  id: string;
  animalId: string;
  fecha: string;
  causa: string;
  observaciones?: string | null;
  sincronizado: number;
  fechaActualizacion: string;
}

interface FilaMortalidadConAnimal extends FilaMortalidad {
  areteAnimal: string;
  nombreAnimal?: string | null;
  especieAnimal?: 'bovino' | 'bufalino' | null;
  sexoAnimal?: 'M' | 'H' | null;
}

function mapearFilaAMortalidad(row: FilaMortalidad): EventoMortalidad {
  return {
    id: row.id,
    animalId: row.animalId,
    fecha: row.fecha,
    causa: row.causa,
    observaciones: row.observaciones || undefined,
    sincronizado: row.sincronizado === 1 ? 1 : 0,
    fechaActualizacion: row.fechaActualizacion || new Date().toISOString(),
  };
}

export const MortalidadRepository = {
  async getAll(): Promise<EventoMortalidad[]> {
    if (!db) return [];
    try {
      const filas = await db.getAllAsync<FilaMortalidad>(
        'SELECT * FROM eventos_mortalidad ORDER BY fecha DESC, fechaActualizacion DESC;'
      );
      return filas.map(mapearFilaAMortalidad);
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al obtener eventos de mortalidad:', error.message);
      }
      return [];
    }
  },

  async getById(id: string): Promise<EventoMortalidad | null> {
    if (!db) return null;
    try {
      const fila = await db.getFirstAsync<FilaMortalidad>(
        'SELECT * FROM eventos_mortalidad WHERE id = ?;',
        [id]
      );
      return fila ? mapearFilaAMortalidad(fila) : null;
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al obtener evento de mortalidad ${id}:`, error.message);
      }
      return null;
    }
  },

  async getByAnimal(animalId: string): Promise<EventoMortalidad[]> {
    if (!db) return [];
    try {
      const filas = await db.getAllAsync<FilaMortalidad>(
        'SELECT * FROM eventos_mortalidad WHERE animalId = ? ORDER BY fecha DESC;',
        [animalId]
      );
      return filas.map(mapearFilaAMortalidad);
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al obtener mortalidad para animal ${animalId}:`, error.message);
      }
      return [];
    }
  },

  async getRecientes(limite: number): Promise<EventoMortalidadConAnimal[]> {
    if (!db) return [];
    try {
      const filas = await db.getAllAsync<FilaMortalidadConAnimal>(
        `SELECT m.*, a.arete as areteAnimal, a.nombre as nombreAnimal, a.especie as especieAnimal, a.sexo as sexoAnimal
         FROM eventos_mortalidad m
         INNER JOIN animales a ON m.animalId = a.id
         ORDER BY m.fecha DESC, m.fechaActualizacion DESC
         LIMIT ?;`,
        [limite]
      );
      return filas.map((row) => ({
        ...mapearFilaAMortalidad(row),
        areteAnimal: row.areteAnimal,
        nombreAnimal: row.nombreAnimal || undefined,
        especieAnimal: (row.especieAnimal as 'bovino' | 'bufalino') || undefined,
        sexoAnimal: (row.sexoAnimal as 'M' | 'H') || undefined,
      }));
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al obtener mortalidades recientes:', error.message);
      }
      return [];
    }
  },

  async contarDelMes(anio: number, mes: number): Promise<number> {
    if (!db) return 0;
    try {
      const mesStr = mes.toString().padStart(2, '0');
      const prefijo = `${anio}-${mesStr}%`;
      const fila = await db.getFirstAsync<{ total: number }>(
        'SELECT COUNT(*) as total FROM eventos_mortalidad WHERE fecha LIKE ?;',
        [prefijo]
      );
      return Number(fila?.total ?? 0);
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al contar mortalidades del mes:', error.message);
      }
      return 0;
    }
  },

  async contarTotal(): Promise<number> {
    if (!db) return 0;
    try {
      const fila = await db.getFirstAsync<{ total: number }>(
        'SELECT COUNT(*) as total FROM eventos_mortalidad;'
      );
      return Number(fila?.total ?? 0);
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al contar total de mortalidades:', error.message);
      }
      return 0;
    }
  },

  async create(evento: EventoMortalidad): Promise<void> {
    if (!db) {
      throw new Error('Base de datos no inicializada');
    }
    try {
      const ahora = new Date().toISOString();
      await db.runAsync(
        `INSERT INTO eventos_mortalidad (
          id, animalId, fecha, causa, observaciones, sincronizado, fechaActualizacion
        ) VALUES (?, ?, ?, ?, ?, 0, ?);`,
        [
          evento.id,
          evento.animalId,
          evento.fecha,
          evento.causa,
          evento.observaciones ?? null,
          ahora,
        ]
      );
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al registrar mortalidad en SQLite:', error.message);
      }
      throw error;
    }
  },

  async update(id: string, cambios: Partial<EventoMortalidad>): Promise<void> {
    if (!db) {
      throw new Error('Base de datos no inicializada');
    }
    try {
      const keys = Object.keys(cambios).filter((k) => k !== 'id');
      if (keys.length === 0) return;

      const camposConParametros = keys.map((k) => `${k} = ?`);
      const valores = keys.map((k) => {
        const val = (cambios as Record<string, unknown>)[k];
        return val !== undefined ? val : null;
      });

      if (!keys.includes('fechaActualizacion')) {
        camposConParametros.push('fechaActualizacion = ?');
        valores.push(new Date().toISOString());
      }
      if (!keys.includes('sincronizado')) {
        camposConParametros.push('sincronizado = ?');
        valores.push(0);
      }

      valores.push(id);
      const sql = `UPDATE eventos_mortalidad SET ${camposConParametros.join(', ')} WHERE id = ?;`;
      await db.runAsync(sql, valores as (string | number | null)[]);
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al actualizar mortalidad ${id} en SQLite:`, error.message);
      }
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    if (!db) {
      throw new Error('Base de datos no inicializada');
    }
    try {
      await db.runAsync('DELETE FROM eventos_mortalidad WHERE id = ?;', [id]);
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al eliminar mortalidad ${id}:`, error.message);
      }
      throw error;
    }
  },
};
