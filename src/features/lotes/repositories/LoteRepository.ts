import { db } from '../../../database/sqlite/db';
import { Lote } from '../types/Lote';

function mapearFilaALote(row: any): Lote {
  return {
    id: row.id,
    nombre: row.nombre,
    descripcion: row.descripcion || undefined,
    colorHex: row.colorHex || '#1EA97B',
    sincronizado: row.sincronizado === 1 ? 1 : 0,
    fechaActualizacion: row.fechaActualizacion || new Date().toISOString(),
  };
}

export const LoteRepository = {
  async getAll(): Promise<Lote[]> {
    if (!db) return [];
    try {
      const filas = await db.getAllAsync<any>('SELECT * FROM lotes ORDER BY nombre ASC;');
      return filas.map(mapearFilaALote);
    } catch (error) {
      console.error('Error al obtener lotes de SQLite:', error);
      return [];
    }
  },

  async getById(id: string): Promise<Lote | null> {
    if (!db) return null;
    try {
      const fila = await db.getFirstAsync<any>('SELECT * FROM lotes WHERE id = ?;', [id]);
      return fila ? mapearFilaALote(fila) : null;
    } catch (error) {
      console.error(`Error al obtener lote ${id}:`, error);
      return null;
    }
  },

  async create(lote: Lote): Promise<void> {
    if (!db) return;
    try {
      const fechaActualizacion = lote.fechaActualizacion || new Date().toISOString();
      await db.runAsync(
        `INSERT INTO lotes (id, nombre, descripcion, colorHex, sincronizado, fechaActualizacion)
         VALUES (?, ?, ?, ?, ?, ?);`,
        [
          lote.id,
          lote.nombre,
          lote.descripcion ?? null,
          lote.colorHex || '#1EA97B',
          lote.sincronizado ?? 0,
          fechaActualizacion,
        ]
      );
      console.log(`✅ Lote "${lote.nombre}" guardado en SQLite.`);
    } catch (error) {
      console.error('Error al crear lote en SQLite:', error);
      throw error;
    }
  },

  async update(id: string, cambios: Partial<Lote>): Promise<void> {
    if (!db) return;
    try {
      const keys = Object.keys(cambios).filter(k => k !== 'id');
      if (keys.length === 0) return;

      const setClause = keys.map(k => `${k} = ?`).join(', ');
      const values = keys.map(k => (cambios as any)[k] ?? null);

      let extraClause = '';
      if (!keys.includes('fechaActualizacion')) {
        extraClause += ', fechaActualizacion = ?';
        values.push(new Date().toISOString());
      }
      if (!keys.includes('sincronizado')) {
        extraClause += ', sincronizado = ?';
        values.push(0);
      }

      values.push(id);

      const sql = `UPDATE lotes SET ${setClause}${extraClause} WHERE id = ?;`;
      await db.runAsync(sql, values);
      console.log(`✅ Lote ${id} actualizado en SQLite.`);
    } catch (error) {
      console.error(`Error al actualizar lote ${id}:`, error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    if (!db) return;
    try {
      await db.runAsync('DELETE FROM lotes WHERE id = ?;', [id]);
      console.log(`✅ Lote ${id} eliminado de SQLite.`);
    } catch (error) {
      console.error(`Error al eliminar lote ${id}:`, error);
      throw error;
    }
  },
};
