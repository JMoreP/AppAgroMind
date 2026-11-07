import { db } from '../../../database/sqlite/db';
import { Ceba, CebaConAnimal } from '../types/Ceba';
import {
  calcularPesoActual,
  determinarEtapaActual,
  calcularDiasCeba,
  calcularGananciaPesoDiaria,
} from '../utils/calculosCeba';

interface FilaCeba {
  id: string;
  animalId: string;
  fechaNacimiento?: string | null;
  pesoDestete?: number | null;
  padreNro?: string | null;
  raza?: string | null;
  fechaInicio: string;
  pesoI?: number | null;
  fechaII?: string | null;
  pesoII?: number | null;
  fechaIII?: string | null;
  pesoIII?: number | null;
  fechaIV?: string | null;
  pesoIV?: number | null;
  pesoObjetivo?: number | null;
  observaciones?: string | null;
  activo: number;
  sincronizado: number;
  fechaActualizacion: string;
}

interface FilaCebaConAnimal extends FilaCeba {
  areteAnimal?: string | null;
  nombreAnimal?: string | null;
  especieAnimal?: 'bovino' | 'bufalino' | null;
}

function mapearFilaACeba(row: FilaCeba): Ceba {
  return {
    id: row.id,
    animalId: row.animalId,
    fechaNacimiento: row.fechaNacimiento || undefined,
    pesoDestete: row.pesoDestete != null ? Number(row.pesoDestete) : undefined,
    padreNro: row.padreNro || undefined,
    raza: row.raza || undefined,
    fechaInicio: row.fechaInicio,
    pesoI: row.pesoI != null ? Number(row.pesoI) : undefined,
    fechaII: row.fechaII || undefined,
    pesoII: row.pesoII != null ? Number(row.pesoII) : undefined,
    fechaIII: row.fechaIII || undefined,
    pesoIII: row.pesoIII != null ? Number(row.pesoIII) : undefined,
    fechaIV: row.fechaIV || undefined,
    pesoIV: row.pesoIV != null ? Number(row.pesoIV) : undefined,
    pesoObjetivo: row.pesoObjetivo != null ? Number(row.pesoObjetivo) : 450,
    observaciones: row.observaciones || undefined,
    activo: row.activo === 1 ? 1 : 0,
    sincronizado: row.sincronizado === 1 ? 1 : 0,
    fechaActualizacion: row.fechaActualizacion || new Date().toISOString(),
  };
}

