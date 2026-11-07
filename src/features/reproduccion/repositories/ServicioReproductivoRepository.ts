import { db } from '../../../database/sqlite/db';
import { ServicioReproductivo, ServicioConAnimal } from '../types/ServicioReproductivo';
import { calcularFechaProbableParto } from '../utils/calculosReproductivos';
import { Especie } from '../../../shared/config/configuracionEspecie';

interface FilaServicioReproductivo {
  id: string;
  animalId: string;
  fecha: string;
  tipo: string;
  numeroPajuela?: string | null;
  razaToro?: string | null;
  veterinario?: string | null;
  toroNumero?: string | null;
  toroRaza?: string | null;
  resultado?: string | null;
  fechaProbableParto?: string | null;
  observaciones?: string | null;
  sincronizado: number;
  fechaActualizacion: string;
}

function mapearFilaAServicio(row: FilaServicioReproductivo): ServicioReproductivo {
  return {
    id: row.id,
    animalId: row.animalId,
    fecha: row.fecha,
    tipo: row.tipo as 'inseminacion' | 'monta',
    numeroPajuela: row.numeroPajuela || undefined,
    razaToro: row.razaToro || undefined,
    veterinario: row.veterinario || undefined,
    toroNumero: row.toroNumero || undefined,
    toroRaza: row.toroRaza || undefined,
    resultado: (row.resultado as 'pendiente' | 'preñada' | 'vacia') || 'pendiente',
    fechaProbableParto: row.fechaProbableParto || undefined,
    observaciones: row.observaciones || undefined,
    sincronizado: row.sincronizado === 1 ? 1 : 0,
    fechaActualizacion: row.fechaActualizacion || new Date().toISOString(),
  };
}

