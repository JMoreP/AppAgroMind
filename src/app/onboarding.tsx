import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building2,
  User,
  MapPin,
  Coins,
  Droplet,
  Sparkles,
} from 'lucide-react-native';
import { LogoGanaSmart } from '../shared/components/LogoGanaSmart';
import { COLORES } from '../shared/theme/colores';
import { useConfiguracion } from '../features/configuracion/hooks/useConfiguracion';
import {
  MONEDAS_DISPONIBLES,
  ConfiguracionFinca,
} from '../features/configuracion/types/ConfiguracionFinca';

export default function PantallaOnboarding() {
  const router = useRouter();
  const { completarOnboarding } = useConfiguracion();

  // Paso actual (1 a 4)
  const [paso, setPaso] = useState<number>(1);

  // Estados del formulario
  const [nombreFinca, setNombreFinca] = useState('');
  const [propietario, setPropietario] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [especies, setEspecies] = useState<Array<'bovino' | 'bufalino'>>(['bufalino']);
  const [moneda, setMoneda] = useState<string>('Bs.');
  const [precioLeche, setPrecioLeche] = useState<string>('0');

  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
  const [guardando, setGuardando] = useState<boolean>(false);

  // Manejador de selección de especies (mínimo una)
  const toggleEspecie = (esp: 'bovino' | 'bufalino') => {
    setErrorValidacion(null);
    if (especies.includes(esp)) {
      if (especies.length === 1) {
        setErrorValidacion('Debes seleccionar al menos una especie para tu finca.');
        return;
      }
      setEspecies(especies.filter((e) => e !== esp));
    } else {
      setEspecies([...especies, esp]);
    }
  };

  // Validaciones y avance
  const avanzarPaso2 = () => {
    setErrorValidacion(null);
    setPaso(2);
  };

  const avanzarPaso3 = () => {
    if (!nombreFinca.trim()) {
      setErrorValidacion('Ingresa el nombre de la finca.');
      return;
    }
    if (!propietario.trim()) {
      setErrorValidacion('Ingresa el nombre del propietario o productor.');
      return;
    }
    setErrorValidacion(null);
    setPaso(3);
  };

  const avanzarPaso4 = () => {
    if (especies.length === 0) {
      setErrorValidacion('Selecciona al menos una especie.');
      return;
    }
    setErrorValidacion(null);
    setPaso(4);
  };

  const retrocederPaso = () => {
    setErrorValidacion(null);
    if (paso > 1) {
      setPaso(paso - 1);
    }
  };

  const finalizarOnboarding = async () => {
    setErrorValidacion(null);
    let precioNum = 0;
    if (precioLeche.trim()) {
      const limpio = precioLeche.replace(',', '.');
      const parsed = parseFloat(limpio);
      if (isNaN(parsed) || parsed < 0) {
        setErrorValidacion('Ingresa un precio de leche válido (número positivo o 0).');
        return;
      }
      precioNum = parsed;
    }

    const payload: ConfiguracionFinca = {
      nombre: nombreFinca.trim(),
      propietario: propietario.trim(),
      ubicacion: ubicacion.trim(),
      moneda,
      precioLeche: precioNum,
      especies,
    };

    setGuardando(true);
    try {
      await completarOnboarding(payload);
      router.replace('/(tabs)');
    } catch (err) {
      if (err instanceof Error) {
        setErrorValidacion(err.message);
      } else {
        setErrorValidacion('Error al guardar la configuración.');
      }
      setGuardando(false);
    }
  };

  return (
    <SafeAreaView style={styles.contenedorSeguro} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Barra superior de navegación y progreso */}
        <View style={styles.headerProgreso}>
          {paso > 1 ? (
            <Pressable
              style={styles.botonAtras}
              onPress={retrocederPaso}
              disabled={guardando}
              hitSlop={8}
            >
              <ChevronLeft size={22} color={COLORES.tealOscuro} />
              <Text style={styles.textoBotonAtras}>Atrás</Text>
            </Pressable>
          ) : (
            <View style={styles.espacioBotonAtras} />
          )}

          {/* Indicador de pasos */}
          <View style={styles.indicadorPuntos}>
            {[1, 2, 3, 4].map((p) => {
              const activo = p === paso;
              const completado = p < paso;
              return (
                <View
                  key={p}
                  style={[
                    styles.puntoProgreso,
                    activo && styles.puntoProgresoActivo,
                    completado && styles.puntoProgresoCompletado,
                  ]}
                />
              );
            })}
          </View>

          <Text style={styles.textoPasoContador}>{`Paso ${paso}/4`}</Text>
        </View>

        <ScrollView
          style={styles.flex1}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ========================================================
              PASO 1: BIENVENIDA
             ======================================================== */}
          {paso === 1 && (
            <View style={styles.pasoContenedor}>
              <View style={styles.logoContenedor}>
                <LogoGanaSmart tamaño={100} />
              </View>

              <Text style={styles.tituloHero}>Bienvenido a GanaSmart</Text>
              <Text style={styles.subtituloHero}>
                Configuremos tu finca en 3 pasos rápidos para adaptar métricas, monedas y especies a tu operación real.
              </Text>

              <View style={styles.tarjetaBeneficios}>
                <View style={styles.filaBeneficio}>
                  <View style={styles.iconoBeneficio}>
                    <CheckCircle2 size={18} color={COLORES.verdeEsmeralda} />
                  </View>
                  <Text style={styles.textoBeneficio}>
                    Gestión 100% offline en potrero, sin depender de internet.
                  </Text>
                </View>

                <View style={styles.filaBeneficio}>
                  <View style={styles.iconoBeneficio}>
                    <CheckCircle2 size={18} color={COLORES.verdeEsmeralda} />
                  </View>
                  <Text style={styles.textoBeneficio}>
                    Control de leche, engorde, reproducción y sanidad.
                  </Text>
                </View>

                <View style={styles.filaBeneficio}>
                  <View style={styles.iconoBeneficio}>
                    <CheckCircle2 size={18} color={COLORES.verdeEsmeralda} />
                  </View>
                  <Text style={styles.textoBeneficio}>
                    Soporte multi-especie para bovinos y bufalinos.
                  </Text>
                </View>
              </View>

              <Pressable style={styles.botonPrimario} onPress={avanzarPaso2}>
                <Text style={styles.textoBotonPrimario}>Comenzar</Text>
                <ArrowRight size={20} color={COLORES.blanco} />
              </Pressable>
            </View>
          )}

          {/* ========================================================
              PASO 2: DATOS DE LA FINCA
             ======================================================== */}
          {paso === 2 && (
            <View style={styles.pasoContenedor}>
              <View style={styles.iconoPasoContenedor}>
                <Building2 size={32} color={COLORES.verdeOscuro} />
              </View>
              <Text style={styles.tituloPaso}>Datos de tu Finca</Text>
              <Text style={styles.subtituloPaso}>
                Estos datos identificarán tus reportes técnicos y exportaciones en PDF.
              </Text>

              <View style={styles.formularioGrupo}>
                {/* Nombre de la finca */}
                <View style={styles.campoInput}>
                  <Text style={styles.labelInput}>
                    Nombre de la Finca / Hacienda <Text style={styles.asterisco}>*</Text>
                  </Text>
                  <View style={styles.inputConIcono}>
                    <Building2 size={18} color={COLORES.textoMudo} style={styles.iconoInput} />
                    <TextInput
                      style={styles.inputText}
                      placeholder="Ej. Finca La Esperanza"
                      placeholderTextColor={COLORES.textoMudo}
                      value={nombreFinca}
                      onChangeText={(val) => {
                        setNombreFinca(val);
                        if (errorValidacion) setErrorValidacion(null);
                      }}
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                {/* Propietario */}
                <View style={styles.campoInput}>
                  <Text style={styles.labelInput}>
                    Propietario o Administrador <Text style={styles.asterisco}>*</Text>
                  </Text>
                  <View style={styles.inputConIcono}>
                    <User size={18} color={COLORES.textoMudo} style={styles.iconoInput} />
                    <TextInput
                      style={styles.inputText}
                      placeholder="Ej. Juan Pérez"
                      placeholderTextColor={COLORES.textoMudo}
                      value={propietario}
                      onChangeText={(val) => {
                        setPropietario(val);
                        if (errorValidacion) setErrorValidacion(null);
                      }}
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                {/* Ubicación */}
                <View style={styles.campoInput}>
                  <Text style={styles.labelInput}>Ubicación (Municipio / Estado)</Text>
                  <View style={styles.inputConIcono}>
                    <MapPin size={18} color={COLORES.textoMudo} style={styles.iconoInput} />
                    <TextInput
                      style={styles.inputText}
                      placeholder="Ej. Barinas, Venezuela"
                      placeholderTextColor={COLORES.textoMudo}
                      value={ubicacion}
                      onChangeText={setUbicacion}
                      autoCapitalize="words"
                    />
                  </View>
                </View>
              </View>

              {errorValidacion && (
                <View style={styles.cajaError}>
                  <AlertCircle size={16} color={COLORES.rojoError} />
                  <Text style={styles.textoError}>{errorValidacion}</Text>
                </View>
              )}

              <Pressable style={styles.botonPrimario} onPress={avanzarPaso3}>
                <Text style={styles.textoBotonPrimario}>Siguiente</Text>
                <ArrowRight size={20} color={COLORES.blanco} />
              </Pressable>
            </View>
          )}

          {/* ========================================================
              PASO 3: ESPECIES
             ======================================================== */}
          {paso === 3 && (
            <View style={styles.pasoContenedor}>
              <View style={styles.iconoPasoContenedor}>
                <Sparkles size={32} color={COLORES.verdeOscuro} />
              </View>
              <Text style={styles.tituloPaso}>¿Qué especies manejas?</Text>
              <Text style={styles.subtituloPaso}>
                Puedes seleccionar una o ambas especies según el rebaño de tu predio.
              </Text>

              <View style={styles.contenedorCardsEspecies}>
                {/* Opción Bovinos */}
                <Pressable
                  style={[
                    styles.cardEspecie,
                    especies.includes('bovino') && styles.cardEspecieActiva,
                  ]}
                  onPress={() => toggleEspecie('bovino')}
                >
                  <View style={styles.cabeceraCardEspecie}>
                    <Text style={styles.emojiCardEspecie}>🐄</Text>
                    <View
                      style={[
                        styles.checkCard,
                        especies.includes('bovino') && styles.checkCardActivo,
                      ]}
                    >
                      {especies.includes('bovino') && (
                        <CheckCircle2 size={16} color={COLORES.blanco} />
                      )}
                    </View>
                  </View>
                  <Text style={styles.tituloCardEspecie}>Bovinos</Text>
                  <Text style={styles.descCardEspecie}>
                    Gestación: 283 días. Vacas, toros, novillos y terneros.
                  </Text>
                </Pressable>

                {/* Opción Bufalinos */}
                <Pressable
                  style={[
                    styles.cardEspecie,
                    especies.includes('bufalino') && styles.cardEspecieActiva,
                  ]}
                  onPress={() => toggleEspecie('bufalino')}
                >
                  <View style={styles.cabeceraCardEspecie}>
                    <Text style={styles.emojiCardEspecie}>🐃</Text>
                    <View
                      style={[
                        styles.checkCard,
                        especies.includes('bufalino') && styles.checkCardActivo,
                      ]}
                    >
                      {especies.includes('bufalino') && (
                        <CheckCircle2 size={16} color={COLORES.blanco} />
                      )}
                    </View>
                  </View>
                  <Text style={styles.tituloCardEspecie}>Bufalinos</Text>
                  <Text style={styles.descCardEspecie}>
                    Gestación: 310 días. Búfalas, padrotes, bubillos y bucerros.
                  </Text>
                </Pressable>
              </View>

              {errorValidacion && (
                <View style={styles.cajaError}>
                  <AlertCircle size={16} color={COLORES.rojoError} />
                  <Text style={styles.textoError}>{errorValidacion}</Text>
                </View>
              )}

              <Pressable style={styles.botonPrimario} onPress={avanzarPaso4}>
                <Text style={styles.textoBotonPrimario}>Siguiente</Text>
                <ArrowRight size={20} color={COLORES.blanco} />
              </Pressable>
            </View>
          )}

          {/* ========================================================
              PASO 4: PRECIO DE LECHE Y MONEDA
             ======================================================== */}
          {paso === 4 && (
            <View style={styles.pasoContenedor}>
              <View style={styles.iconoPasoContenedor}>
                <Coins size={32} color={COLORES.verdeOscuro} />
              </View>
              <Text style={styles.tituloPaso}>Último paso</Text>
              <Text style={styles.subtituloPaso}>
                Moneda de cálculo y precio estimado de venta de leche por litro.
              </Text>

              <View style={styles.formularioGrupo}>
                {/* Selector de moneda */}
                <View style={styles.campoInput}>
                  <Text style={styles.labelInput}>Moneda de la Operación</Text>
                  <View style={styles.contenedorMonedas}>
                    {MONEDAS_DISPONIBLES.map((m) => {
                      const seleccionada = moneda === m.codigo;
                      return (
                        <Pressable
                          key={m.codigo}
                          style={[
                            styles.chipMoneda,
                            seleccionada && styles.chipMonedaActivo,
                          ]}
                          onPress={() => setMoneda(m.codigo)}
                        >
                          <Text
                            style={[
                              styles.textoChipMoneda,
                              seleccionada && styles.textoChipMonedaActivo,
                            ]}
                          >
                            {m.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Precio de leche */}
                <View style={styles.campoInput}>
                  <Text style={styles.labelInput}>
                    {`Precio de Leche por Litro (${moneda})`}
                  </Text>
                  <View style={styles.inputConIcono}>
                    <Droplet size={18} color={COLORES.verdeEsmeralda} style={styles.iconoInput} />
                    <TextInput
                      style={styles.inputText}
                      placeholder="0.00"
                      placeholderTextColor={COLORES.textoMudo}
                      value={precioLeche}
                      onChangeText={(val) => {
                        setPrecioLeche(val);
                        if (errorValidacion) setErrorValidacion(null);
                      }}
                      keyboardType="numeric"
                    />
                  </View>
                  <Text style={styles.hintInput}>
                    Se usará para proyectar ingresos diarios y mensuales en el módulo de ordeño.
                  </Text>
                </View>
              </View>

              {errorValidacion && (
                <View style={styles.cajaError}>
                  <AlertCircle size={16} color={COLORES.rojoError} />
                  <Text style={styles.textoError}>{errorValidacion}</Text>
                </View>
              )}

              <Pressable
                style={[styles.botonPrimario, guardando && styles.botonDeshabilitado]}
                onPress={finalizarOnboarding}
                disabled={guardando}
              >
                {guardando ? (
                  <ActivityIndicator size="small" color={COLORES.blanco} />
                ) : (
                  <>
                    <Text style={styles.textoBotonPrimario}>Comenzar a usar GanaSmart</Text>
                    <CheckCircle2 size={20} color={COLORES.blanco} />
                  </>
                )}
              </Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedorSeguro: {
    flex: 1,
    backgroundColor: COLORES.fondoApp,
  },
  flex1: {
    flex: 1,
  },
  headerProgreso: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORES.bordeClaro,
    backgroundColor: COLORES.blanco,
  },
  botonAtras: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 70,
  },
  textoBotonAtras: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORES.tealOscuro,
  },
  espacioBotonAtras: {
    minWidth: 70,
  },
  indicadorPuntos: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  puntoProgreso: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORES.bordeClaro,
  },
  puntoProgresoActivo: {
    width: 22,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORES.verdeEsmeralda,
  },
  puntoProgresoCompletado: {
    backgroundColor: COLORES.verdeOscuro,
  },
  textoPasoContador: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORES.textoMudo,
    minWidth: 70,
    textAlign: 'right',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  pasoContenedor: {
    gap: 18,
  },
  logoContenedor: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  iconoPasoContenedor: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: COLORES.verdeMentha,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 6,
  },
  tituloHero: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORES.tealOscuro,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtituloHero: {
    fontSize: 15,
    color: COLORES.textoMudo,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
    paddingHorizontal: 10,
  },
  tituloPaso: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORES.tealOscuro,
    textAlign: 'center',
  },
  subtituloPaso: {
    fontSize: 14,
    color: COLORES.textoMudo,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
    paddingHorizontal: 12,
  },
  tarjetaBeneficios: {
    backgroundColor: COLORES.blanco,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    gap: 16,
    marginVertical: 12,
  },
  filaBeneficio: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconoBeneficio: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORES.esmeraldaTransparente15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBeneficio: {
    flex: 1,
    fontSize: 14,
    color: COLORES.tealOscuro,
    fontWeight: '600',
    lineHeight: 19,
  },
  formularioGrupo: {
    backgroundColor: COLORES.blanco,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    gap: 16,
  },
  campoInput: {
    gap: 6,
  },
  labelInput: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORES.tealOscuro,
  },
  asterisco: {
    color: COLORES.rojoError,
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
  inputText: {
    flex: 1,
    fontSize: 15,
    color: COLORES.tealOscuro,
    fontWeight: '600',
  },
  hintInput: {
    fontSize: 12,
    color: COLORES.textoMudo,
    lineHeight: 16,
    marginTop: 2,
  },
  contenedorCardsEspecies: {
    gap: 14,
    marginVertical: 8,
  },
  cardEspecie: {
    backgroundColor: COLORES.blanco,
    borderRadius: 18,
    padding: 18,
    borderWidth: 2,
    borderColor: COLORES.bordeClaro,
    gap: 6,
  },
  cardEspecieActiva: {
    borderColor: COLORES.verdeEsmeralda,
    backgroundColor: COLORES.esmeraldaTransparente15,
  },
  cabeceraCardEspecie: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emojiCardEspecie: {
    fontSize: 32,
  },
  checkCard: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: COLORES.bordeClaro,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORES.blanco,
  },
  checkCardActivo: {
    backgroundColor: COLORES.verdeEsmeralda,
    borderColor: COLORES.verdeEsmeralda,
  },
  tituloCardEspecie: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORES.tealOscuro,
  },
  descCardEspecie: {
    fontSize: 13,
    color: COLORES.textoMudo,
    fontWeight: '500',
    lineHeight: 18,
  },
  contenedorMonedas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  chipMoneda: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORES.fondoApp,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  chipMonedaActivo: {
    backgroundColor: COLORES.tealOscuro,
    borderColor: COLORES.tealOscuro,
  },
  textoChipMoneda: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORES.textoMudo,
  },
  textoChipMonedaActivo: {
    color: COLORES.blanco,
    fontWeight: '800',
  },
  cajaError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORES.rojoClaro,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORES.rojoError,
  },
  textoError: {
    flex: 1,
    fontSize: 13,
    color: COLORES.rojoError,
    fontWeight: '600',
  },
  botonPrimario: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORES.verdeEsmeralda,
    height: 52,
    borderRadius: 16,
    marginTop: 10,
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
  textoBotonPrimario: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORES.blanco,
  },
});
