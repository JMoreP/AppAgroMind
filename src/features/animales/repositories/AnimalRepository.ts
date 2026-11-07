import { db } from '../../../database/sqlite/db';
import { Animal } from '../types/Animal';

function mapearFilaAAnimal(row: Record<string, unknown>): Animal {
  return {
    id: String(row.id),
    arete: String(row.arete),
    nombre: row.nombre ? String(row.nombre) : undefined,
    sexo: row.sexo as 'M' | 'H',
    especie: (row.especie as 'bovino' | 'bufalino') || 'bufalino',
    fechaNacimiento: String(row.fechaNacimiento),
    raza: row.raza ? String(row.raza) : undefined,
    pesoInicial: Number(row.pesoInicial ?? 0),
    pesoActual: Number(row.pesoActual ?? row.ultimoPesajeCarne ?? 0),
    padreNro: row.padreNro ? String(row.padreNro) : undefined,
    madreNro: row.madreNro ? String(row.madreNro) : undefined,
    estadoReproductivo: (row.estadoReproductivo as Animal['estadoReproductivo']) || (row.sexo === 'M' ? 'ninguno' : 'vacia'),
    totalPartos: Number(row.totalPartos ?? 0),
    fechaInseminacion: row.fechaInseminacion ? String(row.fechaInseminacion) : undefined,
    fechaProbableParto: row.fechaProbableParto ? String(row.fechaProbableParto) : undefined,
    ultimoPesajeLitros: Number(row.ultimoPesajeLitros ?? 0),
    promedioLitros: Number(row.promedioLitros ?? 0),
    estadoVida: (row.estadoVida as Animal['estadoVida']) || 'activa',
    loteId: row.loteId ? String(row.loteId) : undefined,
    sincronizado: row.sincronizado === 1 ? 1 : 0,
    fechaActualizacion: String(row.fechaActualizacion || new Date().toISOString()),
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
      const filas = await db.getAllAsync<Record<string, unknown>>('SELECT * FROM animales ORDER BY arete ASC;');
      return filas.map(mapearFilaAAnimal);
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al obtener animales de SQLite:', error.message);
      }
      return [];
    }
  },

  async getById(id: string): Promise<Animal | null> {
    if (!db) return null;
    try {
      const fila = await db.getFirstAsync<Record<string, unknown>>('SELECT * FROM animales WHERE id = ?;', [id]);
      return fila ? mapearFilaAAnimal(fila) : null;
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al obtener animal con id ${id}:`, error.message);
      }
      return null;
    }
  },

  async getByArete(arete: string): Promise<Animal | null> {
    if (!db) return null;
    try {
      const fila = await db.getFirstAsync<Record<string, unknown>>('SELECT * FROM animales WHERE arete = ?;', [arete]);
      return fila ? mapearFilaAAnimal(fila) : null;
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al obtener animal con arete ${arete}:`, error.message);
      }
      return null;
    }
  },

  async create(animal: Animal): Promise<void> {
    if (!db) return;
    try {
      const fechaActualizacion = animal.fechaActualizacion || new Date().toISOString();
      await db.runAsync(
        `INSERT INTO animales (
          id, arete, nombre, sexo, especie, fechaNacimiento, raza,
          pesoInicial, pesoActual, padreNro, madreNro,
          estadoReproductivo, totalPartos, fechaInseminacion, fechaProbableParto,
          ultimoPesajeLitros, promedioLitros, estadoVida, loteId,
          sincronizado, fechaActualizacion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          animal.id,
          animal.arete,
          animal.nombre ?? null,
          animal.sexo,
          animal.especie ?? 'bufalino',
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
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al crear animal en SQLite:', error.message);
      }
      throw error;
    }
  },

  async update(id: string, cambios: Partial<Animal>): Promise<void> {
    if (!db) return;
    try {
      const keys = Object.keys(cambios).filter(k => k !== 'id');
      if (keys.length === 0) return;

      const camposConParametros = keys.map(k => `${k} = ?`);
      const valores = keys.map(k => {
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

      const sql = `UPDATE animales SET ${camposConParametros.join(', ')} WHERE id = ?;`;
      await db.runAsync(sql, valores as (string | number | null)[]);
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al actualizar animal ${id} en SQLite:`, error.message);
      }
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    if (!db) return;
    try {
      await db.runAsync('DELETE FROM animales WHERE id = ?;', [id]);
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al eliminar animal ${id} de SQLite:`, error.message);
      }
      throw error;
    }
  },

  async contarPorEstadoVida(): Promise<{ activa: number; muerta: number; descartada: number }> {
    if (!db) return { activa: 0, muerta: 0, descartada: 0 };
    try {
      const filas = await db.getAllAsync<{ estadoVida: string; total: number }>(
        'SELECT estadoVida, COUNT(*) as total FROM animales GROUP BY estadoVida;'
      );
      const conteo = { activa: 0, muerta: 0, descartada: 0 };
      for (const f of filas) {
        if (f.estadoVida === 'activa') conteo.activa = Number(f.total);
        if (f.estadoVida === 'muerta') conteo.muerta = Number(f.total);
        if (f.estadoVida === 'descartada') conteo.descartada = Number(f.total);
      }
      return conteo;
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al contar animales por estado de vida:', error.message);
      }
      return { activa: 0, muerta: 0, descartada: 0 };
    }
  },
};