export const ServicioReproductivoRepository = {
  /**
   * Obtiene todos los servicios registrados ordenados por fecha descendente.
   */
  async getAll(): Promise<ServicioReproductivo[]> {
    if (!db) return [];
    try {
      const filas = await db.getAllAsync<FilaServicioReproductivo>(
        'SELECT * FROM servicios_reproductivos ORDER BY fecha DESC, fechaActualizacion DESC;'
      );
      return filas.map(mapearFilaAServicio);
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al obtener servicios reproductivos:', error.message);
      }
      return [];
    }
  },

  /**
   * Obtiene un servicio por su ID único.
   */
  async getById(id: string): Promise<ServicioReproductivo | null> {
    if (!db) return null;
    try {
      const fila = await db.getFirstAsync<FilaServicioReproductivo>(
        'SELECT * FROM servicios_reproductivos WHERE id = ?;',
        [id]
      );
      return fila ? mapearFilaAServicio(fila) : null;
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al obtener servicio ${id}:`, error.message);
      }
      return null;
    }
  },

  /**
   * Obtiene todos los servicios de un animal.
   */
  async getByAnimal(animalId: string): Promise<ServicioReproductivo[]> {
    if (!db) return [];
    try {
      const filas = await db.getAllAsync<FilaServicioReproductivo>(
        'SELECT * FROM servicios_reproductivos WHERE animalId = ?;',
        [animalId]
      );
      return filas.map(mapearFilaAServicio);
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al obtener servicios para animal ${animalId}:`, error.message);
      }
      return [];
    }
  },

  /**
   * Obtiene los servicios de un animal ordenados del más reciente al más antiguo.
   */
  async getByAnimalOrdenado(animalId: string): Promise<ServicioReproductivo[]> {
    if (!db) return [];
    try {
      const filas = await db.getAllAsync<FilaServicioReproductivo>(
        'SELECT * FROM servicios_reproductivos WHERE animalId = ? ORDER BY fecha DESC, fechaActualizacion DESC;',
        [animalId]
      );
      return filas.map(mapearFilaAServicio);
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al obtener servicios ordenados para animal ${animalId}:`, error.message);
      }
      return [];
    }
  },

  /**
   * Obtiene el servicio más reciente de un animal.
   */
  async getUltimoPorAnimal(animalId: string): Promise<ServicioReproductivo | null> {
    if (!db) return null;
    try {
      const fila = await db.getFirstAsync<FilaServicioReproductivo>(
        'SELECT * FROM servicios_reproductivos WHERE animalId = ? ORDER BY fecha DESC, fechaActualizacion DESC LIMIT 1;',
        [animalId]
      );
      return fila ? mapearFilaAServicio(fila) : null;
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al obtener último servicio para animal ${animalId}:`, error.message);
      }
      return null;
    }
  },

  /**
   * Obtiene todos los servicios pendientes de confirmación/diagnóstico.
   */
  async getPendientes(): Promise<ServicioReproductivo[]> {
    if (!db) return [];
    try {
      const filas = await db.getAllAsync<FilaServicioReproductivo>(
        "SELECT * FROM servicios_reproductivos WHERE resultado = 'pendiente' ORDER BY fecha DESC;"
      );
      return filas.map(mapearFilaAServicio);
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al obtener servicios pendientes:', error.message);
      }
      return [];
    }
  },

  /**
   * Obtiene todos los servicios pendientes de confirmación/diagnóstico con datos del animal.
   */
  async getPendientesConAnimal(): Promise<ServicioConAnimal[]> {
    if (!db) return [];
    try {
      const filas = await db.getAllAsync<
        FilaServicioReproductivo & {
          arete: string | null;
          nombre: string | null;
          raza: string | null;
          loteId: string | null;
          especie: 'bovino' | 'bufalino' | null;
        }
      >(
        `SELECT s.*, COALESCE(a.arete, 'S/A') as arete, a.nombre, a.raza, a.loteId, a.especie 
         FROM servicios_reproductivos s
         LEFT JOIN animales a ON s.animalId = a.id
         WHERE s.resultado = 'pendiente' 
         ORDER BY s.fecha ASC;`
      );
      return filas.map((row) => ({
        ...mapearFilaAServicio(row),
        arete: row.arete || 'S/A',
        nombre: row.nombre || undefined,
        raza: row.raza || undefined,
        loteId: row.loteId || undefined,
        especie: (row.especie as 'bovino' | 'bufalino') || undefined,
      }));
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al obtener servicios pendientes con animal:', error.message);
      }
      return [];
    }
  },

  /**
   * Registra un nuevo servicio reproductivo.
   * Auto-calcula la FPP según la especie del animal si no fue indicada y desnormaliza
   * en la tabla `animales`: estadoReproductivo = 'servida', fechaInseminacion y fechaProbableParto.
   */
  async create(servicio: ServicioReproductivo): Promise<void> {
    if (!db) return;
    try {
      const fechaActualizacion = servicio.fechaActualizacion || new Date().toISOString();
      
      // Obtener especie del animal para calcular gestación adecuada (283 para bovino, 310 para bufalino)
      const filaAnimal = await db.getFirstAsync<{ especie: string }>(
        'SELECT especie FROM animales WHERE id = ?;',
        [servicio.animalId]
      );
      const especieAnimal: Especie = (filaAnimal?.especie as Especie) || 'bufalino';
      const fppCalculada = servicio.fechaProbableParto || calcularFechaProbableParto(servicio.fecha, especieAnimal);

      // 1. Insertar registro en servicios_reproductivos
      await db.runAsync(
        `INSERT INTO servicios_reproductivos (
          id, animalId, fecha, tipo,
          numeroPajuela, razaToro, veterinario,
          toroNumero, toroRaza,
          resultado, fechaProbableParto,
          observaciones, sincronizado, fechaActualizacion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          servicio.id,
          servicio.animalId,
          servicio.fecha,
          servicio.tipo,
          servicio.numeroPajuela ?? null,
          servicio.razaToro ?? null,
          servicio.veterinario ?? null,
          servicio.toroNumero ?? null,
          servicio.toroRaza ?? null,
          servicio.resultado ?? 'pendiente',
          fppCalculada,
          servicio.observaciones ?? null,
          servicio.sincronizado ?? 0,
          fechaActualizacion,
        ]
      );

      // 2. Desnormalización en animales: pasa a estado 'servida' con sus fechas estimadas
      await db.runAsync(
        `UPDATE animales 
         SET estadoReproductivo = 'servida',
             fechaInseminacion = ?,
             fechaProbableParto = ?,
             sincronizado = 0,
             fechaActualizacion = ?
         WHERE id = ?;`,
        [servicio.fecha, fppCalculada, fechaActualizacion, servicio.animalId]
      );
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al registrar servicio reproductivo:', error.message);
      }
      throw error;
    }
  },

  /**
   * Actualiza campos parciales de un servicio existente.
   */
  async update(id: string, cambios: Partial<ServicioReproductivo>): Promise<void> {
    if (!db) return;
    try {
      const servicioExistente = await this.getById(id);
      if (!servicioExistente) {
        throw new Error(`Servicio con ID ${id} no encontrado`);
      }

      const fechaActualizacion = new Date().toISOString();
      const camposActualizar: string[] = [];
      const valores: (string | number | null)[] = [];

      if (cambios.fecha !== undefined) {
        camposActualizar.push('fecha = ?');
        valores.push(cambios.fecha);
        if (cambios.fechaProbableParto === undefined) {
          const filaAnimal = await db.getFirstAsync<{ especie: string }>(
            'SELECT especie FROM animales WHERE id = ?;',
            [servicioExistente.animalId]
          );
          const especieAnimal: Especie = (filaAnimal?.especie as Especie) || 'bufalino';
          camposActualizar.push('fechaProbableParto = ?');
          valores.push(calcularFechaProbableParto(cambios.fecha, especieAnimal));
        }
      }
      if (cambios.tipo !== undefined) {
        camposActualizar.push('tipo = ?');
        valores.push(cambios.tipo);
      }
      if (cambios.numeroPajuela !== undefined) {
        camposActualizar.push('numeroPajuela = ?');
        valores.push(cambios.numeroPajuela ?? null);
      }
      if (cambios.razaToro !== undefined) {
        camposActualizar.push('razaToro = ?');
        valores.push(cambios.razaToro ?? null);
      }
      if (cambios.veterinario !== undefined) {
        camposActualizar.push('veterinario = ?');
        valores.push(cambios.veterinario ?? null);
      }
      if (cambios.toroNumero !== undefined) {
        camposActualizar.push('toroNumero = ?');
        valores.push(cambios.toroNumero ?? null);
      }
      if (cambios.toroRaza !== undefined) {
        camposActualizar.push('toroRaza = ?');
        valores.push(cambios.toroRaza ?? null);
      }
      if (cambios.resultado !== undefined) {
        camposActualizar.push('resultado = ?');
        valores.push(cambios.resultado);
      }
      if (cambios.fechaProbableParto !== undefined) {
        camposActualizar.push('fechaProbableParto = ?');
        valores.push(cambios.fechaProbableParto ?? null);
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
        `UPDATE servicios_reproductivos SET ${camposActualizar.join(', ')} WHERE id = ?;`,
        valores
      );
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al actualizar servicio ${id}:`, error.message);
      }
      throw error;
    }
  },

  /**
   * Actualiza el resultado del diagnóstico de preñez ('preñada' | 'vacia')
   * y sincroniza en la tabla de animales.
   */
  async updateResultado(id: string, resultado: 'preñada' | 'vacia'): Promise<void> {
    if (!db) return;
    try {
      const servicio = await this.getById(id);
      if (!servicio) {
        throw new Error(`Servicio con ID ${id} no encontrado`);
      }

      const ahora = new Date().toISOString();

      // 1. Actualizar resultado del servicio
      await db.runAsync(
        `UPDATE servicios_reproductivos 
         SET resultado = ?, sincronizado = 0, fechaActualizacion = ? 
         WHERE id = ?;`,
        [resultado, ahora, id]
      );

      // 2. Actualizar estado del animal correspondiente
      if (resultado === 'preñada') {
        await db.runAsync(
          `UPDATE animales 
           SET estadoReproductivo = 'preñada', sincronizado = 0, fechaActualizacion = ? 
           WHERE id = ?;`,
          [ahora, servicio.animalId]
        );
      } else {
        await db.runAsync(
          `UPDATE animales 
           SET estadoReproductivo = 'vacia', 
               fechaInseminacion = NULL, 
               fechaProbableParto = NULL, 
               sincronizado = 0, 
               fechaActualizacion = ? 
           WHERE id = ?;`,
          [ahora, servicio.animalId]
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al actualizar resultado para servicio ${id}:`, error.message);
      }
      throw error;
    }
  },

  /**
   * Elimina un registro de servicio reproductivo.
   * Si era el servicio activo, recalcula el estado reproductivo del animal.
   */
  async delete(id: string): Promise<void> {
    if (!db) return;
    try {
      const servicio = await this.getById(id);
      await db.runAsync('DELETE FROM servicios_reproductivos WHERE id = ?;', [id]);

      if (servicio) {
        // Consultar si queda algún servicio para el animal
        const ultimoRestante = await this.getUltimoPorAnimal(servicio.animalId);
        const ahora = new Date().toISOString();

        if (ultimoRestante) {
          const nuevoEstado = ultimoRestante.resultado === 'pendiente' 
            ? 'servida' 
            : ultimoRestante.resultado;
            
          await db.runAsync(
            `UPDATE animales 
             SET estadoReproductivo = ?,
                 fechaInseminacion = ?,
                 fechaProbableParto = ?,
                 sincronizado = 0,
                 fechaActualizacion = ?
             WHERE id = ?;`,
            [
              nuevoEstado,
              ultimoRestante.fecha,
              ultimoRestante.fechaProbableParto ?? null,
              ahora,
              servicio.animalId,
            ]
          );
        } else {
          // No queda ningún servicio registrado
          await db.runAsync(
            `UPDATE animales 
             SET estadoReproductivo = 'vacia',
                 fechaInseminacion = NULL,
                 fechaProbableParto = NULL,
                 sincronizado = 0,
                 fechaActualizacion = ?
             WHERE id = ?;`,
            [ahora, servicio.animalId]
          );
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al eliminar servicio ${id}:`, error.message);
      }
      throw error;
    }
  },

  /**
   * Cuenta la cantidad de servicios actualmente pendientes de diagnóstico.
   */
  async contarPendientes(): Promise<number> {
    if (!db) return 0;
    try {
      const fila = await db.getFirstAsync<{ total: number }>(
        "SELECT COUNT(*) as total FROM servicios_reproductivos WHERE resultado = 'pendiente';"
      );
      return Number(fila?.total ?? 0);
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al contar servicios pendientes:', error.message);
      }
      return 0;
    }
  },
};
