import { db } from '../../../database/sqlite/db';
import { Animal } from '../types/Animal';

function mapearFilaAAnimal(row: any): Animal {
  return {
    id: row.id,
    arete: row.arete,
    nombre: row.nombre || undefined,
    sexo: row.sexo as 'M' | 'H',
    fechaNacimiento: row.fechaNacimiento,
    raza: row.raza || undefined,
    pesoInicial: Number(row.pesoInicial ?? 0),
    pesoActual: Number(row.pesoActual ?? row.ultimoPesajeCarne ?? 0),
    padreNro: row.padreNro || undefined,
    madreNro: row.madreNro || undefined,
    estadoReproductivo: row.estadoReproductivo || (row.sexo === 'M' ? 'ninguno' : 'vacia'),
    totalPartos: Number(row.totalPartos ?? 0),
    fechaInseminacion: row.fechaInseminacion || undefined,
    fechaProbableParto: row.fechaProbableParto || undefined,
    ultimoPesajeLitros: Number(row.ultimoPesajeLitros ?? 0),
    promedioLitros: Number(row.promedioLitros ?? 0),
    estadoVida: row.estadoVida || 'activa',
    loteId: row.loteId || undefined,
    sincronizado: row.sincronizado === 1 ? 1 : 0,
    fechaActualizacion: row.fechaActualizacion || new Date().toISOString(),
  };
}

/**
 * Repositorio de Animales. Es el ÚNICO punto de acceso a datos de animales.
 * Toda pantalla debe consumir este repositorio a través de hooks, NUNCA 
 * consultar SQLite o Firebase directamente.
 */
export const AnimalRepository = {
  async getAll(): Promise<Animal[]> {
    if (!db) return [];
    try {
      const filas = await db.getAllAsync<any>('SELECT * FROM animales ORDER BY arete ASC;');
      return filas.map(mapearFilaAAnimal);
    } catch (error) {
      console.error('Error al obtener animales de SQLite:', error);
      return [];
    }
  },

  async getById(id: string): Promise<Animal | null> {
    if (!db) return null;
    try {
      const fila = await db.getFirstAsync<any>('SELECT * FROM animales WHERE id = ?;', [id]);
      return fila ? mapearFilaAAnimal(fila) : null;
    } catch (error) {
      console.error(`Error al obtener animal con id ${id}:`, error);
      return null;
    }
  },

  async getByArete(arete: string): Promise<Animal | null> {
    if (!db) return null;
    try {
      const fila = await db.getFirstAsync<any>('SELECT * FROM animales WHERE arete = ?;', [arete]);
      return fila ? mapearFilaAAnimal(fila) : null;
    } catch (error) {
      console.error(`Error al obtener animal con arete ${arete}:`, error);
      return null;
    }
  },

  async create(animal: Animal): Promise<void> {
    if (!db) return;
    try {
      const fechaActualizacion = animal.fechaActualizacion || new Date().toISOString();
      await db.runAsync(
        `INSERT INTO animales (
          id, arete, nombre, sexo, fechaNacimiento, raza,
          pesoInicial, pesoActual, padreNro, madreNro,
          estadoReproductivo, totalPartos, fechaInseminacion, fechaProbableParto,
          ultimoPesajeLitros, promedioLitros, estadoVida, loteId,
          sincronizado, fechaActualizacion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          animal.id,
          animal.arete,
          animal.nombre ?? null,
          animal.sexo,
          animal.fechaNacimiento,
          animal.raza ?? null,
          animal.pesoInicial ?? 0,
          animal.pesoActual ?? 0,
          animal.padreNro ?? null,
          animal.madreNro ?? null,
          animal.estadoReproductivo ?? (animal.sexo === 'M' ? 'ninguno' : 'vacia'),
          animal.totalPartos ?? 0,
          animal.fechaInseminacion ?? null,
          animal.fechaProbableParto ?? null,
          animal.ultimoPesajeLitros ?? 0,
          animal.promedioLitros ?? 0,
          animal.estadoVida ?? 'activa',
          animal.loteId ?? null,
          animal.sincronizado ?? 0,
          fechaActualizacion,
        ]
      );
      console.log(`✅ Animal con arete ${animal.arete} guardado en SQLite.`);
    } catch (error) {
      console.error('Error al crear animal en SQLite:', error);
      throw error;
    }
  },

  async update(id: string, cambios: Partial<Animal>): Promise<void> {
    if (!db) return;
    try {
      const keys = Object.keys(cambios).filter(k => k !== 'id');
      if (keys.length === 0) return;

      const camposConParametros = keys.map(k => `${k} = ?`);
      const valores = keys.map(k => (cambios as any)[k] ?? null);

      if (!keys.includes('fechaActualizacion')) {
        camposConParametros.push('fechaActualizacion = ?');
        valores.push(new Date().toISOString());
      }
      if (!keys.includes('sincronizado')) {
        camposConParametros.push('sincronizado = ?');
        valores.push(0);
      }

      valores.push(id);

      const sql = `UPDATE animales SET ${camposConParametros.join(', ')} WHERE id = ?;`;
      await db.runAsync(sql, valores);
      console.log(`✅ Animal ${id} actualizado en SQLite.`);
    } catch (error) {
      console.error(`Error al actualizar animal ${id} en SQLite:`, error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    if (!db) return;
    try {
      await db.runAsync('DELETE FROM animales WHERE id = ?;', [id]);
      console.log(`✅ Animal ${id} eliminado de SQLite.`);
    } catch (error) {
      console.error(`Error al eliminar animal ${id} de SQLite:`, error);
      throw error;
    }
  },
};

