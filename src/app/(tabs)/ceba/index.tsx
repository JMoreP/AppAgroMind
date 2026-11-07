import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Search,
  Scale,
  Beef,
  Flame,
  CheckCircle2,
  BarChart2,
} from 'lucide-react-native';
import { COLORES } from '../../../shared/theme/colores';
import { CebaConAnimal } from '../../../features/carne/types/Ceba';
import { CebaRepository } from '../../../features/carne/repositories/CebaRepository';
import { TarjetaCeba } from '../../../features/carne/components/TarjetaCeba';

type FiltroEstado = 'todos' | 'activos' | 'finalizados';

export default function PantallaCeba() {
  const router = useRouter();

  const [cebas, setCebas] = useState<CebaConAnimal[]>([]);
  const [totalActivos, setTotalActivos] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<FiltroEstado>('activos');

  const recargar = useCallback(async () => {
    try {
      setCargando(true);
      const [recientes, activosCount] = await Promise.all([
        CebaRepository.getRecientes(50),
        CebaRepository.contarActivos(),
      ]);
      setCebas(recientes);
      setTotalActivos(activosCount);
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al cargar datos de ceba:', error.message);
      }
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  // Filtrado reactivo por buscador y estado
  const cebasFiltradas = useMemo(() => {
    return cebas.filter((c) => {
      // Filtro por estado
      if (filtro === 'activos' && c.activo !== 1) return false;
      if (filtro === 'finalizados' && c.activo !== 0) return false;

      // Filtro por búsqueda de arete o nombre
      if (busqueda.trim()) {
        const query = busqueda.trim().toLowerCase();
        const coincideArete = c.areteAnimal.toLowerCase().includes(query);
        const coincideNombre = c.nombreAnimal ? c.nombreAnimal.toLowerCase().includes(query) : false;
        return coincideArete || coincideNombre;
      }

      return true;
    });
  }, [cebas, filtro, busqueda]);

  if (cargando) {
    return (
      <SafeAreaView style={styles.contenedorCentro} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color={COLORES.verdeEsmeralda} />
        <Text style={styles.textoCargando}>Cargando control de ceba...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.contenedor} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />

      {/* Header superior */}
      <View style={styles.headerNav}>
        <Pressable onPress={() => router.back()} style={styles.btnVolver}>
          <ChevronLeft size={24} color={COLORES.tealOscuro} />
        </Pressable>
        <Text style={styles.headerTitulo}>Control de Ceba</Text>
        <Pressable
          onPress={() => router.push('/ceba/dashboard')}
          style={styles.btnEstadisticas}
        >
          <BarChart2 size={18} color={COLORES.verdeEsmeralda} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContenido}
        showsVerticalScrollIndicator={false}
      >
        {/* Tarjeta KPI Hero */}
        <View style={styles.tarjetaKPIHero}>
          <View style={styles.iconoKPIHero}>
            <Beef size={24} color={COLORES.verdeOscuro} />
          </View>
          <View style={styles.infoKPIHero}>
            <Text style={styles.etiquetaKPIHero}>ANIMALES EN ENGORDE ACTIVO</Text>
            <Text style={styles.valorKPIHero}>{totalActivos}</Text>
            <Text style={styles.subtextoKPIHero}>
              {totalActivos === 1 ? '1 animal en seguimiento' : `${totalActivos} animales en seguimiento`}
            </Text>
          </View>
        </View>

        {/* Barra de Búsqueda */}
        <View style={styles.contenedorBuscador}>
          <Search size={18} color={COLORES.textoSecundario} />
          <TextInput
            style={styles.inputBuscador}
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder="Buscar por arete o nombre..."
            placeholderTextColor={COLORES.grisIOSInactivo}
          />
        </View>

        {/* Filtros Segmentados */}
        <View style={styles.filaFiltros}>
          <Pressable
            onPress={() => setFiltro('activos')}
            style={
              filtro === 'activos'
                ? styles.botonFiltroActivo
                : styles.botonFiltroInactivo
            }
          >
            <Text
              style={
                filtro === 'activos'
                  ? styles.textoFiltroActivo
                  : styles.textoFiltroInactivo
              }
            >
              Activos ({totalActivos})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setFiltro('todos')}
            style={
              filtro === 'todos'
                ? styles.botonFiltroActivo
                : styles.botonFiltroInactivo
            }
          >
            <Text
              style={
                filtro === 'todos'
                  ? styles.textoFiltroActivo
                  : styles.textoFiltroInactivo
              }
            >
              Todos ({cebas.length})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setFiltro('finalizados')}
            style={
              filtro === 'finalizados'
                ? styles.botonFiltroActivo
                : styles.botonFiltroInactivo
            }
          >
            <Text
              style={
                filtro === 'finalizados'
                  ? styles.textoFiltroActivo
                  : styles.textoFiltroInactivo
              }
            >
              Finalizados
            </Text>
          </Pressable>
        </View>

        {/* Lista de Tarjetas Ceba */}
        <Text style={styles.seccionTitulo}>Lotes de Ceba en Seguimiento</Text>

        {cebasFiltradas.length === 0 ? (
          <View style={styles.tarjetaVacia}>
            <Scale size={32} color={COLORES.textoSecundario} style={styles.iconoVacio} />
            <Text style={styles.textoVacioTitulo}>No se encontraron registros</Text>
            <Text style={styles.textoVacioDesc}>
              {busqueda
                ? 'No hay animales en ceba que coincidan con la búsqueda.'
                : 'No hay animales en ceba bajo el filtro seleccionado.'}
            </Text>
          </View>
        ) : (
          <View style={styles.listaCeba}>
            {cebasFiltradas.map((c) => (
              <TarjetaCeba
                key={c.id}
                ceba={c}
                onPress={() => router.push(`/animal/${c.animalId}`)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: COLORES.fondoApp,
  },
  contenedorCentro: {
    flex: 1,
    backgroundColor: COLORES.fondoApp,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  textoCargando: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORES.tealOscuro,
    marginTop: 14,
  },
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 60,
  },
  btnVolver: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORES.blanco,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  headerTitulo: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORES.tealOscuro,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  btnEstadisticas: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORES.blanco,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  scrollContenido: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 110,
  },
  tarjetaKPIHero: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.blanco,
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    shadowColor: COLORES.textoOscuro,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  iconoKPIHero: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORES.verdeMentha,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  infoKPIHero: {
    flex: 1,
  },
  etiquetaKPIHero: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORES.textoMudo,
    letterSpacing: 0.5,
  },
  valorKPIHero: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORES.verdeOscuro,
    marginTop: 2,
  },
  subtextoKPIHero: {
    fontSize: 11,
    color: COLORES.textoSecundario,
    marginTop: 2,
    fontWeight: '500',
  },
  contenedorBuscador: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORES.blanco,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    marginBottom: 14,
  },
  inputBuscador: {
    flex: 1,
    fontSize: 14,
    color: COLORES.textoOscuro,
    padding: 0,
    fontWeight: '500',
  },
  filaFiltros: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  botonFiltroActivo: {
    flex: 1,
    backgroundColor: COLORES.verdeEsmeralda,
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  botonFiltroInactivo: {
    flex: 1,
    backgroundColor: COLORES.blanco,
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  textoFiltroActivo: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORES.blanco,
  },
  textoFiltroInactivo: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORES.textoSecundario,
  },
  seccionTitulo: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORES.textoMudo,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  listaCeba: {
    gap: 12,
  },
  tarjetaVacia: {
    backgroundColor: COLORES.blanco,
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  iconoVacio: {
    marginBottom: 10,
  },
  textoVacioTitulo: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORES.tealOscuro,
    marginBottom: 4,
  },
  textoVacioDesc: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORES.textoMudo,
    textAlign: 'center',
    lineHeight: 18,
  },
});
