import { format } from 'date-fns';
import { db } from '../../../database/sqlite/db';
import {
  EventoSanitario,
  EventoSanitarioConAnimal,
  TipoEventoSanitario,
} from '../types/EventoSanitario';

interface FilaEventoSanitario {
  id: string;
  animalId?: string | null;
  esGrupal: number;
  fecha: string;
  tipo: string;
  producto: string;
  dosis?: string | null;
  responsable?: string | null;
  proximaDosis?: string | null;
  diasRetiroLeche?: number | null;
  observaciones?: string | null;
  sincronizado: number;
  fechaActualizacion: string;
}

interface FilaEventoSanitarioConAnimal extends FilaEventoSanitario {
  areteAnimal?: string | null;
  nombreAnimal?: string | null;
  especieAnimal?: 'bovino' | 'bufalino' | null;
}

function mapearFilaAEvento(row: FilaEventoSanitario): EventoSanitario {
  return {
    id: row.id,
    animalId: row.animalId || undefined,
    esGrupal: row.esGrupal === 1 ? 1 : 0,
    fecha: row.fecha,
    tipo: row.tipo as TipoEventoSanitario,
    producto: row.producto,
    dosis: row.dosis || undefined,
    responsable: row.responsable || undefined,
    proximaDosis: row.proximaDosis || undefined,
    diasRetiroLeche: row.diasRetiroLeche != null ? Number(row.diasRetiroLeche) : undefined,
    observaciones: row.observaciones || undefined,
    sincronizado: row.sincronizado === 1 ? 1 : 0,
    fechaActualizacion: row.fechaActualizacion || new Date().toISOString(),
  };
}

