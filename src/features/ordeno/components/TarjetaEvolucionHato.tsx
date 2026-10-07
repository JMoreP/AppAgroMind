import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Layers, Users, TrendingUp } from 'lucide-react-native';
import { COLORES } from '../../../shared/theme/colores';
import { useHistorialHato } from '../hooks/useHistorialHato';
import { GraficaProduccionLeche } from './GraficaProduccionLeche';

export function TarjetaEvolucionHato() {
  const {
    cargando,
    metricasHato,
    totalLitrosHoy,
    bufalasHoy,
    pdpHatoHoy,
    pdpHato7Dias,
  } = useHistorialHato();

  const [rango, setRango] = useState<'7d' | '30d'>('7d');

  if (cargando) {
    return (
      <View style={styles.contenedorCarga}>
        <ActivityIndicator size="small" color={COLORES.verdeEsmeralda} />
      </View>
    );
  }

  const datosGrafica = metricasHato.map((m) => ({
    fecha: m.fecha,
    litros: m.litros,
  }));

  return (
    <View style={styles.contenedorPrincipal}>
      {/* Tarjeta de métricas PDP del hato */}
      <View style={styles.resumenHatoFila}>
        <View style={styles.tarjetaMetricaHato}>
          <View style={styles.encabezadoMetrica}>
            <View style={styles.iconoVerde}>
              <TrendingUp size={14} color={COLORES.verdeOscuro} />
            </View>
            <Text style={styles.tituloMetrica}>PDP DEL HATO</Text>
          </View>
          <View style={styles.filaValor}>
            <Text style={styles.valorPrincipal}>{pdpHatoHoy.toFixed(1)}</Text>
            <Text style={styles.unidadTexto}>L/búfala</Text>
          </View>
          <Text style={styles.subtextoMetrica}>
            {bufalasHoy > 0 ? `${bufalasHoy} ordeñadas hoy` : 'Sin ordeño hoy'}
          </Text>
        </View>

        <View style={styles.tarjetaMetricaHato}>
          <View style={styles.encabezadoMetrica}>
            <View style={styles.iconoAzul}>
              <Users size={14} color={COLORES.azulRey} />
            </View>
            <Text style={styles.tituloMetrica}>PDP 7 DÍAS</Text>
          </View>
          <View style={styles.filaValor}>
            <Text style={styles.valorPrincipal}>{pdpHato7Dias.toFixed(1)}</Text>
            <Text style={styles.unidadTexto}>L/prom</Text>
          </View>
          <Text style={styles.subtextoMetrica}>Media semanal hato</Text>
        </View>
      </View>

      {/* Gráfica de línea del hato */}
      <GraficaProduccionLeche
        datos={datosGrafica}
        lineaReferenciaPDP={pdpHato7Dias > 0 ? Number((pdpHato7Dias * (bufalasHoy || 1)).toFixed(1)) : undefined}
        etiquetaReferencia="Ref Hato"
        titulo="Producción Diaria del Hato"
        subtitulo="Litros totales acumulados por ordeño diario"
        rangoActivo={rango}
        onCambiarRango={setRango}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedorPrincipal: {
    marginBottom: 8,
  },
  contenedorCarga: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resumenHatoFila: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  tarjetaMetricaHato: {
    flex: 1,
    backgroundColor: COLORES.blanco,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    shadowColor: COLORES.textoOscuro,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  encabezadoMetrica: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  iconoVerde: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORES.verdeMentha,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconoAzul: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORES.aquaClaro,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tituloMetrica: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORES.textoMudo,
    letterSpacing: 0.8,
  },
  filaValor: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  valorPrincipal: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORES.tealOscuro,
    letterSpacing: -0.5,
  },
  unidadTexto: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORES.verdeEsmeralda,
    marginLeft: 4,
  },
  subtextoMetrica: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORES.textoMudo,
    marginTop: 4,
  },
});
