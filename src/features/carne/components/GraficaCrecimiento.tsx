import React, { useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  Circle,
  Line,
  Text as SvgText,
} from 'react-native-svg';
import { parseISO, format, isValid } from 'date-fns';
import { COLORES } from '../../../shared/theme/colores';

export interface PuntoCrecimiento {
  fecha: string;
  peso: number;
  etapa: string;
}

export interface GraficaCrecimientoProps {
  puntos: PuntoCrecimiento[];
  pesoObjetivo?: number;
  altura?: number;
}

export function GraficaCrecimiento({
  puntos,
  pesoObjetivo,
  altura = 200,
}: GraficaCrecimientoProps) {
  const [anchoContenedor, setAnchoContenedor] = useState(320);

  const manejarLayout = (evento: LayoutChangeEvent) => {
    const ancho = evento.nativeEvent.layout.width;
    if (ancho > 50) {
      setAnchoContenedor(ancho);
    }
  };

  if (!puntos || puntos.length === 0) {
    return (
      <View style={styles.tarjetaContenedor} onLayout={manejarLayout}>
        <View style={styles.cabecera}>
          <Text style={styles.titulo}>Curva de Crecimiento</Text>
          <Text style={styles.subtitulo}>Evolución ponderal por etapas</Text>
        </View>
        <View style={styles.contenedorVacio}>
          <Text style={styles.textoVacio}>Sin pesajes registrados</Text>
        </View>
      </View>
    );
  }

  const margenIzquierdo = 44;
  const margenDerecho = 24;
  const margenSuperior = 26;
  const margenInferior = 36;

  const anchoUtil = Math.max(anchoContenedor - margenIzquierdo - margenDerecho, 80);
  const altoUtil = Math.max(altura - margenSuperior - margenInferior, 80);

  const pesos = puntos.map((p) => p.peso);
  const todosLosPesos = pesoObjetivo ? [...pesos, pesoObjetivo] : pesos;
  const pesoMinRaw = Math.min(...todosLosPesos);
  const pesoMaxRaw = Math.max(...todosLosPesos);

  const minPeso = Math.max(0, Math.floor((pesoMinRaw * 0.85) / 10) * 10);
  const maxPeso = Math.ceil((pesoMaxRaw * 1.08) / 10) * 10;
  const rangoPeso = maxPeso - minPeso || 1;

  const calcularX = (index: number) => {
    if (puntos.length === 1) {
      return margenIzquierdo + anchoUtil / 2;
    }
    return margenIzquierdo + (index / (puntos.length - 1)) * anchoUtil;
  };

  const calcularY = (peso: number) => {
    const proporcion = (peso - minPeso) / rangoPeso;
    return margenSuperior + altoUtil - proporcion * altoUtil;
  };

  // Coordenadas de los puntos
  const coordenadas = puntos.map((p, i) => ({
    x: calcularX(i),
    y: calcularY(p.peso),
    peso: p.peso,
    etapa: p.etapa,
    fecha: p.fecha,
  }));

  // Construir Path de línea y área
  let dLinea = '';
  let dArea = '';

  if (coordenadas.length === 1) {
    const pt = coordenadas[0];
    dLinea = `M ${pt.x - 20} ${pt.y} L ${pt.x + 20} ${pt.y}`;
  } else {
    dLinea = `M ${coordenadas[0].x} ${coordenadas[0].y}`;
    for (let i = 1; i < coordenadas.length; i++) {
      dLinea += ` L ${coordenadas[i].x} ${coordenadas[i].y}`;
    }

    const fondoY = margenSuperior + altoUtil;
    dArea = `M ${coordenadas[0].x} ${fondoY} L ${coordenadas[0].x} ${coordenadas[0].y}`;
    for (let i = 1; i < coordenadas.length; i++) {
      dArea += ` L ${coordenadas[i].x} ${coordenadas[i].y}`;
    }
    dArea += ` L ${coordenadas[coordenadas.length - 1].x} ${fondoY} Z`;
  }

  // Línea de referencia del peso objetivo
  const yObjetivo = pesoObjetivo ? calcularY(pesoObjetivo) : null;

  // 3 líneas de grilla horizontal
  const nivelesGrilla = [
    minPeso,
    Math.round(minPeso + rangoPeso * 0.5),
    maxPeso,
  ];

  const formatearFechaCorta = (fechaStr: string) => {
    try {
      const d = parseISO(fechaStr);
      if (isValid(d)) {
        return format(d, 'd MMM');
      }
    } catch {
      // Ignorar fallback
    }
    return fechaStr;
  };

  return (
    <View style={styles.tarjetaContenedor} onLayout={manejarLayout}>
      <View style={styles.cabecera}>
        <View>
          <Text style={styles.titulo}>Curva de Crecimiento</Text>
          <Text style={styles.subtitulo}>Pesaje en etapas I, II, III y IV (kg)</Text>
        </View>
        {pesoObjetivo && (
          <View style={styles.badgeMeta}>
            <Text style={styles.textoBadgeMeta}>Meta: {pesoObjetivo} kg</Text>
          </View>
        )}
      </View>

      <View style={styles.contenedorSvg}>
        <Svg width={anchoContenedor} height={altura}>
          <Defs>
            <LinearGradient id="gradienteAreaCeba" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={COLORES.verdeEsmeralda} stopOpacity="0.32" />
              <Stop offset="90%" stopColor={COLORES.verdeEsmeralda} stopOpacity="0.02" />
            </LinearGradient>
          </Defs>

          {/* Grilla horizontal y etiquetas de peso Y */}
          {nivelesGrilla.map((pesoNivel) => {
            const yPos = calcularY(pesoNivel);
            return (
              <React.Fragment key={`grilla-${pesoNivel}`}>
                <Line
                  x1={margenIzquierdo}
                  y1={yPos}
                  x2={anchoContenedor - margenDerecho}
                  y2={yPos}
                  stroke={COLORES.bordeClaro}
                  strokeWidth="1"
                  strokeDasharray="2, 4"
                />
                <SvgText
                  x={margenIzquierdo - 6}
                  y={yPos + 4}
                  fill={COLORES.textoMudo}
                  fontSize="10"
                  fontWeight="600"
                  textAnchor="end"
                >
                  {pesoNivel}
                </SvgText>
              </React.Fragment>
            );
          })}

          {/* Línea horizontal punteada para el peso objetivo */}
          {yObjetivo != null && (
            <React.Fragment>
              <Line
                x1={margenIzquierdo}
                y1={yObjetivo}
                x2={anchoContenedor - margenDerecho}
                y2={yObjetivo}
                stroke={COLORES.ambarAlerta}
                strokeWidth="1.5"
                strokeDasharray="5, 4"
              />
              <SvgText
                x={anchoContenedor - margenDerecho}
                y={yObjetivo - 5}
                fill={COLORES.ambarOscuro}
                fontSize="10"
                fontWeight="800"
                textAnchor="end"
              >
                Objetivo: {pesoObjetivo} kg
              </SvgText>
            </React.Fragment>
          )}

          {/* Área sombreada */}
          {dArea !== '' && <Path d={dArea} fill="url(#gradienteAreaCeba)" />}

          {/* Línea principal */}
          {dLinea !== '' && (
            <Path
              d={dLinea}
              fill="none"
              stroke={COLORES.verdeEsmeralda}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Puntos de cada etapa */}
          {coordenadas.map((pt, idx) => (
            <React.Fragment key={`punto-${idx}-${pt.etapa}`}>
              <Circle
                cx={pt.x}
                cy={pt.y}
                r="7"
                fill={COLORES.blanco}
                stroke={COLORES.verdeEsmeralda}
                strokeWidth="3"
              />
              <Circle
                cx={pt.x}
                cy={pt.y}
                r="3"
                fill={COLORES.verdeEsmeralda}
              />
              {/* Etiqueta de peso arriba del punto */}
              <SvgText
                x={pt.x}
                y={pt.y - 12}
                fill={COLORES.tealOscuro}
                fontSize="11"
                fontWeight="800"
                textAnchor="middle"
              >
                {`${pt.peso}k`}
              </SvgText>
              {/* Etiqueta de Etapa debajo del eje X */}
              <SvgText
                x={pt.x}
                y={margenSuperior + altoUtil + 14}
                fill={COLORES.verdeOscuro}
                fontSize="10"
                fontWeight="700"
                textAnchor="middle"
              >
                {`Et. ${pt.etapa}`}
              </SvgText>
              {/* Fecha debajo de la etapa */}
              <SvgText
                x={pt.x}
                y={margenSuperior + altoUtil + 26}
                fill={COLORES.textoMudo}
                fontSize="9"
                fontWeight="500"
                textAnchor="middle"
              >
                {formatearFechaCorta(pt.fecha)}
              </SvgText>
            </React.Fragment>
          ))}
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tarjetaContenedor: {
    backgroundColor: COLORES.blanco,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    marginBottom: 16,
  },
  cabecera: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titulo: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORES.tealOscuro,
  },
  subtitulo: {
    fontSize: 12,
    color: COLORES.textoSecundario,
    marginTop: 2,
  },
  badgeMeta: {
    backgroundColor: COLORES.ambarClaro,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORES.ambarAlerta,
  },
  textoBadgeMeta: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORES.ambarOscuro,
  },
  contenedorSvg: {
    alignItems: 'center',
    justifyContent: 'center',
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
  },
});
