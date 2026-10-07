import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Circle, Defs, RadialGradient, Stop, Path, LinearGradient } from 'react-native-svg';
import { COLORES } from '../../../shared/theme/colores';

interface Props {
  totalLitros?: string;
  onPress?: () => void;
}

export function TarjetaHeroOrdeno({ totalLitros = '480.5 L', onPress }: Props) {
  return (
    <View style={styles.contenedorTarjetaHero}>
      <Pressable 
        style={({ pressed }) => [
          styles.tarjetaOuter,
          pressed && Boolean(onPress) && styles.tarjetaOuterPresionada
        ]}
        onPress={onPress}
      >
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

        {/* Gráfico Sparkline de Fondo (Tendencia de Ordeño) */}
        <View style={styles.sparklineContainer}>
          <Svg width="100%" height="80" viewBox="0 0 300 80" preserveAspectRatio="none">
            <Defs>
              <LinearGradient id="gradSpark" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={COLORES.esmeraldaNeon} stopOpacity="0.5" />
                <Stop offset="100%" stopColor={COLORES.esmeraldaNeon} stopOpacity="0" />
              </LinearGradient>
            </Defs>
            <Path 
              d="M 0 60 Q 30 20 60 40 T 120 30 T 180 50 T 240 20 T 300 35 L 300 80 L 0 80 Z" 
              fill="url(#gradSpark)" 
            />
            <Path 
              d="M 0 60 Q 30 20 60 40 T 120 30 T 180 50 T 240 20 T 300 35" 
              fill="none" 
              stroke={COLORES.esmeraldaNeon} 
              strokeWidth="3" 
              strokeLinecap="round" 
            />
          </Svg>
        </View>

        {/* Tarjeta Interna (Superficie de Cristal Auténtico) */}
        <BlurView intensity={70} tint="light" style={styles.tarjetaInner}>
          <View style={styles.badgeCrecimiento}>
            <Text style={styles.textoBadgeCrecimiento}>▲ Ver análisis del hato</Text>
          </View>
          <Text style={styles.textoLitrosCentral}>{totalLitros}</Text>
          <Text style={styles.etiquetaTotalLeche}>TOTAL MILK TODAY</Text>
        </BlurView>
      </Pressable>

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
  tarjetaOuterPresionada: {
    transform: [{ scale: 0.98 }],
    opacity: 0.92,
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
    backgroundColor: COLORES.blancoTransparente40,
    borderRadius: 28, // 30 (outer) - 2 (padding)
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORES.blancoTransparente80,
  },
  sparklineContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    opacity: 0.6,
  },
  badgeCrecimiento: {
    backgroundColor: COLORES.esmeraldaTransparente15,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORES.esmeraldaTransparente30,
  },
  textoBadgeCrecimiento: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORES.verdeBadgeCrecimiento, // Un verde más oscuro para legibilidad
    letterSpacing: 0.5,
  },
  textoLitrosCentral: {
    fontSize: 42,
    fontWeight: '900',
    color: COLORES.textoOscuro,
    letterSpacing: -1.5,
  },
  etiquetaTotalLeche: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORES.textoSecundario,
    letterSpacing: 1.5,
    marginTop: -2,
    textTransform: 'uppercase',
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
