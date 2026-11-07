import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { inicializarBaseDatos } from '../database/sqlite/schema';
import { ConfiguracionRepository } from '../features/configuracion/repositories/ConfiguracionRepository';
import { COLORES } from '../shared/theme/colores';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [listo, setListo] = useState<boolean>(false);
  const [necesitaOnboarding, setNecesitaOnboarding] = useState<boolean>(false);

  useEffect(() => {
    async function inicializar() {
      try {
        await inicializarBaseDatos();
        const completado = await ConfiguracionRepository.onboardingCompletado();
        setNecesitaOnboarding(!completado);
      } catch (err) {
        if (err instanceof Error) {
          console.warn('Error inicializando app y configuración:', err.message);
        }
      } finally {
        setListo(true);
      }
    }
    inicializar();
  }, []);

  useEffect(() => {
    if (!listo) return;
    const enOnboarding = (segments as string[])[0] === 'onboarding';
    if (necesitaOnboarding && !enOnboarding) {
      router.replace('/onboarding');
    }
  }, [listo, necesitaOnboarding, segments, router]);

  if (!listo) {
    return (
      <View style={styles.cargandoContenedor}>
        <ActivityIndicator size="large" color={COLORES.verdeEsmeralda} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Pantalla de Onboarding inicial */}
      <Stack.Screen name="onboarding" />

      {/* El grupo (tabs) contiene la barra inferior */}
      <Stack.Screen name="(tabs)" />
      
      {/* Otras pantallas que NO deben tener barra inferior van aquí */}
      <Stack.Screen name="ajustes" />
      <Stack.Screen name="animal/ficha" />
      <Stack.Screen name="animal/[id]" />
      <Stack.Screen name="ordeno/dashboard" />
      <Stack.Screen name="reproduccion/index" />
      <Stack.Screen name="ceba/dashboard" />
      <Stack.Screen name="reportes/index" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  cargandoContenedor: {
    flex: 1,
    backgroundColor: COLORES.fondoPrincipal,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
