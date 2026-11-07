import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
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
  Building2,
  User,
  MapPin,
  Coins,
  Droplet,
  CheckCircle2,
  Database,
  Download,
  Upload,
  RotateCcw,
  Info,
  Shield,
  Sparkles,
  Save,
} from 'lucide-react-native';
import { COLORES } from '../shared/theme/colores';
import { useConfiguracion } from '../features/configuracion/hooks/useConfiguracion';
import { ConfiguracionRepository } from '../features/configuracion/repositories/ConfiguracionRepository';
import {
  MONEDAS_DISPONIBLES,
  ConfiguracionFinca,
} from '../features/configuracion/types/ConfiguracionFinca';

export default function PantallaAjustes() {
  const router = useRouter();
  const { configuracion, cargando, guardarConfiguracion } = useConfiguracion();

  // Estados locales para edición
  const [nombreFinca, setNombreFinca] = useState('');
  const [propietario, setPropietario] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [moneda, setMoneda] = useState('Bs.');
  const [precioLeche, setPrecioLeche] = useState('0');
  const [especies, setEspecies] = useState<Array<'bovino' | 'bufalino'>>(['bufalino']);

  const [guardandoFinca, setGuardandoFinca] = useState(false);
  const [guardandoPreferencias, setGuardandoPreferencias] = useState(false);
  const [guardandoEspecies, setGuardandoEspecies] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  useEffect(() => {
    if (!cargando) {
      setNombreFinca(configuracion.nombre);
      setPropietario(configuracion.propietario);
      setUbicacion(configuracion.ubicacion);
      setMoneda(configuracion.moneda || 'Bs.');
      setPrecioLeche(configuracion.precioLeche ? configuracion.precioLeche.toString() : '0');
      setEspecies(configuracion.especies.length > 0 ? configuracion.especies : ['bufalino']);
    }
  }, [configuracion, cargando]);

  const mostrarExitoTemporal = (mensaje: string) => {
    setMensajeExito(mensaje);
    setTimeout(() => {
      setMensajeExito(null);
    }, 3000);
  };

  const handleGuardarDatosFinca = async () => {
    if (!nombreFinca.trim()) {
      Alert.alert('Campo requerido', 'El nombre de la finca no puede estar vacío.');
      return;
    }
    if (!propietario.trim()) {
      Alert.alert('Campo requerido', 'El nombre del propietario no puede estar vacío.');
      return;
    }

    setGuardandoFinca(true);
    try {
      const payload: ConfiguracionFinca = {
        ...configuracion,
        nombre: nombreFinca.trim(),
        propietario: propietario.trim(),
        ubicacion: ubicacion.trim(),
      };
      await guardarConfiguracion(payload);
      mostrarExitoTemporal('¡Datos de la finca actualizados con éxito!');
    } catch (err) {
      if (err instanceof Error) {
        Alert.alert('Error', err.message);
      }
    } finally {
      setGuardandoFinca(false);
    }
  };

  const handleGuardarPreferencias = async () => {
    let precioNum = 0;
    if (precioLeche.trim()) {
      const limpio = precioLeche.replace(',', '.');
      const parsed = parseFloat(limpio);
      if (isNaN(parsed) || parsed < 0) {
        Alert.alert('Precio inválido', 'Por favor ingresa un precio válido mayor o igual a 0.');
        return;
      }
      precioNum = parsed;
    }

    setGuardandoPreferencias(true);
    try {
      const payload: ConfiguracionFinca = {
        ...configuracion,
        moneda,
        precioLeche: precioNum,
      };
      await guardarConfiguracion(payload);
      mostrarExitoTemporal('¡Preferencias de moneda y leche guardadas!');
    } catch (err) {
      if (err instanceof Error) {
        Alert.alert('Error', err.message);
      }
    } finally {
      setGuardandoPreferencias(false);
    }
  };

  const toggleEspecie = (esp: 'bovino' | 'bufalino') => {
    if (especies.includes(esp)) {
      if (especies.length === 1) {
        Alert.alert('Atención', 'Debes mantener seleccionada al menos una especie en tu finca.');
        return;
      }
      setEspecies(especies.filter((e) => e !== esp));
    } else {
      setEspecies([...especies, esp]);
    }
  };

  const handleGuardarEspecies = async () => {
    if (especies.length === 0) {
      Alert.alert('Especies requeridas', 'Selecciona al menos una especie.');
      return;
    }

    setGuardandoEspecies(true);
    try {
      const payload: ConfiguracionFinca = {
        ...configuracion,
        especies,
      };
      await guardarConfiguracion(payload);
      mostrarExitoTemporal('¡Especies de la finca actualizadas!');
    } catch (err) {
      if (err instanceof Error) {
        Alert.alert('Error', err.message);
      }
    } finally {
      setGuardandoEspecies(false);
    }
  };

  const handleResetearConfiguracion = () => {
    Alert.alert(
      '⚠️ Restablecer Configuración',
      '¿Estás seguro de que deseas eliminar la configuración de tu finca? Volverás a ver la pantalla de bienvenida y asistente inicial.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restablecer',
          style: 'destructive',
          onPress: async () => {
            try {
              await ConfiguracionRepository.eliminarConfiguracion();
              router.replace('/onboarding');
            } catch (err) {
              if (err instanceof Error) {
                Alert.alert('Error al restablecer', err.message);
              }
            }
          },
        },
      ]
    );
  };

  if (cargando) {
    return (
      <SafeAreaView style={styles.contenedorCentro} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color={COLORES.verdeEsmeralda} />
        <Text style={styles.textoCargando}>Cargando ajustes...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.contenedor} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />

      {/* Header superior */}
      <View style={styles.headerNav}>
        <Pressable onPress={() => router.back()} style={styles.btnVolver} hitSlop={8}>
          <ChevronLeft size={24} color={COLORES.tealOscuro} />
        </Pressable>
        <Text style={styles.headerTitulo}>Ajustes y Configuración</Text>
        <View style={styles.espaciadorHeader} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContenido}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Banner de mensaje de éxito flotante */}
        {mensajeExito && (
          <View style={styles.bannerExito}>
            <CheckCircle2 size={18} color={COLORES.verdeOscuro} />
            <Text style={styles.textoBannerExito}>{mensajeExito}</Text>
          </View>
        )}

        {/* ── SECCIÓN 1: DATOS DE LA FINCA ── */}
        <View style={styles.seccion}>
          <View style={styles.cabeceraSeccion}>
            <Building2 size={18} color={COLORES.verdeOscuro} />
            <Text style={styles.tituloSeccion}>DATOS DE LA FINCA</Text>
          </View>

          <View style={styles.tarjetaFormulario}>
            <View style={styles.campoGrupo}>
              <Text style={styles.labelCampo}>Nombre de la Finca / Predio</Text>
              <TextInput
                style={styles.inputTexto}
                value={nombreFinca}
                onChangeText={setNombreFinca}
                placeholder="Ej. Finca La Esperanza"
                placeholderTextColor={COLORES.textoMudo}
              />
            </View>

            <View style={styles.campoGrupo}>
              <Text style={styles.labelCampo}>Propietario / Administrador</Text>
              <TextInput
                style={styles.inputTexto}
                value={propietario}
                onChangeText={setPropietario}
                placeholder="Ej. Juan Pérez"
                placeholderTextColor={COLORES.textoMudo}
              />
            </View>

            <View style={styles.campoGrupo}>
              <Text style={styles.labelCampo}>Ubicación Geográfica</Text>
              <TextInput
                style={styles.inputTexto}
                value={ubicacion}
                onChangeText={setUbicacion}
                placeholder="Ej. Barinas, Venezuela"
                placeholderTextColor={COLORES.textoMudo}
              />
            </View>

            <Pressable
              style={[styles.botonGuardarSeccion, guardandoFinca && styles.botonDeshabilitado]}
              onPress={handleGuardarDatosFinca}
              disabled={guardandoFinca}
            >
              {guardandoFinca ? (
                <ActivityIndicator size="small" color={COLORES.blanco} />
              ) : (
                <>
                  <Save size={16} color={COLORES.blanco} />
                  <Text style={styles.textoBotonGuardar}>Guardar Datos de Finca</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>

        {/* ── SECCIÓN 2: PREFERENCIAS (MONEDA Y LECHE) ── */}
        <View style={styles.seccion}>
          <View style={styles.cabeceraSeccion}>
            <Coins size={18} color={COLORES.verdeOscuro} />
            <Text style={styles.tituloSeccion}>PREFERENCIAS ECONÓMICAS</Text>
          </View>

          <View style={styles.tarjetaFormulario}>
            <View style={styles.campoGrupo}>
              <Text style={styles.labelCampo}>Moneda de la Operación</Text>
              <View style={styles.gridMonedas}>
                {MONEDAS_DISPONIBLES.map((m) => {
                  const activa = moneda === m.codigo;
                  return (
                    <Pressable
                      key={m.codigo}
                      style={[styles.chipMoneda, activa && styles.chipMonedaActivo]}
                      onPress={() => setMoneda(m.codigo)}
                    >
                      <Text style={[styles.textoChipMoneda, activa && styles.textoChipMonedaActivo]}>
                        {m.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.campoGrupo}>
              <Text style={styles.labelCampo}>{`Precio de Leche por Litro (${moneda})`}</Text>
              <View style={styles.inputConIcono}>
                <Droplet size={18} color={COLORES.verdeEsmeralda} style={styles.iconoInput} />
                <TextInput
                  style={styles.inputTextoConIcono}
                  value={precioLeche}
                  onChangeText={setPrecioLeche}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor={COLORES.textoMudo}
                />
              </View>
              <Text style={styles.hintTexto}>
                Se utiliza para calcular ingresos brutos en la producción diaria y mensual.
              </Text>
            </View>

            <Pressable
              style={[styles.botonGuardarSeccion, guardandoPreferencias && styles.botonDeshabilitado]}
              onPress={handleGuardarPreferencias}
              disabled={guardandoPreferencias}
            >
              {guardandoPreferencias ? (
                <ActivityIndicator size="small" color={COLORES.blanco} />
              ) : (
                <>
                  <Save size={16} color={COLORES.blanco} />
                  <Text style={styles.textoBotonGuardar}>Guardar Preferencias</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>

        {/* ── SECCIÓN 3: ESPECIES ── */}
        <View style={styles.seccion}>
          <View style={styles.cabeceraSeccion}>
            <Sparkles size={18} color={COLORES.verdeOscuro} />
            <Text style={styles.tituloSeccion}>ESPECIES EN EL REBAÑO</Text>
          </View>

          <View style={styles.tarjetaFormulario}>
            <Text style={styles.hintTexto}>
              Selecciona las especies activas en tu predio para habilitar razas y categorías apropiadas.
            </Text>

            <View style={styles.contenedorCardsEspecies}>
              {/* Bovinos */}
              <Pressable
                style={[styles.cardEspecie, especies.includes('bovino') && styles.cardEspecieActiva]}
                onPress={() => toggleEspecie('bovino')}
              >
                <View style={styles.cabeceraEspecieCard}>
                  <Text style={styles.emojiEspecie}>🐄</Text>
                  <View style={[styles.checkEspecie, especies.includes('bovino') && styles.checkEspecieActivo]}>
                    {especies.includes('bovino') && <CheckCircle2 size={16} color={COLORES.blanco} />}
                  </View>
                </View>
                <Text style={styles.tituloEspecie}>Bovinos</Text>
                <Text style={styles.descEspecie}>Gestación 283 días · Vacas y toros</Text>
              </Pressable>

              {/* Bufalinos */}
              <Pressable
                style={[styles.cardEspecie, especies.includes('bufalino') && styles.cardEspecieActiva]}
                onPress={() => toggleEspecie('bufalino')}
              >
                <View style={styles.cabeceraEspecieCard}>
                  <Text style={styles.emojiEspecie}>🐃</Text>
                  <View style={[styles.checkEspecie, especies.includes('bufalino') && styles.checkEspecieActivo]}>
                    {especies.includes('bufalino') && <CheckCircle2 size={16} color={COLORES.blanco} />}
                  </View>
                </View>
                <Text style={styles.tituloEspecie}>Bufalinos</Text>
                <Text style={styles.descEspecie}>Gestación 310 días · Búfalas y búfalos</Text>
              </Pressable>
            </View>

            <Pressable
              style={[styles.botonGuardarSeccion, guardandoEspecies && styles.botonDeshabilitado]}
              onPress={handleGuardarEspecies}
              disabled={guardandoEspecies}
            >
              {guardandoEspecies ? (
                <ActivityIndicator size="small" color={COLORES.blanco} />
              ) : (
                <>
                  <Save size={16} color={COLORES.blanco} />
                  <Text style={styles.textoBotonGuardar}>Guardar Especies</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>

        {/* ── SECCIÓN 4: DATOS Y RESPALDO ── */}
        <View style={styles.seccion}>
          <View style={styles.cabeceraSeccion}>
            <Database size={18} color={COLORES.verdeOscuro} />
            <Text style={styles.tituloSeccion}>DATOS Y RESPALDO</Text>
          </View>

          <View style={styles.tarjetaFormulario}>
            <Pressable
              style={styles.filaBotonAccion}
              onPress={() =>
                Alert.alert(
                  'Exportar Respaldo',
                  'La generación de copias de seguridad portátiles estará disponible próximamente en la fase de sincronización.'
                )
              }
            >
              <View style={styles.iconoBotonAccionVerde}>
                <Download size={18} color={COLORES.verdeOscuro} />
              </View>
              <View style={styles.textosBotonAccion}>
                <Text style={styles.tituloBotonAccion}>Exportar Respaldo</Text>
                <Text style={styles.subtituloBotonAccion}>Guardar copia local de SQLite</Text>
              </View>
            </Pressable>

            <View style={styles.divisor} />

            <Pressable
              style={styles.filaBotonAccion}
              onPress={() =>
                Alert.alert(
                  'Importar Respaldo',
                  'La restauración desde copias de seguridad estará disponible próximamente.'
                )
              }
            >
              <View style={styles.iconoBotonAccionAzul}>
                <Upload size={18} color={COLORES.azulRey} />
              </View>
              <View style={styles.textosBotonAccion}>
                <Text style={styles.tituloBotonAccion}>Importar Respaldo</Text>
                <Text style={styles.subtituloBotonAccion}>Restaurar base de datos previa</Text>
              </View>
            </Pressable>

            <View style={styles.divisor} />

            <Pressable
              style={styles.filaBotonAccionPeligrosa}
              onPress={handleResetearConfiguracion}
            >
              <View style={styles.iconoBotonAccionRojo}>
                <RotateCcw size={18} color={COLORES.rojoError} />
              </View>
              <View style={styles.textosBotonAccion}>
                <Text style={styles.tituloBotonAccionPeligrosa}>Restablecer Configuración</Text>
                <Text style={styles.subtituloBotonAccionPeligrosa}>
                  Elimina datos de finca y reinicia el asistente
                </Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* ── SECCIÓN 5: ACERCA DE ── */}
        <View style={styles.seccion}>
          <View style={styles.cabeceraSeccion}>
            <Info size={18} color={COLORES.verdeOscuro} />
            <Text style={styles.tituloSeccion}>ACERCA DE LA APLICACIÓN</Text>
          </View>

          <View style={styles.tarjetaAcercaDe}>
            <View style={styles.filaAcercaItem}>
              <Text style={styles.labelAcerca}>Plataforma</Text>
              <Text style={styles.valorAcerca}>GanaSmart - AgroMind</Text>
            </View>

            <View style={styles.divisor} />

            <View style={styles.filaAcercaItem}>
              <Text style={styles.labelAcerca}>Versión</Text>
              <Text style={styles.valorAcerca}>1.0.0 (Local-First Edition)</Text>
            </View>

            <View style={styles.divisor} />

            <View style={styles.filaAcercaItem}>
              <Text style={styles.labelAcerca}>Motor de Datos</Text>
              <Text style={styles.valorAcerca}>SQLite Local Autónomo</Text>
            </View>

            <View style={styles.divisor} />

            <View style={styles.filaAcercaItem}>
              <Text style={styles.labelAcerca}>Licencia</Text>
              <Text style={styles.valorAcerca}>Licencia de Campo AgroMind</Text>
            </View>
          </View>
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
    color: COLORES.textoMudo,
    fontWeight: '600',
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
    paddingBottom: 60,
    gap: 20,
  },
  bannerExito: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORES.verdeMentha,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORES.verdeEsmeralda,
  },
  textoBannerExito: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    color: COLORES.verdeOscuro,
  },
  seccion: {
    gap: 8,
  },
  cabeceraSeccion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  tituloSeccion: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORES.tealOscuro,
    letterSpacing: 0.8,
  },
  tarjetaFormulario: {
    backgroundColor: COLORES.blanco,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    gap: 14,
  },
  campoGrupo: {
    gap: 6,
  },
  labelCampo: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORES.tealOscuro,
  },
  inputTexto: {
    backgroundColor: COLORES.fondoApp,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15,
    color: COLORES.tealOscuro,
    fontWeight: '600',
  },
  inputConIcono: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.fondoApp,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    paddingHorizontal: 12,
    height: 48,
  },
  iconoInput: {
    marginRight: 10,
  },
  inputTextoConIcono: {
    flex: 1,
    fontSize: 15,
    color: COLORES.tealOscuro,
    fontWeight: '600',
  },
  hintTexto: {
    fontSize: 12,
    color: COLORES.textoMudo,
    lineHeight: 16,
  },
  gridMonedas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  chipMoneda: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORES.fondoApp,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  chipMonedaActivo: {
    backgroundColor: COLORES.tealOscuro,
    borderColor: COLORES.tealOscuro,
  },
  textoChipMoneda: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORES.textoMudo,
  },
  textoChipMonedaActivo: {
    color: COLORES.blanco,
    fontWeight: '800',
  },
  contenedorCardsEspecies: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 4,
  },
  cardEspecie: {
    flex: 1,
    backgroundColor: COLORES.fondoApp,
    borderRadius: 14,
    padding: 14,
    borderWidth: 2,
    borderColor: COLORES.bordeClaro,
    gap: 4,
  },
  cardEspecieActiva: {
    borderColor: COLORES.verdeEsmeralda,
    backgroundColor: COLORES.esmeraldaTransparente15,
  },
  cabeceraEspecieCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emojiEspecie: {
    fontSize: 24,
  },
  checkEspecie: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORES.bordeClaro,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORES.blanco,
  },
  checkEspecieActivo: {
    backgroundColor: COLORES.verdeEsmeralda,
    borderColor: COLORES.verdeEsmeralda,
  },
  tituloEspecie: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORES.tealOscuro,
    marginTop: 2,
  },
  descEspecie: {
    fontSize: 11,
    color: COLORES.textoMudo,
    fontWeight: '500',
    lineHeight: 15,
  },
  botonGuardarSeccion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORES.verdeEsmeralda,
    height: 44,
    borderRadius: 12,
    marginTop: 6,
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
  textoBotonGuardar: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORES.blanco,
  },
  filaBotonAccion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  iconoBotonAccionVerde: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORES.verdeMentha,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconoBotonAccionAzul: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORES.aquaClaro,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconoBotonAccionRojo: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORES.rojoClaro,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textosBotonAccion: {
    flex: 1,
    gap: 2,
  },
  tituloBotonAccion: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORES.tealOscuro,
  },
  subtituloBotonAccion: {
    fontSize: 12,
    color: COLORES.textoMudo,
  },
  filaBotonAccionPeligrosa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  tituloBotonAccionPeligrosa: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORES.rojoError,
  },
  subtituloBotonAccionPeligrosa: {
    fontSize: 12,
    color: COLORES.rojoError,
    opacity: 0.8,
  },
  divisor: {
    height: 1,
    backgroundColor: COLORES.bordeClaro,
  },
  tarjetaAcercaDe: {
    backgroundColor: COLORES.blanco,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    gap: 12,
  },
  filaAcercaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  labelAcerca: {
    fontSize: 13,
    color: COLORES.textoMudo,
    fontWeight: '600',
  },
  valorAcerca: {
    fontSize: 13,
    color: COLORES.tealOscuro,
    fontWeight: '700',
  },
});
