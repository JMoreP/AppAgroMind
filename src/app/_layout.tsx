import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { inicializarBaseDatos } from '../database/sqlite/schema';

export default function RootLayout() {
  useEffect(() => {
    // Inicializamos SQLite al nivel más alto de la aplicación
    inicializarBaseDatos();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* El grupo (tabs) contiene la barra inferior */}
      <Stack.Screen name="(tabs)" />
      
      {/* Otras pantallas que NO deben tener barra inferior van aquí */}
      <Stack.Screen name="animal/ficha" />
    </Stack>
  );
}
