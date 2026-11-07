import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Beef,
  CheckCircle2,
  TrendingUp,
  Clock,
  Award,
  Calendar,
  Target,
  ChevronRight,
} from 'lucide-react-native';
import { COLORES } from '../../shared/theme/colores';
import { useMetricasCeba } from '../../features/carne/hooks/useMetricasCeba';
import { calcularPesoActual } from '../../features/carne/utils/calculosCeba';

export default function PantallaCebaDashboard() {
  const router = useRouter();
  const {
    activos,
    listosFaena,
    gpPromedio,
    diasPromedio,
    topGanancia,
    proximosFaena,
    cargando,
  } = useMetricasCeba();

  if (cargando) {
    return (
      <SafeAreaView style={styles.contenedorCentro} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color={COLORES.verdeEsmeralda} />
        <Text style={styles.textoCargando}>Cargando estadísticas de ceba...</Text>
      </SafeAreaView>
    );
  }

  const obtenerEstiloGP = (gp: number) => {
    if (gp >= 0.8) return styles.textoGPVerde;
    if (gp >= 0.4) return styles.textoGPAmbar;
    return styles.textoGPRojo;
  };

  return (
    <SafeAreaView style={styles.contenedor} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />

      {/* Header superior */}
      <View style={styles.headerNav}>
        <Pressable onPress={() => router.back()} style={styles.btnVolver}>
          <ChevronLeft size={24} color={COLORES.tealOscuro} />
        </Pressable>
        <Text style={styles.headerTitulo}>Estadísticas de Ceba</Text>
        <View style={styles.espaciadorHeader} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContenido}
        showsVerticalScrollIndicator={false}
      >
        {/* Tarjetas KPI (Grid 2x2) */}
        <View style={styles.gridKPI}>
          {/* KPI 1: En ceba activos */}
          <View style={styles.tarjetaKPI}>
            <View style={styles.cabeceraKPI}>
              <View style={styles.iconoKPIVerde}>
                <Beef size={18} color={COLORES.verdeEsmeralda} />
              </View>
              <Text style={styles.etiquetaKPI}>EN CEBA ACTIVOS</Text>
            </View>
            <Text style={styles.valorKPI}>{activos}</Text>
            <Text style={styles.subtextoKPI}>animales en proceso</Text>
          </View>

          {/* KPI 2: Listos para faena */}
          <View style={styles.tarjetaKPI}>
            <View style={styles.cabeceraKPI}>
              <View style={styles.iconoKPIAzul}>
                <CheckCircle2 size={18} color={COLORES.azulRey} />
              </View>
              <Text style={styles.etiquetaKPI}>LISTOS PARA FAENA</Text>
            </View>
            <Text style={styles.valorKPI}>{listosFaena}</Text>
            <Text style={styles.subtextoKPI}>peso objetivo alcanzado</Text>
          </View>

          {/* KPI 3: GP promedio del hato */}
          <View style={styles.tarjetaKPI}>
            <View style={styles.cabeceraKPI}>
              <View style={styles.iconoKPIAmbar}>
                <TrendingUp size={18} color={COLORES.ambarAlerta} />
              </View>
              <Text style={styles.etiquetaKPI}>GP PROMEDIO</Text>
            </View>
            <Text style={styles.valorKPI}>{`${gpPromedio.toFixed(2)}`}</Text>
            <Text style={styles.subtextoKPI}>kg/día por animal</Text>
          </View>

          {/* KPI 4: Días promedio en ceba */}
          <View style={styles.tarjetaKPI}>
            <View style={styles.cabeceraKPI}>
              <View style={styles.iconoKPIOliva}>
                <Clock size={18} color={COLORES.olivaOscuro} />
              </View>
              <Text style={styles.etiquetaKPI}>DÍAS PROMEDIO</Text>
            </View>
            <Text style={styles.valorKPI}>{diasPromedio}</Text>
            <Text style={styles.subtextoKPI}>días transcurridos</Text>
          </View>
        </View>

        {/* Sección 1: Top 10 por GP Ceba */}
        <View style={styles.seccion}>
          <View style={styles.cabeceraSeccion}>
            <Award size={20} color={COLORES.verdeEsmeralda} />
            <Text style={styles.tituloSeccion}>Top 10 por GP Ceba</Text>
          </View>

          {topGanancia.length === 0 ? (
            <View style={styles.tarjetaVacia}>
              <Text style={styles.textoVacio}>No hay pesajes suficientes para calcular el top de ganancia.</Text>
            </View>
          ) : (
            topGanancia.map((ceba, index) => {
              const pesoAct = calcularPesoActual(ceba);
              return (
                <Pressable
                  key={`top-${ceba.id}`}
                  style={styles.itemLista}
                  onPress={() => router.push(`/animal/${ceba.animalId}`)}
                >
                  <View style={styles.contenedorRanking}>
                    <Text style={styles.textoRanking}>#{index + 1}</Text>
                  </View>

                  <View style={styles.infoAnimal}>
                    <Text style={styles.areteAnimal}>#{ceba.areteAnimal}</Text>
                    <Text style={styles.nombreAnimal}>{ceba.nombreAnimal || 'Búfalo sin nombre'}</Text>
                  </View>

                  <View style={styles.metricasAnimal}>
                    <Text style={styles.pesoActualItem}>{pesoAct} kg</Text>
                    <Text style={styles.subtextoItem}>peso actual</Text>
                  </View>

                  <ChevronRight size={18} color={COLORES.textoMudo} />
                </Pressable>
              );
            })
          )}
        </View>

        {/* Sección 2: Próximos a faena */}
        <View style={styles.seccion}>
          <View style={styles.cabeceraSeccion}>
            <Target size={20} color={COLORES.ambarAlerta} />
            <Text style={styles.tituloSeccion}>Próximos a Faena</Text>
          </View>

          {proximosFaena.length === 0 ? (
            <View style={styles.tarjetaVacia}>
              <Text style={styles.textoVacio}>
                No hay animales próximos a faena con proyección activa.
              </Text>
            </View>
          ) : (
            proximosFaena.map((item) => {
              const pesoAct = calcularPesoActual(item.ceba);
              const meta = item.ceba.pesoObjetivo || 450;
              return (
                <Pressable
                  key={`proximo-${item.ceba.id}`}
                  style={styles.itemProximo}
                  onPress={() => router.push(`/animal/${item.ceba.animalId}`)}
                >
                  <View style={styles.cabeceraProximo}>
                    <View style={styles.infoAnimal}>
                      <Text style={styles.areteAnimal}>#{item.ceba.areteAnimal}</Text>
                      <Text style={styles.nombreAnimal}>{item.ceba.nombreAnimal || 'Búfalo sin nombre'}</Text>
                    </View>

                    <View style={styles.badgeDiasRestantes}>
                      <Clock size={12} color={COLORES.ambarOscuro} />
                      <Text style={styles.textoBadgeDias}>
                        {`${item.diasRestantes} días restantes`}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.filaDetallesProximo}>
                    <View style={styles.detalleItem}>
                      <Text style={styles.etiquetaDetalle}>PESO ACTUAL / META</Text>
                      <Text style={styles.valorDetalle}>{`${pesoAct} kg / ${meta} kg`}</Text>
                    </View>

                    <View style={styles.detalleItemDerecha}>
                      <Text style={styles.etiquetaDetalle}>FECHA ESTIMADA</Text>
                      <View style={styles.filaFechaEstimada}>
                        <Calendar size={13} color={COLORES.verdeEsmeralda} />
                        <Text style={styles.valorFechaEstimada}>{item.fechaEstimada}</Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              );
            })
          )}
        </View>
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
    padding: 20,
  },
  textoCargando: {
    marginTop: 12,
    fontSize: 14,
    color: COLORES.textoSecundario,
  },
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORES.bordeClaro,
    backgroundColor: COLORES.blanco,
  },
  btnVolver: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORES.fondoApp,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitulo: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORES.tealOscuro,
  },
  espaciadorHeader: {
    width: 40,
  },
  scrollContenido: {
    padding: 16,
    paddingBottom: 40,
  },
  gridKPI: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  tarjetaKPI: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: COLORES.blanco,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  cabeceraKPI: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  iconoKPIVerde: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORES.verdeMentha,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconoKPIAzul: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORES.aquaClaro,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconoKPIAmbar: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORES.ambarClaro,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconoKPIOliva: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORES.limaClaro,
    justifyContent: 'center',
    alignItems: 'center',
  },
  etiquetaKPI: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORES.textoMudo,
    letterSpacing: 0.5,
  },
  valorKPI: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORES.tealOscuro,
  },
  subtextoKPI: {
    fontSize: 11,
    color: COLORES.textoSecundario,
    marginTop: 2,
  },
  seccion: {
    marginBottom: 24,
  },
  cabeceraSeccion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tituloSeccion: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORES.tealOscuro,
  },
  tarjetaVacia: {
    backgroundColor: COLORES.blanco,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    alignItems: 'center',
  },
  textoVacio: {
    fontSize: 13,
    color: COLORES.textoMudo,
    textAlign: 'center',
  },
  itemLista: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.blanco,
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  contenedorRanking: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORES.fondoApp,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textoRanking: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORES.tealOscuro,
  },
  infoAnimal: {
    flex: 1,
  },
  areteAnimal: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORES.tealOscuro,
  },
  nombreAnimal: {
    fontSize: 12,
    color: COLORES.textoSecundario,
    marginTop: 1,
  },
  metricasAnimal: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  pesoActualItem: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORES.tealOscuro,
  },
  subtextoItem: {
    fontSize: 10,
    color: COLORES.textoMudo,
  },
  textoGPVerde: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORES.verdeEsmeralda,
  },
  textoGPAmbar: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORES.ambarOscuro,
  },
  textoGPRojo: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORES.rojoError,
  },
  itemProximo: {
    backgroundColor: COLORES.blanco,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  cabeceraProximo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeDiasRestantes: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.ambarClaro,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  textoBadgeDias: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORES.ambarOscuro,
  },
  filaDetallesProximo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORES.fondoApp,
    padding: 10,
    borderRadius: 10,
  },
  detalleItem: {
    flex: 1,
  },
  detalleItemDerecha: {
    flex: 1,
    alignItems: 'flex-end',
  },
  etiquetaDetalle: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORES.textoMudo,
  },
  valorDetalle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORES.tealOscuro,
    marginTop: 2,
  },
  filaFechaEstimada: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  valorFechaEstimada: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORES.verdeEsmeralda,
  },
});
