import { db } from '../../../database/sqlite/db';
import { DiagnosticoPrenez, DiagnosticoConAnimal } from '../types/DiagnosticoPrenez';

interface FilaDiagnosticoPrenez {
  id: string;
  animalId: string;
  servicioId?: string | null;
  fecha: string;
  resultado: string;
  metodo?: string | null;
  veterinario?: string | null;
  observaciones?: string | null;
  sincronizado: number;
  fechaActualizacion: string;
}

interface FilaDiagnosticoConAnimal extends FilaDiagnosticoPrenez {
  animalArete?: string | null;
  animalNombre?: string | null;
  animalEspecie?: 'bovino' | 'bufalino' | null;
}

function mapearFilaADiagnostico(row: FilaDiagnosticoPrenez): DiagnosticoPrenez {
  return {
    id: row.id,
    animalId: row.animalId,
    servicioId: row.servicioId || undefined,
    fecha: row.fecha,
    resultado: (row.resultado as 'preñada' | 'vacia') || 'vacia',
    metodo: (row.metodo as 'palpacion' | 'ecografia' | 'otro') || undefined,
    veterinario: row.veterinario || undefined,
    observaciones: row.observaciones || undefined,
    sincronizado: row.sincronizado === 1 ? 1 : 0,
    fechaActualizacion: row.fechaActualizacion || new Date().toISOString(),
  };
}

