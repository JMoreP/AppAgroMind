import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { COLORES } from '../../../shared/theme/colores';

export function TarjetaHeroOrdeno({ totalLitros = '480.5 L' }: { totalLitros?: string }) {
  return (
    <View style={styles.contenedorTarjetaHero}>
      <View style={styles.tarjetaOuter}>
        {/* Esmeralda Glow Blob (Efecto Glass/Luz) */}
        <View style={styles.glowingBlob}>
          <Svg width="100%" height="100%" viewBox="0 0 100 100">
            <Defs>
              <RadialGradient id="glow" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset="0%" stopColor={COLORES.esmeraldaNeon} stopOpacity="0.4" />
                <Stop offset="100%" stopColor={COLORES.esmeraldaNeon} stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Circle cx="50" cy="50" r="50" fill="url(#glow)" />
          </Svg>
        </View>

        {/* Tarjeta Interna (Superficie de Cristal Auténtico) */}
        <BlurView intensity={70} tint="light" style={styles.tarjetaInner}>
          <Text style={styles.textoLitrosCentral}>{totalLitros}</Text>
          <Text style={styles.etiquetaTotalLeche}>TOTAL MILK TODAY</Text>
        </BlurView>
      </View>

      {/* Indicadores de Paginación en la base (3 Puntos) */}
      <View style={styles.contenedorPuntosPaginacion}>
        <View style={styles.puntoPaginacionActivo} />
        <View style={styles.puntoPaginacionInactivo} />
        <View style={styles.puntoPaginacionInactivo} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedorTarjetaHero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  tarjetaOuter: {
    width: '100%',
    height: 180, // Fija altura horizontal
    backgroundColor: 'transparent',
    borderRadius: 30,
    padding: 2, // Inset
    overflow: 'hidden',
    shadowColor: COLORES.sombraTarjetaHero,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  glowingBlob: {
    position: 'absolute',
    bottom: -80,
    right: -40,
    width: 220,
    height: 220,
  },
  tarjetaInner: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 28, // 30 (outer) - 2 (padding)
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  textoLitrosCentral: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORES.textoOscuro,
    letterSpacing: -0.5,
  },
  etiquetaTotalLeche: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORES.textoSecundario,
    letterSpacing: 1.2,
    marginTop: -8,
  },
  contenedorPuntosPaginacion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
  },
  puntoPaginacionInactivo: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORES.puntoInactivo,
  },
  puntoPaginacionActivo: {
    width: 18,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORES.puntoActivo,
  },
});
