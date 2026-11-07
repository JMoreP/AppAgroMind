import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  StatusBar, 
  ActivityIndicator, 
  Alert,
  Modal,
  TextInput
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
  Tag,
  AlertCircle,
  HeartPulse,
  Baby,
  Beef,
  CheckCircle2,
  Scale,
  Target,
  Syringe,
  Share2,
  AlertTriangle,
  LogOut,
  RotateCcw,
} from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useReportes } from '../../features/reportes/hooks/useReportes';
import { Animal } from '../../features/animales/types/Animal';
import { AnimalRepository } from '../../features/animales/repositories/AnimalRepository';
import { FormularioAnimalModal } from '../../features/animales/components/FormularioAnimalModal';
import { useHistorialLeche } from '../../features/ordeno/hooks/useHistorialLeche';
import { TarjetasResumenPDP } from '../../features/ordeno/components/TarjetasResumenPDP';
import { AlertaCaidaProduccion } from '../../features/ordeno/components/AlertaCaidaProduccion';
import { GraficaProduccionLeche } from '../../features/ordeno/components/GraficaProduccionLeche';
import { ListaHistorialPesajes } from '../../features/ordeno/components/ListaHistorialPesajes';
import { useServicioAnimal } from '../../features/reproduccion/hooks/useServicioAnimal';
import { FormularioServicioModal } from '../../features/reproduccion/components/FormularioServicioModal';
import { HistorialServicios } from '../../features/reproduccion/components/HistorialServicios';
import { useDiagnosticoAnimal } from '../../features/reproduccion/hooks/useDiagnosticoAnimal';
import { FormularioDiagnosticoModal } from '../../features/reproduccion/components/FormularioDiagnosticoModal';
import { HistorialDiagnosticos } from '../../features/reproduccion/components/HistorialDiagnosticos';
import { usePartosAnimal } from '../../features/reproduccion/hooks/usePartosAnimal';
import { FormularioPartoModal } from '../../features/reproduccion/components/FormularioPartoModal';
import { HistorialPartos } from '../../features/reproduccion/components/HistorialPartos';
import { useCebaAnimal } from '../../features/carne/hooks/useCebaAnimal';
import { FormularioCebaModal } from '../../features/carne/components/FormularioCebaModal';
import { GraficaCrecimiento } from '../../features/carne/components/GraficaCrecimiento';
import { ProyeccionFaena } from '../../features/carne/components/ProyeccionFaena';
import {
  determinarEtapaActual,
  calcularPesoActual,
  calcularDiasCeba,
  calcularGananciaPesoDiaria,
  construirSerieCrecimiento,
  obtenerPesoObjetivoPorEspecie,
} from '../../features/carne/utils/calculosCeba';
import { useEventosAnimal } from '../../features/sanidad/hooks/useEventosAnimal';
import { FormularioEventoSanitarioModal } from '../../features/sanidad/components/FormularioEventoSanitarioModal';
import { HistorialEventosSanitarios } from '../../features/sanidad/components/HistorialEventosSanitarios';
import { useBajasAnimal } from '../../features/sanidad/hooks/useBajasAnimal';
import { FormularioMortalidadModal } from '../../features/sanidad/components/FormularioMortalidadModal';
import { FormularioDescarteModal } from '../../features/sanidad/components/FormularioDescarteModal';
import { DestinoDescarte } from '../../features/sanidad/types/BajaAnimal';
import {
  labelTipoEvento,
  diasHastaFecha,
} from '../../features/sanidad/utils/calculosSanidad';
import {
  calcularCategoriaEtaria,
  obtenerNombreAnimal,
  obtenerNombrePlural,
} from '../../shared/config/configuracionEspecie';
import { COLORES } from '../../shared/theme/colores';

function labelDestinoDescarte(destino: DestinoDescarte): string {
  switch (destino) {
    case 'matadero': return 'Matadero';
    case 'venta': return 'Venta';
    case 'consumo_interno': return 'Consumo Interno';
    case 'otro': return 'Otro';
    default: return destino;
  }
}

