import React, { useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORES } from '../../shared/theme/colores';

import { useRouter } from 'expo-router';
import { EncabezadoPrincipal } from '../../shared/components/EncabezadoPrincipal';
import { TarjetaHeroOrdeno } from '../../features/ordeno/components/TarjetaHeroOrdeno';
import { SeccionModulos } from '../../shared/components/SeccionModulos';
import { SeccionRecientes } from '../../features/animales/components/SeccionRecientes';
import { useOrdenoStore } from '../../shared/store/useOrdenoStore';

export default function PantallaInicio() {
  const router = useRouter();
  const totalLitrosHoy = useOrdenoStore((state) => state.totalLitrosHoy);
  const cargarTotalLitrosHoy = useOrdenoStore((state) => state.cargarTotalLitrosHoy);

  useEffect(() => {
    cargarTotalLitrosHoy();
  }, [cargarTotalLitrosHoy]);

  const textoLitrosHoy = `${totalLitrosHoy.toFixed(1)} L`;

  return (
    <SafeAreaView style={styles.contenedorSeguro}>
      <ScrollView
        contentContainerStyle={styles.contenidoScroll}
        showsVerticalScrollIndicator={false}
      >
        {/* PASO 1: ENCABEZADO EXACTO */}
        <EncabezadoPrincipal />

        {/* PASO 2: TARJETA HERO - NAVEGABLE A DASHBOARD DEL HATO */}
        <TarjetaHeroOrdeno 
          totalLitros={textoLitrosHoy} 
          onPress={() => router.push('/ordeno/dashboard')} 
        />

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
