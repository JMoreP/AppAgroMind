import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Syringe,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Users,
  ChevronRight,
  Sparkles,
  Calendar,
  FileText,
  CheckCircle2,
  LogOut,
} from 'lucide-react-native';
import { differenceInDays, parseISO, format } from 'date-fns';
import { COLORES } from '../../../shared/theme/colores';
import { useReportes } from '../../../features/reportes/hooks/useReportes';
import { useEventosSanitarios } from '../../../features/sanidad/hooks/useEventosSanitarios';
import { useMetricasSanidad } from '../../../features/sanidad/hooks/useMetricasSanidad';
import { DestinoDescarte } from '../../../features/sanidad/types/BajaAnimal';
import { FormularioEventoSanitarioModal } from '../../../features/sanidad/components/FormularioEventoSanitarioModal';
import {
  labelTipoEvento,
  diasHastaFecha,
  estaEnAlerta,
  estaVencido,
} from '../../../features/sanidad/utils/calculosSanidad';
import { obtenerNombreAnimal } from '../../../shared/config/configuracionEspecie';

function labelDestino(destino: DestinoDescarte): string {
  switch (destino) {
    case 'matadero': return 'Matadero';
    case 'venta': return 'Venta';
    case 'consumo_interno': return 'Consumo Interno';
    case 'otro': return 'Otro';
    default: return destino;
  }
}

