import React, { useState } from 'react';
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
  ChevronRight,
  FileText,
  Droplet,
  ShieldCheck,
  Search,
  Sparkles,
  Info,
} from 'lucide-react-native';
import { COLORES } from '../../shared/theme/colores';
import { useReportes } from '../../features/reportes/hooks/useReportes';

const NOMBRES_MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export default function PantallaReportes() {
  const router = useRouter();
  const { generando, exportarReporteProduccion, exportarReporteSanidad } = useReportes();

  const fechaActual = new Date();
  const [mesProduccion, setMesProduccion] = useState<number>(fechaActual.getMonth() + 1);
  const [anioProduccion, setAnioProduccion] = useState<number>(fechaActual.getFullYear());

  const [mesSanidad, setMesSanidad] = useState<number>(fechaActual.getMonth() + 1);
  const [anioSanidad, setAnioSanidad] = useState<number>(fechaActual.getFullYear());

  const retrocederMesProduccion = () => {
    if (mesProduccion === 1) {
      setMesProduccion(12);
      setAnioProduccion((a) => a - 1);
    } else {
      setMesProduccion((m) => m - 1);
    }
  };

  const avanzarMesProduccion = () => {
    if (mesProduccion === 12) {
      setMesProduccion(1);
      setAnioProduccion((a) => a + 1);
    } else {
      setMesProduccion((m) => m + 1);
    }
  };

  const retrocederMesSanidad = () => {
    if (mesSanidad === 1) {
      setMesSanidad(12);
      setAnioSanidad((a) => a - 1);
    } else {
      setMesSanidad((m) => m - 1);
    }
  };

  const avanzarMesSanidad = () => {
    if (mesSanidad === 12) {
      setMesSanidad(1);
      setAnioSanidad((a) => a + 1);
    } else {
      setMesSanidad((m) => m + 1);
    }
  };

  const handleGenerarReporteProduccion = async () => {
    try {
      await exportarReporteProduccion(anioProduccion, mesProduccion);
    } catch (err) {
      if (err instanceof Error) {
        Alert.alert('Error al generar reporte', err.message);
      }
    }
  };

  const handleGenerarReporteSanidad = async () => {
    try {
      await exportarReporteSanidad(anioSanidad, mesSanidad);
    } catch (err) {
      if (err instanceof Error) {
        Alert.alert('Error al generar reporte', err.message);
      }
    }
  };

  return (
    <SafeAreaView style={styles.contenedor} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />

      {/* Header superior */}
      <View style={styles.headerNav}>
        <Pressable onPress={() => router.back()} style={styles.btnVolver}>
          <ChevronLeft size={24} color={COLORES.tealOscuro} />
        </Pressable>
        <Text style={styles.headerTitulo}>Reportes y Exportación</Text>
        <View style={styles.espaciadorHeader} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContenido}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Informativo */}
        <View style={styles.bannerInformativo}>
          <View style={styles.bannerIconoContenedor}>
            <Sparkles size={20} color={COLORES.verdeEsmeralda} />
          </View>
          <View style={styles.bannerTextos}>
            <Text style={styles.bannerTitulo}>Exportación Local a PDF</Text>
            <Text style={styles.bannerSubtitulo}>
              Genera documentos profesionales para impresión o compartir por WhatsApp sin necesidad de conexión a internet.
            </Text>
          </View>
        </View>

        {/* Sección 1: Reporte de Producción */}
        <View style={styles.tarjetaSeccion}>
          <View style={styles.cabeceraTarjeta}>
            <View style={styles.iconoSeccionVerde}>
              <Droplet size={20} color={COLORES.verdeEsmeralda} />
            </View>
            <View style={styles.titulosSeccion}>
              <Text style={styles.tituloTarjeta}>Reporte Mensual de Producción</Text>
              <Text style={styles.subtituloTarjeta}>
                Litros totales, promedio PDP, detalle diario y ranking del hato.
              </Text>
            </View>
          </View>

          {/* Selector Mes / Año */}
          <View style={styles.selectorFechaContenedor}>
            <Pressable onPress={retrocederMesProduccion} style={styles.btnSelectorFecha}>
              <ChevronLeft size={20} color={COLORES.tealOscuro} />
            </Pressable>
            <View style={styles.etiquetaFechaContenedor}>
              <Text style={styles.textoMesSelector}>
                {NOMBRES_MESES[mesProduccion - 1]}
              </Text>
              <Text style={styles.textoAnioSelector}>{anioProduccion}</Text>
            </View>
            <Pressable onPress={avanzarMesProduccion} style={styles.btnSelectorFecha}>
              <ChevronRight size={20} color={COLORES.tealOscuro} />
            </Pressable>
          </View>

          {/* Botón Acción */}
          <Pressable
            style={styles.btnPrimario}
            onPress={handleGenerarReporteProduccion}
            disabled={generando}
          >
            {generando ? (
              <ActivityIndicator size="small" color={COLORES.blanco} />
            ) : (
              <>
                <FileText size={18} color={COLORES.blanco} />
                <Text style={styles.textoBtnPrimario}>Generar PDF de Producción</Text>
              </>
            )}
          </Pressable>
        </View>

        {/* Sección 2: Reporte Sanitario */}
        <View style={styles.tarjetaSeccion}>
          <View style={styles.cabeceraTarjeta}>
            <View style={styles.iconoSeccionAzul}>
              <ShieldCheck size={20} color={COLORES.azulRey} />
            </View>
            <View style={styles.titulosSeccion}>
              <Text style={styles.tituloTarjeta}>Reporte Mensual Sanitario</Text>
              <Text style={styles.subtituloTarjeta}>
                Vacunaciones, desparasitaciones, tratamientos y próximas dosis.
              </Text>
            </View>
          </View>

          {/* Selector Mes / Año */}
          <View style={styles.selectorFechaContenedor}>
            <Pressable onPress={retrocederMesSanidad} style={styles.btnSelectorFecha}>
              <ChevronLeft size={20} color={COLORES.tealOscuro} />
            </Pressable>
            <View style={styles.etiquetaFechaContenedor}>
              <Text style={styles.textoMesSelector}>
                {NOMBRES_MESES[mesSanidad - 1]}
              </Text>
              <Text style={styles.textoAnioSelector}>{anioSanidad}</Text>
            </View>
            <Pressable onPress={avanzarMesSanidad} style={styles.btnSelectorFecha}>
              <ChevronRight size={20} color={COLORES.tealOscuro} />
            </Pressable>
          </View>

          {/* Botón Acción */}
          <Pressable
            style={styles.btnSecundario}
            onPress={handleGenerarReporteSanidad}
            disabled={generando}
          >
            {generando ? (
              <ActivityIndicator size="small" color={COLORES.blanco} />
            ) : (
              <>
                <FileText size={18} color={COLORES.blanco} />
                <Text style={styles.textoBtnPrimario}>Generar PDF Sanitario</Text>
              </>
            )}
          </Pressable>
        </View>

        {/* Sección 3: Fichas de Animales */}
        <View style={styles.tarjetaSeccion}>
          <View style={styles.cabeceraTarjeta}>
            <View style={styles.iconoSeccionLima}>
              <Search size={20} color={COLORES.olivaOscuro} />
            </View>
            <View style={styles.titulosSeccion}>
              <Text style={styles.tituloTarjeta}>Fichas Individuales de Animales</Text>
              <Text style={styles.subtituloTarjeta}>
                Genealogía, curva de leche, ceba y tratamientos de cada animal.
              </Text>
            </View>
          </View>

          <View style={styles.cajaNota}>
            <Info size={18} color={COLORES.textoMudo} />
            <Text style={styles.textoNota}>
              Puedes exportar la ficha completa en PDF directamente desde el detalle de cada animal en el rebaño.
            </Text>
          </View>

          <Pressable
            style={styles.btnIrRebano}
            onPress={() => router.push('/(tabs)/rebano')}
          >
            <Search size={18} color={COLORES.tealOscuro} />
            <Text style={styles.textoBtnIrRebano}>Seleccionar Animal del Rebaño</Text>
          </Pressable>
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
    borderRadius: 20,
    backgroundColor: COLORES.fondoApp,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORES.tealOscuro,
  },
  espaciadorHeader: {
    width: 40,
  },
  scrollContenido: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  bannerInformativo: {
    flexDirection: 'row',
    backgroundColor: COLORES.verdeMentha,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORES.bordeTarjeta,
  },
  bannerIconoContenedor: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORES.blanco,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTextos: {
    flex: 1,
  },
  bannerTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORES.verdeOscuro,
  },
  bannerSubtitulo: {
    fontSize: 12,
    color: COLORES.verdeOscuro,
    marginTop: 2,
    lineHeight: 16,
  },
  tarjetaSeccion: {
    backgroundColor: COLORES.blanco,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  cabeceraTarjeta: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconoSeccionVerde: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORES.verdeMentha,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconoSeccionAzul: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORES.aquaClaro,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconoSeccionLima: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORES.limaClaro,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulosSeccion: {
    flex: 1,
  },
  tituloTarjeta: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORES.tealOscuro,
  },
  subtituloTarjeta: {
    fontSize: 12,
    color: COLORES.textoMudo,
    marginTop: 2,
    lineHeight: 16,
  },
  selectorFechaContenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORES.fondoApp,
    borderRadius: 12,
    padding: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  btnSelectorFecha: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORES.blanco,
    alignItems: 'center',
    justifyContent: 'center',
  },
  etiquetaFechaContenedor: {
    alignItems: 'center',
  },
  textoMesSelector: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORES.tealOscuro,
  },
  textoAnioSelector: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORES.textoMudo,
  },
  btnPrimario: {
    backgroundColor: COLORES.verdeEsmeralda,
    borderRadius: 12,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnSecundario: {
    backgroundColor: COLORES.azulRey,
    borderRadius: 12,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  textoBtnPrimario: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORES.blanco,
  },
  cajaNota: {
    flexDirection: 'row',
    backgroundColor: COLORES.fondoApp,
    borderRadius: 12,
    padding: 12,
    gap: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  textoNota: {
    fontSize: 12,
    color: COLORES.textoMudo,
    flex: 1,
    lineHeight: 16,
  },
  btnIrRebano: {
    borderWidth: 1.5,
    borderColor: COLORES.tealOscuro,
    borderRadius: 12,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORES.blanco,
  },
  textoBtnIrRebano: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORES.tealOscuro,
  },
});
