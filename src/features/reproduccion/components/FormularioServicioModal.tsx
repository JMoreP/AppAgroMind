import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { X, Calendar, Syringe, Sparkles } from 'lucide-react-native';
import { format } from 'date-fns';
import { COLORES } from '../../../shared/theme/colores';
import { SelectorFecha } from '../../../shared/components/SelectorFecha';
import { Animal } from '../../animales/types/Animal';
import { ServicioReproductivo } from '../types/ServicioReproductivo';
import { calcularFechaProbableParto } from '../utils/calculosReproductivos';
import { Especie, obtenerGestacionDias, obtenerNombreAnimal } from '../../../shared/config/configuracionEspecie';

interface Props {
  visible: boolean;
  animal?: Animal;
  animalId?: string;
  especie?: Especie;
  onGuardar: (datos: Partial<ServicioReproductivo>) => Promise<void>;
  onCerrar: () => void;
}

export function FormularioServicioModal({
  visible,
  animal,
  animalId,
  especie,
  onGuardar,
  onCerrar,
}: Props) {
  const hoyISO = new Date().toISOString().split('T')[0];
  const especieObjetivo: Especie = especie || animal?.especie || 'bufalino';

  const [tipo, setTipo] = useState<'inseminacion' | 'monta'>('inseminacion');
  const [fecha, setFecha] = useState(hoyISO);
  const [numeroPajuela, setNumeroPajuela] = useState('');
  const [razaToro, setRazaToro] = useState('');
  const [veterinario, setVeterinario] = useState('');
  const [toroNumero, setToroNumero] = useState('');
  const [toroRaza, setToroRaza] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const [guardando, setGuardando] = useState(false);
  const [errorFecha, setErrorFecha] = useState('');
  const [errorGeneral, setErrorGeneral] = useState('');

  useEffect(() => {
    if (visible) {
      setTipo('inseminacion');
      setFecha(new Date().toISOString().split('T')[0]);
      setNumeroPajuela('');
      setRazaToro('');
      setVeterinario('');
      setToroNumero('');
      setToroRaza('');
      setObservaciones('');
      setErrorFecha('');
      setErrorGeneral('');
    }
  }, [visible]);

  const validarFormulario = (): boolean => {
    setErrorFecha('');
    setErrorGeneral('');

    if (!fecha.trim()) {
      setErrorFecha('La fecha del servicio es obligatoria');
      return false;
    }

    if (tipo === 'inseminacion') {
      const tieneDato = Boolean(
        numeroPajuela.trim() || razaToro.trim() || veterinario.trim()
      );
      if (!tieneDato) {
        setErrorGeneral('Ingresa al menos un dato de la inseminación (Nº pajuela, raza o veterinario).');
        return false;
      }
    } else {
      const tieneDato = Boolean(toroNumero.trim() || toroRaza.trim());
      if (!tieneDato) {
        setErrorGeneral('Ingresa al menos el número o la raza del toro de monta.');
        return false;
      }
    }

    return true;
  };

  const manejarGuardar = async () => {
    if (!validarFormulario()) return;

    setGuardando(true);
    try {
      const idObjetivo = animalId || animal?.id;
      if (!idObjetivo) {
        setErrorGeneral('No se identificó el animal para el servicio.');
        setGuardando(false);
        return;
      }

      const fpp = calcularFechaProbableParto(fecha.trim(), especieObjetivo);

      const datosServicio: Partial<ServicioReproductivo> = {
        animalId: idObjetivo,
        fecha: fecha.trim(),
        tipo,
        numeroPajuela: tipo === 'inseminacion' && numeroPajuela.trim() ? numeroPajuela.trim() : undefined,
        razaToro: tipo === 'inseminacion' && razaToro.trim() ? razaToro.trim() : undefined,
        veterinario: tipo === 'inseminacion' && veterinario.trim() ? veterinario.trim() : undefined,
        toroNumero: tipo === 'monta' && toroNumero.trim() ? toroNumero.trim() : undefined,
        toroRaza: tipo === 'monta' && toroRaza.trim() ? toroRaza.trim() : undefined,
        fechaProbableParto: fpp,
        observaciones: observaciones.trim() ? observaciones.trim() : undefined,
      };

      await onGuardar(datosServicio);
      onCerrar();
    } catch (err) {
      if (err instanceof Error) {
        setErrorGeneral(err.message);
      } else {
        setErrorGeneral('Ocurrió un error al registrar el servicio');
      }
    } finally {
      setGuardando(false);
    }
  };

  const fppEstimada = fecha.length === 10 ? calcularFechaProbableParto(fecha, especieObjetivo) : '—';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onCerrar}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.contenedorModal}>
          {/* Header */}
          <View style={styles.headerModal}>
            <View>
              <Text style={styles.tituloModal}>Registrar Servicio</Text>
              <Text style={styles.subtituloModal}>
                {animal ? `${obtenerNombreAnimal(especieObjetivo, animal.sexo)} #${animal.arete} ${animal.nombre ? `(${animal.nombre})` : ''}` : 'Módulo de Reproducción'}
              </Text>
            </View>
            <Pressable onPress={onCerrar} style={styles.botonCerrar}>
              <X size={20} color={COLORES.tealOscuro} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContenido}
            showsVerticalScrollIndicator={false}
          >
            {/* Selector de Tipo de Servicio */}
            <Text style={styles.etiquetaCampo}>Tipo de Servicio</Text>
            <View style={styles.selectorTipoFila}>
              <Pressable
                style={[
                  styles.opcionTipo,
                  tipo === 'inseminacion' && styles.opcionTipoActiva,
                ]}
                onPress={() => setTipo('inseminacion')}
              >
                <Syringe
                  size={16}
                  color={tipo === 'inseminacion' ? COLORES.blanco : COLORES.tealOscuro}
                />
                <Text
                  style={[
                    styles.textoOpcionTipo,
                    tipo === 'inseminacion' && styles.textoOpcionTipoActivo,
                  ]}
                >
                  Inseminación Artificial
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.opcionTipo,
                  tipo === 'monta' && styles.opcionTipoActiva,
                ]}
                onPress={() => setTipo('monta')}
              >
                <Text
                  style={[
                    styles.textoOpcionTipo,
                    tipo === 'monta' && styles.textoOpcionTipoActivo,
                  ]}
                >
                  🐂 Monta Natural
                </Text>
              </Pressable>
            </View>

            {/* Fecha del Servicio */}
            <SelectorFecha
              label="Fecha del Servicio"
              valor={fecha}
              onChange={(val) => {
                setFecha(val);
                setErrorFecha('');
              }}
              requerido
              maximo={format(new Date(), 'yyyy-MM-dd')}
              error={errorFecha}
            />

            {/* Preview en vivo de FPP */}
            <View style={styles.previewFppCard}>
              <Sparkles size={16} color={COLORES.verdeOscuro} style={styles.iconoSparkle} />
              <View style={styles.previewFppInfo}>
                <Text style={styles.previewFppTitulo}>
                  {`Fecha Probable de Parto (+${obtenerGestacionDias(especieObjetivo)}d)`}
                </Text>
                <Text style={styles.previewFppValor}>{fppEstimada}</Text>
              </View>
            </View>

            {/* Campos condicionales según tipo */}
            {tipo === 'inseminacion' ? (
              <View style={styles.bloqueCamposEspecificos}>
                <Text style={styles.seccionSubtitulo}>Datos de la Inseminación</Text>

                <Text style={styles.etiquetaCampo}>Número / Código de Pajuela</Text>
                <TextInput
                  style={styles.inputSimple}
                  value={numeroPajuela}
                  onChangeText={setNumeroPajuela}
                  placeholder="Ej. PAJ-8842"
                  placeholderTextColor={COLORES.textoMudo}
                />

                <Text style={styles.etiquetaCampo}>Raza del Toro Donante</Text>
                <TextInput
                  style={styles.inputSimple}
                  value={razaToro}
                  onChangeText={setRazaToro}
                  placeholder="Ej. Murrah Puro, Mediterráneo"
                  placeholderTextColor={COLORES.textoMudo}
                />

                <Text style={styles.etiquetaCampo}>Veterinario / Inseminador</Text>
                <TextInput
                  style={styles.inputSimple}
                  value={veterinario}
                  onChangeText={setVeterinario}
                  placeholder="Nombre del técnico o MV"
                  placeholderTextColor={COLORES.textoMudo}
                />
              </View>
            ) : (
              <View style={styles.bloqueCamposEspecificos}>
                <Text style={styles.seccionSubtitulo}>Datos de la Monta Natural</Text>

                <Text style={styles.etiquetaCampo}>Número / Arete del Toro</Text>
                <TextInput
                  style={styles.inputSimple}
                  value={toroNumero}
                  onChangeText={setToroNumero}
                  placeholder="Ej. T-04, Padrillo 1"
                  placeholderTextColor={COLORES.textoMudo}
                />

                <Text style={styles.etiquetaCampo}>Raza del Toro</Text>
                <TextInput
                  style={styles.inputSimple}
                  value={toroRaza}
                  onChangeText={setToroRaza}
                  placeholder="Ej. Jafarabadi, Murrah"
                  placeholderTextColor={COLORES.textoMudo}
                />
              </View>
            )}

            {/* Observaciones */}
            <Text style={styles.etiquetaCampo}>Observaciones (Opcional)</Text>
            <TextInput
              style={styles.inputArea}
              value={observaciones}
              onChangeText={setObservaciones}
              placeholder="Detalles del celo, condición o lugar..."
              placeholderTextColor={COLORES.textoMudo}
              multiline
              numberOfLines={3}
            />

            {Boolean(errorGeneral) && (
              <View style={styles.cajaErrorGeneral}>
                <Text style={styles.textoErrorGeneral}>{errorGeneral}</Text>
              </View>
            )}

            {/* Botón Guardar */}
            <Pressable
              style={styles.botonGuardar}
              onPress={manejarGuardar}
              disabled={guardando}
            >
              {guardando ? (
                <ActivityIndicator size="small" color={COLORES.blanco} />
              ) : (
                <Text style={styles.textoBotonGuardar}>Guardar Servicio</Text>
              )}
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORES.textoOscuro,
    justifyContent: 'flex-end',
  },
  contenedorModal: {
    backgroundColor: COLORES.fondoApp,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  headerModal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORES.bordeClaro,
  },
  tituloModal: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORES.tealOscuro,
  },
  subtituloModal: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORES.textoMudo,
    marginTop: 2,
  },
  botonCerrar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORES.blanco,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  scrollContenido: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  etiquetaCampo: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORES.tealOscuro,
    marginBottom: 6,
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectorTipoFila: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  opcionTipo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORES.blanco,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    gap: 6,
  },
  opcionTipoActiva: {
    backgroundColor: COLORES.verdeEsmeralda,
    borderColor: COLORES.verdeEsmeralda,
  },
  textoOpcionTipo: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORES.tealOscuro,
  },
  textoOpcionTipoActivo: {
    color: COLORES.blanco,
  },
  inputFila: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.blanco,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    paddingHorizontal: 14,
    height: 48,
  },
  iconoInput: {
    marginRight: 10,
  },
  inputText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORES.tealOscuro,
  },
  inputSimple: {
    backgroundColor: COLORES.blanco,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    fontWeight: '600',
    color: COLORES.tealOscuro,
  },
  inputArea: {
    backgroundColor: COLORES.blanco,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '500',
    color: COLORES.tealOscuro,
    textAlignVertical: 'top',
    minHeight: 70,
  },
  inputError: {
    borderColor: COLORES.rojoError,
  },
  textoErrorValidacion: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORES.rojoError,
    marginTop: 4,
  },
  previewFppCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.verdeMentha,
    borderRadius: 16,
    padding: 12,
    marginTop: 14,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: COLORES.verdeEsmeralda,
  },
  iconoSparkle: {
    marginRight: 10,
  },
  previewFppInfo: {
    flex: 1,
  },
  previewFppTitulo: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORES.verdeOscuro,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewFppValor: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORES.verdeOscuro,
    marginTop: 2,
  },
  bloqueCamposEspecificos: {
    backgroundColor: COLORES.blanco,
    borderRadius: 20,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  seccionSubtitulo: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORES.verdeOscuro,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  cajaErrorGeneral: {
    backgroundColor: COLORES.rojoClaro,
    borderRadius: 12,
    padding: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORES.rojoError,
  },
  textoErrorGeneral: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORES.rojoError,
    textAlign: 'center',
  },
  botonGuardar: {
    backgroundColor: COLORES.verdeEsmeralda,
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  textoBotonGuardar: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORES.blanco,
    letterSpacing: 0.5,
  },
});
