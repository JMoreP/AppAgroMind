import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  LayoutChangeEvent, 
  Pressable 
} from 'react-native';
import Svg, { 
  Path, 
  Defs, 
  LinearGradient, 
  Stop, 
  Circle, 
  Line, 
  Text as SvgText 
} from 'react-native-svg';
import { COLORES } from '../../../shared/theme/colores';
import { PuntoProduccionDiaria } from '../types/PesajeLeche';

interface Props {
  datos: PuntoProduccionDiaria[];
  lineaReferenciaPDP?: number;
  etiquetaReferencia?: string;
  titulo?: string;
  subtitulo?: string;
  rangoActivo?: '7d' | '30d';
  onCambiarRango?: (rango: '7d' | '30d') => void;
}

export function GraficaProduccionLeche({
  datos,
  lineaReferenciaPDP,
  etiquetaReferencia = 'PDP',
  titulo = 'Evolución de Producción',
  subtitulo,
  rangoActivo,
  onCambiarRango,
}: Props) {
  const [anchoContenedor, setAnchoContenedor] = useState(320);
  const [puntoSeleccionadoIndex, setPuntoSeleccionadoIndex] = useState<number | null>(null);

  const manejarLayout = (evento: LayoutChangeEvent) => {
    const ancho = evento.nativeEvent.layout.width;
    if (ancho > 50) {
      setAnchoContenedor(ancho);
    }
  };

  const altoGrafica = 190;
  const margenIzquierdo = 36;
  const margenDerecho = 16;
  const margenSuperior = 20;
  const margenInferior = 30;

  const anchoUtil = Math.max(anchoContenedor - margenIzquierdo - margenDerecho, 100);
  const altoUtil = altoGrafica - margenSuperior - margenInferior;

  // Filtrar o recortar datos si hay rango activo
  const datosFiltrados = React.useMemo(() => {
    if (!datos || datos.length === 0) return [];
    if (rangoActivo === '7d') {
      return datos.slice(-7);
    }
    return datos.slice(-30);
  }, [datos, rangoActivo]);

  // Si no hay datos suficientes
  if (datosFiltrados.length === 0) {
    return (
      <View style={styles.tarjetaContenedor} onLayout={manejarLayout}>
        <View style={styles.cabeceraFila}>
          <View>
            <Text style={styles.tituloGrafica}>{titulo}</Text>
            {subtitulo && <Text style={styles.subtituloGrafica}>{subtitulo}</Text>}
          </View>
        </View>
        <View style={styles.contenedorVacio}>
          <Text style={styles.textoVacio}>No hay registros de producción en este período.</Text>
        </View>
      </View>
    );
  }

  // Cálculos de escala
  const valoresLitros = datosFiltrados.map((d) => d.litros);
  const maxLitros = Math.max(...valoresLitros, lineaReferenciaPDP ?? 0, 5);
  const techoY = Math.ceil(maxLitros * 1.15); // 15% de holgura superior
  const medioY = Number((techoY / 2).toFixed(1));

  // Generar coordenadas X, Y
  const coordenadas = datosFiltrados.map((d, index) => {
    const pasoX = datosFiltrados.length > 1 ? anchoUtil / (datosFiltrados.length - 1) : anchoUtil / 2;
    const x = margenIzquierdo + index * pasoX;
    const proporcionY = d.litros / techoY;
    const y = margenSuperior + altoUtil * (1 - proporcionY);
    return { x, y, valor: d.litros, fecha: d.fecha };
  });

  // Construir comando SVG Path para la línea continua
  let comandoLinea = '';
  if (coordenadas.length === 1) {
    const unico = coordenadas[0];
    comandoLinea = `M ${margenIzquierdo} ${unico.y} L ${margenIzquierdo + anchoUtil} ${unico.y}`;
  } else {
    comandoLinea = coordenadas.reduce((acc, coord, i) => {
      if (i === 0) return `M ${coord.x.toFixed(1)} ${coord.y.toFixed(1)}`;
      return `${acc} L ${coord.x.toFixed(1)} ${coord.y.toFixed(1)}`;
    }, '');
  }

  // Construir área sombreada bajo la curva
  const primeraX = coordenadas[0].x.toFixed(1);
  const ultimaX = coordenadas[coordenadas.length - 1].x.toFixed(1);
  const basePisoY = (margenSuperior + altoUtil).toFixed(1);
  const comandoArea = `${comandoLinea} L ${ultimaX} ${basePisoY} L ${primeraX} ${basePisoY} Z`;

  // Coordenada Y para línea de referencia PDP
  const yReferenciaPDP = lineaReferenciaPDP && lineaReferenciaPDP > 0
    ? margenSuperior + altoUtil * (1 - Math.min(lineaReferenciaPDP / techoY, 1))
    : null;

  // Punto actualmente seleccionado o el más reciente por defecto
  const indiceActivo = puntoSeleccionadoIndex !== null 
    ? puntoSeleccionadoIndex 
    : coordenadas.length - 1;
  const puntoActivo = coordenadas[indiceActivo];

  return (
    <View style={styles.tarjetaContenedor} onLayout={manejarLayout}>
      
      {/* Cabecera con selector de rango */}
      <View style={styles.cabeceraFila}>
        <View style={styles.infoColumna}>
          <Text style={styles.tituloGrafica}>{titulo}</Text>
          {subtitulo && <Text style={styles.subtituloGrafica}>{subtitulo}</Text>}
        </View>

        {onCambiarRango && (
          <View style={styles.selectorRangoContenedor}>
            <Pressable 
              style={rangoActivo === '7d' ? styles.botonRangoActivo : styles.botonRangoInactivo}
              onPress={() => onCambiarRango('7d')}
            >
              <Text style={rangoActivo === '7d' ? styles.textoRangoActivo : styles.textoRangoInactivo}>
                7D
              </Text>
            </Pressable>
            <Pressable 
              style={rangoActivo === '30d' ? styles.botonRangoActivo : styles.botonRangoInactivo}
              onPress={() => onCambiarRango('30d')}
            >
              <Text style={rangoActivo === '30d' ? styles.textoRangoActivo : styles.textoRangoInactivo}>
                30D
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Indicador de valor flotante seleccionado */}
      {puntoActivo && (
        <View style={styles.cajaValorSeleccionado}>
          <Text style={styles.etiquetaFechaSeleccionada}>
            {formatearFechaCorta(puntoActivo.fecha)}:
          </Text>
          <Text style={styles.valorLitrosSeleccionado}>
            {puntoActivo.valor.toFixed(1)} L
          </Text>
          {lineaReferenciaPDP && lineaReferenciaPDP > 0 && (
            <Text style={styles.comparacionPDPTexto}>
              {puntoActivo.valor >= lineaReferenciaPDP ? '▲ Sobre PDP' : '▼ Bajo PDP'}
            </Text>
          )}
        </View>
      )}

      {/* Gráfica SVG */}
      <Svg width={anchoContenedor} height={altoGrafica}>
        <Defs>
          <LinearGradient id="gradienteAreaProduccion" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={COLORES.verdeEsmeralda} stopOpacity="0.35" />
            <Stop offset="90%" stopColor={COLORES.verdeMentha} stopOpacity="0.02" />
          </LinearGradient>
        </Defs>

        {/* Líneas horizontales de cuadrícula */}
        <Line 
          x1={margenIzquierdo} 
          y1={margenSuperior} 
          x2={margenIzquierdo + anchoUtil} 
          y2={margenSuperior} 
          stroke={COLORES.bordeClaro} 
          strokeWidth="1" 
        />
        <Line 
          x1={margenIzquierdo} 
          y1={margenSuperior + altoUtil / 2} 
          x2={margenIzquierdo + anchoUtil} 
          y2={margenSuperior + altoUtil / 2} 
          stroke={COLORES.bordeClaro} 
          strokeWidth="1" 
          strokeDasharray="4, 4"
        />
        <Line 
          x1={margenIzquierdo} 
          y1={margenSuperior + altoUtil} 
          x2={margenIzquierdo + anchoUtil} 
          y2={margenSuperior + altoUtil} 
          stroke={COLORES.bordeClaro} 
          strokeWidth="1" 
        />

        {/* Etiquetas eje Y */}
        <SvgText 
          x={margenIzquierdo - 6} 
          y={margenSuperior + 4} 
          fontSize="10" 
          fill={COLORES.textoMudo} 
          textAnchor="end"
          fontWeight="bold"
        >
          {techoY}
        </SvgText>
        <SvgText 
          x={margenIzquierdo - 6} 
          y={margenSuperior + altoUtil / 2 + 4} 
          fontSize="10" 
          fill={COLORES.textoMudo} 
          textAnchor="end"
        >
          {medioY}
        </SvgText>
        <SvgText 
          x={margenIzquierdo - 6} 
          y={margenSuperior + altoUtil + 4} 
          fontSize="10" 
          fill={COLORES.textoMudo} 
          textAnchor="end"
        >
          0
        </SvgText>

        {/* Línea horizontal de referencia PDP */}
        {yReferenciaPDP !== null && lineaReferenciaPDP !== undefined && (
          <>
            <Line 
              x1={margenIzquierdo} 
              y1={yReferenciaPDP} 
              x2={margenIzquierdo + anchoUtil} 
              y2={yReferenciaPDP} 
              stroke={COLORES.limaBrillante} 
              strokeWidth="1.5" 
              strokeDasharray="5, 3" 
            />
            <SvgText 
              x={margenIzquierdo + anchoUtil} 
              y={yReferenciaPDP - 4} 
              fontSize="9" 
              fill={COLORES.olivaOscuro} 
              textAnchor="end"
              fontWeight="bold"
            >
              {etiquetaReferencia}: {lineaReferenciaPDP.toFixed(1)}L
            </SvgText>
          </>
        )}

        {/* Área con gradiente suave */}
        <Path d={comandoArea} fill="url(#gradienteAreaProduccion)" />

        {/* Línea de tendencia */}
        <Path 
          d={comandoLinea} 
          fill="none" 
          stroke={COLORES.verdeEsmeralda} 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />

        {/* Puntos y marcadores en cada día */}
        {coordenadas.map((coord, idx) => {
          const esActivo = idx === indiceActivo;
          return (
            <Circle 
              key={`pto-${coord.fecha}-${idx}`} 
              cx={coord.x} 
              cy={coord.y} 
              r={esActivo ? 6 : 3.5} 
              fill={esActivo ? COLORES.limaBrillante : COLORES.blanco} 
              stroke={esActivo ? COLORES.verdeOscuro : COLORES.verdeEsmeralda} 
              strokeWidth={esActivo ? 2.5 : 2} 
              onPress={() => setPuntoSeleccionadoIndex(idx)}
            />
          );
        })}

        {/* Etiquetas del eje X (primer día, día medio y último día) */}
        {coordenadas.length > 0 && (
          <SvgText 
            x={coordenadas[0].x} 
            y={altoGrafica - 6} 
            fontSize="9" 
            fill={COLORES.textoMudo} 
            textAnchor="start"
          >
            {formatearFechaDia(coordenadas[0].fecha)}
          </SvgText>
        )}

        {coordenadas.length > 2 && (
          <SvgText 
            x={coordenadas[Math.floor(coordenadas.length / 2)].x} 
            y={altoGrafica - 6} 
            fontSize="9" 
            fill={COLORES.textoMudo} 
            textAnchor="middle"
          >
            {formatearFechaDia(coordenadas[Math.floor(coordenadas.length / 2)].fecha)}
          </SvgText>
        )}

        {coordenadas.length > 1 && (
          <SvgText 
            x={coordenadas[coordenadas.length - 1].x} 
            y={altoGrafica - 6} 
            fontSize="9" 
            fill={COLORES.textoMudo} 
            textAnchor="end"
            fontWeight="bold"
          >
            {formatearFechaDia(coordenadas[coordenadas.length - 1].fecha)}
          </SvgText>
        )}
      </Svg>

    </View>
  );
}

function formatearFechaDia(fechaISO: string): string {
  try {
    const partes = fechaISO.split('-');
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}`;
    }
    return fechaISO;
  } catch {
    return fechaISO;
  }
}

function formatearFechaCorta(fechaISO: string): string {
  try {
    const partes = fechaISO.split('-');
    if (partes.length === 3) {
      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const mesNum = parseInt(partes[1], 10) - 1;
      return `${partes[2]} ${meses[mesNum] || partes[1]}`;
    }
    return fechaISO;
  } catch {
    return fechaISO;
  }
}

const styles = StyleSheet.create({
  tarjetaContenedor: {
    backgroundColor: COLORES.blanco,
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  cabeceraFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoColumna: {
    flex: 1,
  },
  tituloGrafica: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORES.tealOscuro,
  },
  subtituloGrafica: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORES.textoMudo,
    marginTop: 2,
  },
  selectorRangoContenedor: {
    flexDirection: 'row',
    backgroundColor: COLORES.fondoApp,
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  botonRangoActivo: {
    backgroundColor: COLORES.verdeEsmeralda,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9,
  },
  botonRangoInactivo: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9,
  },
  textoRangoActivo: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORES.blanco,
  },
  textoRangoInactivo: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORES.textoMudo,
  },
  cajaValorSeleccionado: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.fondoApp,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  etiquetaFechaSeleccionada: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORES.textoMudo,
  },
  valorLitrosSeleccionado: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORES.verdeOscuro,
  },
  comparacionPDPTexto: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORES.olivaOscuro,
    marginLeft: 4,
  },
  contenedorVacio: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoVacio: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORES.textoMudo,
    textAlign: 'center',
  },
});