export const DiagnosticoPrenezRepository = {
  /**
   * Obtiene todos los diagnósticos registrados ordenados por fecha descendente.
   */
  async getAll(): Promise<DiagnosticoPrenez[]> {
    if (!db) return [];
    try {
      const filas = await db.getAllAsync<FilaDiagnosticoPrenez>(
        'SELECT * FROM diagnosticos_prenez ORDER BY fecha DESC, fechaActualizacion DESC;'
      );
      return filas.map(mapearFilaADiagnostico);
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al obtener diagnósticos de preñez:', error.message);
      }
      return [];
    }
  },

  /**
   * Obtiene un diagnóstico por su ID único.
   */
  async getById(id: string): Promise<DiagnosticoPrenez | null> {
    if (!db) return null;
    try {
      const fila = await db.getFirstAsync<FilaDiagnosticoPrenez>(
        'SELECT * FROM diagnosticos_prenez WHERE id = ?;',
        [id]
      );
      return fila ? mapearFilaADiagnostico(fila) : null;
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al obtener diagnóstico ${id}:`, error.message);
      }
      return null;
    }
  },

  /**
   * Obtiene todos los diagnósticos de un animal.
   */
  async getByAnimal(animalId: string): Promise<DiagnosticoPrenez[]> {
    if (!db) return [];
    try {
      const filas = await db.getAllAsync<FilaDiagnosticoPrenez>(
        'SELECT * FROM diagnosticos_prenez WHERE animalId = ? ORDER BY fecha DESC;',
        [animalId]
      );
      return filas.map(mapearFilaADiagnostico);
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al obtener diagnósticos para el animal ${animalId}:`, error.message);
      }
      return [];
    }
  },

  /**
   * Obtiene los diagnósticos de un animal ordenados cronológicamente (más reciente primero).
   */
  async getByAnimalOrdenado(animalId: string): Promise<DiagnosticoPrenez[]> {
    return this.getByAnimal(animalId);
  },

  /**
   * Obtiene el diagnóstico vinculado a un servicio reproductivo específico.
   */
  async getByServicio(servicioId: string): Promise<DiagnosticoPrenez | null> {
    if (!db) return null;
    try {
      const fila = await db.getFirstAsync<FilaDiagnosticoPrenez>(
        'SELECT * FROM diagnosticos_prenez WHERE servicioId = ? ORDER BY fecha DESC LIMIT 1;',
        [servicioId]
      );
      return fila ? mapearFilaADiagnostico(fila) : null;
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al obtener diagnóstico para el servicio ${servicioId}:`, error.message);
      }
      return null;
    }
  },

  /**
   * Obtiene los diagnósticos más recientes con datos del animal para listados globales.
   */
  async getRecientes(limite: number = 10): Promise<DiagnosticoConAnimal[]> {
    if (!db) return [];
    try {
      const filas = await db.getAllAsync<FilaDiagnosticoConAnimal>(
        `SELECT d.*, a.arete as animalArete, a.nombre as animalNombre, a.especie as animalEspecie
         FROM diagnosticos_prenez d
         LEFT JOIN animales a ON d.animalId = a.id
         ORDER BY d.fecha DESC, d.fechaActualizacion DESC
         LIMIT ?;`,
        [limite]
      );
      return filas.map((row) => ({
        ...mapearFilaADiagnostico(row),
        animalArete: row.animalArete || undefined,
        animalNombre: row.animalNombre || undefined,
        animalEspecie: (row.animalEspecie as 'bovino' | 'bufalino') || undefined,
      }));
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al obtener diagnósticos recientes:', error.message);
      }
      return [];
    }
  },

  /**
   * Crea un nuevo registro de diagnóstico de preñez.
   */
  async create(diagnostico: DiagnosticoPrenez): Promise<void> {
    if (!db) {
      throw new Error('Base de datos no inicializada');
    }
    try {
      const ahora = new Date().toISOString();
      await db.runAsync(
        `INSERT INTO diagnosticos_prenez (
          id, animalId, servicioId, fecha, resultado,
          metodo, veterinario, observaciones, sincronizado, fechaActualizacion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?);`,
        [
          diagnostico.id,
          diagnostico.animalId,
          diagnostico.servicioId ?? null,
          diagnostico.fecha,
          diagnostico.resultado,
          diagnostico.metodo ?? null,
          diagnostico.veterinario ?? null,
          diagnostico.observaciones ?? null,
          ahora,
        ]
      );
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al registrar diagnóstico de preñez:', error.message);
      }
      throw error;
    }
  },

  /**
   * Actualiza campos de un diagnóstico existente.
   */
  async update(id: string, cambios: Partial<DiagnosticoPrenez>): Promise<void> {
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
      if (cambios.resultado !== undefined) {
        camposActualizar.push('resultado = ?');
        valores.push(cambios.resultado);
      }
      if (cambios.metodo !== undefined) {
        camposActualizar.push('metodo = ?');
        valores.push(cambios.metodo ?? null);
      }
      if (cambios.veterinario !== undefined) {
        camposActualizar.push('veterinario = ?');
        valores.push(cambios.veterinario ?? null);
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
        `UPDATE diagnosticos_prenez SET ${camposActualizar.join(', ')} WHERE id = ?;`,
        valores
      );
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al actualizar diagnóstico ${id}:`, error.message);
      }
      throw error;
    }
  },

  /**
   * Elimina un registro de diagnóstico de preñez.
   */
  async delete(id: string): Promise<void> {
    if (!db) {
      throw new Error('Base de datos no inicializada');
    }
    try {
      await db.runAsync('DELETE FROM diagnosticos_prenez WHERE id = ?;', [id]);
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al eliminar diagnóstico ${id}:`, error.message);
      }
      throw error;
    }
  },

  /**
   * Cuenta los diagnósticos agrupados por resultado ('preñada' y 'vacia').
   * Opcionalmente filtra por el mes actual.
   */
  async contarPorResultado(mesActualSolo: boolean = false): Promise<{ preñadas: number; vacias: number }> {
    if (!db) return { preñadas: 0, vacias: 0 };
    try {
      let query = `
        SELECT 
          COALESCE(SUM(CASE WHEN resultado = 'preñada' THEN 1 ELSE 0 END), 0) as preñadas,
          COALESCE(SUM(CASE WHEN resultado = 'vacia' THEN 1 ELSE 0 END), 0) as vacias
        FROM diagnosticos_prenez
      `;
      const params: string[] = [];
      if (mesActualSolo) {
        const mesPrefix = new Date().toISOString().slice(0, 7);
        query += ' WHERE fecha LIKE ?';
        params.push(`${mesPrefix}%`);
      }
      const fila = await db.getFirstAsync<{ preñadas: number; vacias: number }>(query, params);
      return {
        preñadas: Number(fila?.preñadas ?? 0),
        vacias: Number(fila?.vacias ?? 0),
      };
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al contar diagnósticos por resultado:', error.message);
      }
      return { preñadas: 0, vacias: 0 };
    }
  },
};
