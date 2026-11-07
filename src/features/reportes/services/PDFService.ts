import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { format, parseISO, isValid, differenceInYears, differenceInMonths } from 'date-fns';
import { Animal } from '../../animales/types/Animal';
import { PesajeLeche } from '../../ordeno/types/PesajeLeche';
import { ServicioReproductivo } from '../../reproduccion/types/ServicioReproductivo';
import { DiagnosticoPrenez } from '../../reproduccion/types/DiagnosticoPrenez';
import { Parto } from '../../reproduccion/types/Parto';
import { EventoSanitario, EventoSanitarioConAnimal } from '../../sanidad/types/EventoSanitario';
import { Ceba } from '../../carne/types/Ceba';
import { calcularGananciaPesoDiaria, calcularPesoActual, proyectarFechaFaena } from '../../carne/utils/calculosCeba';
import { obtenerNombreAnimal } from '../../../shared/config/configuracionEspecie';
import { ConfiguracionFinca } from '../../configuracion/types/ConfiguracionFinca';

function formatearFecha(fechaStr?: string): string {
  if (!fechaStr) return 'N/A';
  try {
    const parseada = parseISO(fechaStr);
    if (!isValid(parseada)) return fechaStr;
    return format(parseada, 'dd/MM/yyyy');
  } catch {
    return fechaStr;
  }
}

function formatearFechaHora(fecha: Date): string {
  try {
    return format(fecha, 'dd/MM/yyyy HH:mm');
  } catch {
    return fecha.toLocaleString();
  }
}

function calcularEdadTexto(fechaNacimientoStr?: string): string {
  if (!fechaNacimientoStr) return 'Desconocida';
  try {
    const fechaNac = parseISO(fechaNacimientoStr);
    if (!isValid(fechaNac)) return 'Desconocida';
    const ahora = new Date();
    const anos = differenceInYears(ahora, fechaNac);
    const meses = differenceInMonths(ahora, fechaNac) % 12;
    if (anos > 0) {
      return `${anos} año${anos > 1 ? 's' : ''}${meses > 0 ? ` y ${meses} m` : ''}`;
    }
    return `${meses} mes${meses !== 1 ? 'es' : ''}`;
  } catch {
    return 'Desconocida';
  }
}

