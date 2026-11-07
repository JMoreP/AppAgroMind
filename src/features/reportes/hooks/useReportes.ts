import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { AnimalRepository } from '../../animales/repositories/AnimalRepository';
import { PesajeLecheRepository } from '../../ordeno/repositories/PesajeLecheRepository';
import { ServicioReproductivoRepository } from '../../reproduccion/repositories/ServicioReproductivoRepository';
import { DiagnosticoPrenezRepository } from '../../reproduccion/repositories/DiagnosticoPrenezRepository';
import { PartoRepository } from '../../reproduccion/repositories/PartoRepository';
import { EventoSanitarioRepository } from '../../sanidad/repositories/EventoSanitarioRepository';
import { CebaRepository } from '../../carne/repositories/CebaRepository';
import { ConfiguracionRepository } from '../../configuracion/repositories/ConfiguracionRepository';
import {
  generarHTMLFichaAnimal,
  generarHTMLReporteProduccion,
  generarHTMLReporteSanidad,
  imprimirOCompartirPDF,
} from '../services/PDFService';

export interface UseReportesReturn {
  generando: boolean;
  error: string | null;
  exportarFichaAnimal: (animalId: string) => Promise<void>;
  exportarReporteProduccion: (anio: number, mes: number) => Promise<void>;
  exportarReporteSanidad: (anio: number, mes: number) => Promise<void>;
}

export function useReportes(): UseReportesReturn {
  const [generando, setGenerando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Exporta la ficha completa de un animal en PDF.
   */
  const exportarFichaAnimal = useCallback(async (animalId: string): Promise<void> => {
    setGenerando(true);
    setError(null);
    try {
      const animal = await AnimalRepository.getById(animalId);
      if (!animal) {
        throw new Error('No se encontró el animal especificado');
      }

      const [pesajes, servicios, diagnosticos, partos, eventos, cebas, configuracion] = await Promise.all([
        PesajeLecheRepository.getByAnimalId(animalId),
        ServicioReproductivoRepository.getByAnimalOrdenado(animalId),
        DiagnosticoPrenezRepository.getByAnimalOrdenado(animalId),
        PartoRepository.getByAnimalOrdenado(animalId),
        EventoSanitarioRepository.getByAnimalOrdenado(animalId),
        CebaRepository.getByAnimal(animalId),
        ConfiguracionRepository.obtenerConfiguracion(),
      ]);

      const cebaActiva = cebas.find((c) => c.activo === 1) ?? cebas[0] ?? null;

      const html = generarHTMLFichaAnimal(
        animal,
        pesajes,
        servicios,
        diagnosticos,
        partos,
        eventos,
        cebaActiva,
        configuracion
      );

      const fechaHoy = format(new Date(), 'yyyy-MM-dd');
      const nombreArchivo = `ficha_${animal.arete}_${fechaHoy}.pdf`;

      await imprimirOCompartirPDF(html, nombreArchivo);
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al exportar ficha del animal';
      console.warn('Error en exportarFichaAnimal:', mensaje);
      setError(mensaje);
      throw err;
    } finally {
      setGenerando(false);
    }
  }, []);

  /**
   * Exporta el reporte mensual de producción de leche del hato.
   */
  const exportarReporteProduccion = useCallback(async (anio: number, mes: number): Promise<void> => {
    setGenerando(true);
    setError(null);
    try {
      const mesStr = String(mes).padStart(2, '0');
      const ultimoDiaMes = new Date(anio, mes, 0).getDate();
      const desde = `${anio}-${mesStr}-01`;
      const hasta = `${anio}-${mesStr}-${String(ultimoDiaMes).padStart(2, '0')}`;

      const [metricasHato, topProductoras, configuracion] = await Promise.all([
        PesajeLecheRepository.getMetricasHatoPorDiaEnRango(desde, hasta),
        PesajeLecheRepository.getTopProductorasEnRango(desde, hasta, 10),
        ConfiguracionRepository.obtenerConfiguracion(),
      ]);

      const totalMes = metricasHato.reduce((acc, m) => acc + m.litros, 0);
      const promedioDiario = metricasHato.length > 0 ? totalMes / metricasHato.length : 0;

      const productorasFormateadas = topProductoras.map((prod) => ({
        arete: prod.arete,
        nombre: prod.nombre,
        totalLitros: prod.totalLitros,
        pdp: prod.pdpIndividual,
      }));

      const html = generarHTMLReporteProduccion(
        anio,
        mes,
        metricasHato,
        productorasFormateadas,
        totalMes,
        promedioDiario,
        configuracion
      );

      const nombreArchivo = `produccion_${anio}-${mesStr}.pdf`;
      await imprimirOCompartirPDF(html, nombreArchivo);
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al exportar reporte de producción';
      console.warn('Error en exportarReporteProduccion:', mensaje);
      setError(mensaje);
      throw err;
    } finally {
      setGenerando(false);
    }
  }, []);

  /**
   * Exporta el reporte sanitario mensual en PDF.
   */
  const exportarReporteSanidad = useCallback(async (anio: number, mes: number): Promise<void> => {
    setGenerando(true);
    setError(null);
    try {
      const mesStr = String(mes).padStart(2, '0');
      const [eventos, configuracion] = await Promise.all([
        EventoSanitarioRepository.getByMes(anio, mes),
        ConfiguracionRepository.obtenerConfiguracion(),
      ]);

      const html = generarHTMLReporteSanidad(anio, mes, eventos, configuracion);
      const nombreArchivo = `sanidad_${anio}-${mesStr}.pdf`;

      await imprimirOCompartirPDF(html, nombreArchivo);
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al exportar reporte sanitario';
      console.warn('Error en exportarReporteSanidad:', mensaje);
      setError(mensaje);
      throw err;
    } finally {
      setGenerando(false);
    }
  }, []);

  return {
    generando,
    error,
    exportarFichaAnimal,
    exportarReporteProduccion,
    exportarReporteSanidad,
  };
}
