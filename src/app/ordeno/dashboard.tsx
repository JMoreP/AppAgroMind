import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  ActivityIndicator, 
  StatusBar 
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ChevronLeft, 
  Droplet, 
  Award, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  Calendar,
  Layers,
  RotateCcw
} from 'lucide-react-native';
import { COLORES } from '../../shared/theme/colores';
import { PesajeLecheRepository } from '../../features/ordeno/repositories/PesajeLecheRepository';
import { 
  MetricaHatoDiaria, 
  ProductoraTopRanking, 
  AlertaHatoProduccion 
} from '../../features/ordeno/types/PesajeLeche';
import { GraficaProduccionLeche } from '../../features/ordeno/components/GraficaProduccionLeche';

export default function PantallaDashboardHato() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [rango, setRango] = useState<'7d' | '30d'>('7d');
  const [historialExpandido, setHistorialExpandido] = useState(false);

  // Estados de datos
  const [metricasHato, setMetricasHato] = useState<MetricaHatoDiaria[]>([]);
  const [resumenHoy, setResumenHoy] = useState({
    totalLitrosDia: 0,
    totalBufalasOrdenadas: 0,
    promedioPorBufala: 0,
  });
  const [pdpHato7Dias, setPdpHato7Dias] = useState(0);
  const [topProductoras, setTopProductoras] = useState<ProductoraTopRanking[]>([]);
  const [alertasCaida, setAlertasCaida] = useState<AlertaHatoProduccion[]>([]);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setErrorCarga(null);
    try {
      const hoy = new Date();
      const hace30Dias = new Date();
      hace30Dias.setDate(hoy.getDate() - 30);

      const formatoFecha = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      };

      const desdeISO = formatoFecha(hace30Dias);
      const hastaISO = formatoFecha(hoy);

      const [metricas, resumen, ranking, alertas] = await Promise.all([
        PesajeLecheRepository.getMetricasHatoPorDiaEnRango(desdeISO, hastaISO),
        PesajeLecheRepository.getResumenFecha(hastaISO),
        PesajeLecheRepository.getTopProductorasEnRango(desdeISO, hastaISO, 10),
        PesajeLecheRepository.getAnimalesConAlertaCaida(30),
      ]);

      setMetricasHato(metricas);
      setResumenHoy({
        totalLitrosDia: resumen.totalLitrosDia,
        totalBufalasOrdenadas: resumen.totalBufalasOrdenadas,
        promedioPorBufala: resumen.promedioPorBufala,
      });
      setTopProductoras(ranking);
      setAlertasCaida(alertas);

      // Calcular PDP promedio de los últimos 7 días con registros
      const ultimos7 = metricas.slice(-7);
      if (ultimos7.length > 0) {
        const sumaPdp = ultimos7.reduce((acc, m) => acc + m.pdp, 0);
        setPdpHato7Dias(Number((sumaPdp / ultimos7.length).toFixed(2)));
      } else {
        setPdpHato7Dias(resumen.promedioPorBufala);
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorCarga(error.message);
      } else {
        setErrorCarga('Ocurrió un error inesperado al cargar los datos.');
      }
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Filtrar métricas según rango seleccionado
  const metricasFiltradas = React.useMemo(() => {
    if (rango === '7d') {
      return metricasHato.slice(-7);
    }
    return metricasHato.slice(-30);
  }, [metricasHato, rango]);

  const datosGrafica = React.useMemo(() => {
    return metricasFiltradas.map((m) => ({
      fecha: m.fecha,
      litros: m.litros,
    }));
  }, [metricasFiltradas]);

  if (cargando) {
    return (
      <SafeAreaView style={styles.contenedorCentro} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color={COLORES.verdeEsmeralda} />
        <Text style={styles.textoCargando}>Cargando análisis del hato...</Text>
      </SafeAreaView>
    );
  }

  if (errorCarga) {
    return (
      <SafeAreaView style={styles.contenedorCentro} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" />
        <AlertTriangle size={48} color={COLORES.rojoError} />
        <Text style={styles.textoErrorTitulo}>Error al cargar datos</Text>
        <Text style={styles.textoErrorDesc}>{errorCarga}</Text>
        <Pressable style={styles.botonReintentar} onPress={cargarDatos}>
          <RotateCcw size={16} color={COLORES.blanco} style={styles.iconoBoton} />
          <Text style={styles.textoBotonReintentar}>Reintentar</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.contenedor} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />

      {/* ── HEADER SUPERIOR ── */}
      <View style={styles.headerNav}>
        <Pressable onPress={() => router.back()} style={styles.btnVolver}>
          <ChevronLeft size={24} color={COLORES.tealOscuro} />
        </Pressable>

        <Text style={styles.headerTitulo}>Producción del Hato</Text>

        <View style={styles.selectorRangoHeader}>
          <Pressable
            style={rango === '7d' ? styles.btnRangoActivo : styles.btnRangoInactivo}
            onPress={() => setRango('7d')}
          >
            <Text style={rango === '7d' ? styles.textoRangoActivo : styles.textoRangoInactivo}>
              7D
            </Text>
          </Pressable>
          <Pressable
            style={rango === '30d' ? styles.btnRangoActivo : styles.btnRangoInactivo}
            onPress={() => setRango('30d')}
          >
            <Text style={rango === '30d' ? styles.textoRangoActivo : styles.textoRangoInactivo}>
              30D
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContenido} showsVerticalScrollIndicator={false}>
        
        {/* ── SECCIÓN 1: KPIS DEL HATO (GRID 2x2) ── */}
        <Text style={styles.seccionTitulo}>Métricas Clave del Hato</Text>
        
        <View style={styles.gridKpis}>
          {/* Card 1: Total hoy */}
          <View style={styles.tarjetaKpi}>
            <View style={styles.kpiCabecera}>
              <View style={styles.circuloIconoVerde}>
                <Droplet size={16} color={COLORES.verdeOscuro} />
              </View>
              <Text style={styles.kpiEtiqueta}>TOTAL HOY</Text>
            </View>
            <View style={styles.kpiFilaValor}>
              <Text style={styles.kpiValorGrande}>
                {resumenHoy.totalLitrosDia.toFixed(1)}
              </Text>
              <Text style={styles.kpiUnidad}>L</Text>
            </View>
            <Text style={styles.kpiDetalle}>Acumulado de turnos</Text>
          </View>

          {/* Card 2: PDP del hato hoy */}
          <View style={styles.tarjetaKpi}>
            <View style={styles.kpiCabecera}>
              <View style={styles.circuloIconoLima}>
                <Award size={16} color={COLORES.olivaOscuro} />
              </View>
              <Text style={styles.kpiEtiqueta}>PDP HATO HOY</Text>
            </View>
            <View style={styles.kpiFilaValor}>
              <Text style={styles.kpiValorGrande}>
                {resumenHoy.promedioPorBufala.toFixed(1)}
              </Text>
              <Text style={styles.kpiUnidad}>L/búfala</Text>
            </View>
            <Text style={styles.kpiDetalle}>Promedio por cabeza</Text>
          </View>

          {/* Card 3: Búfalas ordeñadas hoy */}
          <View style={styles.tarjetaKpi}>
            <View style={styles.kpiCabecera}>
              <View style={styles.circuloIconoAzul}>
                <Users size={16} color={COLORES.azulRey} />
              </View>
              <Text style={styles.kpiEtiqueta}>ORDEÑADAS HOY</Text>
            </View>
            <View style={styles.kpiFilaValor}>
              <Text style={styles.kpiValorGrande}>
                {resumenHoy.totalBufalasOrdenadas}
              </Text>
              <Text style={styles.kpiUnidad}>cabezas</Text>
            </View>
            <Text style={styles.kpiDetalle}>Búfalas en lote activo</Text>
          </View>

          {/* Card 4: PDP promedio 7d */}
          <View style={styles.tarjetaKpi}>
            <View style={styles.kpiCabecera}>
              <View style={styles.circuloIconoVerdeClaro}>
                <TrendingUp size={16} color={COLORES.verdeOscuro} />
              </View>
              <Text style={styles.kpiEtiqueta}>PDP 7 DÍAS</Text>
            </View>
            <View style={styles.kpiFilaValor}>
              <Text style={styles.kpiValorGrande}>
                {pdpHato7Dias.toFixed(1)}
              </Text>
              <Text style={styles.kpiUnidad}>L/día</Text>
            </View>
            <Text style={styles.kpiDetalle}>Tendencia semanal</Text>
          </View>
        </View>

        {/* ── SECCIÓN 2: GRÁFICA DE EVOLUCIÓN DEL HATO ── */}
        <Text style={styles.seccionTitulo}>Evolución Diaria del Hato</Text>
        
        <GraficaProduccionLeche
          datos={datosGrafica}
          lineaReferenciaPDP={
            pdpHato7Dias > 0 
              ? Number((pdpHato7Dias * (resumenHoy.totalBufalasOrdenadas || 1)).toFixed(1)) 
              : undefined
          }
          etiquetaReferencia="Ref Hato"
          titulo="Producción Acumulada del Hato"
          subtitulo={`Litros totales registrados (${rango === '7d' ? 'últimos 7 días' : 'últimos 30 días'})`}
          rangoActivo={rango}
          onCambiarRango={setRango}
        />

        {/* ── SECCIÓN 3: TOP 10 BÚFALAS PRODUCTORAS (ÚLTIMOS 30 DÍAS) ── */}
        <Text style={styles.seccionTitulo}>Top 10 Búfalas Productoras (30 Días)</Text>

        {topProductoras.length === 0 ? (
          <View style={styles.tarjetaVacia}>
            <Text style={styles.textoVacio}>Sin datos de producción registrados.</Text>
          </View>
        ) : (
          <View style={styles.tarjetaRankingContenedor}>
            {topProductoras.map((productora, idx) => {
              const esUltimo = idx === topProductoras.length - 1;
              const esPodio = productora.posicion <= 3;

              return (
                <Pressable
                  key={`top-${productora.animalId}-${idx}`}
                  style={[styles.filaRanking, !esUltimo && styles.bordeInferiorRanking]}
                  onPress={() => router.push(`/animal/${productora.animalId}`)}
                >
                  {/* Posición / Medalla */}
                  <View style={esPodio ? styles.badgePosicionPodio : styles.badgePosicionNormal}>
                    <Text style={esPodio ? styles.textoPosicionPodio : styles.textoPosicionNormal}>
                      #{productora.posicion}
                    </Text>
                  </View>

                  {/* Info de la Búfala */}
                  <View style={styles.infoBufalaRanking}>
                    <Text style={styles.areteRanking}>#{productora.arete}</Text>
                    <Text style={styles.nombreRanking}>
                      {productora.nombre || productora.raza || 'Búfala'}
                    </Text>
                  </View>

                  {/* Litros acumulados y PDP */}
                  <View style={styles.valoresRanking}>
                    <Text style={styles.totalLitrosRanking}>
                      {productora.totalLitros.toFixed(1)} L
                    </Text>
                    <Text style={styles.pdpRanking}>
                      PDP: {productora.pdpIndividual.toFixed(1)} L/d
                    </Text>
                  </View>

                  <ChevronRight size={18} color={COLORES.textoMudo} style={styles.iconoChevron} />
                </Pressable>
              );
            })}
          </View>
        )}

        {/* ── SECCIÓN 4: ALERTAS DE PRODUCCIÓN (>25% CAÍDA) ── */}
        <Text style={styles.seccionTitulo}>Alertas Sanitarias de Producción</Text>

        {alertasCaida.length === 0 ? (
          <View style={styles.tarjetaAlertaOptima}>
            <View style={styles.filaAlertaOptima}>
              <View style={styles.circuloIconoVerde}>
                <CheckCircle2 size={20} color={COLORES.verdeOscuro} />
              </View>
              <View style={styles.infoAlertaOptima}>
                <Text style={styles.tituloAlertaOptima}>SIN ALERTAS DE PRODUCCIÓN</Text>
                <Text style={styles.subtituloAlertaOptima}>
                  Todas las búfalas mantienen producción estable sin caídas superiores al 25%.
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.listaAlertas}>
            {alertasCaida.map((alerta) => (
              <View key={`alerta-${alerta.animalId}`} style={styles.tarjetaAlertaCritica}>
                <View style={styles.filaAlertaSuperior}>
                  <View style={styles.circuloIconoRojo}>
                    <AlertTriangle size={18} color={COLORES.rojoError} />
                  </View>
                  <View style={styles.infoAlertaTexto}>
                    <Text style={styles.areteAlerta}>#{alerta.arete} — {alerta.nombre || 'Búfala'}</Text>
                    <Text style={styles.detalleCaidaAlerta}>
                      {alerta.promedioReciente} L/d recientes vs {alerta.promedioPrevio} L/d previos
                    </Text>
                  </View>
                  <View style={styles.badgeCaidaRojo}>
                    <Text style={styles.textoBadgeCaida}>-{alerta.porcentajeCaida}%</Text>
                  </View>
                </View>

                <Pressable
                  style={styles.botonVerBufalaAlerta}
                  onPress={() => router.push(`/animal/${alerta.animalId}`)}
                >
                  <Text style={styles.textoBotonVerBufala}>Examinar ficha médica y ordeños</Text>
                  <ChevronRight size={16} color={COLORES.blanco} />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* ── SECCIÓN 5: HISTORIAL DIARIO DEL HATO ── */}
        <Text style={styles.seccionTitulo}>Historial Diario del Hato</Text>

        {metricasHato.length === 0 ? (
          <View style={styles.tarjetaVacia}>
            <Text style={styles.textoVacio}>Sin registros históricos disponibles.</Text>
          </View>
        ) : (
          <View style={styles.tarjetaHistorialContenedor}>
            {(() => {
              const registrosInvertidos = [...metricasHato].reverse();
              const itemsAMostrar = historialExpandido 
                ? registrosInvertidos 
                : registrosInvertidos.slice(0, 6);

              return (
                <>
                  {itemsAMostrar.map((dia, idx) => {
                    const esUltimo = idx === itemsAMostrar.length - 1;
                    return (
                      <View 
                        key={`dia-historial-${dia.fecha}-${idx}`} 
                        style={[styles.filaHistorial, !esUltimo && styles.bordeInferiorRanking]}
                      >
                        <View style={styles.infoFechaHistorial}>
                          <Calendar size={14} color={COLORES.tealOscuro} style={styles.iconoFechaHistorial} />
                          <Text style={styles.textoFechaHistorial}>{dia.fecha}</Text>
                        </View>

                        <View style={styles.infoValoresHistorial}>
                          <Text style={styles.litrosHistorial}>{dia.litros.toFixed(1)} L</Text>
                          <Text style={styles.bufalasHistorial}>
                            {dia.bufalas} búfalas • PDP: {dia.pdp.toFixed(1)} L
                          </Text>
                        </View>
                      </View>
                    );
                  })}

                  {registrosInvertidos.length > 6 && (
                    <Pressable
                      style={styles.botonExpandirHistorial}
                      onPress={() => setHistorialExpandido(!historialExpandido)}
                    >
                      <Text style={styles.textoBotonExpandir}>
                        {historialExpandido ? 'Ver menos' : `Ver todos (${registrosInvertidos.length} días)`}
                      </Text>
                    </Pressable>
                  )}
                </>
              );
            })()}
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
    marginTop: 16,
  },
  textoErrorTitulo: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORES.tealOscuro,
    marginTop: 16,
    marginBottom: 6,
  },
  textoErrorDesc: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORES.textoMudo,
    textAlign: 'center',
    marginBottom: 20,
  },
  botonReintentar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.verdeEsmeralda,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  iconoBoton: {
    marginRight: 6,
  },
  textoBotonReintentar: {
    color: COLORES.blanco,
    fontWeight: '700',
    fontSize: 14,
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
  selectorRangoHeader: {
    flexDirection: 'row',
    backgroundColor: COLORES.blanco,
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  btnRangoActivo: {
    backgroundColor: COLORES.verdeEsmeralda,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9,
  },
  btnRangoInactivo: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9,
  },
  textoRangoActivo: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORES.blanco,
  },
  textoRangoInactivo: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORES.textoMudo,
  },
  scrollContenido: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 60,
  },
  seccionTitulo: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORES.textoMudo,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 14,
    marginLeft: 4,
  },
  gridKpis: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  tarjetaKpi: {
    width: '48%',
    backgroundColor: COLORES.blanco,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    shadowColor: COLORES.textoOscuro,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  kpiCabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  circuloIconoVerde: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORES.verdeMentha,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circuloIconoLima: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORES.limaClaro,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circuloIconoAzul: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORES.aquaClaro,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circuloIconoVerdeClaro: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORES.verdeBordeAvatar,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kpiEtiqueta: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORES.textoMudo,
    letterSpacing: 0.8,
  },
  kpiFilaValor: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  kpiValorGrande: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORES.tealOscuro,
    letterSpacing: -0.5,
  },
  kpiUnidad: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORES.verdeEsmeralda,
    marginLeft: 4,
  },
  kpiDetalle: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORES.textoMudo,
    marginTop: 4,
  },
  tarjetaVacia: {
    backgroundColor: COLORES.blanco,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  textoVacio: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORES.textoMudo,
    textAlign: 'center',
  },
  tarjetaRankingContenedor: {
    backgroundColor: COLORES.blanco,
    borderRadius: 24,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  filaRanking: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  bordeInferiorRanking: {
    borderBottomWidth: 1,
    borderBottomColor: COLORES.bordeClaro,
  },
  badgePosicionPodio: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORES.verdeMentha,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textoPosicionPodio: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORES.verdeOscuro,
  },
  badgePosicionNormal: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORES.fondoApp,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textoPosicionNormal: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORES.textoMudo,
  },
  infoBufalaRanking: {
    flex: 1,
  },
  areteRanking: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORES.tealOscuro,
  },
  nombreRanking: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORES.textoMudo,
    marginTop: 1,
  },
  valoresRanking: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  totalLitrosRanking: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORES.verdeOscuro,
  },
  pdpRanking: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORES.olivaOscuro,
    marginTop: 1,
  },
  iconoChevron: {
    marginLeft: 4,
  },
  tarjetaAlertaOptima: {
    backgroundColor: COLORES.verdeMentha,
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORES.verdeEsmeralda,
  },
  filaAlertaOptima: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoAlertaOptima: {
    flex: 1,
  },
  tituloAlertaOptima: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORES.verdeOscuro,
    letterSpacing: 0.8,
  },
  subtituloAlertaOptima: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORES.tealOscuro,
    marginTop: 2,
    lineHeight: 16,
  },
  listaAlertas: {
    gap: 12,
    marginBottom: 24,
  },
  tarjetaAlertaCritica: {
    backgroundColor: COLORES.rojoClaro,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: COLORES.rojoError,
  },
  filaAlertaSuperior: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  circuloIconoRojo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORES.blanco,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  infoAlertaTexto: {
    flex: 1,
  },
  areteAlerta: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORES.tealOscuro,
  },
  detalleCaidaAlerta: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORES.textoOscuro,
    marginTop: 2,
  },
  badgeCaidaRojo: {
    backgroundColor: COLORES.rojoError,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  textoBadgeCaida: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORES.blanco,
  },
  botonVerBufalaAlerta: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORES.rojoError,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  textoBotonVerBufala: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORES.blanco,
  },
  tarjetaHistorialContenedor: {
    backgroundColor: COLORES.blanco,
    borderRadius: 24,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  filaHistorial: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoFechaHistorial: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconoFechaHistorial: {
    marginRight: 8,
  },
  textoFechaHistorial: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORES.tealOscuro,
  },
  infoValoresHistorial: {
    alignItems: 'flex-end',
  },
  litrosHistorial: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORES.verdeOscuro,
  },
  bufalasHistorial: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORES.textoMudo,
    marginTop: 1,
  },
  botonExpandirHistorial: {
    paddingTop: 12,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORES.bordeClaro,
    alignItems: 'center',
  },
  textoBotonExpandir: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORES.verdeEsmeralda,
  },
});
