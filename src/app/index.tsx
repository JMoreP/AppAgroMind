import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORES } from '../shared/theme/colores';

// Importaciones según la Arquitectura Clean Feature-based (AGENTS.md)
import { EncabezadoPrincipal } from '../shared/components/EncabezadoPrincipal';
import { TarjetaHeroOrdeno } from '../features/ordeno/components/TarjetaHeroOrdeno';
import { SeccionModulos } from '../shared/components/SeccionModulos';
import { SeccionRecientes } from '../features/animales/components/SeccionRecientes';

export default function PantallaInicio() {
  return (
    <SafeAreaView style={styles.contenedorSeguro}>
      <ScrollView
        contentContainerStyle={styles.contenidoScroll}
        showsVerticalScrollIndicator={false}
      >
        {/* PASO 1: ENCABEZADO EXACTO */}
        <EncabezadoPrincipal />

        {/* PASO 2: TARJETA HERO - MEDIDOR CIRCULAR SVG DE ORDEÑO */}
        <TarjetaHeroOrdeno totalLitros="480.5 L" />

        {/* PASO 3: LIVESTOCK OVERVIEW (Tarjetas Modulares Glass) */}
        <SeccionModulos />

        {/* PASO 4: RECENTS (Últimos Registros - Grey Glass) */}
        <SeccionRecientes />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedorSeguro: {
    flex: 1,
    backgroundColor: COLORES.fondoPrincipal,
  },
  contenidoScroll: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
});
