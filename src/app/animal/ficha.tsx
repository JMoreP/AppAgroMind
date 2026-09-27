import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Scale, Activity, Droplets, Calendar } from 'lucide-react-native';
import { useAnimalStore } from '../../shared/store/useAnimalStore';
import { COLORES } from '../../shared/theme/colores';

export default function PantallaFicha() {
  const router = useRouter();
  const { animalSeleccionado } = useAnimalStore();

  // Si por alguna razón recargan la app en esta ruta y no hay animal, regresar.
  // TODO: Implementar un fallback de fetch con SQLite si se navega directo por URL.
  if (!animalSeleccionado) {
    return (
      <SafeAreaView style={styles.centro}>
        <Text>Animal no encontrado en la memoria.</Text>
        <Pressable onPress={() => router.back()} style={styles.botonVolverErr}>
          <Text style={{ color: 'white' }}>Volver</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const animal = animalSeleccionado;

  const getEstadoColor = () => {
    switch(animal.estadoReproductivo) {
      case 'lactancia': return '#10b981';
      case 'preñada': return '#3b82f6';
      case 'secado': return '#f59e0b';
      case 'vacia': return '#ef4444';
      default: return '#9ca3af';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* ── Navbar ── */}
      <View style={styles.navbar}>
        <Pressable onPress={() => router.back()} style={styles.botonAtras}>
          <ChevronLeft size={28} color="#000000" />
        </Pressable>
        <Text style={styles.navbarTitulo}>Ficha del Animal</Text>
        <View style={styles.navbarEspaciador} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollPadding} showsVerticalScrollIndicator={false}>
        
        {/* ── Tarjeta Hero (Perfil) ── */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.areteBadgeGigante}>
              <Text style={styles.areteGiganteTexto}>{animal.arete}</Text>
            </View>
            <View style={styles.heroInfo}>
              <Text style={styles.nombreTexto}>{animal.nombre || 'Búfala Sin Nombre'}</Text>
              <Text style={styles.fechaNacimiento}>
                <Calendar size={14} color="#8e8e93" style={{ marginRight: 4 }} />
                Nacida: {animal.fechaNacimiento}
              </Text>
            </View>
          </View>
          
          <View style={styles.heroBottom}>
            <View style={[styles.pillEstado, { backgroundColor: getEstadoColor() + '20' }]}>
              <View style={[styles.puntoEstado, { backgroundColor: getEstadoColor() }]} />
              <Text style={[styles.textoEstado, { color: getEstadoColor() }]}>
                {animal.estadoReproductivo.toUpperCase()}
              </Text>
            </View>
            {animal.sincronizado === 0 && (
              <View style={styles.pillOffline}>
                <Text style={styles.textoOffline}>Edición Local</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.seccionTitulo}>Métricas Actuales</Text>

        {/* ── Cuadrícula de Datos ── */}
        <View style={styles.gridMetricas}>
          
          {/* Módulo de Leche */}
          <View style={styles.gridItem}>
            <View style={styles.gridIconoContainer}>
              <Droplets size={24} color={COLORES.esmeraldaNeon} />
            </View>
            <Text style={styles.gridValor}>{animal.ultimoPesajeLitros.toFixed(1)} L</Text>
            <Text style={styles.gridLabel}>Último Ordeño</Text>
          </View>

          {/* Módulo de Peso */}
          <View style={styles.gridItem}>
            <View style={[styles.gridIconoContainer, { backgroundColor: '#f3e8ff' }]}>
              <Scale size={24} color="#9333ea" />
            </View>
            <Text style={styles.gridValor}>{animal.ultimoPesajeCarne.toFixed(0)} kg</Text>
            <Text style={styles.gridLabel}>Peso Corporal</Text>
          </View>

          {/* Módulo de Salud (Dummy por ahora) */}
          <View style={styles.gridItem}>
            <View style={[styles.gridIconoContainer, { backgroundColor: '#fee2e2' }]}>
              <Activity size={24} color="#ef4444" />
            </View>
            <Text style={styles.gridValor}>Sana</Text>
            <Text style={styles.gridLabel}>Estado de Salud</Text>
          </View>

          {/* Módulo Sexo */}
          <View style={styles.gridItem}>
            <View style={[styles.gridIconoContainer, { backgroundColor: '#e0f2fe' }]}>
              <Text style={{fontSize: 18, fontWeight: '800', color: '#0ea5e9'}}>{animal.sexo}</Text>
            </View>
            <Text style={styles.gridValor}>{animal.sexo === 'H' ? 'Hembra' : 'Macho'}</Text>
            <Text style={styles.gridLabel}>Sexo</Text>
          </View>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORES.fondoPrincipal,
  },
  centro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonVolverErr: {
    marginTop: 12,
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 54,
  },
  botonAtras: {
    padding: 8,
    marginLeft: -8,
  },
  navbarTitulo: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  navbarEspaciador: {
    width: 44, // Misma anchura que el botón atrás para centrar perfecto
  },
  scrollPadding: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
  },
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
    borderCurve: 'continuous',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  areteBadgeGigante: {
    backgroundColor: COLORES.fondoPrincipal,
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderCurve: 'continuous',
  },
  areteGiganteTexto: {
    fontSize: 32,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -1,
  },
  heroInfo: {
    flex: 1,
  },
  nombreTexto: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  fechaNacimiento: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8e8e93',
    alignItems: 'center',
  },
  heroBottom: {
    flexDirection: 'row',
    gap: 8,
  },
  pillEstado: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  puntoEstado: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  textoEstado: {
    fontSize: 13,
    fontWeight: '700',
  },
  pillOffline: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  textoOffline: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  seccionTitulo: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  gridMetricas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '47%', // Dos columnas con gap
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    borderCurve: 'continuous',
  },
  gridIconoContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#ecfdf5', // Default (Leche)
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderCurve: 'continuous',
  },
  gridValor: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  gridLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8e8e93',
  }
});
