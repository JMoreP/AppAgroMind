import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { Target, Calendar, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { Ceba } from '../types/Ceba';
import {
  calcularPesoActual,
  determinarEtapaActual,
  calcularDiasCeba,
  calcularGananciaPesoDiaria,
  calcularProgresoFaena,
  proyectarFechaFaena,
} from '../utils/calculosCeba';
import { COLORES } from '../../../shared/theme/colores';

interface ProyeccionFaenaProps {
  ceba: Ceba;
}

export function ProyeccionFaena({ ceba }: ProyeccionFaenaProps) {
  const pesoInicial = ceba.pesoI ?? 0;
  const pesoActual = calcularPesoActual(ceba);
  const pesoObjetivo = ceba.pesoObjetivo || 450;
  const progreso = calcularProgresoFaena(pesoInicial, pesoActual, pesoObjetivo);

  const etapa = determinarEtapaActual(ceba);
  const fechaUltimo =
    etapa === 'IV' && ceba.fechaIV
      ? ceba.fechaIV
      : etapa === 'III' && ceba.fechaIII
      ? ceba.fechaIII
      : etapa === 'II' && ceba.fechaII
      ? ceba.fechaII
      : ceba.fechaInicio;

  const dias = calcularDiasCeba(ceba.fechaInicio, fechaUltimo);
  const gp = ceba.pesoI ? calcularGananciaPesoDiaria(ceba.pesoI, pesoActual, dias) : 0;
  const proyeccion = proyectarFechaFaena(pesoActual, pesoObjetivo, gp, fechaUltimo);

  const metaAlcanzada = pesoActual >= pesoObjetivo;

  return (
    <View style={styles.tarjeta}>
      {/* Cabecera */}
      <View style={styles.filaCabecera}>
        <View style={styles.contenedorIconoTitulo}>
          <Target size={18} color={COLORES.verdeEsmeralda} />
          <Text style={styles.titulo}>Proyección a Faena</Text>
        </View>
        <Text style={styles.textoPorcentaje}>{progreso}%</Text>
      </View>

      {/* Barra de progreso SVG */}
      <View style={styles.contenedorBarra}>
        <Svg width="100%" height={12}>
          <Rect
            x="0"
            y="0"
            width="100%"
            height={12}
            rx={6}
            fill={COLORES.bordeClaro}
          />
          <Rect
            x="0"
            y="0"
            width={`${Math.min(100, Math.max(0, progreso))}%`}
            height={12}
            rx={6}
            fill={metaAlcanzada ? COLORES.verdeOscuro : COLORES.verdeEsmeralda}
          />
        </Svg>
      </View>

      {/* Subtítulo de progreso */}
      <Text style={styles.textoProgresoDetalle}>
        {`Progreso: ${progreso}% hacia los ${pesoObjetivo} kg (actual: ${pesoActual} kg)`}
      </Text>

      {/* Estados condicionales */}
      {metaAlcanzada ? (
        <View style={styles.cajaAlcanzado}>
          <CheckCircle2 size={20} color={COLORES.verdeOscuro} />
          <View style={styles.cajaTextoAlcanzado}>
            <Text style={styles.textoAlcanzadoTitulo}>🎯 Peso de faena alcanzado</Text>
            <Text style={styles.textoAlcanzadoSub}>
              {`El animal superó la meta (${pesoActual} kg / ${pesoObjetivo} kg). Listo para faena.`}
            </Text>
          </View>
        </View>
      ) : proyeccion != null ? (
        <View style={styles.cajaProyeccion}>
          <View style={styles.filaDetalleProyeccion}>
            <Calendar size={16} color={COLORES.tealOscuro} />
            <Text style={styles.textoFechaEstimada}>
              {`Fecha estimada de faena: ${proyeccion.fechaEstimada}`}
            </Text>
          </View>

          <View style={styles.filaDetalleProyeccion}>
            <TrendingUp size={16} color={COLORES.verdeEsmeralda} />
            <Text style={styles.textoDiasRestantes}>
              {`Faltan ${proyeccion.diasRestantes} días al ritmo actual (${gp.toFixed(2)} kg/día)`}
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.cajaSinDatos}>
          <AlertCircle size={16} color={COLORES.textoMudo} />
          <Text style={styles.textoSinDatos}>
            Sin datos suficientes para proyectar (registre pesajes con ganancia positiva)
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: COLORES.blanco,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    marginBottom: 16,
  },
  filaCabecera: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  contenedorIconoTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titulo: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORES.tealOscuro,
  },
  textoPorcentaje: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORES.verdeEsmeralda,
  },
  contenedorBarra: {
    height: 12,
    marginVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
  textoProgresoDetalle: {
    fontSize: 12,
    color: COLORES.textoSecundario,
    marginTop: 6,
    marginBottom: 12,
  },
  cajaAlcanzado: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.verdeMentha,
    padding: 12,
    borderRadius: 14,
    gap: 10,
  },
  cajaTextoAlcanzado: {
    flex: 1,
  },
  textoAlcanzadoTitulo: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORES.verdeOscuro,
  },
  textoAlcanzadoSub: {
    fontSize: 11,
    color: COLORES.verdeOscuro,
    marginTop: 2,
  },
  cajaProyeccion: {
    backgroundColor: COLORES.fondoApp,
    padding: 12,
    borderRadius: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  filaDetalleProyeccion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textoFechaEstimada: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORES.tealOscuro,
  },
  textoDiasRestantes: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORES.textoSecundario,
  },
  cajaSinDatos: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.fondoApp,
    padding: 10,
    borderRadius: 12,
    gap: 8,
  },
  textoSinDatos: {
    fontSize: 12,
    color: COLORES.textoMudo,
    flex: 1,
  },
});