const ESTILOS_BASE_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    color: #0f172a;
    background-color: #ffffff;
    padding: 24px;
    font-size: 12px;
    line-height: 1.4;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid #044b39;
    padding-bottom: 12px;
    margin-bottom: 20px;
  }
  .app-titulo {
    font-size: 20px;
    font-weight: bold;
    color: #044b39;
    letter-spacing: -0.5px;
  }
  .app-subtitulo {
    font-size: 13px;
    color: #1ea97b;
    font-weight: 600;
  }
  .meta-fecha {
    text-align: right;
    font-size: 11px;
    color: #64748b;
  }
  .seccion {
    margin-bottom: 20px;
  }
  .seccion-titulo {
    font-size: 14px;
    font-weight: bold;
    color: #044b39;
    background-color: #edf2ee;
    padding: 6px 10px;
    border-radius: 4px;
    margin-bottom: 10px;
    border-left: 4px solid #1ea97b;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 6px;
    font-size: 11px;
  }
  th {
    background-color: #f1f5f9;
    color: #334155;
    font-weight: bold;
    text-align: left;
    padding: 6px 8px;
    border: 1px solid #cbd5e1;
  }
  td {
    padding: 6px 8px;
    border: 1px solid #e2e8f0;
  }
  tr:nth-child(even) td {
    background-color: #f8fafc;
  }
  .grid-2 {
    display: table;
    width: 100%;
    margin-bottom: 12px;
  }
  .grid-col {
    display: table-cell;
    width: 50%;
    vertical-align: top;
    padding-right: 12px;
  }
  .info-fila {
    display: flex;
    justify-content: space-between;
    padding: 4px 0;
    border-bottom: 1px dotted #e2e8f0;
  }
  .info-label {
    font-weight: 600;
    color: #475569;
  }
  .info-valor {
    color: #0f172a;
    font-weight: 500;
  }
  .badge {
    display: inline-block;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
  }
  .badge-verde { background-color: #dcfce7; color: #166534; }
  .badge-ambar { background-color: #fef3c7; color: #92400e; }
  .badge-rojo { background-color: #fee2e2; color: #991b1b; }
  .badge-gris { background-color: #f1f5f9; color: #475569; }
  .badge-azul { background-color: #e0f2fe; color: #075985; }
  .resumen-cards {
    display: flex;
    gap: 12px;
    margin-bottom: 14px;
  }
  .card-metrica {
    flex: 1;
    background-color: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 10px;
    text-align: center;
  }
  .card-metrica-valor {
    font-size: 18px;
    font-weight: bold;
    color: #044b39;
    margin-top: 4px;
  }
  .card-metrica-etiqueta {
    font-size: 10px;
    color: #64748b;
    text-transform: uppercase;
    font-weight: 600;
  }
  .footer {
    margin-top: 30px;
    padding-top: 10px;
    border-top: 1px solid #cbd5e1;
    text-align: center;
    font-size: 10px;
    color: #94a3b8;
  }
  .sin-datos {
    font-style: italic;
    color: #94a3b8;
    padding: 8px 0;
  }
`;

/**
 * Genera un HTML completo con estilos inline (para PDF) a partir de una ficha
 * de animal. Retorna el HTML listo para imprimir.
 */
export function generarHTMLFichaAnimal(
  animal: Animal,
  pesajesLeche: PesajeLeche[],
  servicios: ServicioReproductivo[],
  diagnosticos: DiagnosticoPrenez[],
  partos: Parto[],
  eventosSanitarios: EventoSanitario[],
  ceba?: Ceba | null,
  configuracion?: ConfiguracionFinca
): string {
  const fechaGeneracion = formatearFechaHora(new Date());
  const edadTexto = calcularEdadTexto(animal.fechaNacimiento);

  // Cálculos leche
  const ultimos30Pesajes = [...pesajesLeche]
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .slice(0, 30);
  
  const totalLitros30 = ultimos30Pesajes.reduce((acc, p) => acc + p.litros, 0);
  const ultimos7Pesajes = ultimos30Pesajes.slice(0, 7);
  const totalLitros7 = ultimos7Pesajes.reduce((acc, p) => acc + p.litros, 0);
  const pdp7 = ultimos7Pesajes.length > 0 ? (totalLitros7 / ultimos7Pesajes.length).toFixed(1) : '0.0';

  // Ceba cálculos
  const pesoActualCeba = ceba ? calcularPesoActual(ceba) : animal.pesoActual;
  let cebaDetalleHTML = '';
  if (ceba) {
    const ganancia = ceba.fechaInicio && ceba.pesoI && pesoActualCeba > ceba.pesoI
      ? calcularGananciaPesoDiaria(ceba.pesoI, pesoActualCeba, 60)
      : 0;
    const proy = ganancia > 0 ? proyectarFechaFaena(pesoActualCeba, ceba.pesoObjetivo, ganancia, ceba.fechaInicio) : null;

    cebaDetalleHTML = `
      <div class="seccion">
        <div class="seccion-titulo">Ceba y Engorde (Carne)</div>
        <div class="resumen-cards">
          <div class="card-metrica">
            <div class="card-metrica-etiqueta">Peso Objetivo</div>
            <div class="card-metrica-valor">${ceba.pesoObjetivo} kg</div>
          </div>
          <div class="card-metrica">
            <div class="card-metrica-etiqueta">Peso Actual</div>
            <div class="card-metrica-valor">${pesoActualCeba} kg</div>
          </div>
          <div class="card-metrica">
            <div class="card-metrica-etiqueta">Proyección Faena</div>
            <div class="card-metrica-valor">${proy?.fechaEstimada ? formatearFecha(proy.fechaEstimada) : 'N/A'}</div>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Etapa</th>
              <th>Fecha Registro</th>
              <th>Peso (kg)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Etapa I (Inicio)</td>
              <td>${formatearFecha(ceba.fechaInicio)}</td>
              <td>${ceba.pesoI != null ? `${ceba.pesoI} kg` : '-'}</td>
            </tr>
            <tr>
              <td>Etapa II</td>
              <td>${formatearFecha(ceba.fechaII)}</td>
              <td>${ceba.pesoII != null ? `${ceba.pesoII} kg` : '-'}</td>
            </tr>
            <tr>
              <td>Etapa III</td>
              <td>${formatearFecha(ceba.fechaIII)}</td>
              <td>${ceba.pesoIII != null ? `${ceba.pesoIII} kg` : '-'}</td>
            </tr>
            <tr>
              <td>Etapa IV (Final)</td>
              <td>${formatearFecha(ceba.fechaIV)}</td>
              <td>${ceba.pesoIV != null ? `${ceba.pesoIV} kg` : '-'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  // Servicios HTML
  const serviciosFilas = servicios.length > 0
    ? servicios.slice(0, 5).map(s => {
        const badgeClase = s.resultado === 'preñada' ? 'badge-verde' : s.resultado === 'pendiente' ? 'badge-ambar' : 'badge-rojo';
        const detalle = s.tipo === 'inseminacion'
          ? `Pajuela: ${s.numeroPajuela ?? '-'} | Toro: ${s.razaToro ?? '-'}`
          : `Toro: ${s.toroNumero ?? '-'} (${s.toroRaza ?? '-'})`;
        return `
          <tr>
            <td>${formatearFecha(s.fecha)}</td>
            <td>${s.tipo.toUpperCase()}</td>
            <td>${detalle}</td>
            <td><span class="badge ${badgeClase}">${s.resultado}</span></td>
          </tr>
        `;
      }).join('')
    : '<tr><td colspan="4" class="sin-datos">No hay servicios reproductivos registrados</td></tr>';

  // Diagnósticos HTML
  const diagnosticosFilas = diagnosticos.length > 0
    ? diagnosticos.slice(0, 5).map(d => {
        const badgeClase = d.resultado === 'preñada' ? 'badge-verde' : 'badge-rojo';
        return `
          <tr>
            <td>${formatearFecha(d.fecha)}</td>
            <td>${d.metodo ? d.metodo.toUpperCase() : 'PALPACIÓN'}</td>
            <td><span class="badge ${badgeClase}">${d.resultado}</span></td>
            <td>${d.veterinario ?? 'No especificado'}</td>
          </tr>
        `;
      }).join('')
    : '<tr><td colspan="4" class="sin-datos">No hay diagnósticos registrados</td></tr>';

  // Partos HTML
  const partosFilas = partos.length > 0
    ? partos.slice(0, 5).map(p => `
        <tr>
          <td>${formatearFecha(p.fecha)}</td>
          <td>${p.sexoCria === 'M' ? 'Macho' : 'Hembra'}</td>
          <td>${p.pesoCria != null ? `${p.pesoCria} kg` : '-'}</td>
          <td>${p.areteCria ?? 'Sin arete'}</td>
        </tr>
      `).join('')
    : '<tr><td colspan="4" class="sin-datos">No hay partos registrados</td></tr>';

  // Pesajes leche tabla
  const pesajesFilas = ultimos30Pesajes.length > 0
    ? ultimos30Pesajes.map(p => `
        <tr>
          <td>${formatearFecha(p.fecha)}</td>
          <td>${p.turno.toUpperCase()}</td>
          <td><b>${p.litros.toFixed(1)} L</b></td>
          <td>${p.observaciones ?? '-'}</td>
        </tr>
      `).join('')
    : '<tr><td colspan="4" class="sin-datos">No hay pesajes de leche registrados</td></tr>';

  // Sanidad HTML
  const sanidadFilas = eventosSanitarios.length > 0
    ? eventosSanitarios.slice(0, 6).map(e => `
        <tr>
          <td>${formatearFecha(e.fecha)}</td>
          <td><span class="badge badge-azul">${e.tipo.toUpperCase()}</span></td>
          <td>${e.producto}</td>
          <td>${e.dosis ?? '-'}</td>
          <td>${e.proximaDosis ? formatearFecha(e.proximaDosis) : '-'}</td>
        </tr>
      `).join('')
    : '<tr><td colspan="5" class="sin-datos">No hay eventos sanitarios registrados</td></tr>';

  const estadoReproductivoBadge = animal.sexo === 'M'
    ? '<span class="badge badge-gris">NO APLICA</span>'
    : animal.estadoReproductivo === 'preñada'
    ? '<span class="badge badge-verde">PREÑADA</span>'
    : animal.estadoReproductivo === 'servida'
    ? '<span class="badge badge-ambar">SERVIDA</span>'
    : animal.estadoReproductivo === 'lactancia'
    ? '<span class="badge badge-azul">LACTANCIA</span>'
    : `<span class="badge badge-gris">${animal.estadoReproductivo.toUpperCase()}</span>`;

  const estadoVidaBadge = animal.estadoVida === 'activa'
    ? '<span class="badge badge-verde">ACTIVA</span>'
    : '<span class="badge badge-rojo">' + animal.estadoVida.toUpperCase() + '</span>';

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <title>Ficha de ${obtenerNombreAnimal(animal.especie || 'bufalino', animal.sexo)} - Arete ${animal.arete}</title>
      <style>${ESTILOS_BASE_CSS}</style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="app-titulo">${configuracion?.nombre?.trim() ? `${configuracion.nombre.trim()} · GanaSmart AgroMind` : 'GanaSmart - AgroMind'}</div>
          <div class="app-subtitulo">Ficha de ${obtenerNombreAnimal(animal.especie || 'bufalino', animal.sexo)} #${animal.arete}</div>
          ${(configuracion?.propietario?.trim() || configuracion?.ubicacion?.trim()) ? `<div style="font-size: 11px; color: #475569; margin-top: 2px;">${[configuracion?.propietario?.trim() ? `Propietario: ${configuracion.propietario.trim()}` : null, configuracion?.ubicacion?.trim() ? `Ubicación: ${configuracion.ubicacion.trim()}` : null].filter(Boolean).join(' · ')}</div>` : ''}
        </div>
        <div class="meta-fecha">
          <div>Fecha de emisión:</div>
          <b>${fechaGeneracion}</b>
        </div>
      </div>

      <div class="seccion">
        <div class="seccion-titulo">Datos Generales</div>
        <table style="border: none;">
          <tbody>
            <tr>
              <td style="width: 50%; border: none; vertical-align: top; padding: 0 10px 0 0;">
                <div class="info-fila"><span class="info-label">Arete Oficial:</span> <span class="info-valor"><b>${animal.arete}</b></span></div>
                <div class="info-fila"><span class="info-label">Especie:</span> <span class="info-valor"><b>${animal.especie === 'bovino' ? 'Bovino 🐄' : 'Bufalino 🐃'}</b></span></div>
                <div class="info-fila"><span class="info-label">Nombre / Alias:</span> <span class="info-valor">${animal.nombre ?? 'Sin nombre'}</span></div>
                <div class="info-fila"><span class="info-label">Sexo:</span> <span class="info-valor">${animal.sexo === 'M' ? 'Macho' : 'Hembra'}</span></div>
                <div class="info-fila"><span class="info-label">Raza:</span> <span class="info-valor">${animal.raza ?? (animal.especie === 'bovino' ? 'Bovino Mestizo' : 'Bufalino Mestizo')}</span></div>
                <div class="info-fila"><span class="info-label">Lote:</span> <span class="info-valor">${animal.loteId ?? 'General'}</span></div>
              </td>
              <td style="width: 50%; border: none; vertical-align: top; padding: 0 0 0 10px;">
                <div class="info-fila"><span class="info-label">Fecha Nacimiento:</span> <span class="info-valor">${formatearFecha(animal.fechaNacimiento)}</span></div>
                <div class="info-fila"><span class="info-label">Edad:</span> <span class="info-valor">${edadTexto}</span></div>
                <div class="info-fila"><span class="info-label">Estado de Vida:</span> <span class="info-valor">${estadoVidaBadge}</span></div>
                <div class="info-fila"><span class="info-label">Estado Reproductivo:</span> <span class="info-valor">${estadoReproductivoBadge}</span></div>
                <div class="info-fila"><span class="info-label">Total Partos:</span> <span class="info-valor">${animal.totalPartos ?? 0}</span></div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="seccion">
        <div class="seccion-titulo">Genealogía y Peso Corporal</div>
        <div class="resumen-cards">
          <div class="card-metrica">
            <div class="card-metrica-etiqueta">Peso Inicial (Destete)</div>
            <div class="card-metrica-valor">${animal.pesoInicial ?? 0} kg</div>
          </div>
          <div class="card-metrica">
            <div class="card-metrica-etiqueta">Peso Corporal Actual</div>
            <div class="card-metrica-valor">${animal.pesoActual ?? 0} kg</div>
          </div>
          <div class="card-metrica">
            <div class="card-metrica-etiqueta">Padre (Toro)</div>
            <div class="card-metrica-valor" style="font-size: 14px;">${animal.padreNro ?? 'Desconocido'}</div>
          </div>
          <div class="card-metrica">
            <div class="card-metrica-etiqueta">Madre</div>
            <div class="card-metrica-valor" style="font-size: 14px;">${animal.madreNro ?? 'Desconocida'}</div>
          </div>
        </div>
      </div>

      ${animal.sexo === 'H' ? `
      <div class="seccion">
        <div class="seccion-titulo">Producción Lechera (Últimos 30 Registros)</div>
        <div class="resumen-cards">
          <div class="card-metrica">
            <div class="card-metrica-etiqueta">Último Pesaje</div>
            <div class="card-metrica-valor">${animal.ultimoPesajeLitros?.toFixed(1) ?? '0.0'} L</div>
          </div>
          <div class="card-metrica">
            <div class="card-metrica-etiqueta">PDP (7 Días)</div>
            <div class="card-metrica-valor">${pdp7} L/día</div>
          </div>
          <div class="card-metrica">
            <div class="card-metrica-etiqueta">Total Acumulado 7d</div>
            <div class="card-metrica-valor">${totalLitros7.toFixed(1)} L</div>
          </div>
          <div class="card-metrica">
            <div class="card-metrica-etiqueta">Total Acumulado 30d</div>
            <div class="card-metrica-valor">${totalLitros30.toFixed(1)} L</div>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Turno</th>
              <th>Litros</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            ${pesajesFilas}
          </tbody>
        </table>
      </div>

      <div class="seccion">
        <div class="seccion-titulo">Historial Reproductivo</div>
        <div style="font-weight: 600; margin-bottom: 4px; color: #475569;">Servicios Recientes:</div>
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Detalle Toro / Pajuela</th>
              <th>Resultado</th>
            </tr>
          </thead>
          <tbody>
            ${serviciosFilas}
          </tbody>
        </table>

        <div style="font-weight: 600; margin: 12px 0 4px 0; color: #475569;">Diagnósticos de Preñez (Palpación / Ecografía):</div>
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Método</th>
              <th>Resultado</th>
              <th>Veterinario</th>
            </tr>
          </thead>
          <tbody>
            ${diagnosticosFilas}
          </tbody>
        </table>

        <div style="font-weight: 600; margin: 12px 0 4px 0; color: #475569;">Registro de Partos:</div>
        <table>
          <thead>
            <tr>
              <th>Fecha Parto</th>
              <th>Sexo Cría</th>
              <th>Peso Cría</th>
              <th>Arete Cría</th>
            </tr>
          </thead>
          <tbody>
            ${partosFilas}
          </tbody>
        </table>
      </div>
      ` : ''}

      ${cebaDetalleHTML}

      <div class="seccion">
        <div class="seccion-titulo">Historial Sanitario y Tratamientos</div>
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo Evento</th>
              <th>Producto Aplicado</th>
              <th>Dosis</th>
              <th>Próxima Dosis</th>
            </tr>
          </thead>
          <tbody>
            ${sanidadFilas}
          </tbody>
        </table>
      </div>

      <div class="footer">
        Generado por GanaSmart - AgroMind el ${fechaGeneracion} | Sistema de Gestión Ganadera Local-First
      </div>
    </body>
    </html>
  `;
}

/**
 * Genera un HTML para el reporte mensual de producción del hato.
 */
export function generarHTMLReporteProduccion(
  anio: number,
  mes: number,
  metricasHato: Array<{ fecha: string; litros: number; bufalas: number; pdp: number }>,
  topProductoras: Array<{ arete: string; nombre?: string; totalLitros: number; pdp: number }>,
  totalMes: number,
  promedioDiario: number,
  configuracion?: ConfiguracionFinca
): string {
  const fechaGeneracion = formatearFechaHora(new Date());
  const nombreMes = format(new Date(anio, mes - 1, 1), 'MMMM yyyy');

  const topProductorasFilas = topProductoras.length > 0
    ? topProductoras.map((prod, idx) => `
        <tr>
          <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
          <td><b>${prod.arete}</b></td>
          <td>${prod.nombre ?? '-'}</td>
          <td><b>${prod.totalLitros.toFixed(1)} L</b></td>
          <td>${prod.pdp.toFixed(1)} L/día</td>
        </tr>
      `).join('')
    : '<tr><td colspan="5" class="sin-datos">No hay productoras registradas en este período</td></tr>';

  const metricasDiariasFilas = metricasHato.length > 0
    ? metricasHato.map(m => `
        <tr>
          <td>${formatearFecha(m.fecha)}</td>
          <td style="text-align: center;">${m.bufalas}</td>
          <td><b>${m.litros.toFixed(1)} L</b></td>
          <td>${m.pdp.toFixed(1)} L/buf</td>
        </tr>
      `).join('')
    : '<tr><td colspan="4" class="sin-datos">No hay datos de ordeño diario en este mes</td></tr>';

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <title>Reporte de Producción de Leche - ${nombreMes}</title>
      <style>${ESTILOS_BASE_CSS}</style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="app-titulo">${configuracion?.nombre?.trim() ? `${configuracion.nombre.trim()} · GanaSmart AgroMind` : 'GanaSmart - AgroMind'}</div>
          <div class="app-subtitulo">Reporte Mensual de Producción Lechera</div>
          ${(configuracion?.propietario?.trim() || configuracion?.ubicacion?.trim()) ? `<div style="font-size: 11px; color: #475569; margin-top: 2px;">${[configuracion?.propietario?.trim() ? `Propietario: ${configuracion.propietario.trim()}` : null, configuracion?.ubicacion?.trim() ? `Ubicación: ${configuracion.ubicacion.trim()}` : null].filter(Boolean).join(' · ')}</div>` : ''}
        </div>
        <div class="meta-fecha">
          <div>Período: <b style="text-transform: capitalize;">${nombreMes}</b></div>
          <div>Emitido: ${fechaGeneracion}</div>
        </div>
      </div>

      <div class="seccion">
        <div class="seccion-titulo">Resumen Ejecutivo del Mes</div>
        <div class="resumen-cards">
          <div class="card-metrica">
            <div class="card-metrica-etiqueta">Total Leche Mes</div>
            <div class="card-metrica-valor">${totalMes.toFixed(1)} L</div>
          </div>
          <div class="card-metrica">
            <div class="card-metrica-etiqueta">Promedio Diario Hato</div>
            <div class="card-metrica-valor">${promedioDiario.toFixed(1)} L/día</div>
          </div>
          <div class="card-metrica">
            <div class="card-metrica-etiqueta">Días Registrados</div>
            <div class="card-metrica-valor">${metricasHato.length}</div>
          </div>
        </div>
      </div>

      <div class="seccion">
        <div class="seccion-titulo">Top Animales Más Productores</div>
        <table>
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">#</th>
              <th>Arete</th>
              <th>Nombre</th>
              <th>Total Litros</th>
              <th>Promedio PDP</th>
            </tr>
          </thead>
          <tbody>
            ${topProductorasFilas}
          </tbody>
        </table>
      </div>

      <div class="seccion">
        <div class="seccion-titulo">Detalle Diario de Ordeño</div>
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th style="text-align: center;">Animales Ordeñados</th>
              <th>Total Litros</th>
              <th>PDP Promedio</th>
            </tr>
          </thead>
          <tbody>
            ${metricasDiariasFilas}
          </tbody>
        </table>
      </div>

      <div class="footer">
        Generado por GanaSmart - AgroMind el ${fechaGeneracion} | Sistema de Gestión Ganadera Local-First
      </div>
    </body>
    </html>
  `;
}

/**
 * Genera un HTML para el reporte sanitario del mes.
 */
export function generarHTMLReporteSanidad(
  anio: number,
  mes: number,
  eventos: EventoSanitarioConAnimal[],
  configuracion?: ConfiguracionFinca
): string {
  const fechaGeneracion = formatearFechaHora(new Date());
  const nombreMes = format(new Date(anio, mes - 1, 1), 'MMMM yyyy');

  // Conteo por tipo
  const conteoPorTipo: Record<string, number> = {};
  for (const ev of eventos) {
    conteoPorTipo[ev.tipo] = (conteoPorTipo[ev.tipo] ?? 0) + 1;
  }

  const tiposBadgeHTML = Object.entries(conteoPorTipo).map(([tipo, cant]) => `
    <span class="badge badge-azul" style="margin-right: 6px; margin-bottom: 6px; padding: 4px 8px; font-size: 11px;">
      ${tipo.toUpperCase()}: <b>${cant}</b>
    </span>
  `).join('');

  const eventosFilas = eventos.length > 0
    ? eventos.map(e => `
        <tr>
          <td>${formatearFecha(e.fecha)}</td>
          <td><b>${e.areteAnimal ?? (e.esGrupal === 1 ? 'Todo el Lote' : 'Sin Arete')}</b></td>
          <td>${e.nombreAnimal ?? '-'}</td>
          <td><span class="badge badge-azul">${e.tipo.toUpperCase()}</span></td>
          <td>${e.producto}</td>
          <td>${e.dosis ?? '-'}</td>
          <td>${e.responsable ?? '-'}</td>
          <td>${e.proximaDosis ? formatearFecha(e.proximaDosis) : '-'}</td>
        </tr>
      `).join('')
    : '<tr><td colspan="8" class="sin-datos">No hay eventos sanitarios registrados en este período</td></tr>';

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <title>Reporte Sanitario - ${nombreMes}</title>
      <style>${ESTILOS_BASE_CSS}</style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="app-titulo">${configuracion?.nombre?.trim() ? `${configuracion.nombre.trim()} · GanaSmart AgroMind` : 'GanaSmart - AgroMind'}</div>
          <div class="app-subtitulo">Reporte Mensual de Sanidad y Manejo</div>
          ${(configuracion?.propietario?.trim() || configuracion?.ubicacion?.trim()) ? `<div style="font-size: 11px; color: #475569; margin-top: 2px;">${[configuracion?.propietario?.trim() ? `Propietario: ${configuracion.propietario.trim()}` : null, configuracion?.ubicacion?.trim() ? `Ubicación: ${configuracion.ubicacion.trim()}` : null].filter(Boolean).join(' · ')}</div>` : ''}
        </div>
        <div class="meta-fecha">
          <div>Período: <b style="text-transform: capitalize;">${nombreMes}</b></div>
          <div>Emitido: ${fechaGeneracion}</div>
        </div>
      </div>

      <div class="seccion">
        <div class="seccion-titulo">Resumen Sanitario</div>
        <div class="resumen-cards">
          <div class="card-metrica">
            <div class="card-metrica-etiqueta">Total Eventos</div>
            <div class="card-metrica-valor">${eventos.length}</div>
          </div>
          <div class="card-metrica">
            <div class="card-metrica-etiqueta">Tipos de Tratamiento</div>
            <div class="card-metrica-valor">${Object.keys(conteoPorTipo).length}</div>
          </div>
        </div>
        <div style="margin-top: 8px;">
          ${tiposBadgeHTML || '<span class="sin-datos">Sin eventos registrados</span>'}
        </div>
      </div>

      <div class="seccion">
        <div class="seccion-titulo">Detalle de Eventos y Dosis</div>
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Arete</th>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Producto</th>
              <th>Dosis</th>
              <th>Responsable</th>
              <th>Próx. Dosis</th>
            </tr>
          </thead>
          <tbody>
            ${eventosFilas}
          </tbody>
        </table>
      </div>

      <div class="footer">
        Generado por GanaSmart - AgroMind el ${fechaGeneracion} | Sistema de Gestión Ganadera Local-First
      </div>
    </body>
    </html>
  `;
}

/**
 * Abre el diálogo de impresión/guardado del HTML generado.
 * En Android guarda el PDF directamente en el directorio de caché.
 */
export async function imprimirOCompartirPDF(
  html: string,
  nombreArchivo: string
): Promise<void> {
  try {
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    const puedeCompartir = await Sharing.isAvailableAsync();
    if (!puedeCompartir) {
      console.warn('La función de compartir no está disponible en este dispositivo. PDF generado en:', uri);
      throw new Error('La función de compartir no está disponible en este dispositivo.');
    }

    await Sharing.shareAsync(uri, {
      UTI: '.pdf',
      mimeType: 'application/pdf',
      dialogTitle: nombreArchivo,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.warn('Error al exportar o compartir PDF:', error.message);
      throw error;
    }
    console.warn('Error desconocido al exportar o compartir PDF');
    throw new Error('No se pudo generar o compartir el archivo PDF');
  }
}
