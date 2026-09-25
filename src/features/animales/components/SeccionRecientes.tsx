import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORES } from '../../../shared/theme/colores';

export function SeccionRecientes() {
  return (
    <View style={styles.contenedorSeccionRecientes}>
      <Text style={styles.tituloSeccion}>RECENTS</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollRecientes}>
        <TarjetaReciente nombre="Vaca #452" subtitulo="e.a. #452" valorPrincipal="33.9" valorSecundario="10.0" />
        <TarjetaReciente nombre="Vaca #109" subtitulo="e.a. #109" valorPrincipal="10.0" valorSecundario="10.6%" />
      </ScrollView>
    </View>
  );
}

function TarjetaReciente({ nombre, subtitulo, valorPrincipal, valorSecundario }: any) {
  return (
    <View style={styles.tarjetaRecienteOuter}>
      <BlurView intensity={40} tint="light" style={styles.tarjetaRecienteInner}>
        <View style={styles.filaReciente}>
          <Text style={styles.textoNombreReciente}>{nombre}</Text>
          <View style={styles.contenedorValor}>
            <View style={[styles.puntito, { backgroundColor: COLORES.esmeraldaNeon }]} />
            <Text style={styles.textoValorPrincipal}>{valorPrincipal}</Text>
          </View>
        </View>
        <View style={[styles.filaReciente, { marginTop: 4 }]}>
          <Text style={styles.textoSubtituloReciente}>{subtitulo}</Text>
          <View style={styles.contenedorValor}>
            <View style={[styles.puntito, { backgroundColor: COLORES.textoSecundario }]} />
            <Text style={styles.textoValorSecundario}>{valorSecundario}</Text>
          </View>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  tituloSeccion: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORES.textoSecundario,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  contenedorSeccionRecientes: {
    marginTop: 24,
    marginBottom: 80,
  },
  scrollRecientes: {
    paddingRight: 20,
    gap: 12,
  },
  tarjetaRecienteOuter: {
    width: 220,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  tarjetaRecienteInner: {
    padding: 16,
    backgroundColor: 'rgba(235, 238, 240, 0.55)',
  },
  filaReciente: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textoNombreReciente: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORES.textoOscuro,
  },
  textoSubtituloReciente: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORES.textoSecundario,
  },
  contenedorValor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  puntito: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  textoValorPrincipal: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORES.textoOscuro,
  },
  textoValorSecundario: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORES.textoSecundario,
  },
});
