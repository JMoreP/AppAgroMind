import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  FlatList, 
  ActivityIndicator, 
  Pressable, 
  ScrollView,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, SlidersHorizontal, X, Layers, RotateCcw } from 'lucide-react-native';
import { useAnimales } from '../../features/animales/hooks/useAnimales';
import { useLotes } from '../../features/lotes/hooks/useLotes';
import { TarjetaArete } from '../../features/animales/components/TarjetaArete';
import { FormularioAnimalModal } from '../../features/animales/components/FormularioAnimalModal';
import { FormularioLoteModal } from '../../features/lotes/components/FormularioLoteModal';
import { COLORES } from '../../shared/theme/colores';

export default function PantallaRebano() {
  const { 
    animales, 
    todosAnimalesCount,
    busqueda, 
    setBusqueda, 
    filtroEstadoVida,
    setFiltroEstadoVida,
    filtroEstadoReproductivo,
    setFiltroEstadoReproductivo,
    filtroRaza,
    setFiltroRaza,
    filtroLoteId,
    setFiltroLoteId,
    razasDisponibles,
    hayFiltrosActivos,
    resetFiltros,
    cargando, 
    recargar 
  } = useAnimales();

  const { lotes, recargar: recargarLotes } = useLotes();

  const [mostrarBuscador, setMostrarBuscador] = useState(false);
  const [mostrarPanelFiltros, setMostrarPanelFiltros] = useState(false);
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
  const [mostrarModalLote, setMostrarModalLote] = useState(false);
  const [refrescando, setRefrescando] = useState(false);

  const alRefrescar = async () => {
    setRefrescando(true);
    await Promise.all([recargar(), recargarLotes()]);
    setRefrescando(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* ── Header Estilo "My Herds" ── */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.tituloHeader}>Mi Rebaño</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable 
            style={[styles.actionBtn, mostrarBuscador && styles.actionBtnActivo]}
            onPress={() => setMostrarBuscador(!mostrarBuscador)}
          >
            {mostrarBuscador ? (
              <X size={20} color={COLORES.tealOscuro} />
            ) : (
              <Search size={20} color={COLORES.tealOscuro} />
            )}
          </Pressable>
          <Pressable 
            style={styles.actionBtn}
            onPress={() => setMostrarModalCrear(true)}
          >
            <Plus size={20} color={COLORES.tealOscuro} />
          </Pressable>
        </View>
      </View>

      {/* ── Buscador Desplegable con Botón Filtro ── */}
      {mostrarBuscador && (
        <View style={styles.contenedorBuscador}>
          <View style={styles.barraBusqueda}>
            <Search size={18} color={COLORES.textoMudo} style={styles.iconoBuscar} />
            <TextInput
              style={styles.inputBusqueda}
              placeholder="Buscar por arete o nombre..."
              placeholderTextColor={COLORES.textoMudo}
              value={busqueda}
              onChangeText={setBusqueda}
              clearButtonMode="while-editing"
              autoFocus
            />
          </View>
          <Pressable 
            style={[styles.botonFiltro, (mostrarPanelFiltros || hayFiltrosActivos) && styles.botonFiltroActivo]}
            onPress={() => setMostrarPanelFiltros(!mostrarPanelFiltros)}
          >
            <SlidersHorizontal 
              size={18} 
              color={hayFiltrosActivos ? COLORES.blanco : COLORES.tealOscuro} 
            />
          </Pressable>
        </View>
      )}

      {/* ── Barra Horizontal Filtro Rápido por Lote ── */}
      <View style={styles.contenedorLotesRapidos}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollLotesChips}>
          <Pressable
            style={[styles.chipLote, filtroLoteId === 'todos' && styles.chipLoteActivo]}
            onPress={() => setFiltroLoteId('todos')}
          >
            <Text style={[styles.textoChipLote, filtroLoteId === 'todos' && styles.textoChipLoteActivo]}>
              Todos
            </Text>
          </Pressable>

          {lotes.map(lote => {
            const esSeleccionado = filtroLoteId === lote.nombre;
            return (
              <Pressable
                key={lote.id}
                style={[
                  styles.chipLote,
                  esSeleccionado && styles.chipLoteActivo,
                  { borderColor: lote.colorHex }
                ]}
                onPress={() => setFiltroLoteId(esSeleccionado ? 'todos' : lote.nombre)}
              >
                <View style={[styles.dotLote, { backgroundColor: lote.colorHex }]} />
                <Text style={[styles.textoChipLote, esSeleccionado && styles.textoChipLoteActivo]}>
                  {lote.nombre}
                </Text>
              </Pressable>
            );
          })}

          <Pressable
            style={styles.chipLoteNuevo}
            onPress={() => setMostrarModalLote(true)}
          >
            <Layers size={14} color={COLORES.verdeEsmeralda} />
            <Text style={styles.textoChipLoteNuevo}>+ Lote</Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* ── Panel Expandible Filtros Avanzados ── */}
      {mostrarPanelFiltros && (
        <View style={styles.panelFiltrosCard}>
          <View style={styles.panelFiltrosHeader}>
            <Text style={styles.tituloPanelFiltros}>Filtros Avanzados</Text>
            {hayFiltrosActivos && (
              <Pressable style={styles.btnResetFiltros} onPress={resetFiltros}>
                <RotateCcw size={14} color={COLORES.verdeEsmeralda} />
                <Text style={styles.textoResetFiltros}>Limpiar</Text>
              </Pressable>
            )}
          </View>

          {/* Filtro Estado de Vida */}
          <Text style={styles.labelFiltro}>Estado de Vida:</Text>
          <View style={styles.rowChips}>
            {(['activa', 'muerta', 'descartada', 'todos'] as const).map(est => (
              <Pressable
                key={est}
                style={[styles.chipFiltro, filtroEstadoVida === est && styles.chipFiltroActivo]}
                onPress={() => setFiltroEstadoVida(est)}
              >
                <Text style={[styles.textoChipFiltro, filtroEstadoVida === est && styles.textoChipFiltroActivo]}>
                  {est.charAt(0).toUpperCase() + est.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Filtro Estado Reproductivo */}
          <Text style={styles.labelFiltro}>Estado Reproductivo:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowChipsScroll}>
            {(['todos', 'vacia', 'preñada', 'lactancia', 'secado', 'ninguno'] as const).map(est => (
              <Pressable
                key={est}
                style={[styles.chipFiltro, filtroEstadoReproductivo === est && styles.chipFiltroActivo]}
                onPress={() => setFiltroEstadoReproductivo(est)}
              >
                <Text style={[styles.textoChipFiltro, filtroEstadoReproductivo === est && styles.textoChipFiltroActivo]}>
                  {est.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Filtro por Raza */}
          {razasDisponibles.length > 0 && (
            <>
              <Text style={styles.labelFiltro}>Raza / Cruza:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowChipsScroll}>
                <Pressable
                  style={[styles.chipFiltro, filtroRaza === 'todos' && styles.chipFiltroActivo]}
                  onPress={() => setFiltroRaza('todos')}
                >
                  <Text style={[styles.textoChipFiltro, filtroRaza === 'todos' && styles.textoChipFiltroActivo]}>
                    Todas
                  </Text>
                </Pressable>
                {razasDisponibles.map(r => (
                  <Pressable
                    key={r}
                    style={[styles.chipFiltro, filtroRaza === r && styles.chipFiltroActivo]}
                    onPress={() => setFiltroRaza(r)}
                  >
                    <Text style={[styles.textoChipFiltro, filtroRaza === r && styles.textoChipFiltroActivo]}>
                      {r}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </>
          )}
        </View>
      )}

      {/* ── Lista de Animales ── */}
      {cargando ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={COLORES.verdeEsmeralda} />
        </View>
      ) : (
        <FlatList
          data={animales}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TarjetaArete animal={item} />}
          contentContainerStyle={styles.listaPadding}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refrescando}
              onRefresh={alRefrescar}
              tintColor={COLORES.verdeEsmeralda}
              colors={[COLORES.verdeEsmeralda]}
            />
          }
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.subtituloHeader}>
                {animales.length} de {todosAnimalesCount} {animales.length === 1 ? 'cabeza' : 'cabezas'}
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.centroVacio}>
              <Text style={styles.textoVacio}>No se encontraron animales.</Text>
            </View>
          }
        />
      )}

      {/* ── Modal Crear / Editar Animal ── */}
      <FormularioAnimalModal
        visible={mostrarModalCrear}
        onCerrar={() => setMostrarModalCrear(false)}
        onAnimalGuardado={recargar}
        onCrearLoteSollicitado={() => setMostrarModalLote(true)}
      />

      {/* ── Modal Crear Lote ── */}
      <FormularioLoteModal
        visible={mostrarModalLote}
        onCerrar={() => setMostrarModalLote(false)}
        onLoteGuardado={async () => {
          await recargarLotes();
          await recargar();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORES.fondoApp 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
  tituloHeader: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORES.tealOscuro,
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORES.blanco,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    shadowColor: COLORES.tealOscuro,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionBtnActivo: {
    backgroundColor: COLORES.aquaClaro,
    borderColor: COLORES.verdeEsmeralda,
  },
  contenedorBuscador: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 12,
    alignItems: 'center',
    gap: 12,
  },
  barraBusqueda: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.blanco,
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  iconoBuscar: {
    marginRight: 8,
  },
  inputBusqueda: {
    flex: 1,
    fontSize: 15,
    color: COLORES.tealOscuro,
    height: '100%',
  },
  botonFiltro: {
    width: 44,
    height: 44,
    backgroundColor: COLORES.blanco,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  botonFiltroActivo: {
    backgroundColor: COLORES.verdeEsmeralda,
    borderColor: COLORES.verdeEsmeralda,
  },
  contenedorLotesRapidos: {
    marginBottom: 12,
  },
  scrollLotesChips: {
    paddingHorizontal: 24,
    gap: 8,
  },
  chipLote: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORES.blanco,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    gap: 6,
  },
  chipLoteActivo: {
    backgroundColor: COLORES.tealOscuro,
    borderColor: COLORES.tealOscuro,
  },
  dotLote: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  textoChipLote: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORES.tealOscuro,
  },
  textoChipLoteActivo: {
    color: COLORES.blanco,
    fontWeight: '700',
  },
  chipLoteNuevo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORES.blanco,
    borderWidth: 1,
    borderColor: COLORES.verdeEsmeralda,
    gap: 4,
  },
  textoChipLoteNuevo: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORES.verdeEsmeralda,
  },
  panelFiltrosCard: {
    backgroundColor: COLORES.blanco,
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  panelFiltrosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tituloPanelFiltros: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORES.tealOscuro,
  },
  btnResetFiltros: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  textoResetFiltros: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORES.verdeEsmeralda,
  },
  labelFiltro: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORES.textoMudo,
    marginTop: 8,
    marginBottom: 6,
  },
  rowChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  rowChipsScroll: {
    gap: 6,
    paddingRight: 10,
  },
  chipFiltro: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: COLORES.fondoApp,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  chipFiltroActivo: {
    backgroundColor: COLORES.verdeEsmeralda,
    borderColor: COLORES.verdeEsmeralda,
  },
  textoChipFiltro: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORES.textoMudo,
  },
  textoChipFiltroActivo: {
    color: COLORES.blanco,
    fontWeight: '700',
  },
  listHeader: {
    marginBottom: 16,
  },
  subtituloHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORES.textoMudo,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listaPadding: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  centro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centroVacio: {
    paddingVertical: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoVacio: {
    fontSize: 16,
    color: COLORES.textoMudo,
    fontWeight: '500',
  }
});
