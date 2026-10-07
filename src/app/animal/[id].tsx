import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  StatusBar, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ChevronLeft, 
  Edit3, 
  Trash2, 
  Droplet, 
  Weight, 
  CalendarDays, 
  ActivitySquare, 
  Stethoscope, 
  Fingerprint,
  Dna,
  Tag
} from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { Animal } from '../../features/animales/types/Animal';
import { AnimalRepository } from '../../features/animales/repositories/AnimalRepository';
import { FormularioAnimalModal } from '../../features/animales/components/FormularioAnimalModal';
import { useHistorialLeche } from '../../features/ordeno/hooks/useHistorialLeche';
import { TarjetasResumenPDP } from '../../features/ordeno/components/TarjetasResumenPDP';
import { AlertaCaidaProduccion } from '../../features/ordeno/components/AlertaCaidaProduccion';
import { GraficaProduccionLeche } from '../../features/ordeno/components/GraficaProduccionLeche';
import { ListaHistorialPesajes } from '../../features/ordeno/components/ListaHistorialPesajes';
import { COLORES } from '../../shared/theme/colores';

export default function PantallaDetalleAnimal() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const idAnimal = params.id;

  const [animal, setAnimal] = useState<Animal | null>(null);
  const [cargando, setCargando] = useState(true);
  const [mostrarModalEdit, setMostrarModalEdit] = useState(false);
  const [rangoGrafica, setRangoGrafica] = useState<'7d' | '30d'>('7d');

  const {
    puntosGrafica,
    pesajesDetallados,
    resumenPDP,
    recargar: recargarHistorial,
  } = useHistorialLeche(idAnimal);

  const cargarDatosAnimal = useCallback(async () => {
    if (!idAnimal) return;
    setCargando(true);
    try {
      const data = await AnimalRepository.getById(idAnimal);
      setAnimal(data);
      await recargarHistorial();
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al cargar animal por ID:', error.message);
      }
    } finally {
      setCargando(false);
    }
  }, [idAnimal, recargarHistorial]);

  useEffect(() => {
    cargarDatosAnimal();
  }, [cargarDatosAnimal]);

  const confirmarEliminacion = () => {
    if (!animal) return;

    Alert.alert(
      'Confirmar Eliminación',
      `¿Deseas dar de baja a la búfala #${animal.arete}? El registro pasará a estado "descartada".`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Dar de baja', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Soft-delete cambiando el estado de vida a descartada
              await AnimalRepository.update(animal.id, { estadoVida: 'descartada' });
              router.back();
            } catch (error) {
              if (error instanceof Error) {
                console.warn('Error al eliminar animal:', error.message);
              }
            }
          }
        }
      ]
    );
  };

  if (cargando) {
    return (
      <SafeAreaView style={styles.containerCentro}>
        <ActivityIndicator size="large" color={COLORES.verdeEsmeralda} />
      </SafeAreaView>
    );
  }

  if (!animal) {
    return (
      <SafeAreaView style={styles.containerCentro}>
        <Text style={styles.textoNoEncontrado}>Animal no encontrado.</Text>
        <Pressable onPress={() => router.back()} style={styles.btnVolver}>
          <Text style={styles.textoBtnVolver}>Volver al rebaño</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const getStatusHeroStyle = () => {
    switch(animal.estadoReproductivo) {
      case 'lactancia': return styles.heroStatusLactancia;
      case 'preñada': return styles.heroStatusPrenada;
      case 'secado': return styles.heroStatusSecado;
      case 'vacia': return styles.heroStatusVacia;
      default: return styles.heroStatusDefault;
    }
  };

  const getStatusHeroDotStyle = () => {
    switch(animal.estadoReproductivo) {
      case 'lactancia': return styles.heroDotLactancia;
      case 'preñada': return styles.heroDotPrenada;
      case 'secado': return styles.heroDotSecado;
      case 'vacia': return styles.heroDotVacia;
      default: return styles.heroDotDefault;
    }
  };

  const getStatusHeroTextStyle = () => {
    switch(animal.estadoReproductivo) {
      case 'lactancia': return styles.heroTextLactancia;
      case 'preñada': return styles.heroTextPrenada;
      case 'secado': return styles.heroTextSecado;
      case 'vacia': return styles.heroTextVacia;
      default: return styles.heroTextDefault;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />
      
      {/* ── Top Navigation ── */}
      <View style={styles.headerNav}>
        <Pressable onPress={() => router.back()} style={styles.btnNav}>
          <ChevronLeft size={24} color={COLORES.tealOscuro} />
        </Pressable>
        <Text style={styles.headerTitle}>Ficha Técnica</Text>
        <View style={styles.headerRightActions}>
          <Pressable onPress={() => setMostrarModalEdit(true)} style={styles.btnNav}>
            <Edit3 size={18} color={COLORES.tealOscuro} />
          </Pressable>
          <Pressable onPress={confirmarEliminacion} style={styles.btnNavEliminar}>
            <Trash2 size={18} color={COLORES.rojoError} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollPadding} showsVerticalScrollIndicator={false}>
        
        {/* ── Premium Dark Hero Card ── */}
        <View style={styles.heroCard}>
          <View style={styles.heroBgPattern1} />
          <View style={styles.heroBgPattern2} />
          
          <View style={styles.heroTop}>
            <View style={getStatusHeroStyle()}>
              <View style={getStatusHeroDotStyle()} />
              <Text style={getStatusHeroTextStyle()}>{animal.estadoReproductivo.toUpperCase()}</Text>
            </View>
            <View style={styles.idBadgeDark}>
              <Fingerprint size={12} color={COLORES.limaBrillante} />
              <Text style={styles.idBadgeTextDark}>
                {animal.estadoVida.toUpperCase()}
              </Text>
            </View>
          </View>
          
          <View style={styles.heroCenter}>
            <Text style={styles.areteGiant}>#{animal.arete}</Text>
            <Text style={styles.nombreDark}>{animal.nombre || 'Búfala N/A'}</Text>
          </View>
          
          <View style={styles.heroBottomRow}>
            <View style={styles.heroTagDark}>
              <CalendarDays size={14} color={COLORES.verdeMentha} style={styles.iconoTag} />
              <Text style={styles.heroTagTextDark}>{animal.fechaNacimiento}</Text>
            </View>
            {animal.raza && (
              <View style={styles.heroTagDark}>
                <Tag size={12} color={COLORES.verdeMentha} />
                <Text style={styles.heroTagTextDark}>{animal.raza}</Text>
              </View>
            )}
            <View style={styles.heroTagDark}>
              <Text style={styles.heroTagTextDark}>{animal.loteId || 'SIN LOTE'}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Métricas Diarias</Text>

        {/* ── Minimalist Metrics Grid ── */}
        <View style={styles.grid}>
          
          {/* Tarjeta Leche */}
          <View style={styles.tarjetaGlassOuter}>
            <View style={styles.glowingBlob}>
              <Svg width="100%" height="100%" viewBox="0 0 100 100">
                <Defs>
                  <RadialGradient id="glowMilk" cx="50%" cy="50%" rx="50%" ry="50%">
                    <Stop offset="0%" stopColor={COLORES.limaBrillante} stopOpacity="0.4" />
                    <Stop offset="100%" stopColor={COLORES.limaBrillante} stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <Circle cx="50" cy="50" r="50" fill="url(#glowMilk)" />
              </Svg>
            </View>

            <BlurView intensity={65} tint="light" style={styles.tarjetaGlassInner}>
              <View style={styles.gridHeader}>
                <View style={styles.iconMilk}>
                  <Droplet size={18} color={COLORES.verdeOscuro} />
                </View>
                <Text style={styles.metricLabel}>Leche hoy</Text>
              </View>
              <View style={styles.metricValueRow}>
                <Text style={styles.metricValue}>
                  {resumenPDP.litrosHoy > 0 ? (resumenPDP.litrosHoy % 1 === 0 ? resumenPDP.litrosHoy.toFixed(0) : resumenPDP.litrosHoy.toFixed(1)) : '0'}
                </Text>
                <Text style={styles.metricUnit}>L</Text>
              </View>
            </BlurView>
          </View>

          {/* Tarjeta Peso Vivo */}
          <View style={styles.tarjetaGlassOuter}>
            <View style={styles.glowingBlob}>
              <Svg width="100%" height="100%" viewBox="0 0 100 100">
                <Defs>
                  <RadialGradient id="glowWeight" cx="50%" cy="50%" rx="50%" ry="50%">
                    <Stop offset="0%" stopColor={COLORES.verdeEsmeralda} stopOpacity="0.4" />
                    <Stop offset="100%" stopColor={COLORES.verdeEsmeralda} stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <Circle cx="50" cy="50" r="50" fill="url(#glowWeight)" />
              </Svg>
            </View>

            <BlurView intensity={65} tint="light" style={styles.tarjetaGlassInner}>
              <View style={styles.gridHeader}>
                <View style={styles.iconWeight}>
                  <Weight size={18} color={COLORES.verdeOscuro} />
                </View>
                <Text style={styles.metricLabel}>Peso Vivo</Text>
              </View>
              <View style={styles.metricValueRow}>
                <Text style={styles.metricValue}>{(animal.pesoActual ?? 0).toFixed(0)}</Text>
                <Text style={styles.metricUnit}>Kg</Text>
              </View>
            </BlurView>
          </View>

        </View>

        {/* ── Rendimiento Lechero y Alertas ── */}
        <Text style={styles.sectionTitle}>Rendimiento Lechero & Tendencia</Text>
        <AlertaCaidaProduccion alerta={resumenPDP.alertaCaida} />
        <TarjetasResumenPDP resumen={resumenPDP} />
        <GraficaProduccionLeche
          datos={puntosGrafica}
          lineaReferenciaPDP={resumenPDP.pdp7Dias > 0 ? resumenPDP.pdp7Dias : undefined}
          etiquetaReferencia="PDP 7d"
          titulo="Evolución de Producción"
          subtitulo="Litros diarios registrados (últimos 30 días)"
          rangoActivo={rangoGrafica}
          onCambiarRango={setRangoGrafica}
        />
        <ListaHistorialPesajes pesajes={pesajesDetallados} />

        {/* ── Genealogía y Detalles ── */}
        <Text style={styles.sectionTitle}>Genealogía y Pesos</Text>
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Padre (Toro):</Text>
            <Text style={styles.detailValue}>{animal.padreNro || 'No registrado'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Madre:</Text>
            <Text style={styles.detailValue}>{animal.madreNro || 'No registrada'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Peso Nacimiento/Destete:</Text>
            <Text style={styles.detailValue}>{animal.pesoInicial ? `${animal.pesoInicial} kg` : '0 kg'}</Text>
          </View>
          <View style={styles.detailRowNoBorder}>
            <Text style={styles.detailLabel}>Total de Partos:</Text>
            <Text style={styles.detailValue}>{animal.totalPartos}</Text>
          </View>
        </View>

        {/* ── Historial Clínico ── */}
        <Text style={styles.sectionTitle}>Historial Clínico</Text>
        
        <View style={styles.healthCard}>
          <View style={styles.healthLeftWarn}>
            <ActivitySquare size={24} color={COLORES.olivaOscuro} />
          </View>
          <View style={styles.healthCenter}>
            <Text style={styles.healthTitle}>Chequeo Reproductivo</Text>
            <Text style={styles.healthDesc}>Próxima revisión en 15 días</Text>
          </View>
          <View style={styles.healthRightWarn}>
            <Text style={styles.healthAlertText}>Pendiente</Text>
          </View>
        </View>

        <View style={styles.healthCard}>
          <View style={styles.healthLeftOk}>
            <Stethoscope size={24} color={COLORES.verdeEsmeralda} />
          </View>
          <View style={styles.healthCenter}>
            <Text style={styles.healthTitle}>Sanidad al día</Text>
            <Text style={styles.healthDesc}>Esquema de vacunación completo</Text>
          </View>
        </View>

      </ScrollView>

      {/* Formulario Editar Modal */}
      <FormularioAnimalModal
        visible={mostrarModalEdit}
        animalEditar={animal}
        onCerrar={() => setMostrarModalEdit(false)}
        onAnimalGuardado={cargarDatosAnimal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORES.fondoApp,
  },
  containerCentro: {
    flex: 1,
    backgroundColor: COLORES.fondoApp,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  textoNoEncontrado: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORES.tealOscuro,
    marginBottom: 16,
  },
  btnVolver: {
    backgroundColor: COLORES.verdeEsmeralda,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  textoBtnVolver: {
    color: COLORES.blanco,
    fontWeight: '700',
  },
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 60,
  },
  headerRightActions: {
    flexDirection: 'row',
    gap: 8,
  },
  btnNav: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORES.blanco,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  btnNavEliminar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORES.rojoClaro,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORES.rojoError,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORES.tealOscuro,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  scrollPadding: {
    paddingHorizontal: 20,
    paddingBottom: 60,
    paddingTop: 16,
  },
  
  // Hero Premium (Dark Mode)
  heroCard: {
    backgroundColor: COLORES.verdeOscuro,
    borderRadius: 32,
    padding: 28,
    marginBottom: 32,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: COLORES.verdeOscuro,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  heroBgPattern1: {
    position: 'absolute',
    top: -80,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORES.tealOscuro,
    opacity: 0.5,
  },
  heroBgPattern2: {
    position: 'absolute',
    bottom: -60,
    left: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORES.verdeEsmeralda,
    opacity: 0.3,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  idBadgeDark: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.limaTransparente15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: COLORES.limaTransparente30,
  },
  idBadgeTextDark: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORES.limaBrillante,
    letterSpacing: 1,
    marginLeft: 4,
  },
  heroCenter: {
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  areteGiant: {
    fontSize: 56,
    fontWeight: '900',
    color: COLORES.blanco,
    letterSpacing: -2,
    lineHeight: 64,
  },
  nombreDark: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORES.verdeMentha,
    letterSpacing: 0.5,
  },
  heroBottomRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  heroTagDark: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.blancoTransparente10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
  },
  iconoTag: {
    marginRight: 6,
  },
  heroTagTextDark: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORES.blanco,
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  
  // Hero Status Dynamic Styles
  heroStatusLactancia: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORES.limaBrillante, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100 },
  heroDotLactancia: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORES.verdeOscuro, marginRight: 8 },
  heroTextLactancia: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, color: COLORES.verdeOscuro },

  heroStatusPrenada: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORES.azulRey, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100 },
  heroDotPrenada: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORES.blanco, marginRight: 8 },
  heroTextPrenada: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, color: COLORES.blanco },

  heroStatusSecado: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORES.limaClaro, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100 },
  heroDotSecado: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORES.olivaOscuro, marginRight: 8 },
  heroTextSecado: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, color: COLORES.olivaOscuro },

  heroStatusVacia: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORES.textoMudo, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100 },
  heroDotVacia: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORES.blanco, marginRight: 8 },
  heroTextVacia: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, color: COLORES.blanco },

  heroStatusDefault: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORES.blancoTransparente20, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100 },
  heroDotDefault: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORES.blanco, marginRight: 8 },
  heroTextDefault: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, color: COLORES.blanco },

  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORES.textoMudo,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 16,
    marginLeft: 4,
  },
  
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  tarjetaGlassOuter: {
    flex: 1,
    height: 140,
    backgroundColor: 'transparent',
    borderRadius: 24,
    padding: 2,
    overflow: 'hidden',
  },
  glowingBlob: {
    position: 'absolute',
    bottom: -30,
    right: -20,
    width: 120,
    height: 120,
  },
  tarjetaGlassInner: {
    flex: 1,
    backgroundColor: COLORES.blancoTransparente45,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1.5,
    borderColor: COLORES.blancoTransparente70,
    justifyContent: 'space-between',
  },
  gridHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconMilk: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORES.verdeMentha,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  iconWeight: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORES.verdeMentha,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORES.tealOscuro,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricValue: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORES.verdeOscuro,
    letterSpacing: -1,
  },
  metricUnit: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORES.limaBrillante,
    marginLeft: 6,
  },
  
  detailsCard: {
    backgroundColor: COLORES.blanco,
    borderRadius: 24,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORES.bordeClaro,
  },
  detailRowNoBorder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORES.textoMudo,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORES.tealOscuro,
  },

  healthCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.blanco,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  healthLeftWarn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORES.limaClaro,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  healthLeftOk: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORES.verdeMentha,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  healthCenter: {
    flex: 1,
  },
  healthTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORES.tealOscuro,
    marginBottom: 4,
  },
  healthDesc: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORES.textoMudo,
  },
  healthRightWarn: {
    backgroundColor: COLORES.limaClaro,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: COLORES.olivaOscuro,
  },
  healthAlertText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORES.olivaOscuro,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  }
});