export const CebaRepository = {
  /**
   * Obtiene todos los registros de ceba ordenados por fecha de inicio descendente.
   */
  async getAll(): Promise<Ceba[]> {
    if (!db) return [];
    try {
      const filas = await db.getAllAsync<FilaCeba>(
        'SELECT * FROM ceba ORDER BY fechaInicio DESC, fechaActualizacion DESC;'
      );
      return filas.map(mapearFilaACeba);
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al obtener registros de ceba:', error.message);
      }
      return [];
    }
  },

  /**
   * Obtiene todos los animales actualmente en ceba activa (activo = 1).
   */
  async getAllActivos(): Promise<Ceba[]> {
    if (!db) return [];
    try {
      const filas = await db.getAllAsync<FilaCeba>(
        'SELECT * FROM ceba WHERE activo = 1 ORDER BY fechaInicio DESC;'
      );
      return filas.map(mapearFilaACeba);
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al obtener cebas activas:', error.message);
      }
      return [];
    }
  },

  /**
   * Obtiene todos los animales en ceba activa con datos del animal (arete y nombre).
   */
  async getAllActivosConAnimal(): Promise<CebaConAnimal[]> {
    if (!db) return [];
    try {
      const filas = await db.getAllAsync<FilaCebaConAnimal>(
        `SELECT c.*, a.arete as areteAnimal, a.nombre as nombreAnimal, a.especie as especieAnimal
         FROM ceba c
         LEFT JOIN animales a ON c.animalId = a.id
         WHERE c.activo = 1
         ORDER BY c.fechaInicio DESC;`
      );
      return filas.map((row) => ({
        ...mapearFilaACeba(row),
        areteAnimal: row.areteAnimal || 'Sin arete',
        nombreAnimal: row.nombreAnimal || undefined,
        especieAnimal: (row.especieAnimal as 'bovino' | 'bufalino') || undefined,
      }));
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al obtener cebas activas con animal:', error.message);
      }
      return [];
    }
  },

  /**
   * Obtiene una ceba por su ID único.
   */
  async getById(id: string): Promise<Ceba | null> {
    if (!db) return null;
    try {
      const fila = await db.getFirstAsync<FilaCeba>(
        'SELECT * FROM ceba WHERE id = ?;',
        [id]
      );
      return fila ? mapearFilaACeba(fila) : null;
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al obtener ceba ${id}:`, error.message);
      }
      return null;
    }
  },

  /**
   * Obtiene todas las cebas históricas de un animal.
   */
  async getByAnimal(animalId: string): Promise<Ceba[]> {
    if (!db) return [];
    try {
      const filas = await db.getAllAsync<FilaCeba>(
        'SELECT * FROM ceba WHERE animalId = ? ORDER BY fechaInicio DESC;',
        [animalId]
      );
      return filas.map(mapearFilaACeba);
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al obtener cebas del animal ${animalId}:`, error.message);
      }
      return [];
    }
  },

  /**
   * Obtiene las cebas más recientes haciendo JOIN con la tabla animales para mostrar arete y nombre.
   */
  async getRecientes(limite: number = 10): Promise<CebaConAnimal[]> {
    if (!db) return [];
    try {
      const filas = await db.getAllAsync<FilaCebaConAnimal>(
        `SELECT c.*, a.arete as areteAnimal, a.nombre as nombreAnimal, a.especie as especieAnimal
         FROM ceba c
         LEFT JOIN animales a ON c.animalId = a.id
         ORDER BY c.fechaInicio DESC, c.fechaActualizacion DESC
         LIMIT ?;`,
        [limite]
      );
      return filas.map((row) => ({
        ...mapearFilaACeba(row),
        areteAnimal: row.areteAnimal || 'Sin arete',
        nombreAnimal: row.nombreAnimal || undefined,
        especieAnimal: (row.especieAnimal as 'bovino' | 'bufalino') || undefined,
      }));
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al obtener cebas recientes:', error.message);
      }
      return [];
    }
  },

  /**
   * Registra un nuevo ciclo de ceba.
   */
  async create(ceba: Ceba): Promise<void> {
    if (!db) {
      throw new Error('Base de datos no inicializada');
    }
    try {
      const ahora = new Date().toISOString();
      await db.runAsync(
        `INSERT INTO ceba (
          id, animalId, fechaNacimiento, pesoDestete, padreNro,
          raza, fechaInicio, pesoI, fechaII, pesoII,
          fechaIII, pesoIII, fechaIV, pesoIV, pesoObjetivo, observaciones,
          activo, sincronizado, fechaActualizacion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?);`,
        [
          ceba.id,
          ceba.animalId,
          ceba.fechaNacimiento ?? null,
          ceba.pesoDestete ?? null,
          ceba.padreNro ?? null,
          ceba.raza ?? null,
          ceba.fechaInicio,
          ceba.pesoI ?? null,
          ceba.fechaII ?? null,
          ceba.pesoII ?? null,
          ceba.fechaIII ?? null,
          ceba.pesoIII ?? null,
          ceba.fechaIV ?? null,
          ceba.pesoIV ?? null,
          ceba.pesoObjetivo ?? 450,
          ceba.observaciones ?? null,
          ceba.activo ?? 1,
          ahora,
        ]
      );
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al registrar ceba:', error.message);
      }
      throw error;
    }
  },

  /**
   * Actualiza campos de un registro de ceba.
   */
  async update(id: string, cambios: Partial<Ceba>): Promise<void> {
    if (!db) {
      throw new Error('Base de datos no inicializada');
    }
    try {
      const fechaActualizacion = new Date().toISOString();
      const camposActualizar: string[] = [];
      const valores: (string | number | null)[] = [];

      if (cambios.fechaNacimiento !== undefined) {
        camposActualizar.push('fechaNacimiento = ?');
        valores.push(cambios.fechaNacimiento ?? null);
      }
      if (cambios.pesoDestete !== undefined) {
        camposActualizar.push('pesoDestete = ?');
        valores.push(cambios.pesoDestete ?? null);
      }
      if (cambios.padreNro !== undefined) {
        camposActualizar.push('padreNro = ?');
        valores.push(cambios.padreNro ?? null);
      }
      if (cambios.raza !== undefined) {
        camposActualizar.push('raza = ?');
        valores.push(cambios.raza ?? null);
      }
      if (cambios.fechaInicio !== undefined) {
        camposActualizar.push('fechaInicio = ?');
        valores.push(cambios.fechaInicio);
      }
      if (cambios.pesoI !== undefined) {
        camposActualizar.push('pesoI = ?');
        valores.push(cambios.pesoI ?? null);
      }
      if (cambios.fechaII !== undefined) {
        camposActualizar.push('fechaII = ?');
        valores.push(cambios.fechaII ?? null);
      }
      if (cambios.pesoII !== undefined) {
        camposActualizar.push('pesoII = ?');
        valores.push(cambios.pesoII ?? null);
      }
      if (cambios.fechaIII !== undefined) {
        camposActualizar.push('fechaIII = ?');
        valores.push(cambios.fechaIII ?? null);
      }
      if (cambios.pesoIII !== undefined) {
        camposActualizar.push('pesoIII = ?');
        valores.push(cambios.pesoIII ?? null);
      }
      if (cambios.fechaIV !== undefined) {
        camposActualizar.push('fechaIV = ?');
        valores.push(cambios.fechaIV ?? null);
      }
      if (cambios.pesoIV !== undefined) {
        camposActualizar.push('pesoIV = ?');
        valores.push(cambios.pesoIV ?? null);
      }
      if (cambios.pesoObjetivo !== undefined) {
        camposActualizar.push('pesoObjetivo = ?');
        valores.push(cambios.pesoObjetivo ?? 450);
      }
      if (cambios.observaciones !== undefined) {
        camposActualizar.push('observaciones = ?');
        valores.push(cambios.observaciones ?? null);
      }
      if (cambios.activo !== undefined) {
        camposActualizar.push('activo = ?');
        valores.push(cambios.activo);
      }

      camposActualizar.push('sincronizado = 0');
      camposActualizar.push('fechaActualizacion = ?');
      valores.push(fechaActualizacion);

      valores.push(id);

      await db.runAsync(
        `UPDATE ceba SET ${camposActualizar.join(', ')} WHERE id = ?;`,
        valores
      );
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al actualizar ceba ${id}:`, error.message);
      }
      throw error;
    }
  },

  /**
   * Elimina un registro de ceba.
   */
  async delete(id: string): Promise<void> {
    if (!db) {
      throw new Error('Base de datos no inicializada');
    }
    try {
      await db.runAsync('DELETE FROM ceba WHERE id = ?;', [id]);
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al eliminar ceba ${id}:`, error.message);
      }
      throw error;
    }
  },

  /**
   * Cuenta la cantidad de animales en ceba activa (activo = 1).
   */
  async contarActivos(): Promise<number> {
    if (!db) return 0;
    try {
      const fila = await db.getFirstAsync<{ total: number }>(
        'SELECT COUNT(*) as total FROM ceba WHERE activo = 1;'
      );
      return Number(fila?.total ?? 0);
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al contar cebas activas:', error.message);
      }
      return 0;
    }
  },

  /**
   * Retorna los animales con mayor ganancia de peso diaria (GP Ceba).
   */
  async getTopGanancia(limite: number = 5): Promise<CebaConAnimal[]> {
    if (!db) return [];
    try {
      const filas = await db.getAllAsync<FilaCebaConAnimal>(
        `SELECT c.*, a.arete as areteAnimal, a.nombre as nombreAnimal
         FROM ceba c
         LEFT JOIN animales a ON c.animalId = a.id
         WHERE c.activo = 1;`
      );

      const cebasConGP = filas.map((row) => {
        const ceba = {
          ...mapearFilaACeba(row),
          areteAnimal: row.areteAnimal || 'Sin arete',
          nombreAnimal: row.nombreAnimal || undefined,
        };

        const pesoActual = calcularPesoActual(ceba);
        const etapa = determinarEtapaActual(ceba);

        let fechaFin = ceba.fechaInicio;
        if (etapa === 'IV' && ceba.fechaIV) fechaFin = ceba.fechaIV;
        else if (etapa === 'III' && ceba.fechaIII) fechaFin = ceba.fechaIII;
        else if (etapa === 'II' && ceba.fechaII) fechaFin = ceba.fechaII;

        let dias = 0;
        try {
          dias = calcularDiasCeba(ceba.fechaInicio, fechaFin);
        } catch {
          dias = 0;
        }

        const gp = calcularGananciaPesoDiaria(ceba.pesoI ?? 0, pesoActual, dias);
        return { ceba, gp };
      });

      cebasConGP.sort((a, b) => b.gp - a.gp);
      return cebasConGP.slice(0, limite).map((item) => item.ceba);
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al obtener top ganancia de ceba:', error.message);
      }
      return [];
    }
  },
};