export default function PantallaDetalleAnimal() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const idAnimal = params.id;

  const [animal, setAnimal] = useState<Animal | null>(null);
  const [cargando, setCargando] = useState(true);
  const [mostrarModalEdit, setMostrarModalEdit] = useState(false);
  const [mostrarModalServicio, setMostrarModalServicio] = useState(false);
  const [mostrarModalDiagnostico, setMostrarModalDiagnostico] = useState(false);
  const [mostrarModalParto, setMostrarModalParto] = useState(false);
  const [mostrarModalCeba, setMostrarModalCeba] = useState(false);
  const [mostrarModalPesoObjetivo, setMostrarModalPesoObjetivo] = useState(false);
  const [mostrarModalSanidad, setMostrarModalSanidad] = useState(false);
  const [mostrarModalMortalidad, setMostrarModalMortalidad] = useState(false);
  const [mostrarModalDescarte, setMostrarModalDescarte] = useState(false);
  const [nuevoPesoObjetivo, setNuevoPesoObjetivo] = useState('450');
  const [rangoGrafica, setRangoGrafica] = useState<'7d' | '30d'>('7d');

  const {
    mortalidad,
    descarte,
    estaMuerta,
    estaDescartada,
    estaActiva,
    cargando: cargandoBajas,
    recargar: recargarBajas,
    registrarMuerte,
    registrarDescarte,
    eliminarBaja,
  } = useBajasAnimal(idAnimal);

  const {
    puntosGrafica,
    pesajesDetallados,
    resumenPDP,
    recargar: recargarHistorial,
  } = useHistorialLeche(idAnimal);

  const {
    servicios,
    tieneServicioPendiente,
    diasDesdeServicio,
    enVentanaPalpacion,
    recargar: recargarServicios,
    crearServicio,
    eliminarServicio,
  } = useServicioAnimal(idAnimal);

  const {
    diagnosticos,
    recargar: recargarDiagnosticos,
    crearDiagnostico,
    eliminarDiagnostico,
  } = useDiagnosticoAnimal(idAnimal);

  const {
    partos,
    recargar: recargarPartos,
    crearParto,
    eliminarParto,
  } = usePartosAnimal(idAnimal);

  const {
    cebas,
    cebaActual,
    recargar: recargarCeba,
    crearCeba,
    actualizarCeba,
  } = useCebaAnimal(idAnimal);

  const {
    eventos: eventosSanidad,
    proximaDosis: proximaDosisSanidad,
    tieneAlertaActiva: tieneAlertaSanidadActiva,
    tieneEventoVencido: tieneEventoSanidadVencido,
    recargar: recargarEventosSanidad,
    crearEvento: crearEventoSanidad,
    eliminarEvento: eliminarEventoSanidad,
  } = useEventosAnimal(idAnimal);

  const { exportarFichaAnimal, generando: exportandoPDF } = useReportes();

  const handleExportarPDF = async () => {
    if (!idAnimal || exportandoPDF) return;
    try {
      await exportarFichaAnimal(idAnimal);
    } catch (err) {
      if (err instanceof Error) {
        Alert.alert('Error al exportar', err.message);
      }
    }
  };

  const cargarDatosAnimal = useCallback(async () => {
    if (!idAnimal) return;
    setCargando(true);
    try {
      const data = await AnimalRepository.getById(idAnimal);
      setAnimal(data);
      if (data) {
        setNuevoPesoObjetivo(String(obtenerPesoObjetivoPorEspecie(data.especie || 'bufalino')));
      }
      await Promise.all([
        recargarHistorial(),
        recargarServicios(),
        recargarPartos(),
        recargarCeba(),
        recargarEventosSanidad(),
        recargarBajas(),
      ]);
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Error al cargar animal por ID:', error.message);
      }
    } finally {
      setCargando(false);
    }
  }, [idAnimal, recargarHistorial, recargarServicios, recargarPartos, recargarCeba, recargarEventosSanidad, recargarBajas]);

  const confirmarReactivarAnimal = () => {
    Alert.alert(
      'Revertir Baja del Animal',
      '¿Deseas eliminar este registro de baja y reactivar al animal como productivo en el hato?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reactivar Animal',
          style: 'default',
          onPress: async () => {
            try {
              await eliminarBaja();
              await cargarDatosAnimal();
            } catch (err) {
              if (err instanceof Error) {
                Alert.alert('Error al reactivar', err.message);
              }
            }
          },
        },
      ]
    );
  };

  const confirmarFinalizarCeba = (idCeba: string) => {
    Alert.alert(
      'Finalizar Ceba',
      '¿Deseas dar por finalizado el ciclo de ceba actual para este animal?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Finalizar',
          style: 'destructive',
          onPress: async () => {
            try {
              await actualizarCeba(idCeba, { activo: 0 });
              await recargarCeba();
            } catch (error) {
              if (error instanceof Error) {
                console.warn('Error al finalizar ceba:', error.message);
              }
            }
          },
        },
      ]
    );
  };

  const etapaActualCeba = cebaActual ? determinarEtapaActual(cebaActual) : 'I';
  const pesoActualCeba = cebaActual ? calcularPesoActual(cebaActual) : 0;
  const fechaUltimoCeba = cebaActual ? (
    etapaActualCeba === 'IV' && cebaActual.fechaIV ? cebaActual.fechaIV :
    etapaActualCeba === 'III' && cebaActual.fechaIII ? cebaActual.fechaIII :
    etapaActualCeba === 'II' && cebaActual.fechaII ? cebaActual.fechaII :
    cebaActual.fechaInicio
  ) : '';
  const diasEnCeba = cebaActual ? calcularDiasCeba(cebaActual.fechaInicio, fechaUltimoCeba) : 0;
  const gpCeba = (cebaActual && cebaActual.pesoI) ? calcularGananciaPesoDiaria(cebaActual.pesoI, pesoActualCeba, diasEnCeba) : 0;
  const cebasPasadas = cebas.filter((c) => c.activo === 0);

  const obtenerEstiloGp = (gp: number) => {
    if (gp >= 0.8) return styles.valorMetricaCebaVerde;
    if (gp >= 0.4) return styles.valorMetricaCebaAmbar;
    return styles.valorMetricaCebaRojo;
  };

  useEffect(() => {
    cargarDatosAnimal();
  }, [cargarDatosAnimal]);

  const confirmarEliminacion = () => {
    if (!animal) return;

    const nombreEspecie = obtenerNombreAnimal(animal.especie || 'bufalino', animal.sexo).toLowerCase();
    Alert.alert(
      'Confirmar Eliminación',
      `¿Deseas dar de baja a ${nombreEspecie} #${animal.arete}? El registro pasará a estado "descartada".`,
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
      case 'servida': return styles.heroStatusServida;
      case 'preñada': return styles.heroStatusPrenada;
      case 'secado': return styles.heroStatusSecado;
      case 'vacia': return styles.heroStatusVacia;
      default: return styles.heroStatusDefault;
    }
  };

  const getStatusHeroDotStyle = () => {
    switch(animal.estadoReproductivo) {
      case 'lactancia': return styles.heroDotLactancia;
      case 'servida': return styles.heroDotServida;
      case 'preñada': return styles.heroDotPrenada;
      case 'secado': return styles.heroDotSecado;
      case 'vacia': return styles.heroDotVacia;
      default: return styles.heroDotDefault;
    }
  };

  const getStatusHeroTextStyle = () => {
    switch(animal.estadoReproductivo) {
      case 'lactancia': return styles.heroTextLactancia;
      case 'servida': return styles.heroTextServida;
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
          <Pressable
            onPress={handleExportarPDF}
            style={styles.btnNav}
            disabled={exportandoPDF}
          >
            {exportandoPDF ? (
              <ActivityIndicator size="small" color={COLORES.verdeEsmeralda} />
            ) : (
              <Share2 size={18} color={COLORES.tealOscuro} />
            )}
          </Pressable>
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
            <Text style={styles.nombreDark}>
              {animal.nombre || `${obtenerNombreAnimal(animal.especie || 'bufalino', animal.sexo)} S/N`}
            </Text>
          </View>
          
          <View style={styles.heroBottomRow}>
            <View style={styles.heroTagDark}>
              <Text style={styles.heroTagTextDark}>
                {animal.especie === 'bovino' ? '🐄 Bov' : '🐃 Buf'}
              </Text>
            </View>
            <View style={styles.heroTagDark}>
              <Text style={styles.heroTagTextDark}>
                {calcularCategoriaEtaria(animal.fechaNacimiento, animal.totalPartos, animal.sexo, animal.especie || 'bufalino')}
              </Text>
            </View>
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

        {/* ── Sección Estado del Animal ── */}
        <Text style={styles.sectionTitle}>Estado del Animal</Text>
        <View style={styles.tarjetaEstadoAnimal}>
          {estaActiva ? (
            <View style={styles.contenidoEstadoActivo}>
              <View style={styles.filaEstadoActivo}>
                <View style={styles.badgeEstadoActivo}>
                  <CheckCircle2 size={16} color={COLORES.verdeEsmeralda} />
                  <Text style={styles.textoBadgeEstadoActivo}>Animal Activo en el Hato</Text>
                </View>
                <Text style={styles.subtextoEstadoActivo}>
                  Este animal forma parte del rebaño productivo activo.
                </Text>
              </View>

              <View style={styles.filaBotonesBaja}>
                <Pressable
                  style={styles.botonRegistrarMuerte}
                  onPress={() => setMostrarModalMortalidad(true)}
                >
                  <AlertTriangle size={15} color={COLORES.rojoError} />
                  <Text style={styles.textoBotonRegistrarMuerte}>Registrar Muerte</Text>
                </Pressable>

                <Pressable
                  style={styles.botonRegistrarDescarte}
                  onPress={() => setMostrarModalDescarte(true)}
                >
                  <LogOut size={15} color={COLORES.ambarOscuro} />
                  <Text style={styles.textoBotonRegistrarDescarte}>Registrar Descarte</Text>
                </Pressable>
              </View>
            </View>
          ) : estaMuerta && mortalidad ? (
            <View style={styles.bannerMortalidadGrande}>
              <View style={styles.headerBannerMortalidad}>
                <AlertTriangle size={24} color={COLORES.rojoError} />
                <View style={styles.infoMortalidadHeader}>
                  <Text style={styles.tituloBannerMortalidad}>
                    {`🚨 Este animal está marcado como MUERTO el ${mortalidad.fecha}`}
                  </Text>
                  <Text style={styles.causaMortalidad}>
                    {`Causa: ${mortalidad.causa}`}
                  </Text>
                  {mortalidad.observaciones ? (
                    <Text style={styles.observacionesBaja}>
                      {`Observaciones: ${mortalidad.observaciones}`}
                    </Text>
                  ) : null}
                </View>
              </View>
              <Pressable
                style={styles.botonEliminarBaja}
                onPress={confirmarReactivarAnimal}
              >
                <RotateCcw size={15} color={COLORES.rojoError} />
                <Text style={styles.textoBotonEliminarBaja}>Eliminar registro de muerte</Text>
              </Pressable>
            </View>
          ) : estaDescartada && descarte ? (
            <View style={styles.bannerDescarteGrande}>
              <View style={styles.headerBannerDescarte}>
                <LogOut size={24} color={COLORES.ambarOscuro} />
                <View style={styles.infoDescarteHeader}>
                  <Text style={styles.tituloBannerDescarte}>
                    {`📤 Este animal fue DESCARTADO el ${descarte.fecha}`}
                  </Text>
                  <Text style={styles.destinoDescarte}>
                    {`Destino: ${labelDestinoDescarte(descarte.destino)}${descarte.precio ? ` • $${descarte.precio.toFixed(2)}` : ''}`}
                  </Text>
                  {descarte.observaciones ? (
                    <Text style={styles.observacionesBaja}>
                      {`Observaciones: ${descarte.observaciones}`}
                    </Text>
                  ) : null}
                </View>
              </View>
              <Pressable
                style={styles.botonEliminarBajaDescarte}
                onPress={confirmarReactivarAnimal}
              >
                <RotateCcw size={15} color={COLORES.ambarOscuro} />
                <Text style={styles.textoBotonEliminarBajaDescarte}>Eliminar registro de descarte</Text>
              </Pressable>
            </View>
          ) : null}
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

        {/* ── Sección Reproducción ── */}
        <Text style={styles.sectionTitle}>Reproducción</Text>
        {animal.sexo === 'H' ? (
          <View style={styles.contenedorReproduccion}>
            {!estaActiva && (
              <View style={styles.bannerOperacionesDeshabilitadas}>
                <AlertCircle size={14} color={COLORES.rojoError} />
                <Text style={styles.textoOperacionesDeshabilitadas}>
                  Este animal no está activo. Las operaciones están deshabilitadas.
                </Text>
              </View>
            )}

            {/* Botón Grande Registrar Servicio */}
            <Pressable
              style={[styles.botonRegistrarServicio, !estaActiva && styles.botonDeshabilitadoGeneral]}
              onPress={() => setMostrarModalServicio(true)}
              disabled={!estaActiva}
            >
              <HeartPulse size={18} color={COLORES.blanco} style={styles.iconoBotonServicio} />
              <Text style={styles.textoBotonRegistrarServicio}>Registrar Servicio</Text>
            </Pressable>

            {/* Banner Ámbar si tiene servicio pendiente */}
            {tieneServicioPendiente && (
              <View style={styles.bannerServicioPendiente}>
                <View style={styles.filaBannerPendiente}>
                  <AlertCircle size={18} color={COLORES.ambarOscuro} />
                  <Text style={styles.textoBannerPendiente}>
                    Servicio pendiente de diagnóstico. Días desde el servicio: {diasDesdeServicio ?? 0}
                  </Text>
                </View>
                {enVentanaPalpacion && (
                  <View style={styles.badgeVentanaPalpacion}>
                    <Text style={styles.textoBadgeVentana}>
                      ⚠️ Ventana de palpación recomendada (45-60 días)
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Botón Grande Registrar Palpación */}
            {tieneServicioPendiente && (
              <Pressable
                style={[styles.botonRegistrarPalpacion, !estaActiva && styles.botonDeshabilitadoGeneral]}
                onPress={() => setMostrarModalDiagnostico(true)}
                disabled={!estaActiva}
              >
                <Stethoscope size={18} color={COLORES.verdeOscuro} style={styles.iconoBotonServicio} />
                <Text style={styles.textoBotonRegistrarPalpacion}>Registrar Palpación</Text>
              </Pressable>
            )}

            {/* Historial de Servicios */}
            <HistorialServicios
              servicios={servicios}
              onEliminar={async (id) => {
                await eliminarServicio(id);
                await cargarDatosAnimal();
              }}
            />

            {/* Historial de Diagnósticos */}
            <Text style={styles.subtituloSeccionReproduccion}>Diagnósticos de Preñez</Text>
            <HistorialDiagnosticos
              diagnosticos={diagnosticos}
              onEliminar={async (id) => {
                await eliminarDiagnostico(id);
                await recargarServicios();
                await cargarDatosAnimal();
              }}
            />

            {/* Botón Grande Registrar Parto */}
            {animal.estadoReproductivo === 'preñada' || animal.estadoReproductivo === 'lactancia' ? (
              <Pressable
                style={[styles.botonRegistrarParto, !estaActiva && styles.botonDeshabilitadoGeneral]}
                onPress={() => setMostrarModalParto(true)}
                disabled={!estaActiva}
              >
                <Baby size={18} color={COLORES.blanco} style={styles.iconoBotonServicio} />
                <Text style={styles.textoBotonRegistrarParto}>Registrar Parto</Text>
              </Pressable>
            ) : (
              <View style={styles.contenedorBotonPartoDeshabilitado}>
                <View style={styles.botonRegistrarPartoDeshabilitado}>
                  <Baby size={18} color={COLORES.textoMudo} style={styles.iconoBotonServicio} />
                  <Text style={styles.textoBotonRegistrarPartoDeshabilitado}>Registrar Parto</Text>
                </View>
                <Text style={styles.textoTooltipPartoDeshabilitado}>
                  {`Solo disponible para ${obtenerNombrePlural(animal.especie || 'bufalino').toLowerCase()} hembras preñadas o en lactancia`}
                </Text>
              </View>
            )}

            {/* Historial de Partos y Crías */}
            <Text style={styles.subtituloSeccionReproduccion}>Partos y Crías</Text>
            <HistorialPartos
              partos={partos}
              onEliminar={async (id) => {
                await eliminarParto(id);
                await cargarDatosAnimal();
              }}
            />
          </View>
        ) : (
          <View style={styles.cajaMachoReproduccion}>
            <Text style={styles.textoMachoReproduccion}>No aplica para machos</Text>
          </View>
        )}

        {/* ── Sección Ceba / Engorde ── */}
        <Text style={styles.sectionTitle}>Ceba / Engorde</Text>
        <View style={styles.contenedorCeba}>
          {!estaActiva && (
            <View style={styles.bannerOperacionesDeshabilitadas}>
              <AlertCircle size={14} color={COLORES.rojoError} />
              <Text style={styles.textoOperacionesDeshabilitadas}>
                Este animal no está activo. Las operaciones están deshabilitadas.
              </Text>
            </View>
          )}

          {cebaActual ? (
            <React.Fragment>
              <View style={styles.cardResumenCeba}>
              <View style={styles.filaCabeceraCeba}>
                <View>
                  <Text style={styles.labelMetricaCeba}>Ciclo Activo</Text>
                  <Text style={styles.fechaInicioCeba}>Inicio: {cebaActual.fechaInicio}</Text>
                </View>
                <View style={styles.badgeEtapaCeba}>
                  <Text style={styles.textoBadgeEtapaCeba}>Etapa {etapaActualCeba}</Text>
                </View>
              </View>

              <View style={styles.gridMetricasCeba}>
                <View style={styles.metricaCebaItem}>
                  <Text style={styles.labelMetricaCeba}>Peso Actual</Text>
                  <Text style={styles.valorMetricaCeba}>{pesoActualCeba > 0 ? `${pesoActualCeba} kg` : 'N/A'}</Text>
                </View>

                <View style={styles.metricaCebaItem}>
                  <Text style={styles.labelMetricaCeba}>GP Ceba</Text>
                  <Text style={obtenerEstiloGp(gpCeba)}>
                    {gpCeba > 0 ? `${gpCeba.toFixed(2)} kg/d` : '0.00 kg/d'}
                  </Text>
                </View>

                <View style={styles.metricaCebaItem}>
                  <Text style={styles.labelMetricaCeba}>Días en Ceba</Text>
                  <Text style={styles.valorMetricaCeba}>{diasEnCeba} días</Text>
                </View>

                <View style={styles.metricaCebaItem}>
                  <Text style={styles.labelMetricaCeba}>Peso Inicial</Text>
                  <Text style={styles.valorMetricaCeba}>{cebaActual.pesoI ? `${cebaActual.pesoI} kg` : 'N/A'}</Text>
                </View>
              </View>

              <View style={styles.filaBotonesCeba}>
                <Pressable
                  style={[styles.botonActualizarCeba, !estaActiva && styles.botonDeshabilitadoGeneral]}
                  onPress={() => setMostrarModalCeba(true)}
                  disabled={!estaActiva}
                >
                  <Edit3 size={15} color={COLORES.blanco} style={styles.iconoBotonCeba} />
                  <Text style={styles.textoBotonActualizarCeba}>Actualizar Pesaje</Text>
                </Pressable>

                <Pressable
                  style={[styles.botonFinalizarCeba, !estaActiva && styles.botonDeshabilitadoGeneral]}
                  onPress={() => confirmarFinalizarCeba(cebaActual.id)}
                  disabled={!estaActiva}
                >
                  <CheckCircle2 size={15} color={COLORES.rojoError} style={styles.iconoBotonCeba} />
                  <Text style={styles.textoBotonFinalizarCeba}>Finalizar Ceba</Text>
                </Pressable>
              </View>

              <Pressable
                style={[styles.botonAjustarObjetivo, !estaActiva && styles.botonDeshabilitadoGeneral]}
                onPress={() => {
                  setNuevoPesoObjetivo(cebaActual.pesoObjetivo ? cebaActual.pesoObjetivo.toString() : '450');
                  setMostrarModalPesoObjetivo(true);
                }}
                disabled={!estaActiva}
              >
                <Target size={15} color={COLORES.verdeEsmeralda} style={styles.iconoBotonCeba} />
                <Text style={styles.textoBotonAjustarObjetivo}>Ajustar Peso Objetivo</Text>
              </Pressable>
            </View>

            {/* Curva de Crecimiento y Proyección a Faena */}
            <GraficaCrecimiento
              puntos={construirSerieCrecimiento(cebaActual)}
              pesoObjetivo={cebaActual.pesoObjetivo}
            />

            <ProyeccionFaena ceba={cebaActual} />
          </React.Fragment>
        ) : (
            <Pressable
              style={[styles.botonIniciarCeba, !estaActiva && styles.botonDeshabilitadoGeneral]}
              onPress={() => setMostrarModalCeba(true)}
              disabled={!estaActiva}
            >
              <Beef size={18} color={COLORES.blanco} style={styles.iconoBotonCeba} />
              <Text style={styles.textoBotonIniciarCeba}>Iniciar Ceba</Text>
            </Pressable>
          )}

          {/* Historial de cebas pasadas si existen */}
          {cebasPasadas.length > 0 && (
            <View style={styles.contenedorCebasPasadas}>
              <Text style={styles.tituloCebasPasadas}>Cebas Finalizadas ({cebasPasadas.length})</Text>
              {cebasPasadas.map((cPasada) => {
                const etapaP = determinarEtapaActual(cPasada);
                const pesoP = calcularPesoActual(cPasada);
                const fechaFinP = cPasada.fechaIV || cPasada.fechaIII || cPasada.fechaII || cPasada.fechaInicio;
                const diasP = calcularDiasCeba(cPasada.fechaInicio, fechaFinP);
                const gpP = cPasada.pesoI ? calcularGananciaPesoDiaria(cPasada.pesoI, pesoP, diasP) : 0;

                return (
                  <View key={cPasada.id} style={styles.tarjetaCebaPasada}>
                    <Text style={styles.textoCebaPasadaFechas}>
                      {cPasada.fechaInicio} • Etapa {etapaP}
                    </Text>
                    <Text style={styles.textoCebaPasadaDetalles}>
                      Peso: {cPasada.pesoI || 0} kg → {pesoP} kg ({diasP} días) • GP: {gpP.toFixed(2)} kg/día
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* ── Sección Sanidad ── */}
        <Text style={styles.sectionTitle}>Sanidad</Text>
        <View style={styles.contenedorSanidad}>
          {!estaActiva && (
            <View style={styles.bannerOperacionesDeshabilitadas}>
              <AlertCircle size={14} color={COLORES.rojoError} />
              <Text style={styles.textoOperacionesDeshabilitadas}>
                Este animal no está activo. Las operaciones están deshabilitadas.
              </Text>
            </View>
          )}

          {/* Banner Rojo si hay dosis vencida */}
          {tieneEventoSanidadVencido && proximaDosisSanidad && (
            <View style={styles.bannerSanidadVencido}>
              <AlertCircle size={18} color={COLORES.rojoError} />
              <Text style={styles.textoBannerSanidadVencido}>
                {`🚨 Dosis vencida: ${labelTipoEvento(proximaDosisSanidad.tipo)} (${proximaDosisSanidad.proximaDosis})`}
              </Text>
            </View>
          )}

          {/* Banner Ámbar si hay alerta activa (<= 7 días) */}
          {tieneAlertaSanidadActiva && proximaDosisSanidad && !tieneEventoSanidadVencido && (
            <View style={styles.bannerSanidadAlerta}>
              <AlertCircle size={18} color={COLORES.ambarOscuro} />
              <Text style={styles.textoBannerSanidadAlerta}>
                {`⚠️ Próxima dosis en ${diasHastaFecha(proximaDosisSanidad.proximaDosis!)} días: ${labelTipoEvento(proximaDosisSanidad.tipo)}`}
              </Text>
            </View>
          )}

          {/* Botón Grande: Registrar Evento Sanitario */}
          <Pressable
            style={[styles.botonRegistrarSanidad, !estaActiva && styles.botonDeshabilitadoGeneral]}
            onPress={() => setMostrarModalSanidad(true)}
            disabled={!estaActiva}
          >
            <Syringe size={18} color={COLORES.blanco} style={styles.iconoBotonCeba} />
            <Text style={styles.textoBotonRegistrarSanidad}>Registrar Evento Sanitario</Text>
          </Pressable>

          {/* Historial de eventos sanitarios */}
          <HistorialEventosSanitarios
            eventos={eventosSanidad}
            onEliminar={async (id) => {
              await eliminarEventoSanidad(id);
              await recargarEventosSanidad();
            }}
          />
        </View>

        {/* ── Genealogía y Detalles ── */}
        <Text style={styles.sectionTitle}>Genealogía y Detalles</Text>
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Especie:</Text>
            <Text style={styles.detailValue}>
              {animal.especie === 'bovino' ? 'Bovino 🐄' : 'Bufalino 🐃'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Categoría Etaria:</Text>
            <Text style={styles.detailValue}>
              {calcularCategoriaEtaria(animal.fechaNacimiento, animal.totalPartos, animal.sexo, animal.especie || 'bufalino')}
            </Text>
          </View>
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

      {/* Formulario Registrar Servicio Modal */}
      <FormularioServicioModal
        visible={mostrarModalServicio}
        animal={animal}
        animalId={animal.id}
        especie={animal.especie}
        onCerrar={() => setMostrarModalServicio(false)}
        onGuardar={async (datos) => {
          await crearServicio({
            fecha: datos.fecha!,
            tipo: datos.tipo!,
            numeroPajuela: datos.numeroPajuela,
            razaToro: datos.razaToro,
            veterinario: datos.veterinario,
            toroNumero: datos.toroNumero,
            toroRaza: datos.toroRaza,
            observaciones: datos.observaciones,
          });
          await cargarDatosAnimal();
        }}
      />

      {/* Formulario Registrar Diagnóstico Modal */}
      <FormularioDiagnosticoModal
        visible={mostrarModalDiagnostico}
        animal={animal}
        servicioPendiente={servicios.find((s) => s.resultado === 'pendiente') || null}
        onCerrar={() => setMostrarModalDiagnostico(false)}
        onGuardar={async (datos) => {
          await crearDiagnostico({
            servicioId: datos.servicioId,
            fecha: datos.fecha,
            resultado: datos.resultado,
            metodo: datos.metodo,
            veterinario: datos.veterinario,
            observaciones: datos.observaciones,
          });
          await recargarServicios();
          await cargarDatosAnimal();
        }}
      />

      {/* Formulario Registrar Parto Modal */}
      <FormularioPartoModal
        visible={mostrarModalParto}
        animal={animal}
        onCerrar={() => setMostrarModalParto(false)}
        onGuardar={async (datos) => {
          await crearParto(datos);
          await cargarDatosAnimal();
          await recargarServicios();
        }}
      />
      {/* Formulario Ceba Modal */}
      {animal && (
        <FormularioCebaModal
          visible={mostrarModalCeba}
          animal={animal}
          cebaExistente={cebaActual}
          onCerrar={() => setMostrarModalCeba(false)}
          onGuardar={async (datos) => {
            if (cebaActual) {
              await actualizarCeba(cebaActual.id, datos);
            } else if (datos.fechaInicio) {
              await crearCeba({
                fechaInicio: datos.fechaInicio,
                fechaNacimiento: datos.fechaNacimiento,
                pesoDestete: datos.pesoDestete,
                padreNro: datos.padreNro,
                raza: datos.raza,
                pesoI: datos.pesoI,
                fechaII: datos.fechaII,
                pesoII: datos.pesoII,
                fechaIII: datos.fechaIII,
                pesoIII: datos.pesoIII,
                fechaIV: datos.fechaIV,
                pesoIV: datos.pesoIV,
                pesoObjetivo: datos.pesoObjetivo ?? obtenerPesoObjetivoPorEspecie(animal.especie || 'bufalino'),
                observaciones: datos.observaciones,
              });
            }
            await recargarCeba();
          }}
        />
      )}

      {/* Modal Ajustar Peso Objetivo */}
      <Modal
        visible={mostrarModalPesoObjetivo}
        transparent
        animationType="fade"
        onRequestClose={() => setMostrarModalPesoObjetivo(false)}
      >
        <View style={styles.modalFondo}>
          <View style={styles.modalContenedor}>
            <View style={styles.modalCabecera}>
              <Target size={20} color={COLORES.verdeEsmeralda} />
              <Text style={styles.modalTitulo}>Ajustar Peso Objetivo</Text>
            </View>

            <Text style={styles.modalDescripcion}>
              Define el peso en kilogramos (kg) que se espera alcanzar para la faena de este animal.
            </Text>

            <View style={styles.contenedorInputObjetivo}>
              <TextInput
                style={styles.inputObjetivo}
                keyboardType="numeric"
                value={nuevoPesoObjetivo}
                onChangeText={setNuevoPesoObjetivo}
                placeholder="450"
                placeholderTextColor={COLORES.textoMudo}
              />
              <Text style={styles.sufijoKg}>kg</Text>
            </View>

            <View style={styles.modalFilaAcciones}>
              <Pressable
                style={styles.botonModalCancelar}
                onPress={() => setMostrarModalPesoObjetivo(false)}
              >
                <Text style={styles.textoModalCancelar}>Cancelar</Text>
              </Pressable>

              <Pressable
                style={styles.botonModalGuardar}
                onPress={async () => {
                  const pesoNum = parseFloat(nuevoPesoObjetivo.trim());
                  if (!isNaN(pesoNum) && pesoNum > 0 && cebaActual) {
                    await actualizarCeba(cebaActual.id, { pesoObjetivo: pesoNum });
                    await recargarCeba();
                    setMostrarModalPesoObjetivo(false);
                  }
                }}
              >
                <Text style={styles.textoModalGuardar}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Formulario Evento Sanitario Modal */}
      {animal && (
        <FormularioEventoSanitarioModal
          visible={mostrarModalSanidad}
          animal={animal}
          onCerrar={() => setMostrarModalSanidad(false)}
          onGuardar={async (datos) => {
            await crearEventoSanidad(datos);
            await recargarEventosSanidad();
          }}
        />
      )}

      {/* Formulario Mortalidad Modal */}
      {animal && (
        <FormularioMortalidadModal
          visible={mostrarModalMortalidad}
          animal={animal}
          onCerrar={() => setMostrarModalMortalidad(false)}
          onGuardar={async (datos) => {
            await registrarMuerte(datos);
            await cargarDatosAnimal();
          }}
        />
      )}

      {/* Formulario Descarte Modal */}
      {animal && (
        <FormularioDescarteModal
          visible={mostrarModalDescarte}
          animal={animal}
          onCerrar={() => setMostrarModalDescarte(false)}
          onGuardar={async (datos) => {
            await registrarDescarte(datos);
            await cargarDatosAnimal();
          }}
        />
      )}
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

  heroStatusServida: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORES.aquaClaro, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100 },
  heroDotServida: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORES.tealOscuro, marginRight: 8 },
  heroTextServida: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, color: COLORES.tealOscuro },

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
  },
  contenedorReproduccion: {
    marginBottom: 16,
  },
  botonRegistrarServicio: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORES.verdeEsmeralda,
    paddingVertical: 14,
    borderRadius: 20,
    marginBottom: 14,
    shadowColor: COLORES.textoOscuro,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  iconoBotonServicio: {
    marginRight: 8,
  },
  textoBotonRegistrarServicio: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORES.blanco,
    letterSpacing: 0.5,
  },
  bannerServicioPendiente: {
    backgroundColor: COLORES.ambarClaro,
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORES.ambarAlerta,
  },
  filaBannerPendiente: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  textoBannerPendiente: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: COLORES.ambarOscuro,
    lineHeight: 18,
  },
  badgeVentanaPalpacion: {
    backgroundColor: COLORES.blanco,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORES.ambarAlerta,
    alignSelf: 'flex-start',
  },
  textoBadgeVentana: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORES.ambarOscuro,
  },
  botonRegistrarPalpacion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORES.verdeMentha,
    borderRadius: 18,
    paddingVertical: 14,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: COLORES.verdeEsmeralda,
  },
  textoBotonRegistrarPalpacion: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORES.verdeOscuro,
    letterSpacing: 0.5,
  },
  subtituloSeccionReproduccion: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORES.tealOscuro,
    marginTop: 18,
    marginBottom: 8,
  },
  botonRegistrarParto: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORES.azulRey,
    borderRadius: 18,
    paddingVertical: 14,
    marginBottom: 14,
  },
  textoBotonRegistrarParto: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORES.blanco,
    letterSpacing: 0.5,
  },
  contenedorBotonPartoDeshabilitado: {
    marginBottom: 14,
  },
  botonRegistrarPartoDeshabilitado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORES.fondoApp,
    borderRadius: 18,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    opacity: 0.7,
  },
  textoBotonRegistrarPartoDeshabilitado: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORES.textoMudo,
    letterSpacing: 0.5,
  },
  textoTooltipPartoDeshabilitado: {
    fontSize: 11,
    color: COLORES.textoMudo,
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
  cajaMachoReproduccion: {
    backgroundColor: COLORES.blanco,
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    alignItems: 'center',
  },
  textoMachoReproduccion: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORES.textoMudo,
  },
  contenedorCeba: {
    marginBottom: 20,
  },
  botonIniciarCeba: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORES.verdeEsmeralda,
    borderRadius: 18,
    paddingVertical: 14,
    marginBottom: 14,
  },
  textoBotonIniciarCeba: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORES.blanco,
    letterSpacing: 0.5,
  },
  cardResumenCeba: {
    backgroundColor: COLORES.blanco,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    marginBottom: 14,
  },
  filaCabeceraCeba: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  fechaInicioCeba: {
    fontSize: 12,
    color: COLORES.textoSecundario,
    marginTop: 2,
  },
  badgeEtapaCeba: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: COLORES.verdeMentha,
  },
  textoBadgeEtapaCeba: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORES.verdeEsmeralda,
  },
  gridMetricasCeba: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  metricaCebaItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORES.fondoApp,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  labelMetricaCeba: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORES.textoMudo,
    textTransform: 'uppercase',
  },
  valorMetricaCeba: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORES.tealOscuro,
    marginTop: 4,
  },
  valorMetricaCebaVerde: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORES.verdeEsmeralda,
    marginTop: 4,
  },
  valorMetricaCebaAmbar: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORES.ambarOscuro,
    marginTop: 4,
  },
  valorMetricaCebaRojo: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORES.rojoError,
    marginTop: 4,
  },
  filaBotonesCeba: {
    flexDirection: 'row',
    gap: 10,
  },
  botonActualizarCeba: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORES.verdeEsmeralda,
    borderRadius: 14,
    paddingVertical: 12,
  },
  textoBotonActualizarCeba: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORES.blanco,
  },
  botonFinalizarCeba: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORES.rojoClaro,
    borderWidth: 1,
    borderColor: COLORES.rojoClaro,
    borderRadius: 14,
    paddingVertical: 12,
  },
  textoBotonFinalizarCeba: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORES.rojoError,
  },
  contenedorCebasPasadas: {
    marginTop: 4,
  },
  tituloCebasPasadas: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORES.tealOscuro,
    marginBottom: 8,
  },
  tarjetaCebaPasada: {
    backgroundColor: COLORES.blanco,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    marginBottom: 8,
  },
  textoCebaPasadaFechas: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORES.tealOscuro,
  },
  textoCebaPasadaDetalles: {
    fontSize: 11,
    color: COLORES.textoSecundario,
    marginTop: 2,
  },
  iconoBotonCeba: {
    marginRight: 8,
  },
  botonAjustarObjetivo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORES.fondoApp,
    borderWidth: 1,
    borderColor: COLORES.verdeEsmeralda,
    borderRadius: 14,
    paddingVertical: 10,
    marginTop: 10,
  },
  textoBotonAjustarObjetivo: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORES.verdeEsmeralda,
  },
  modalFondo: {
    flex: 1,
    backgroundColor: COLORES.blancoTransparente80,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContenedor: {
    width: '100%',
    backgroundColor: COLORES.blanco,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    shadowColor: COLORES.textoOscuro,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  modalCabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  modalTitulo: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORES.tealOscuro,
  },
  modalDescripcion: {
    fontSize: 12,
    color: COLORES.textoSecundario,
    lineHeight: 18,
    marginBottom: 16,
  },
  contenedorInputObjetivo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.fondoApp,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  inputObjetivo: {
    flex: 1,
    height: 48,
    fontSize: 18,
    fontWeight: '800',
    color: COLORES.tealOscuro,
  },
  sufijoKg: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORES.textoMudo,
  },
  modalFilaAcciones: {
    flexDirection: 'row',
    gap: 12,
  },
  botonModalCancelar: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORES.fondoApp,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  textoModalCancelar: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORES.textoSecundario,
  },
  botonModalGuardar: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORES.verdeEsmeralda,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoModalGuardar: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORES.blanco,
  },
  contenedorSanidad: {
    marginBottom: 20,
  },
  bannerSanidadVencido: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.rojoClaro,
    borderWidth: 1,
    borderColor: COLORES.rojoError,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  textoBannerSanidadVencido: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORES.rojoError,
    flex: 1,
  },
  bannerSanidadAlerta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.ambarClaro,
    borderWidth: 1,
    borderColor: COLORES.ambarAlerta,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  textoBannerSanidadAlerta: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORES.ambarOscuro,
    flex: 1,
  },
  botonRegistrarSanidad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORES.verdeEsmeralda,
    borderRadius: 18,
    paddingVertical: 14,
    marginBottom: 14,
  },
  textoBotonRegistrarSanidad: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORES.blanco,
    letterSpacing: 0.5,
  },
  tarjetaEstadoAnimal: {
    backgroundColor: COLORES.blanco,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    padding: 16,
    marginBottom: 20,
  },
  contenidoEstadoActivo: {
    gap: 14,
  },
  filaEstadoActivo: {
    gap: 6,
  },
  badgeEstadoActivo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: COLORES.fondoApp,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  textoBadgeEstadoActivo: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORES.verdeOscuro,
  },
  subtextoEstadoActivo: {
    fontSize: 13,
    color: COLORES.textoMudo,
    fontWeight: '500',
    lineHeight: 18,
  },
  filaBotonesBaja: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORES.bordeClaro,
  },
  botonRegistrarMuerte: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORES.rojoClaro,
    borderWidth: 1,
    borderColor: COLORES.rojoClaro,
  },
  textoBotonRegistrarMuerte: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORES.rojoError,
  },
  botonRegistrarDescarte: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORES.ambarClaro,
    borderWidth: 1,
    borderColor: COLORES.ambarClaro,
  },
  textoBotonRegistrarDescarte: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORES.ambarOscuro,
  },
  bannerMortalidadGrande: {
    backgroundColor: COLORES.rojoClaro,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORES.rojoError,
    gap: 14,
  },
  headerBannerMortalidad: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  infoMortalidadHeader: {
    flex: 1,
    gap: 4,
  },
  tituloBannerMortalidad: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORES.rojoError,
    lineHeight: 20,
  },
  causaMortalidad: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORES.tealOscuro,
  },
  observacionesBaja: {
    fontSize: 12,
    color: COLORES.textoMudo,
    fontStyle: 'italic',
  },
  botonEliminarBaja: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORES.blanco,
    borderWidth: 1,
    borderColor: COLORES.rojoError,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
  },
  textoBotonEliminarBaja: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORES.rojoError,
  },
  bannerDescarteGrande: {
    backgroundColor: COLORES.ambarClaro,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORES.ambarAlerta,
    gap: 14,
  },
  headerBannerDescarte: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  infoDescarteHeader: {
    flex: 1,
    gap: 4,
  },
  tituloBannerDescarte: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORES.ambarOscuro,
    lineHeight: 20,
  },
  destinoDescarte: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORES.tealOscuro,
  },
  botonEliminarBajaDescarte: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORES.blanco,
    borderWidth: 1,
    borderColor: COLORES.ambarAlerta,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
  },
  textoBotonEliminarBajaDescarte: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORES.ambarOscuro,
  },
  bannerOperacionesDeshabilitadas: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORES.rojoClaro,
    borderWidth: 1,
    borderColor: COLORES.rojoClaro,
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  textoOperacionesDeshabilitadas: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: COLORES.rojoError,
  },
  botonDeshabilitadoGeneral: {
    opacity: 0.45,
  },
});