export default function PantallaSanidad() {
  const router = useRouter();
  const {
    eventos,
    eventosRecientes,
    proximasDosis,
    vencidos,
    totalDelMes,
    cargando,
    crearEvento,
    eliminarEvento,
  } = useEventosSanitarios();

  const {
    productivos,
    muertosMes,
    muertosTotal,
    descartadosMes,
    descartadosTotal,
    mortalidadReciente,
    descarteReciente,
    recargar: recargarMetricas,
  } = useMetricasSanidad();

  const { generando, exportarReporteSanidad } = useReportes();
  const [mostrarModalGrupal, setMostrarModalGrupal] = useState(false);

  const handleExportarPDF = async () => {
    try {
      const ahora = new Date();
      await exportarReporteSanidad(ahora.getFullYear(), ahora.getMonth() + 1);
    } catch (err) {
      if (err instanceof Error) {
        Alert.alert('Error al generar reporte', err.message);
      }
    }
  };

  // Calcular animales con retiro activo de leche
  const totalRetiroActivo = useMemo(() => {
    const hoyStr = format(new Date(), 'yyyy-MM-dd');
    const dHoy = parseISO(hoyStr);

    let count = 0;
    for (const ev of eventos) {
      if (ev.diasRetiroLeche && ev.diasRetiroLeche > 0) {
        try {
          const dFecha = parseISO(ev.fecha);
          const diasPasados = differenceInDays(dHoy, dFecha);
          if (diasPasados >= 0 && diasPasados < ev.diasRetiroLeche) {
            count++;
          }
        } catch {
          // Ignorar error de fecha
        }
      }
    }
    return count;
  }, [eventos]);

  // Eventos en ventana de alerta próxima (<= 7 días)
  const alertasProximas = useMemo(() => {
    return proximasDosis.filter((p) => estaEnAlerta(p.proximaDosis));
  }, [proximasDosis]);

  if (cargando) {
    return (
      <SafeAreaView style={styles.contenedorCentro} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color={COLORES.verdeEsmeralda} />
        <Text style={styles.textoCargando}>Cargando registros sanitarios...</Text>
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
        <Text style={styles.headerTitulo}>Sanidad</Text>
        <Pressable
          onPress={handleExportarPDF}
          style={styles.btnVolver}
          disabled={generando}
        >
          {generando ? (
            <ActivityIndicator size="small" color={COLORES.verdeEsmeralda} />
          ) : (
            <FileText size={20} color={COLORES.tealOscuro} />
          )}
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContenido}
        showsVerticalScrollIndicator={false}
      >
        {/* Grid 3x2 de KPIs */}
        <View style={styles.gridKPI}>
          {/* KPI 1: Eventos este mes */}
          <View style={styles.tarjetaKPI}>
            <View style={styles.cabeceraKPI}>
              <View style={styles.iconoKPIVerde}>
                <Syringe size={18} color={COLORES.verdeEsmeralda} />
              </View>
              <Text style={styles.etiquetaKPI}>EVENTOS ESTE MES</Text>
            </View>
            <Text style={styles.valorKPI}>{totalDelMes}</Text>
            <Text style={styles.subtextoKPI}>aplicados en el hato</Text>
          </View>

          {/* KPI 2: Próximas dosis (≤ 7 días) */}
          <View style={styles.tarjetaKPI}>
            <View style={styles.cabeceraKPI}>
              <View style={styles.iconoKPIAmbar}>
                <Clock size={18} color={COLORES.ambarAlerta} />
              </View>
              <Text style={styles.etiquetaKPI}>PRÓXIMAS DOSIS</Text>
            </View>
            <Text style={styles.valorKPI}>{alertasProximas.length}</Text>
            <Text style={styles.subtextoKPI}>en ventana de 7 días</Text>
          </View>

          {/* KPI 3: Vencidos */}
          <View style={styles.tarjetaKPI}>
            <View style={styles.cabeceraKPI}>
              <View style={styles.iconoKPIRojo}>
                <AlertTriangle size={18} color={COLORES.rojoError} />
              </View>
              <Text style={styles.etiquetaKPI}>DOSIS VENCIDAS</Text>
            </View>
            <Text style={styles.valorKPI}>{vencidos.length}</Text>
            <Text style={styles.subtextoKPI}>requieren atención</Text>
          </View>

          {/* KPI 4: Animales Productivos */}
          <View style={styles.tarjetaKPI}>
            <View style={styles.cabeceraKPI}>
              <View style={styles.iconoKPIVerde}>
                <CheckCircle2 size={18} color={COLORES.verdeEsmeralda} />
              </View>
              <Text style={styles.etiquetaKPI}>PRODUCTIVOS</Text>
            </View>
            <Text style={styles.valorKPI}>{productivos}</Text>
            <Text style={styles.subtextoKPI}>activos en el rebaño</Text>
          </View>

          {/* KPI 5: Muertos este mes */}
          <View style={styles.tarjetaKPI}>
            <View style={styles.cabeceraKPI}>
              <View style={styles.iconoKPIRojo}>
                <AlertTriangle size={18} color={COLORES.rojoError} />
              </View>
              <Text style={styles.etiquetaKPI}>MUERTOS ESTE MES</Text>
            </View>
            <Text style={styles.valorKPI}>{muertosMes}</Text>
            <Text style={styles.subtextoKPI}>{`Total histórico: ${muertosTotal}`}</Text>
          </View>

          {/* KPI 6: Descartados este mes */}
          <View style={styles.tarjetaKPI}>
            <View style={styles.cabeceraKPI}>
              <View style={styles.iconoKPIAmbar}>
                <LogOut size={18} color={COLORES.ambarOscuro} />
              </View>
              <Text style={styles.etiquetaKPI}>DESCARTADOS ESTE MES</Text>
            </View>
            <Text style={styles.valorKPI}>{descartadosMes}</Text>
            <Text style={styles.subtextoKPI}>{`Total histórico: ${descartadosTotal}`}</Text>
          </View>
        </View>

        {/* Botón Grande: Registrar Evento Grupal */}
        <Pressable
          style={styles.botonRegistrarGrupal}
          onPress={() => setMostrarModalGrupal(true)}
        >
          <Users size={20} color={COLORES.blanco} />
          <Text style={styles.textoBotonRegistrarGrupal}>Registrar Evento Grupal (Hato)</Text>
        </Pressable>

        {/* Botón: Generar Reporte Sanitario */}
        <Pressable
          style={styles.botonReporteSanitario}
          onPress={handleExportarPDF}
          disabled={generando}
        >
          {generando ? (
            <ActivityIndicator size="small" color={COLORES.tealOscuro} />
          ) : (
            <>
              <FileText size={18} color={COLORES.tealOscuro} />
              <Text style={styles.textoBotonReporteSanitario}>Generar Reporte Sanitario (PDF)</Text>
            </>
          )}
        </Pressable>

        {/* Sección: ⚠️ Alertas de Próxima Dosis (≤ 7 días) */}
        <View style={styles.seccion}>
          <View style={styles.cabeceraSeccion}>
            <Clock size={18} color={COLORES.ambarOscuro} />
            <Text style={styles.tituloSeccion}>⚠️ Alertas de Próxima Dosis</Text>
          </View>

          {alertasProximas.length === 0 ? (
            <View style={styles.tarjetaVacia}>
              <Text style={styles.textoVacio}>No hay dosis pendientes para los próximos 7 días.</Text>
            </View>
          ) : (
            alertasProximas.map((item) => {
              const dias = item.proximaDosis ? diasHastaFecha(item.proximaDosis) : 0;
              return (
                <Pressable
                  key={`alerta-${item.id}`}
                  style={styles.itemAlerta}
                  onPress={() => {
                    if (item.animalId) {
                      router.push(`/animal/${item.animalId}`);
                    }
                  }}
                >
                  <View style={styles.infoAlerta}>
                    <Text style={styles.tituloItemAlerta}>
                      {item.areteAnimal ? `${item.especieAnimal === 'bovino' ? 'Bovino' : 'Búfalo'} #${item.areteAnimal}` : 'Evento de Hato'}
                    </Text>
                    <Text style={styles.subtextoItemAlerta}>
                      {`${labelTipoEvento(item.tipo)} • ${item.producto}`}
                    </Text>
                  </View>

                  <View style={styles.badgeDiasAmbar}>
                    <Text style={styles.textoBadgeDiasAmbar}>
                      {dias === 0 ? '¡Hoy!' : `en ${dias} d`}
                    </Text>
                  </View>

                  {item.animalId && <ChevronRight size={18} color={COLORES.textoMudo} />}
                </Pressable>
              );
            })
          )}
        </View>

        {/* Sección: 🚨 Eventos Vencidos */}
        <View style={styles.seccion}>
          <View style={styles.cabeceraSeccion}>
            <AlertTriangle size={18} color={COLORES.rojoError} />
            <Text style={styles.tituloSeccion}>🚨 Dosis Vencidas</Text>
          </View>

          {vencidos.length === 0 ? (
            <View style={styles.tarjetaVacia}>
              <Text style={styles.textoVacio}>Excelente, no hay eventos sanitarios vencidos.</Text>
            </View>
          ) : (
            vencidos.map((item) => {
              const diasVencido = item.proximaDosis
                ? Math.abs(diasHastaFecha(item.proximaDosis))
                : 0;

              return (
                <Pressable
                  key={`vencido-${item.id}`}
                  style={styles.itemVencido}
                  onPress={() => {
                    if (item.animalId) {
                      router.push(`/animal/${item.animalId}`);
                    }
                  }}
                >
                  <View style={styles.infoAlerta}>
                    <Text style={styles.tituloItemVencido}>
                      {item.areteAnimal ? `${item.especieAnimal === 'bovino' ? 'Bovino' : 'Búfalo'} #${item.areteAnimal}` : 'Evento de Hato'}
                    </Text>
                    <Text style={styles.subtextoItemAlerta}>
                      {`${labelTipoEvento(item.tipo)} • ${item.producto}`}
                    </Text>
                    <Text style={styles.fechaVencidoSubtexto}>
                      {`Fecha esperada: ${item.proximaDosis}`}
                    </Text>
                  </View>

                  <View style={styles.badgeDiasRojo}>
                    <Text style={styles.textoBadgeDiasRojo}>
                      {`hace ${diasVencido} d`}
                    </Text>
                  </View>

                  {item.animalId && <ChevronRight size={18} color={COLORES.textoMudo} />}
                </Pressable>
              );
            })
          )}
        </View>

        {/* Sección: Eventos Recientes */}
        <View style={styles.seccion}>
          <View style={styles.cabeceraSeccion}>
            <Calendar size={18} color={COLORES.tealOscuro} />
            <Text style={styles.tituloSeccion}>Eventos Recientes</Text>
          </View>

          {eventosRecientes.length === 0 ? (
            <View style={styles.tarjetaVacia}>
              <Text style={styles.textoVacio}>No se han registrado eventos sanitarios aún.</Text>
            </View>
          ) : (
            eventosRecientes.map((ev) => {
              const enAlerta = estaEnAlerta(ev.proximaDosis);
              const venc = estaVencido(ev.proximaDosis);

              return (
                <Pressable
                  key={`reciente-${ev.id}`}
                  style={styles.itemReciente}
                  onPress={() => {
                    if (ev.animalId) {
                      router.push(`/animal/${ev.animalId}`);
                    }
                  }}
                >
                  <View style={styles.infoReciente}>
                    <Text style={styles.tituloItemReciente}>
                      {ev.areteAnimal
                        ? `${ev.especieAnimal ? obtenerNombreAnimal(ev.especieAnimal, 'H') : 'Animal'} #${ev.areteAnimal}`
                        : 'Evento Grupal (Hato)'}
                    </Text>
                    <Text style={styles.subtextoItemAlerta}>
                      {`${labelTipoEvento(ev.tipo)} • ${ev.producto}`}
                    </Text>
                    <Text style={styles.fechaRecienteTexto}>{ev.fecha}</Text>
                  </View>

                  {/* Badge de estado */}
                  {venc ? (
                    <View style={styles.badgeRecienteRojo}>
                      <Text style={styles.textoBadgeRecienteRojo}>Vencida</Text>
                    </View>
                  ) : enAlerta ? (
                    <View style={styles.badgeRecienteAmbar}>
                      <Text style={styles.textoBadgeRecienteAmbar}>Próxima</Text>
                    </View>
                  ) : (
                    <View style={styles.badgeRecienteVerde}>
                      <Text style={styles.textoBadgeRecienteVerde}>Al día</Text>
                    </View>
                  )}
                </Pressable>
              );
            })
          )}
        </View>

        {/* Sección: 🚨 Muertes Recientes */}
        <View style={styles.seccion}>
          <View style={styles.cabeceraSeccion}>
            <AlertTriangle size={18} color={COLORES.rojoError} />
            <Text style={styles.tituloSeccion}>🚨 Muertes Recientes</Text>
          </View>

          {mortalidadReciente.length === 0 ? (
            <View style={styles.tarjetaVacia}>
              <Text style={styles.textoVacio}>No hay registros de mortalidad en el hato.</Text>
            </View>
          ) : (
            mortalidadReciente.map((mort) => (
              <Pressable
                key={`mort-${mort.id}`}
                style={styles.itemReciente}
                onPress={() => router.push(`/animal/${mort.animalId}`)}
              >
                <View style={styles.infoReciente}>
                  <Text style={styles.tituloItemReciente}>
                    {`${mort.especieAnimal ? obtenerNombreAnimal(mort.especieAnimal, mort.sexoAnimal || 'H') : 'Animal'} #${mort.areteAnimal}${mort.nombreAnimal ? ` (${mort.nombreAnimal})` : ''}`}
                  </Text>
                  <Text style={styles.subtextoItemAlerta}>
                    {`Causa: ${mort.causa}`}
                  </Text>
                  <Text style={styles.fechaRecienteTexto}>{mort.fecha}</Text>
                </View>

                <View style={styles.badgeRecienteRojo}>
                  <Text style={styles.textoBadgeRecienteRojo}>Muerta</Text>
                </View>
              </Pressable>
            ))
          )}
        </View>

        {/* Sección: 📤 Descartes Recientes */}
        <View style={styles.seccion}>
          <View style={styles.cabeceraSeccion}>
            <LogOut size={18} color={COLORES.ambarOscuro} />
            <Text style={styles.tituloSeccion}>📤 Descartes Recientes</Text>
          </View>

          {descarteReciente.length === 0 ? (
            <View style={styles.tarjetaVacia}>
              <Text style={styles.textoVacio}>No hay registros de descarte en el hato.</Text>
            </View>
          ) : (
            descarteReciente.map((desc) => (
              <Pressable
                key={`desc-${desc.id}`}
                style={styles.itemReciente}
                onPress={() => router.push(`/animal/${desc.animalId}`)}
              >
                <View style={styles.infoReciente}>
                  <Text style={styles.tituloItemReciente}>
                    {`${desc.especieAnimal ? obtenerNombreAnimal(desc.especieAnimal, desc.sexoAnimal || 'H') : 'Animal'} #${desc.areteAnimal}${desc.nombreAnimal ? ` (${desc.nombreAnimal})` : ''}`}
                  </Text>
                  <Text style={styles.subtextoItemAlerta}>
                    {`Destino: ${labelDestino(desc.destino)}${desc.precio ? ` • $${desc.precio.toFixed(2)}` : ''}`}
                  </Text>
                  <Text style={styles.fechaRecienteTexto}>{desc.fecha}</Text>
                </View>

                <View style={styles.badgeRecienteAmbar}>
                  <Text style={styles.textoBadgeRecienteAmbar}>Descarte</Text>
                </View>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>

      {/* Modal para Evento Grupal */}
      <FormularioEventoSanitarioModal
        visible={mostrarModalGrupal}
        onCerrar={() => setMostrarModalGrupal(false)}
        onGuardar={async (datos) => {
          await crearEvento(datos);
          await recargarMetricas();
        }}
      />
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
    marginTop: 12,
    fontSize: 14,
    color: COLORES.textoSecundario,
  },
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 60,
    backgroundColor: COLORES.blanco,
    borderBottomWidth: 1,
    borderBottomColor: COLORES.bordeClaro,
  },
  btnVolver: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORES.fondoApp,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitulo: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORES.tealOscuro,
  },
  espaciadorHeader: {
    width: 40,
  },
  scrollContenido: {
    padding: 16,
    paddingBottom: 110,
  },
  gridKPI: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
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
  iconoKPIAmbar: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORES.ambarClaro,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconoKPIRojo: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORES.rojoClaro,
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
  botonRegistrarGrupal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORES.verdeEsmeralda,
    borderRadius: 18,
    paddingVertical: 14,
    marginBottom: 20,
    gap: 10,
  },
  textoBotonRegistrarGrupal: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORES.blanco,
    letterSpacing: 0.4,
  },
  seccion: {
    marginBottom: 22,
  },
  cabeceraSeccion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  tituloSeccion: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORES.tealOscuro,
  },
  tarjetaVacia: {
    backgroundColor: COLORES.blanco,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    alignItems: 'center',
  },
  textoVacio: {
    fontSize: 12,
    color: COLORES.textoMudo,
    textAlign: 'center',
  },
  itemAlerta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.blanco,
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    borderLeftWidth: 4,
    borderLeftColor: COLORES.ambarAlerta,
    gap: 10,
  },
  infoAlerta: {
    flex: 1,
  },
  tituloItemAlerta: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORES.tealOscuro,
  },
  subtextoItemAlerta: {
    fontSize: 12,
    color: COLORES.textoSecundario,
    marginTop: 1,
  },
  badgeDiasAmbar: {
    backgroundColor: COLORES.ambarClaro,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  textoBadgeDiasAmbar: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORES.ambarOscuro,
  },
  itemVencido: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.blanco,
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    borderLeftWidth: 4,
    borderLeftColor: COLORES.rojoError,
    gap: 10,
  },
  tituloItemVencido: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORES.rojoError,
  },
  fechaVencidoSubtexto: {
    fontSize: 10,
    color: COLORES.textoMudo,
    marginTop: 2,
  },
  badgeDiasRojo: {
    backgroundColor: COLORES.rojoClaro,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  textoBadgeDiasRojo: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORES.rojoError,
  },
  itemReciente: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.blanco,
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    gap: 10,
  },
  infoReciente: {
    flex: 1,
  },
  tituloItemReciente: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORES.tealOscuro,
  },
  fechaRecienteTexto: {
    fontSize: 11,
    color: COLORES.textoMudo,
    marginTop: 2,
  },
  badgeRecienteVerde: {
    backgroundColor: COLORES.verdeMentha,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  textoBadgeRecienteVerde: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORES.verdeOscuro,
  },
  badgeRecienteAmbar: {
    backgroundColor: COLORES.ambarClaro,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  textoBadgeRecienteAmbar: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORES.ambarOscuro,
  },
  badgeRecienteRojo: {
    backgroundColor: COLORES.rojoClaro,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  textoBadgeRecienteRojo: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORES.rojoError,
  },
  botonReporteSanitario: {
    backgroundColor: COLORES.blanco,
    borderWidth: 1.5,
    borderColor: COLORES.tealOscuro,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
    marginBottom: 16,
  },
  textoBotonReporteSanitario: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORES.tealOscuro,
  },
});
