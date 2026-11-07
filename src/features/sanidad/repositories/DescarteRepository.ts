import { db } from '../../../database/sqlite/db';
import {
  DestinoDescarte,
  EventoDescarte,
  EventoDescarteConAnimal,
} from '../types/BajaAnimal';

interface FilaDescarte {
  id: string;
  animalId: string;
  fecha: string;
  destino: string;
  precio?: number | null;
  observaciones?: string | null;
  sincronizado: number;
  fechaActualizacion: string;
}

interface FilaDescarteConAnimal extends FilaDescarte {
  areteAnimal: string;
  nombreAnimal?: string | null;
  especieAnimal?: 'bovino' | 'bufalino' | null;
  sexoAnimal?: 'M' | 'H' | null;
}

function mapearFilaADescarte(row: FilaDescarte): EventoDescarte {
  return {
    id: row.id,
    animalId: row.animalId,
    fecha: row.fecha,
    destino: row.destino as DestinoDescarte,
    precio: row.precio != null ? Number(row.precio) : undefined,
    observaciones: row.observaciones || undefined,
    sincronizado: row.sincronizado === 1 ? 1 : 0,
    fechaActualizacion: row.fechaActualizacion || new Date().toISOString(),
  };
}

export const DescarteRepository = {
  async getAll(): Promise<EventoDescarte[]> {
    if (!db) return [];
    try {
      const filas = await db.getAllAsync<FilaDescarte>(
        'SELECT * FROM eventos_descarte ORDER BY fecha DESC, fechaActualizacion DESC;'
      );
      return filas.map(mapearFilaADescarte);
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al obtener eventos de descarte:', error.message);
      }
      return [];
    }
  },

  async getById(id: string): Promise<EventoDescarte | null> {
    if (!db) return null;
    try {
      const fila = await db.getFirstAsync<FilaDescarte>(
        'SELECT * FROM eventos_descarte WHERE id = ?;',
        [id]
      );
      return fila ? mapearFilaADescarte(fila) : null;
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al obtener evento de descarte ${id}:`, error.message);
      }
      return null;
    }
  },

  async getByAnimal(animalId: string): Promise<EventoDescarte[]> {
    if (!db) return [];
    try {
      const filas = await db.getAllAsync<FilaDescarte>(
        'SELECT * FROM eventos_descarte WHERE animalId = ? ORDER BY fecha DESC;',
        [animalId]
      );
      return filas.map(mapearFilaADescarte);
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al obtener descarte para animal ${animalId}:`, error.message);
      }
      return [];
    }
  },

  async getRecientes(limite: number): Promise<EventoDescarteConAnimal[]> {
    if (!db) return [];
    try {
      const filas = await db.getAllAsync<FilaDescarteConAnimal>(
        `SELECT d.*, a.arete as areteAnimal, a.nombre as nombreAnimal, a.especie as especieAnimal, a.sexo as sexoAnimal
         FROM eventos_descarte d
         INNER JOIN animales a ON d.animalId = a.id
         ORDER BY d.fecha DESC, d.fechaActualizacion DESC
         LIMIT ?;`,
        [limite]
      );
      return filas.map((row) => ({
        ...mapearFilaADescarte(row),
        areteAnimal: row.areteAnimal,
        nombreAnimal: row.nombreAnimal || undefined,
        especieAnimal: (row.especieAnimal as 'bovino' | 'bufalino') || undefined,
        sexoAnimal: (row.sexoAnimal as 'M' | 'H') || undefined,
      }));
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al obtener descartes recientes:', error.message);
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
        'SELECT COUNT(*) as total FROM eventos_descarte WHERE fecha LIKE ?;',
        [prefijo]
      );
      return Number(fila?.total ?? 0);
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al contar descartes del mes:', error.message);
      }
      return 0;
    }
  },

  async contarTotal(): Promise<number> {
    if (!db) return 0;
    try {
      const fila = await db.getFirstAsync<{ total: number }>(
        'SELECT COUNT(*) as total FROM eventos_descarte;'
      );
      return Number(fila?.total ?? 0);
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al contar total de descartes:', error.message);
      }
      return 0;
    }
  },

  async sumarPreciosDelMes(anio: number, mes: number): Promise<number> {
    if (!db) return 0;
    try {
      const mesStr = mes.toString().padStart(2, '0');
      const prefijo = `${anio}-${mesStr}%`;
      const fila = await db.getFirstAsync<{ total: number | null }>(
        'SELECT SUM(precio) as total FROM eventos_descarte WHERE fecha LIKE ?;',
        [prefijo]
      );
      return Number(fila?.total ?? 0);
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al sumar precios de descarte del mes:', error.message);
      }
      return 0;
    }
  },

  async create(evento: EventoDescarte): Promise<void> {
    if (!db) {
      throw new Error('Base de datos no inicializada');
    }
    try {
      const ahora = new Date().toISOString();
      await db.runAsync(
        `INSERT INTO eventos_descarte (
          id, animalId, fecha, destino, precio, observaciones, sincronizado, fechaActualizacion
        ) VALUES (?, ?, ?, ?, ?, ?, 0, ?);`,
        [
          evento.id,
          evento.animalId,
          evento.fecha,
          evento.destino,
          evento.precio ?? null,
          evento.observaciones ?? null,
          ahora,
        ]
      );
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al registrar descarte en SQLite:', error.message);
      }
      throw error;
    }
  },

  async update(id: string, cambios: Partial<EventoDescarte>): Promise<void> {
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
      const sql = `UPDATE eventos_descarte SET ${camposConParametros.join(', ')} WHERE id = ?;`;
      await db.runAsync(sql, valores as (string | number | null)[]);
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al actualizar descarte ${id} en SQLite:`, error.message);
      }
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    if (!db) {
      throw new Error('Base de datos no inicializada');
    }
    try {
      await db.runAsync('DELETE FROM eventos_descarte WHERE id = ?;', [id]);
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al eliminar descarte ${id}:`, error.message);
      }
      throw error;
    }
  },
};
