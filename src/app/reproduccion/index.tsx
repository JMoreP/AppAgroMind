import React, { useMemo } from 'react';
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
  Calendar,
  ChevronRight,
  Syringe,
  CheckCircle2,
  Clock,
  Sparkles,
  Stethoscope,
  AlertCircle,
  Baby,
} from 'lucide-react-native';
import { COLORES } from '../../shared/theme/colores';
import { useServiciosReproductivos } from '../../features/reproduccion/hooks/useServiciosReproductivos';
import { useDiagnosticosPrenez } from '../../features/reproduccion/hooks/useDiagnosticosPrenez';
import { usePartos } from '../../features/reproduccion/hooks/usePartos';
import {
  diasDesdeServicio,
  estaEnVentanaPalpacion,
} from '../../features/reproduccion/utils/calculosReproductivos';

export default function PantallaReproduccion() {
  const router = useRouter();

  const {
    serviciosPendientesConAnimal,
    cargando: cargandoServicios,
  } = useServiciosReproductivos();

  const {
    diagnosticosRecientes,
    kpisMes: kpisMesDiagnosticos,
    cargando: cargandoDiagnosticos,
  } = useDiagnosticosPrenez();

  const {
    partosRecientes,
    kpisMes: kpisMesPartos,
    cargando: cargandoPartos,
  } = usePartos();

  const cargando = cargandoServicios || cargandoDiagnosticos || cargandoPartos;

  // Ordenar los servicios pendientes por días transcurridos DESC (mayor tiempo de espera arriba)
  const pendientesOrdenados = useMemo(() => {
    return [...serviciosPendientesConAnimal].sort((a, b) => {
      const diasA = diasDesdeServicio(a.fecha);
      const diasB = diasDesdeServicio(b.fecha);
      return diasB - diasA;
    });
  }, [serviciosPendientesConAnimal]);

  if (cargando) {
    return (
      <SafeAreaView style={styles.contenedorCentro} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color={COLORES.verdeEsmeralda} />
        <Text style={styles.textoCargando}>Cargando módulo reproductivo...</Text>
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
        <Text style={styles.headerTitulo}>Reproducción</Text>
        <View style={styles.espaciadorHeader} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContenido}
        showsVerticalScrollIndicator={false}
      >
        {/* Tarjetas KPI Arriba (3 métricas del mes) */}
        <View style={styles.filaKPIs}>
          <View style={styles.tarjetaKPIPrenada}>
            <View style={styles.encabezadoKPI}>
              <View style={styles.iconoKPIPrenada}>
                <CheckCircle2 size={13} color={COLORES.verdeOscuro} />
              </View>
              <Text style={styles.etiquetaKPI}>PREÑADAS</Text>
            </View>
            <Text style={styles.valorKPIPrenada}>{kpisMesDiagnosticos.preñadas}</Text>
            <Text style={styles.subtextoKPI}>Este mes</Text>
          </View>

          <View style={styles.tarjetaKPIVacia}>
            <View style={styles.encabezadoKPI}>
              <View style={styles.iconoKPIVacia}>
                <AlertCircle size={13} color={COLORES.textoSecundario} />
              </View>
              <Text style={styles.etiquetaKPI}>VACÍAS</Text>
            </View>
            <Text style={styles.valorKPIVacia}>{kpisMesDiagnosticos.vacias}</Text>
            <Text style={styles.subtextoKPI}>Este mes</Text>
          </View>

          <View style={styles.tarjetaKPIPartos}>
            <View style={styles.encabezadoKPI}>
              <View style={styles.iconoKPIPartos}>
                <Baby size={13} color={COLORES.azulRey} />
              </View>
              <Text style={styles.etiquetaKPI}>PARTOS</Text>
            </View>
            <Text style={styles.valorKPIPartos}>{kpisMesPartos.total}</Text>
            <Text style={styles.subtextoKPI}>Este mes</Text>
          </View>
        </View>

        {/* Banner de resumen pendientes */}
        <View style={styles.bannerResumen}>
          <View style={styles.circuloIconoBanner}>
            <Clock size={20} color={COLORES.verdeOscuro} />
          </View>
          <View style={styles.infoBanner}>
            <Text style={styles.tituloBanner}>Servicios Pendientes de Diagnóstico</Text>
            <Text style={styles.subtituloBanner}>
              {pendientesOrdenados.length === 1
                ? '1 animal a la espera de confirmación'
                : `${pendientesOrdenados.length} animales a la espera de confirmación`}
            </Text>
          </View>
        </View>

        {/* Sección 1: Servicios pendientes de diagnóstico */}
        <Text style={styles.seccionTitulo}>Servicios Pendientes</Text>

        {pendientesOrdenados.length === 0 ? (
          <View style={styles.tarjetaVacia}>
            <CheckCircle2 size={32} color={COLORES.verdeEsmeralda} style={styles.iconoVacio} />
            <Text style={styles.textoVacioTitulo}>No hay servicios pendientes</Text>
            <Text style={styles.textoVacioDesc}>
              No hay servicios pendientes de diagnóstico en el rebaño en este momento.
            </Text>
          </View>
        ) : (
          <View style={styles.listaPendientes}>
            {pendientesOrdenados.map((servicio, index) => {
              const dias = diasDesdeServicio(servicio.fecha);
              const enVentana = estaEnVentanaPalpacion(servicio.fecha);
              const esInseminacion = servicio.tipo === 'inseminacion';

              return (
                <Pressable
                  key={`pendiente-${servicio.id}-${index}`}
                  style={styles.tarjetaItemPendiente}
                  onPress={() => router.push(`/animal/${servicio.animalId}`)}
                >
                  <View style={styles.filaItemSuperior}>
                    {/* Badge arete / animal */}
                    <View style={styles.infoAnimalColumna}>
                      <View style={styles.filaAreteNombre}>
                        <Text style={styles.areteTexto}>#{servicio.arete}</Text>
                        {Boolean(servicio.nombre) && (
                          <Text style={styles.nombreTexto}>• {servicio.nombre}</Text>
                        )}
                      </View>

                      <View style={styles.filaTipoFecha}>
                        {esInseminacion ? (
                          <Syringe size={12} color={COLORES.verdeOscuro} />
                        ) : (
                          <Text style={styles.emojiToro}>🐂</Text>
                        )}
                        <Text style={styles.tipoTexto}>
                          {esInseminacion ? 'Inseminación' : 'Monta'} • {servicio.fecha}
                        </Text>
                      </View>
                    </View>

                    {/* Días y Badge de Ventana */}
                    <View style={styles.columnaDias}>
                      <Text style={styles.diasNumero}>{dias}</Text>
                      <Text style={styles.diasEtiqueta}>días</Text>
                    </View>

                    <ChevronRight size={18} color={COLORES.textoMudo} style={styles.chevron} />
                  </View>

                  {/* Detalle inferior */}
                  <View style={styles.filaItemInferior}>
                    {enVentana ? (
                      <View style={styles.badgeEnVentana}>
                        <Sparkles size={12} color={COLORES.ambarOscuro} style={styles.iconoSparkle} />
                        <Text style={styles.textoBadgeEnVentana}>
                          En ventana de palpación (45-60 días)
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.textoDetalleDias}>
                        {dias < 45
                          ? `Faltan ${45 - dias} días para la ventana de diagnóstico`
                          : `Superó ventana habitual (+${dias - 60} días)`}
                      </Text>
                    )}

                    {Boolean(servicio.fechaProbableParto) && (
                      <View style={styles.filaFppMini}>
                        <Calendar size={11} color={COLORES.textoMudo} style={styles.iconoFppMini} />
                        <Text style={styles.textoFppMini}>
                          FPP: {servicio.fechaProbableParto}
                        </Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Sección 2: Diagnósticos recientes */}
        <Text style={styles.seccionTituloConMargen}>Diagnósticos Recientes</Text>

        {diagnosticosRecientes.length === 0 ? (
          <View style={styles.tarjetaVacia}>
            <Stethoscope size={30} color={COLORES.textoSecundario} style={styles.iconoVacio} />
            <Text style={styles.textoVacioTitulo}>No hay diagnósticos recientes</Text>
            <Text style={styles.textoVacioDesc}>
              Aún no se han registrado diagnósticos de preñez o palpaciones en el rebaño.
            </Text>
          </View>
        ) : (
          <View style={styles.listaDiagnosticos}>
            {diagnosticosRecientes.map((diag, index) => {
              const esPrenada = diag.resultado === 'preñada';

              return (
                <Pressable
                  key={`diag-reciente-${diag.id}-${index}`}
                  style={styles.tarjetaItemDiagnostico}
                  onPress={() => router.push(`/animal/${diag.animalId}`)}
                >
                  <View style={styles.filaItemSuperior}>
                    <View style={styles.infoAnimalColumna}>
                      <View style={styles.filaAreteNombre}>
                        <Text style={styles.areteTexto}>
                          #{diag.animalArete || 'Sin arete'}
                        </Text>
                        {Boolean(diag.animalNombre) && (
                          <Text style={styles.nombreTexto}>• {diag.animalNombre}</Text>
                        )}
                      </View>

                      <View style={styles.filaTipoFecha}>
                        <Calendar size={12} color={COLORES.textoSecundario} />
                        <Text style={styles.tipoTexto}>{diag.fecha}</Text>
                        {Boolean(diag.veterinario) && (
                          <Text style={styles.textoVetDiagnostico}>
                            • {diag.veterinario}
                          </Text>
                        )}
                      </View>
                    </View>

                    <View
                      style={
                        esPrenada
                          ? styles.badgeDiagPrenada
                          : styles.badgeDiagVacia
                      }
                    >
                      <Text
                        style={
                          esPrenada
                            ? styles.textoBadgeDiagPrenada
                            : styles.textoBadgeDiagVacia
                        }
                      >
                        {esPrenada ? 'PREÑADA' : 'VACÍA'}
                      </Text>
                    </View>

                    <ChevronRight size={18} color={COLORES.textoMudo} style={styles.chevron} />
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Sección 3: Tarea 9 — Partos recientes */}
        <Text style={styles.seccionTituloConMargen}>Partos Recientes</Text>

        {partosRecientes.length === 0 ? (
          <View style={styles.tarjetaVacia}>
            <Baby size={30} color={COLORES.textoSecundario} style={styles.iconoVacio} />
            <Text style={styles.textoVacioTitulo}>No hay partos recientes</Text>
            <Text style={styles.textoVacioDesc}>
              Aún no se han registrado nacimientos o partos en el rebaño.
            </Text>
          </View>
        ) : (
          <View style={styles.listaPartos}>
            {partosRecientes.map((parto, index) => {
              const esHembra = parto.sexoCria === 'H';

              return (
                <Pressable
                  key={`parto-reciente-${parto.id}-${index}`}
                  style={styles.tarjetaItemParto}
                  onPress={() => router.push(`/animal/${parto.animalId}`)}
                >
                  <View style={styles.filaItemSuperior}>
                    <View style={styles.infoAnimalColumna}>
                      <View style={styles.filaAreteNombre}>
                        <Text style={styles.areteTexto}>
                          Madre #{parto.areteMadre}
                        </Text>
                        {Boolean(parto.nombreMadre) && (
                          <Text style={styles.nombreTexto}>• {parto.nombreMadre}</Text>
                        )}
                      </View>

                      <View style={styles.filaTipoFecha}>
                        <Calendar size={12} color={COLORES.textoSecundario} />
                        <Text style={styles.tipoTexto}>{parto.fecha}</Text>
                        {parto.pesoCria != null && (
                          <Text style={styles.textoPesoParto}>
                            • {parto.pesoCria} kg
                          </Text>
                        )}
                        {Boolean(parto.areteCria) && (
                          <Text style={styles.textoAreteParto}>
                            • Cría #{parto.areteCria}
                          </Text>
                        )}
                      </View>
                    </View>

                    <View
                      style={
                        esHembra
                          ? styles.badgePartoHembra
                          : styles.badgePartoMacho
                      }
                    >
                      <Text
                        style={
                          esHembra
                            ? styles.textoBadgePartoHembra
                            : styles.textoBadgePartoMacho
                        }
                      >
                        {esHembra ? '♀ HEMBRA' : '♂ MACHO'}
                      </Text>
                    </View>

                    <ChevronRight size={18} color={COLORES.textoMudo} style={styles.chevron} />
                  </View>
                </Pressable>
              );
            })}
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
  espaciadorHeader: {
    width: 42,
  },
  scrollContenido: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 50,
  },
  filaKPIs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tarjetaKPIPrenada: {
    flex: 1,
    backgroundColor: COLORES.blanco,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORES.verdeMentha,
  },
  tarjetaKPIVacia: {
    flex: 1,
    backgroundColor: COLORES.blanco,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  tarjetaKPIPartos: {
    flex: 1,
    backgroundColor: COLORES.blanco,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORES.aquaClaro,
  },
  encabezadoKPI: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  iconoKPIPrenada: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORES.verdeMentha,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconoKPIVacia: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORES.fondoApp,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconoKPIPartos: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORES.aquaClaro,
    alignItems: 'center',
    justifyContent: 'center',
  },
  etiquetaKPI: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORES.textoMudo,
    letterSpacing: 0.4,
  },
  valorKPIPrenada: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORES.verdeOscuro,
  },
  valorKPIVacia: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORES.textoOscuro,
  },
  valorKPIPartos: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORES.azulRey,
  },
  subtextoKPI: {
    fontSize: 10,
    color: COLORES.textoSecundario,
    marginTop: 2,
    fontWeight: '500',
  },
  bannerResumen: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.blanco,
    borderRadius: 22,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    shadowColor: COLORES.textoOscuro,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  circuloIconoBanner: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORES.verdeMentha,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  infoBanner: {
    flex: 1,
  },
  tituloBanner: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORES.tealOscuro,
  },
  subtituloBanner: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORES.textoMudo,
    marginTop: 2,
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
  seccionTituloConMargen: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORES.textoMudo,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 24,
    marginBottom: 12,
    marginLeft: 4,
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
  listaPendientes: {
    gap: 12,
  },
  listaDiagnosticos: {
    gap: 10,
  },
  listaPartos: {
    gap: 10,
  },
  tarjetaItemPendiente: {
    backgroundColor: COLORES.blanco,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    shadowColor: COLORES.textoOscuro,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  tarjetaItemDiagnostico: {
    backgroundColor: COLORES.blanco,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  tarjetaItemParto: {
    backgroundColor: COLORES.blanco,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  filaItemSuperior: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoAnimalColumna: {
    flex: 1,
  },
  filaAreteNombre: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  areteTexto: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORES.tealOscuro,
    letterSpacing: -0.3,
  },
  nombreTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORES.textoMudo,
  },
  filaTipoFecha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  emojiToro: {
    fontSize: 12,
  },
  tipoTexto: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORES.textoMudo,
  },
  textoVetDiagnostico: {
    fontSize: 12,
    color: COLORES.textoSecundario,
    fontWeight: '500',
  },
  textoPesoParto: {
    fontSize: 12,
    color: COLORES.textoSecundario,
    fontWeight: '600',
  },
  textoAreteParto: {
    fontSize: 12,
    color: COLORES.tealOscuro,
    fontWeight: '700',
  },
  badgeDiagPrenada: {
    backgroundColor: COLORES.verdeMentha,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORES.verdeEsmeralda,
    marginRight: 6,
  },
  badgeDiagVacia: {
    backgroundColor: COLORES.fondoApp,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    marginRight: 6,
  },
  badgePartoHembra: {
    backgroundColor: COLORES.verdeMentha,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORES.verdeEsmeralda,
    marginRight: 6,
  },
  badgePartoMacho: {
    backgroundColor: COLORES.aquaClaro,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORES.azulRey,
    marginRight: 6,
  },
  textoBadgeDiagPrenada: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORES.verdeOscuro,
  },
  textoBadgeDiagVacia: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORES.textoSecundario,
  },
  textoBadgePartoHembra: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORES.verdeOscuro,
  },
  textoBadgePartoMacho: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORES.azulRey,
  },
  columnaDias: {
    alignItems: 'center',
    backgroundColor: COLORES.fondoApp,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 6,
  },
  diasNumero: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORES.verdeOscuro,
    lineHeight: 18,
  },
  diasEtiqueta: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORES.textoMudo,
    textTransform: 'uppercase',
  },
  chevron: {
    marginLeft: 4,
  },
  filaItemInferior: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORES.bordeClaro,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  badgeEnVentana: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.ambarClaro,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORES.ambarAlerta,
  },
  iconoSparkle: {
    marginRight: 4,
  },
  textoBadgeEnVentana: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORES.ambarOscuro,
  },
  textoDetalleDias: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORES.textoMudo,
  },
  filaFppMini: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconoFppMini: {
    marginRight: 4,
  },
  textoFppMini: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORES.textoMudo,
  },
});
