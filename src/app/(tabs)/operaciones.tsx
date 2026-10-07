import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  Pressable, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Droplet, 
  Sun, 
  Moon, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Award
} from 'lucide-react-native';
import { useOrdenoLote } from '../../features/ordeno/hooks/useOrdenoLote';
import { useLotes } from '../../features/lotes/hooks/useLotes';
import { TecladoNumericoRapido } from '../../features/ordeno/components/TecladoNumericoRapido';
import { ListaPesajesRecientes } from '../../features/ordeno/components/ListaPesajesRecientes';
import { COLORES } from '../../shared/theme/colores';

export default function PantallaOrdeñoRapido() {
  const {
    fecha,
    turno,
    setTurno,
    loteSeleccionado,
    setLoteSeleccionado,
    animalesDisponibles,
    animalesPendientes,
    pesajesDelTurno,
    resumenTurnoActual,
    cargando,
    registrarPesaje,
    eliminarPesaje,
  } = useOrdenoLote();

  const { lotes } = useLotes();

  // Estados locales del formulario rápido
  const [areteInput, setAreteInput] = useState('');
  const [litrosInput, setLitrosInput] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [guardando, setGuardando] = useState(false);

  // Buscar información de la búfala actualmente ingresada para confirmación visual
  const animalActual = useMemo(() => {
    if (!areteInput.trim()) return null;
    const query = areteInput.trim().toUpperCase();
    return animalesDisponibles.find(
      (a) => a.arete.toUpperCase() === query || a.id === areteInput.trim()
    ) || null;
  }, [areteInput, animalesDisponibles]);

  const seleccionarSugerencia = (arete: string) => {
    setAreteInput(arete);
    setMensajeError('');
    setMensajeExito('');
  };

  const ejecutarGuardarYSiguiente = async () => {
    setMensajeError('');
    setMensajeExito('');

    const litrosNum = parseFloat(litrosInput);
    if (!areteInput.trim()) {
      setMensajeError('Ingresa el número de arete de la búfala.');
      return;
    }
    if (isNaN(litrosNum) || litrosNum <= 0) {
      setMensajeError('Ingresa la cantidad de litros ordeñados.');
      return;
    }

    setGuardando(true);
    const resultado = await registrarPesaje(areteInput, litrosNum);
    setGuardando(false);

    if (resultado.exito) {
      setMensajeExito(`¡Registrado #${resultado.animal?.arete}: ${litrosNum.toFixed(1)} L!`);
      // Limpiar para la siguiente búfala
      setAreteInput('');
      setLitrosInput('');
    } else {
      setMensajeError(resultado.mensaje || 'Error al guardar el pesaje.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={styles.flexOne}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Encabezado y Selector de Turno ── */}
          <View style={styles.header}>
            <View>
              <Text style={styles.tituloHeader}>Ordeño en Lote</Text>
              <Text style={styles.subtituloFecha}>{fecha}</Text>
            </View>

            {/* Selector Mañana / Tarde */}
            <View style={styles.contenedorTurno}>
              <Pressable
                style={[styles.btnTurno, turno === 'mañana' && styles.btnTurnoActivo]}
                onPress={() => setTurno('mañana')}
              >
                <Sun 
                  size={16} 
                  color={turno === 'mañana' ? COLORES.verdeOscuro : COLORES.textoMudo} 
                />
                <Text style={[styles.textoTurno, turno === 'mañana' && styles.textoTurnoActivo]}>
                  Mañana
                </Text>
              </Pressable>

              <Pressable
                style={[styles.btnTurno, turno === 'tarde' && styles.btnTurnoActivo]}
                onPress={() => setTurno('tarde')}
              >
                <Moon 
                  size={16} 
                  color={turno === 'tarde' ? COLORES.verdeOscuro : COLORES.textoMudo} 
                />
                <Text style={[styles.textoTurno, turno === 'tarde' && styles.textoTurnoActivo]}>
                  Tarde
                </Text>
              </Pressable>
            </View>
          </View>

          {/* ── Selector de Lote de Ordeño ── */}
          <View style={styles.contenedorSelectorLote}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsLoteScroll}>
              <Pressable
                style={[styles.chipLote, loteSeleccionado === 'todos' && styles.chipLoteActivo]}
                onPress={() => setLoteSeleccionado('todos')}
              >
                <Text style={[styles.textoChipLote, loteSeleccionado === 'todos' && styles.textoChipLoteActivo]}>
                  Todos los lotes
                </Text>
              </Pressable>

              {lotes.map((lote) => {
                const activo = loteSeleccionado === lote.nombre;
                return (
                  <Pressable
                    key={lote.id}
                    style={[
                      styles.chipLote, 
                      activo && styles.chipLoteActivo,
                      { borderColor: lote.colorHex }
                    ]}
                    onPress={() => setLoteSeleccionado(activo ? 'todos' : lote.nombre)}
                  >
                    <View style={[styles.dotLote, { backgroundColor: lote.colorHex }]} />
                    <Text style={[styles.textoChipLote, activo && styles.textoChipLoteActivo]}>
                      {lote.nombre}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* ── Tarjeta de Métricas en Vivo del Turno ── */}
          <View style={styles.tarjetaMetricasHero}>
            <View style={styles.metricaCol}>
              <View style={styles.iconoMetricaBadge}>
                <Droplet size={16} color={COLORES.limaBrillante} />
              </View>
              <Text style={styles.valorMetricaHero}>
                {resumenTurnoActual.totalLitrosTurno.toFixed(1)} <Text style={styles.unidadMetricaHero}>L</Text>
              </Text>
              <Text style={styles.labelMetricaHero}>TOTAL TURNO</Text>
            </View>

            <View style={styles.divisorVertical} />

            <View style={styles.metricaCol}>
              <View style={styles.iconoMetricaBadge}>
                <Layers size={16} color={COLORES.verdeMentha} />
              </View>
              <Text style={styles.valorMetricaHero}>
                {resumenTurnoActual.totalBufalasTurno}
              </Text>
              <Text style={styles.labelMetricaHero}>ORDEÑADAS</Text>
            </View>

            <View style={styles.divisorVertical} />

            <View style={styles.metricaCol}>
              <View style={styles.iconoMetricaBadge}>
                <TrendingUp size={16} color={COLORES.aquaClaro} />
              </View>
              <Text style={styles.valorMetricaHero}>
                {resumenTurnoActual.promedioTurno.toFixed(1)} <Text style={styles.unidadMetricaHero}>L</Text>
              </Text>
              <Text style={styles.labelMetricaHero}>PROMEDIO/CAB</Text>
            </View>
          </View>

          {/* ── Bloque de Ingreso Rápido ── */}
          <View style={styles.cardEntradaPrincipal}>
            {/* Campo de Arete */}
            <View style={styles.filaAreteInput}>
              <View style={styles.prefijoArete}>
                <Text style={styles.textoNumeral}>#</Text>
              </View>
              <TextInput
                style={styles.inputArete}
                placeholder="NRO ARETE"
                placeholderTextColor={COLORES.textoMudo}
                value={areteInput}
                onChangeText={(val) => {
                  setAreteInput(val);
                  setMensajeError('');
                  setMensajeExito('');
                }}
                autoCapitalize="characters"
              />
            </View>

            {/* Información instantánea de la búfala encontrada */}
            {animalActual ? (
              <View style={styles.cardInfoAnimal}>
                <View style={styles.avatarMiniAnimal}>
                  <Award size={18} color={COLORES.verdeEsmeralda} />
                </View>
                <View style={styles.datosAnimalMini}>
                  <Text style={styles.nombreAnimalMini}>
                    {animalActual.nombre || `Búfala #${animalActual.arete}`}
                  </Text>
                  <Text style={styles.subtituloAnimalMini}>
                    {animalActual.raza || 'Mestiza'} • {animalActual.estadoReproductivo.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.colUltimoPesajeMini}>
                  <Text style={styles.labelUltimoMini}>Anterior</Text>
                  <Text style={styles.valorUltimoMini}>
                    {(animalActual.ultimoPesajeLitros ?? 0).toFixed(1)} L
                  </Text>
                </View>
              </View>
            ) : null}

            {/* Chips de sugerencias de búfalas pendientes */}
            {animalesPendientes.length > 0 && (
              <View style={styles.contenedorSugerencias}>
                <Text style={styles.labelSugerencias}>PENDIENTES:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollSugerencias}>
                  {animalesPendientes.slice(0, 10).map((pend) => (
                    <Pressable
                      key={pend.id}
                      style={styles.chipPendiente}
                      onPress={() => seleccionarSugerencia(pend.arete)}
                    >
                      <Text style={styles.textoChipPendiente}>#{pend.arete}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Gran Visualizador LCD de Litros */}
            <View style={styles.lcdLitrosDisplay}>
              <Text style={styles.lcdValorTexto}>
                {litrosInput || '0.0'}
              </Text>
              <Text style={styles.lcdUnidadTexto}>LITROS</Text>
            </View>

            {/* Teclado Numérico de Campo */}
            <TecladoNumericoRapido
              valor={litrosInput}
              onCambiarValor={(nuevo) => {
                setLitrosInput(nuevo);
                setMensajeError('');
                setMensajeExito('');
              }}
            />

            {/* Mensajes de Alerta / Éxito */}
            {mensajeError ? (
              <View style={styles.bannerError}>
                <AlertCircle size={16} color={COLORES.rojoError} />
                <Text style={styles.textoBannerError}>{mensajeError}</Text>
              </View>
            ) : null}

            {mensajeExito ? (
              <View style={styles.bannerExito}>
                <CheckCircle2 size={16} color={COLORES.verdeBadgeCrecimiento} />
                <Text style={styles.textoBannerExito}>{mensajeExito}</Text>
              </View>
            ) : null}

            {/* Botón Principal Gigante: Guardar y Siguiente */}
            <Pressable
              style={[
                styles.btnGuardarSiguiente,
                guardando && styles.btnDeshabilitado
              ]}
              onPress={ejecutarGuardarYSiguiente}
              disabled={guardando}
            >
              {guardando ? (
                <ActivityIndicator size="small" color={COLORES.blanco} />
              ) : (
                <>
                  <CheckCircle2 size={24} color={COLORES.blanco} />
                  <Text style={styles.textoGuardarSiguiente}>GUARDAR Y SIGUIENTE</Text>
                </>
              )}
            </Pressable>
          </View>

          {/* ── Lista de Registrados Recientes en la Sesión ── */}
          {cargando ? (
            <ActivityIndicator size="small" color={COLORES.verdeEsmeralda} style={styles.cargador} />
          ) : (
            <ListaPesajesRecientes
              pesajes={pesajesDelTurno}
              onEliminar={eliminarPesaje}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORES.fondoApp,
  },
  flexOne: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 110, // Espacio para el Tab Bar inferior
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tituloHeader: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORES.tealOscuro,
    letterSpacing: -0.5,
  },
  subtituloFecha: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORES.textoMudo,
    marginTop: 2,
  },
  contenedorTurno: {
    flexDirection: 'row',
    backgroundColor: COLORES.blanco,
    borderRadius: 20,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    gap: 4,
  },
  btnTurno: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  btnTurnoActivo: {
    backgroundColor: COLORES.limaClaro,
  },
  textoTurno: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORES.textoMudo,
  },
  textoTurnoActivo: {
    color: COLORES.verdeOscuro,
  },
  contenedorSelectorLote: {
    marginBottom: 14,
  },
  chipsLoteScroll: {
    gap: 8,
  },
  chipLote: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORES.blanco,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    gap: 6,
  },
  chipLoteActivo: {
    backgroundColor: COLORES.tealOscuro,
    borderColor: COLORES.tealOscuro,
  },
  dotLote: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  textoChipLote: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORES.tealOscuro,
  },
  textoChipLoteActivo: {
    color: COLORES.blanco,
  },

  // Tarjeta Métricas Hero
  tarjetaMetricasHero: {
    flexDirection: 'row',
    backgroundColor: COLORES.verdeOscuro,
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 16,
    shadowColor: COLORES.verdeOscuro,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  metricaCol: {
    flex: 1,
    alignItems: 'center',
  },
  iconoMetricaBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORES.blancoTransparente15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  valorMetricaHero: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORES.blanco,
    letterSpacing: -0.5,
  },
  unidadMetricaHero: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORES.limaBrillante,
  },
  labelMetricaHero: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORES.verdeMentha,
    letterSpacing: 0.6,
    marginTop: 2,
  },
  divisorVertical: {
    width: 1,
    height: '70%',
    backgroundColor: COLORES.blancoTransparente20,
    alignSelf: 'center',
  },

  // Entrada Principal
  cardEntradaPrincipal: {
    backgroundColor: COLORES.blanco,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    shadowColor: COLORES.tealOscuro,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  filaAreteInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.fondoApp,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORES.bordeClaro,
    marginBottom: 10,
    overflow: 'hidden',
  },
  prefijoArete: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORES.aquaClaro,
    height: 52,
  },
  textoNumeral: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORES.tealOscuro,
  },
  inputArete: {
    flex: 1,
    height: 52,
    paddingHorizontal: 14,
    fontSize: 20,
    fontWeight: '800',
    color: COLORES.tealOscuro,
    letterSpacing: 1,
  },

  // Mini Card Info Animal
  cardInfoAnimal: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.fondoApp,
    padding: 10,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  avatarMiniAnimal: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORES.verdeMentha,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  datosAnimalMini: {
    flex: 1,
  },
  nombreAnimalMini: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORES.tealOscuro,
  },
  subtituloAnimalMini: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORES.textoMudo,
  },
  colUltimoPesajeMini: {
    alignItems: 'flex-end',
  },
  labelUltimoMini: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORES.textoMudo,
  },
  valorUltimoMini: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORES.verdeOscuro,
  },

  // Sugerencias
  contenedorSugerencias: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  labelSugerencias: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORES.textoMudo,
    marginRight: 6,
  },
  scrollSugerencias: {
    gap: 6,
  },
  chipPendiente: {
    backgroundColor: COLORES.fondoApp,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  textoChipPendiente: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORES.tealOscuro,
  },

  // Display LCD Litros
  lcdLitrosDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORES.fondoApp,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORES.bordeClaro,
    marginBottom: 8,
  },
  lcdValorTexto: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORES.tealOscuro,
    letterSpacing: -1,
  },
  lcdUnidadTexto: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORES.textoMudo,
    letterSpacing: 2,
    marginTop: -2,
  },

  // Banners de Estado
  bannerError: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.rojoClaro,
    padding: 10,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  textoBannerError: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: COLORES.rojoError,
  },
  bannerExito: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.verdeMentha,
    padding: 10,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  textoBannerExito: {
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
    color: COLORES.verdeOscuro,
  },

  // Botón Principal Gigante
  btnGuardarSiguiente: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORES.verdeEsmeralda,
    height: 58,
    borderRadius: 20,
    marginTop: 14,
    gap: 10,
    shadowColor: COLORES.verdeEsmeralda,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  btnDeshabilitado: {
    opacity: 0.6,
  },
  textoGuardarSiguiente: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORES.blanco,
    letterSpacing: 0.5,
  },

  cargador: {
    marginVertical: 16,
  },
});
