import React from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { useAnimales } from '../../features/animales/hooks/useAnimales';
import { TarjetaArete } from '../../features/animales/components/TarjetaArete';
import { COLORES } from '../../shared/theme/colores';

export default function PantallaRebano() {
  const { animales, busqueda, setBusqueda, cargando } = useAnimales();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.tituloHeader}>Rebaño</Text>
        <Text style={styles.subtituloHeader}>
          {cargando ? 'Cargando...' : `${animales.length} cabezas totales`}
        </Text>
      </View>

      {/* ── Buscador ── */}
      <View style={styles.contenedorBuscador}>
        <View style={styles.barraBusqueda}>
          <Search size={20} color="#8e8e93" style={styles.iconoBuscar} />
          <TextInput
            style={styles.inputBusqueda}
            placeholder="Buscar por arete o nombre..."
            placeholderTextColor="#8e8e93"
            value={busqueda}
            onChangeText={setBusqueda}
            clearButtonMode="while-editing" // Nativo de iOS
          />
        </View>
        <View style={styles.botonFiltro}>
          <SlidersHorizontal size={20} color={COLORES.esmeraldaNeon} />
        </View>
      </View>

      {/* ── Lista de Animales ── */}
      {cargando ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={COLORES.esmeraldaNeon} />
        </View>
      ) : (
        <FlatList
          data={animales}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TarjetaArete animal={item} />}
          contentContainerStyle={styles.listaPadding}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centro}>
              <Text style={styles.textoVacio}>No se encontraron animales.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORES.fondoPrincipal 
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  tituloHeader: {
    fontSize: 34,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -1,
  },
  subtituloHeader: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8e8e93',
    marginTop: 4,
  },
  contenedorBuscador: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
    alignItems: 'center',
    gap: 12,
  },
  barraBusqueda: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  iconoBuscar: {
    marginRight: 8,
  },
  inputBusqueda: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    height: '100%',
  },
  botonFiltro: {
    width: 44,
    height: 44,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  listaPadding: {
    paddingHorizontal: 24,
    paddingBottom: 100, // Espacio para el Tab Bar flotante
  },
  centro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoVacio: {
    fontSize: 16,
    color: '#8e8e93',
  }
});
