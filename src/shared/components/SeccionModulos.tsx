import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { COLORES } from '../theme/colores';
import { IconoOrdeno, IconoArete, IconoSalud } from './IconosModulos';

export function SeccionModulos() {
  return (
    <View style={styles.contenedorModulos}>
      <Text style={styles.tituloSeccion}>LIVESTOCK OVERVIEW</Text>
      <View style={styles.filaModulos}>
        <TarjetaModulo titulo="Ordeño Rápido" subtitulo="Quick Milking" Icono={IconoOrdeno} />
        <TarjetaModulo titulo="Búsqueda por Arete" subtitulo="Tag Search" Icono={IconoArete} />
        <TarjetaModulo titulo="Salud & Dosis" subtitulo="Health & Dosage" Icono={IconoSalud} />
      </View>
    </View>
  );
}

function TarjetaModulo({ titulo, subtitulo, Icono }: { titulo: string; subtitulo: string; Icono: any }) {
  return (
    <View style={styles.tarjetaModuloOuter}>
      <View style={styles.glowingBlobModulo}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100">
          <Defs>
            <RadialGradient id="glowMod" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor={COLORES.esmeraldaNeon} stopOpacity="0.6" />
              <Stop offset="100%" stopColor={COLORES.esmeraldaNeon} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx="50" cy="50" r="50" fill="url(#glowMod)" />
        </Svg>
      </View>

      <BlurView intensity={65} tint="light" style={styles.tarjetaModuloInner}>
        <Icono size={52} />
        <Text style={styles.tituloModulo}>{titulo}</Text>
        <Text style={styles.subtituloModulo} numberOfLines={2}>{subtitulo}</Text>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedorModulos: {
    marginTop: 8,
  },
  tituloSeccion: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORES.textoSecundario,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  filaModulos: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  tarjetaModuloOuter: {
    flex: 1,
    height: 155,
    backgroundColor: 'transparent',
    borderRadius: 20,
    padding: 2,
    overflow: 'hidden',
  },
  glowingBlobModulo: {
    position: 'absolute',
    bottom: -40,
    right: -20,
    width: 120,
    height: 120,
  },
  tarjetaModuloInner: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderRadius: 18,
    padding: 10,
    justifyContent: 'flex-start',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  tituloModulo: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORES.textoOscuro,
    marginTop: 12,
    marginBottom: 4,
    lineHeight: 16,
  },
  subtituloModulo: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORES.textoSecundario,
    lineHeight: 12,
  },
});