export const EventoSanitarioRepository = {
  /**
   * Obtiene todos los eventos sanitarios ordenados por fecha descendente.
   */
  async getAll(): Promise<EventoSanitario[]> {
    if (!db) return [];
    try {
      const filas = await db.getAllAsync<FilaEventoSanitario>(
        'SELECT * FROM eventos_sanitarios ORDER BY fecha DESC, fechaActualizacion DESC;'
      );
      return filas.map(mapearFilaAEvento);
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al obtener eventos sanitarios:', error.message);
      }
      return [];
    }
  },

  /**
   * Obtiene un evento sanitario por su ID único.
   */
  async getById(id: string): Promise<EventoSanitario | null> {
    if (!db) return null;
    try {
      const fila = await db.getFirstAsync<FilaEventoSanitario>(
        'SELECT * FROM eventos_sanitarios WHERE id = ?;',
        [id]
      );
      return fila ? mapearFilaAEvento(fila) : null;
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al obtener evento sanitario ${id}:`, error.message);
      }
      return null;
    }
  },

  /**
   * Obtiene los eventos sanitarios asociados a un animal.
   */
  async getByAnimal(animalId: string): Promise<EventoSanitario[]> {
    if (!db) return [];
    try {
      const filas = await db.getAllAsync<FilaEventoSanitario>(
        'SELECT * FROM eventos_sanitarios WHERE animalId = ?;',
        [animalId]
      );
      return filas.map(mapearFilaAEvento);
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al obtener eventos del animal ${animalId}:`, error.message);
      }
      return [];
    }
  },

  /**
   * Obtiene los eventos de un animal ordenados cronológicamente descendente.
   */
  async getByAnimalOrdenado(animalId: string): Promise<EventoSanitario[]> {
    if (!db) return [];
    try {
      const filas = await db.getAllAsync<FilaEventoSanitario>(
        'SELECT * FROM eventos_sanitarios WHERE animalId = ? ORDER BY fecha DESC, fechaActualizacion DESC;',
        [animalId]
      );
      return filas.map(mapearFilaAEvento);
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al obtener eventos ordenados del animal ${animalId}:`, error.message);
      }
      return [];
    }
  },

  /**
   * Obtiene los eventos aplicados de manera grupal a todo el hato.
   */
  async getGrupales(): Promise<EventoSanitario[]> {
    if (!db) return [];
    try {
      const filas = await db.getAllAsync<FilaEventoSanitario>(
        'SELECT * FROM eventos_sanitarios WHERE esGrupal = 1 ORDER BY fecha DESC, fechaActualizacion DESC;'
      );
      return filas.map(mapearFilaAEvento);
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al obtener eventos grupales:', error.message);
      }
      return [];
    }
  },

  /**
   * Obtiene los eventos recientes con datos del animal mediante JOIN.
   */
  async getRecientes(limite: number = 10): Promise<EventoSanitarioConAnimal[]> {
    if (!db) return [];
    try {
      const filas = await db.getAllAsync<FilaEventoSanitarioConAnimal>(
        `SELECT e.*, a.arete as areteAnimal, a.nombre as nombreAnimal, a.especie as especieAnimal
         FROM eventos_sanitarios e
         LEFT JOIN animales a ON e.animalId = a.id
         ORDER BY e.fecha DESC, e.fechaActualizacion DESC
         LIMIT ?;`,
        [limite]
      );
      return filas.map((row) => ({
        ...mapearFilaAEvento(row),
        areteAnimal: row.areteAnimal || undefined,
        nombreAnimal: row.nombreAnimal || undefined,
        especieAnimal: (row.especieAnimal as 'bovino' | 'bufalino') || undefined,
      }));
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al obtener eventos sanitarios recientes:', error.message);
      }
      return [];
    }
  },

  /**
   * Obtiene todos los eventos sanitarios de un mes específico con datos del animal.
   */
  async getByMes(anio: number, mes: number): Promise<EventoSanitarioConAnimal[]> {
    if (!db) return [];
    try {
      const mesStr = String(mes).padStart(2, '0');
      const patronMes = `${anio}-${mesStr}%`;
      const filas = await db.getAllAsync<FilaEventoSanitarioConAnimal>(
        `SELECT e.*, a.arete as areteAnimal, a.nombre as nombreAnimal, a.especie as especieAnimal
         FROM eventos_sanitarios e
         LEFT JOIN animales a ON e.animalId = a.id
         WHERE e.fecha LIKE ?
         ORDER BY e.fecha DESC, e.fechaActualizacion DESC;`,
        [patronMes]
      );
      return filas.map((row) => ({
        ...mapearFilaAEvento(row),
        areteAnimal: row.areteAnimal || undefined,
        nombreAnimal: row.nombreAnimal || undefined,
        especieAnimal: (row.especieAnimal as 'bovino' | 'bufalino') || undefined,
      }));
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al obtener eventos sanitarios para ${anio}-${mes}:`, error.message);
      }
      return [];
    }
  },

  /**
   * Obtiene los eventos cuya próxima dosis es futura o para el día de hoy (>= hoy).
   */
  async getProximasDosis(): Promise<EventoSanitarioConAnimal[]> {
    if (!db) return [];
    try {
      const hoy = format(new Date(), 'yyyy-MM-dd');
      const filas = await db.getAllAsync<FilaEventoSanitarioConAnimal>(
        `SELECT e.*, a.arete as areteAnimal, a.nombre as nombreAnimal, a.especie as especieAnimal
         FROM eventos_sanitarios e
         LEFT JOIN animales a ON e.animalId = a.id
         WHERE e.proximaDosis IS NOT NULL AND e.proximaDosis != '' AND e.proximaDosis >= ?
         ORDER BY e.proximaDosis ASC;`,
        [hoy]
      );
      return filas.map((row) => ({
        ...mapearFilaAEvento(row),
        areteAnimal: row.areteAnimal || undefined,
        nombreAnimal: row.nombreAnimal || undefined,
        especieAnimal: (row.especieAnimal as 'bovino' | 'bufalino') || undefined,
      }));
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al obtener próximas dosis:', error.message);
      }
      return [];
    }
  },

  /**
   * Obtiene los eventos cuya próxima dosis ya está vencida (< hoy).
   */
  async getVencidos(): Promise<EventoSanitarioConAnimal[]> {
    if (!db) return [];
    try {
      const hoy = format(new Date(), 'yyyy-MM-dd');
      const filas = await db.getAllAsync<FilaEventoSanitarioConAnimal>(
        `SELECT e.*, a.arete as areteAnimal, a.nombre as nombreAnimal, a.especie as especieAnimal
         FROM eventos_sanitarios e
         LEFT JOIN animales a ON e.animalId = a.id
         WHERE e.proximaDosis IS NOT NULL AND e.proximaDosis != '' AND e.proximaDosis < ?
         ORDER BY e.proximaDosis ASC;`,
        [hoy]
      );
      return filas.map((row) => ({
        ...mapearFilaAEvento(row),
        areteAnimal: row.areteAnimal || undefined,
        nombreAnimal: row.nombreAnimal || undefined,
        especieAnimal: (row.especieAnimal as 'bovino' | 'bufalino') || undefined,
      }));
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al obtener eventos vencidos:', error.message);
      }
      return [];
    }
  },

  /**
   * Registra un nuevo evento sanitario.
   */
  async create(evento: EventoSanitario): Promise<void> {
    if (!db) {
      throw new Error('Base de datos no inicializada');
    }
    try {
      const ahora = new Date().toISOString();
      await db.runAsync(
        `INSERT INTO eventos_sanitarios (
          id, animalId, esGrupal, fecha, tipo,
          producto, dosis, responsable, proximaDosis,
          diasRetiroLeche, observaciones, sincronizado, fechaActualizacion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?);`,
        [
          evento.id,
          evento.animalId ?? null,
          evento.esGrupal,
          evento.fecha,
          evento.tipo,
          evento.producto,
          evento.dosis ?? null,
          evento.responsable ?? null,
          evento.proximaDosis ?? null,
          evento.diasRetiroLeche ?? null,
          evento.observaciones ?? null,
          ahora,
        ]
      );
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al registrar evento sanitario:', error.message);
      }
      throw error;
    }
  },

  /**
   * Actualiza los datos de un evento sanitario.
   */
  async update(id: string, cambios: Partial<EventoSanitario>): Promise<void> {
    if (!db) {
      throw new Error('Base de datos no inicializada');
    }
    try {
      const fechaActualizacion = new Date().toISOString();
      const camposActualizar: string[] = [];
      const valores: (string | number | null)[] = [];

      if (cambios.animalId !== undefined) {
        camposActualizar.push('animalId = ?');
        valores.push(cambios.animalId ?? null);
      }
      if (cambios.esGrupal !== undefined) {
        camposActualizar.push('esGrupal = ?');
        valores.push(cambios.esGrupal);
      }
      if (cambios.fecha !== undefined) {
        camposActualizar.push('fecha = ?');
        valores.push(cambios.fecha);
      }
      if (cambios.tipo !== undefined) {
        camposActualizar.push('tipo = ?');
        valores.push(cambios.tipo);
      }
      if (cambios.producto !== undefined) {
        camposActualizar.push('producto = ?');
        valores.push(cambios.producto);
      }
      if (cambios.dosis !== undefined) {
        camposActualizar.push('dosis = ?');
        valores.push(cambios.dosis ?? null);
      }
      if (cambios.responsable !== undefined) {
        camposActualizar.push('responsable = ?');
        valores.push(cambios.responsable ?? null);
      }
      if (cambios.proximaDosis !== undefined) {
        camposActualizar.push('proximaDosis = ?');
        valores.push(cambios.proximaDosis ?? null);
      }
      if (cambios.diasRetiroLeche !== undefined) {
        camposActualizar.push('diasRetiroLeche = ?');
        valores.push(cambios.diasRetiroLeche ?? null);
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
        `UPDATE eventos_sanitarios SET ${camposActualizar.join(', ')} WHERE id = ?;`,
        valores
      );
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al actualizar evento sanitario ${id}:`, error.message);
      }
      throw error;
    }
  },

  /**
   * Elimina un evento sanitario por su ID.
   */
  async delete(id: string): Promise<void> {
    if (!db) {
      throw new Error('Base de datos no inicializada');
    }
    try {
      await db.runAsync('DELETE FROM eventos_sanitarios WHERE id = ?;', [id]);
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al eliminar evento sanitario ${id}:`, error.message);
      }
      throw error;
    }
  },

  /**
   * Cuenta los eventos sanitarios realizados en el mes actual.
   */
  async contarDelMes(): Promise<number> {
    if (!db) return 0;
    try {
      const mesActual = format(new Date(), 'yyyy-MM');
      const fila = await db.getFirstAsync<{ total: number }>(
        `SELECT COUNT(*) as total FROM eventos_sanitarios WHERE fecha LIKE ?;`,
        [`${mesActual}%`]
      );
      return Number(fila?.total ?? 0);
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al contar eventos sanitarios del mes:', error.message);
      }
      return 0;
    }
  },
};
