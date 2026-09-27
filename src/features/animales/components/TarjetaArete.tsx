import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { Animal } from '../types/Animal';
import { COLORES } from '../../../shared/theme/colores';
import { useAnimalStore } from '../../../shared/store/useAnimalStore';
import { useRouter } from 'expo-router';

interface Props {
  animal: Animal;
}

export function TarjetaArete({ animal }: Props) {
  const { seleccionarAnimal } = useAnimalStore();
  const router = useRouter();

  const manejarPress = () => {
    seleccionarAnimal(animal);
    router.push(`/animal/ficha`);
  };

  const colorEstado = () => {
    switch(animal.estadoReproductivo) {
      case 'lactancia': return '#10b981'; // Verde
      case 'preñada': return '#3b82f6'; // Azul
      case 'secado': return '#f59e0b'; // Naranja
      case 'vacia': return '#ef4444'; // Rojo
      default: return '#9ca3af';
    }
  };

  return (
    <Pressable 
      style={({ pressed }) => [
        styles.tarjeta, 
        pressed && styles.tarjetaPresionada
      ]}
      onPress={manejarPress}
    >
      <View style={styles.contenedorIzq}>
        <View style={styles.badgeArete}>
          <Text style={styles.textoArete}>{animal.arete}</Text>
        </View>
        <View style={styles.infoCentral}>
          <Text style={styles.textoNombre}>{animal.nombre || 'Sin nombre'}</Text>
          <View style={styles.filaEstado}>
            <View style={[styles.puntoEstado, { backgroundColor: colorEstado() }]} />
            <Text style={styles.textoEstado}>{animal.estadoReproductivo.toUpperCase()}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.contenedorDer}>
        <View style={styles.stats}>
          <Text style={styles.valorStat}>{animal.ultimoPesajeLitros.toFixed(1)} L</Text>
        </View>
        <ChevronRight size={20} color="#c7c7cc" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderCurve: 'continuous', // Apple squircle
  },
  tarjetaPresionada: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  contenedorIzq: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  badgeArete: {
    backgroundColor: COLORES.fondoPrincipal,
    width: 54,
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  textoArete: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.5,
  },
  infoCentral: {
    flex: 1,
    justifyContent: 'center',
  },
  textoNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 4,
  },
  filaEstado: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  puntoEstado: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  textoEstado: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8e8e93',
  },
  contenedorDer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stats: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  valorStat: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORES.esmeraldaNeon,
  },
});
