import { db } from '../../../database/sqlite/db';
import { 
  PesajeLeche, 
  PesajeConAnimal, 
  ProductoraTopRanking, 
  AlertaHatoProduccion 
} from '../types/PesajeLeche';

interface FilaPesajeLeche {
  id: string;
  animalId: string;
  fecha: string;
  turno: string;
  litros: number;
  observaciones?: string | null;
  sincronizado: number;
  fechaActualizacion: string;
}

interface FilaPesajeConAnimal extends FilaPesajeLeche {
  arete?: string | null;
  nombre?: string | null;
  raza?: string | null;
  loteId?: string | null;
}

function mapearFilaAPesaje(row: FilaPesajeLeche): PesajeLeche {
  return {
    id: row.id,
    animalId: row.animalId,
    fecha: row.fecha,
    turno: row.turno as 'mañana' | 'tarde',
    litros: Number(row.litros ?? 0),
    observaciones: row.observaciones || undefined,
    sincronizado: row.sincronizado === 1 ? 1 : 0,
    fechaActualizacion: row.fechaActualizacion || new Date().toISOString(),
  };
}

export const PesajeLecheRepository = {
  async getAll(): Promise<PesajeLeche[]> {
    if (!db) return [];
    try {
      const filas = await db.getAllAsync<FilaPesajeLeche>(
        'SELECT * FROM pesajes_leche ORDER BY fecha DESC, fechaActualizacion DESC;'
      );
      return filas.map(mapearFilaAPesaje);
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al obtener pesajes de leche:', error.message);
      }
      return [];
    }
  },

  async getById(id: string): Promise<PesajeLeche | null> {
    if (!db) return null;
    try {
      const fila = await db.getFirstAsync<FilaPesajeLeche>(
        'SELECT * FROM pesajes_leche WHERE id = ?;',
        [id]
      );
      return fila ? mapearFilaAPesaje(fila) : null;
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al obtener pesaje ${id}:`, error.message);
      }
      return null;
    }
  },

  async getByFecha(fecha: string): Promise<PesajeLeche[]> {
    if (!db) return [];
    try {
      const filas = await db.getAllAsync<FilaPesajeLeche>(
        'SELECT * FROM pesajes_leche WHERE fecha = ? ORDER BY fechaActualizacion DESC;',
        [fecha]
      );
      return filas.map(mapearFilaAPesaje);
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al obtener pesajes para fecha ${fecha}:`, error.message);
      }
      return [];
    }
  },

  async getByAnimalId(animalId: string): Promise<PesajeLeche[]> {
    if (!db) return [];
    try {
      const filas = await db.getAllAsync<FilaPesajeLeche>(
        'SELECT * FROM pesajes_leche WHERE animalId = ? ORDER BY fecha DESC, fechaActualizacion DESC;',
        [animalId]
      );
      return filas.map(mapearFilaAPesaje);
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al obtener pesajes para animal ${animalId}:`, error.message);
      }
      return [];
    }
  },

  async getByAnimalYFecha(animalId: string, fecha: string): Promise<PesajeLeche[]> {
    if (!db) return [];
    try {
      const filas = await db.getAllAsync<FilaPesajeLeche>(
        'SELECT * FROM pesajes_leche WHERE animalId = ? AND fecha = ? ORDER BY fechaActualizacion DESC;',
        [animalId, fecha]
      );
      return filas.map(mapearFilaAPesaje);
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al obtener pesajes para animal ${animalId} en fecha ${fecha}:`, error.message);
      }
      return [];
    }
  },

  async getByFechaYTurno(fecha: string, turno: 'mañana' | 'tarde'): Promise<PesajeConAnimal[]> {
    if (!db) return [];
    try {
      const filas = await db.getAllAsync<FilaPesajeConAnimal>(
        `SELECT p.*, a.arete, a.nombre, a.raza, a.loteId 
         FROM pesajes_leche p
         LEFT JOIN animales a ON p.animalId = a.id
         WHERE p.fecha = ? AND p.turno = ?
         ORDER BY p.fechaActualizacion DESC;`,
        [fecha, turno]
      );
      return filas.map((row) => ({
        ...mapearFilaAPesaje(row),
        arete: row.arete || 'S/A',
        nombre: row.nombre || undefined,
        raza: row.raza || undefined,
        loteId: row.loteId || undefined,
      }));
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al obtener pesajes de fecha ${fecha} y turno ${turno}:`, error.message);
      }
      return [];
    }
  },

  /**
   * Calcula el promedio de litros de los últimos 7 días con pesajes para un animal.
   */
  async calcularPromedioUltimos7Dias(animalId: string): Promise<number> {
    if (!db) return 0;
    try {
      const fila = await db.getFirstAsync<{ promedio: number | null }>(
        `SELECT AVG(litros) as promedio 
         FROM (
           SELECT litros FROM pesajes_leche 
           WHERE animalId = ? 
           ORDER BY fecha DESC, fechaActualizacion DESC 
           LIMIT 14
         );`,
        [animalId]
      );
      return Number(fila?.promedio ? fila.promedio.toFixed(2) : 0);
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al calcular promedio últimos 7 días para animal ${animalId}:`, error.message);
      }
      return 0;
    }
  },

  /**
   * Guarda un pesaje de leche y desnormaliza automáticamente en la tabla animales:
   * actualiza ultimoPesajeLitros y promedioLitros.
   */
  async create(pesaje: PesajeLeche): Promise<void> {
    if (!db) return;
    try {
      const fechaActualizacion = pesaje.fechaActualizacion || new Date().toISOString();

      // 1. Insertar el pesaje
      await db.runAsync(
        `INSERT INTO pesajes_leche (
          id, animalId, fecha, turno, litros, observaciones, sincronizado, fechaActualizacion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          pesaje.id,
          pesaje.animalId,
          pesaje.fecha,
          pesaje.turno,
          pesaje.litros,
          pesaje.observaciones ?? null,
          pesaje.sincronizado ?? 0,
          fechaActualizacion,
        ]
      );

      // 2. Calcular nuevo promedio de los últimos 7 días
      const nuevoPromedio = await this.calcularPromedioUltimos7Dias(pesaje.animalId);

      // 3. Desnormalización automática en la tabla `animales`
      await db.runAsync(
        `UPDATE animales 
         SET ultimoPesajeLitros = ?, 
             promedioLitros = ?, 
             sincronizado = 0, 
             fechaActualizacion = ? 
         WHERE id = ?;`,
        [pesaje.litros, nuevoPromedio, fechaActualizacion, pesaje.animalId]
      );
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al registrar pesaje de leche:', error.message);
      }
      throw error;
    }
  },

  /**
   * Elimina un pesaje de leche y recalcula inmediatamente la desnormalización
   * del animal afectado (si no quedan pesajes, vuelve a 0).
   */
  async delete(id: string): Promise<void> {
    if (!db) return;
    try {
      // 1. Obtener el pesaje antes de borrar para conocer el animalId
      const pesaje = await this.getById(id);
      await db.runAsync('DELETE FROM pesajes_leche WHERE id = ?;', [id]);

      if (pesaje) {
        // 2. Consultar el pesaje más reciente que queda para este animal
        const ultimo = await db.getFirstAsync<{ litros: number }>(
          `SELECT litros FROM pesajes_leche 
           WHERE animalId = ? 
           ORDER BY fecha DESC, fechaActualizacion DESC 
           LIMIT 1;`,
          [pesaje.animalId]
        );

        // 3. Si no queda ningún pesaje, ambos vuelven a 0; si queda, se calcula el nuevo promedio
        const ultimoLitros = ultimo ? ultimo.litros : 0;
        const nuevoPromedio = ultimo ? await this.calcularPromedioUltimos7Dias(pesaje.animalId) : 0;

        await db.runAsync(
          `UPDATE animales 
           SET ultimoPesajeLitros = ?, 
               promedioLitros = ?, 
               sincronizado = 0, 
               fechaActualizacion = ? 
           WHERE id = ?;`,
          [ultimoLitros, nuevoPromedio, new Date().toISOString(), pesaje.animalId]
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al eliminar pesaje ${id}:`, error.message);
      }
      throw error;
    }
  },

  /**
   * Obtiene resumen numérico de producción para una fecha específica.
   */
  async getResumenFecha(fecha: string): Promise<{
    totalLitrosDia: number;
    totalLitrosManana: number;
    totalLitrosTarde: number;
    totalBufalasOrdenadas: number;
    promedioPorBufala: number;
  }> {
    if (!db) {
      return {
        totalLitrosDia: 0,
        totalLitrosManana: 0,
        totalLitrosTarde: 0,
        totalBufalasOrdenadas: 0,
        promedioPorBufala: 0,
      };
    }

    try {
      const filaTotal = await db.getFirstAsync<{ total: number | null; conteo: number | null }>(
        `SELECT SUM(litros) as total, COUNT(DISTINCT animalId) as conteo 
         FROM pesajes_leche 
         WHERE fecha = ?;`,
        [fecha]
      );

      const filaManana = await db.getFirstAsync<{ total: number | null }>(
        `SELECT SUM(litros) as total FROM pesajes_leche WHERE fecha = ? AND turno = 'mañana';`,
        [fecha]
      );

      const filaTarde = await db.getFirstAsync<{ total: number | null }>(
        `SELECT SUM(litros) as total FROM pesajes_leche WHERE fecha = ? AND turno = 'tarde';`,
        [fecha]
      );

      const totalDia = Number(filaTotal?.total ?? 0);
      const conteoBufalas = Number(filaTotal?.conteo ?? 0);
      const promedio = conteoBufalas > 0 ? Number((totalDia / conteoBufalas).toFixed(2)) : 0;

      return {
        totalLitrosDia: totalDia,
        totalLitrosManana: Number(filaManana?.total ?? 0),
        totalLitrosTarde: Number(filaTarde?.total ?? 0),
        totalBufalasOrdenadas: conteoBufalas,
        promedioPorBufala: promedio,
      };
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al obtener resumen de producción para fecha ${fecha}:`, error.message);
      }
      return {
        totalLitrosDia: 0,
        totalLitrosManana: 0,
        totalLitrosTarde: 0,
        totalBufalasOrdenadas: 0,
        promedioPorBufala: 0,
      };
    }
  },
  /**
   * Obtiene todos los pesajes de un animal para un año y mes específicos.
   */
  async getByAnimalYMes(animalId: string, anio: number, mes: number): Promise<PesajeLeche[]> {
    if (!db) return [];
    try {
      const mesStr = String(mes).padStart(2, '0');
      const patronMes = `${anio}-${mesStr}%`;
      const filas = await db.getAllAsync<FilaPesajeLeche>(
        `SELECT * FROM pesajes_leche 
         WHERE animalId = ? AND fecha LIKE ? 
         ORDER BY fecha DESC, turno ASC;`,
        [animalId, patronMes]
      );
      return filas.map(mapearFilaAPesaje);
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al obtener pesajes de animal ${animalId} para ${anio}-${mes}:`, error.message);
      }
      return [];
    }
  },

  /**
   * Obtiene la suma total de litros producidos por día dentro de un rango de fechas.
   */
  async getTotalPorDiaEnRango(
    desde: string,
    hasta: string
  ): Promise<Array<{ fecha: string; litros: number }>> {
    if (!db) return [];
    try {
      const filas = await db.getAllAsync<{ fecha: string; litros: number }>(
        `SELECT fecha, SUM(litros) as litros 
         FROM pesajes_leche 
         WHERE fecha >= ? AND fecha <= ? 
         GROUP BY fecha 
         ORDER BY fecha ASC;`,
        [desde, hasta]
      );
      return filas.map((f) => ({
        fecha: f.fecha,
        litros: Number(Number(f.litros ?? 0).toFixed(2)),
      }));
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al obtener total por día en rango ${desde} a ${hasta}:`, error.message);
      }
      return [];
    }
  },

  /**
   * Obtiene la suma total acumulada de litros por animal dentro de un rango de fechas.
   */
  async getTotalPorAnimalEnRango(
    desde: string,
    hasta: string
  ): Promise<Array<{ animalId: string; litros: number }>> {
    if (!db) return [];
    try {
      const filas = await db.getAllAsync<{ animalId: string; litros: number }>(
        `SELECT animalId, SUM(litros) as litros 
         FROM pesajes_leche 
         WHERE fecha >= ? AND fecha <= ? 
         GROUP BY animalId 
         ORDER BY litros DESC;`,
        [desde, hasta]
      );
      return filas.map((f) => ({
        animalId: f.animalId,
        litros: Number(Number(f.litros ?? 0).toFixed(2)),
      }));
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al obtener total por animal en rango ${desde} a ${hasta}:`, error.message);
      }
      return [];
    }
  },

  /**
   * Obtiene la suma diaria (mañana + tarde) de un animal para los últimos N días con registro,
   * ordenados cronológicamente (de más antiguo a más reciente).
   */
  async getDiasConRegistro(
    animalId: string,
    dias: number
  ): Promise<Array<{ fecha: string; litros: number }>> {
    if (!db) return [];
    try {
      const filas = await db.getAllAsync<{ fecha: string; litros: number }>(
        `SELECT fecha, SUM(litros) as litros 
         FROM pesajes_leche 
         WHERE animalId = ? 
         GROUP BY fecha 
         ORDER BY fecha DESC 
         LIMIT ?;`,
        [animalId, dias]
      );
      // Invertir para retornar cronológicamente de izquierda a derecha (antiguo -> reciente)
      return filas
        .map((f) => ({
          fecha: f.fecha,
          litros: Number(Number(f.litros ?? 0).toFixed(2)),
        }))
        .reverse();
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al obtener días con registro para animal ${animalId}:`, error.message);
      }
      return [];
    }
  },

  /**
   * Obtiene métricas agregadas del hato por día (litros, búfalas ordeñadas y PDP del hato).
   */
  async getMetricasHatoPorDiaEnRango(
    desde: string,
    hasta: string
  ): Promise<Array<{ fecha: string; litros: number; bufalas: number; pdp: number }>> {
    if (!db) return [];
    try {
      const filas = await db.getAllAsync<{ fecha: string; litros: number; bufalas: number }>(
        `SELECT fecha, SUM(litros) as litros, COUNT(DISTINCT animalId) as bufalas 
         FROM pesajes_leche 
         WHERE fecha >= ? AND fecha <= ? 
         GROUP BY fecha 
         ORDER BY fecha ASC;`,
        [desde, hasta]
      );
      return filas.map((f) => {
        const litros = Number(Number(f.litros ?? 0).toFixed(2));
        const bufalas = Number(f.bufalas ?? 0);
        const pdp = bufalas > 0 ? Number((litros / bufalas).toFixed(2)) : 0;
        return { fecha: f.fecha, litros, bufalas, pdp };
      });
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al obtener métricas del hato en rango ${desde} a ${hasta}:`, error.message);
      }
      return [];
    }
  },

  /**
   * Obtiene los pesajes individuales más recientes de un animal (para vista detallada).
   */
  async getUltimosPesajesAnimal(
    animalId: string,
    limite: number = 60
  ): Promise<PesajeLeche[]> {
    if (!db) return [];
    try {
      const filas = await db.getAllAsync<FilaPesajeLeche>(
        `SELECT * FROM pesajes_leche 
         WHERE animalId = ? 
         ORDER BY fecha DESC, turno ASC 
         LIMIT ?;`,
        [animalId, limite]
      );
      return filas.map(mapearFilaAPesaje);
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al obtener últimos pesajes de animal ${animalId}:`, error.message);
      }
      return [];
    }
  },

  /**
   * Obtiene el ranking de las N mejores productoras dentro de un período.
   */
  async getTopProductorasEnRango(
    desde: string,
    hasta: string,
    limite: number = 10
  ): Promise<ProductoraTopRanking[]> {
    if (!db) return [];
    try {
      const filas = await db.getAllAsync<{
        animalId: string;
        arete: string | null;
        nombre: string | null;
        raza: string | null;
        totalLitros: number;
        diasRegistrados: number;
      }>(
        `SELECT 
           p.animalId,
           COALESCE(a.arete, 'S/A') as arete,
           a.nombre,
           a.raza,
           SUM(p.litros) as totalLitros,
           COUNT(DISTINCT p.fecha) as diasRegistrados
         FROM pesajes_leche p
         LEFT JOIN animales a ON p.animalId = a.id
         WHERE p.fecha >= ? AND p.fecha <= ?
         GROUP BY p.animalId
         ORDER BY totalLitros DESC
         LIMIT ?;`,
        [desde, hasta, limite]
      );

      return filas.map((f, index) => {
        const total = Number(Number(f.totalLitros ?? 0).toFixed(1));
        const dias = Number(f.diasRegistrados ?? 0);
        const pdp = dias > 0 ? Number((total / dias).toFixed(2)) : 0;
        return {
          posicion: index + 1,
          animalId: f.animalId,
          arete: f.arete || 'S/A',
          nombre: f.nombre || undefined,
          raza: f.raza || undefined,
          totalLitros: total,
          pdpIndividual: pdp,
          diasRegistrados: dias,
        };
      });
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Error al obtener top productoras en rango ${desde} a ${hasta}:`, error.message);
      }
      return [];
    }
  },

  /**
   * Detecta y lista animales del hato que presentan una caída de producción > 25%
   * en los últimos 3 días vs el promedio de los 7 días previos.
   */
  async getAnimalesConAlertaCaida(limiteDias: number = 30): Promise<AlertaHatoProduccion[]> {
    if (!db) return [];
    try {
      const hoy = new Date();
      const haceNDias = new Date();
      haceNDias.setDate(hoy.getDate() - limiteDias);
      const desdeISO = haceNDias.toISOString().split('T')[0];

      // Consultar registros diarios por animal en el período
      const filas = await db.getAllAsync<{
        animalId: string;
        arete: string | null;
        nombre: string | null;
        fecha: string;
        litrosDia: number;
      }>(
        `SELECT 
           p.animalId,
           COALESCE(a.arete, 'S/A') as arete,
           a.nombre,
           p.fecha,
           SUM(p.litros) as litrosDia
         FROM pesajes_leche p
         LEFT JOIN animales a ON p.animalId = a.id
         WHERE p.fecha >= ?
         GROUP BY p.animalId, p.fecha
         ORDER BY p.animalId, p.fecha DESC;`,
        [desdeISO]
      );

      // Agrupar días por animalId
      const animalesMap = new Map<
        string,
        {
          animalId: string;
          arete: string;
          nombre?: string;
          dias: Array<{ fecha: string; litros: number }>;
        }
      >();

      for (const f of filas) {
        if (!animalesMap.has(f.animalId)) {
          animalesMap.set(f.animalId, {
            animalId: f.animalId,
            arete: f.arete || 'S/A',
            nombre: f.nombre || undefined,
            dias: [],
          });
        }
        animalesMap.get(f.animalId)!.dias.push({
          fecha: f.fecha,
          litros: Number(f.litrosDia ?? 0),
        });
      }

      const alertas: AlertaHatoProduccion[] = [];

      // Evaluar cada animal
      for (const info of animalesMap.values()) {
        const { dias, animalId, arete, nombre } = info;
        if (dias.length < 4) continue; // Requiere al menos 4 días con registros

        const recientes3 = dias.slice(0, 3);
        const previos7 = dias.slice(3, 10);

        const sumaReciente = recientes3.reduce((acc, d) => acc + d.litros, 0);
        const promReciente = Number((sumaReciente / recientes3.length).toFixed(2));

        const sumaPrevios = previos7.reduce((acc, d) => acc + d.litros, 0);
        const promPrevio = previos7.length > 0
          ? Number((sumaPrevios / previos7.length).toFixed(2))
          : 0;

        if (promPrevio > 0) {
          const diferencia = promPrevio - promReciente;
          const caida = Number(((diferencia / promPrevio) * 100).toFixed(1));

          if (caida > 25) {
            alertas.push({
              animalId,
              arete,
              nombre,
              porcentajeCaida: caida,
              promedioReciente: promReciente,
              promedioPrevio: promPrevio,
            });
          }
        }
      }

      // Ordenar por mayor porcentaje de caída
      alertas.sort((a, b) => b.porcentajeCaida - a.porcentajeCaida);
      return alertas;
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al calcular alertas de caída del hato:', error.message);
      }
      return [];
    }
  },
};

