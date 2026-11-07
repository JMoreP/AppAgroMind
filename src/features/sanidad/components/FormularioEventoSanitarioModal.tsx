import React, { useState, useEffect, useMemo } from 'react';
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
  Switch,
} from 'react-native';
import {
  X,
  Calendar,
  Syringe,
  AlertCircle,
  Clock,
  ShieldAlert,
  Users,
  User,
  CheckCircle2,
} from 'lucide-react-native';
import { COLORES } from '../../../shared/theme/colores';
import { SelectorFecha } from '../../../shared/components/SelectorFecha';
import { format } from 'date-fns';
import { Animal } from '../../animales/types/Animal';
import {
  TipoEventoSanitario,
} from '../types/EventoSanitario';
import { DatosCrearEventoSanitario } from '../hooks/useEventosSanitarios';
import {
  calcularProximaDosis,
  labelTipoEvento,
} from '../utils/calculosSanidad';
import { obtenerNombreAnimal } from '../../../shared/config/configuracionEspecie';

export interface FormularioEventoSanitarioModalProps {
  visible: boolean;
  animal?: Animal;
  onGuardar: (datos: DatosCrearEventoSanitario) => Promise<void>;
  onCerrar: () => void;
}

const TIPOS_DISPONIBLES: TipoEventoSanitario[] = [
  'aftosa',
  'clostridiales',
  'rabia',
  'brucelosis',
  'desparasitacion',
  'vitaminas',
  'antibiotico',
  'antiinflamatorio',
  'mastitis',
  'otro',
];

export function FormularioEventoSanitarioModal({
  visible,
  animal,
  onGuardar,
  onCerrar,
}: FormularioEventoSanitarioModalProps) {
  const hoyISO = new Date().toISOString().split('T')[0];

  const [fecha, setFecha] = useState(hoyISO);
  const [esGrupal, setEsGrupal] = useState(false);
  const [tipo, setTipo] = useState<TipoEventoSanitario>('aftosa');
  const [producto, setProducto] = useState('');
  const [dosis, setDosis] = useState('');
  const [responsable, setResponsable] = useState('');
  const [diasRetiroLeche, setDiasRetiroLeche] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const [guardando, setGuardando] = useState(false);
  const [errorFecha, setErrorFecha] = useState('');
  const [errorProducto, setErrorProducto] = useState('');
  const [errorGeneral, setErrorGeneral] = useState('');

  useEffect(() => {
    if (visible) {
      setFecha(new Date().toISOString().split('T')[0]);
      setEsGrupal(!animal);
      setTipo('aftosa');
      setProducto('');
      setDosis('');
      setResponsable('');
      setDiasRetiroLeche('');
      setObservaciones('');
      setErrorFecha('');
      setErrorProducto('');
      setErrorGeneral('');
      setGuardando(false);
    }
  }, [visible, animal]);

  const proximaDosisSugerida = useMemo(() => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(fecha.trim())) return null;
    try {
      return calcularProximaDosis(fecha.trim(), tipo);
    } catch {
      return null;
    }
  }, [fecha, tipo]);

  const validarFormulario = (): boolean => {
    setErrorFecha('');
    setErrorProducto('');
    setErrorGeneral('');

    if (!fecha.trim()) {
      setErrorFecha('La fecha del evento es obligatoria');
      return false;
    }

    if (!producto.trim()) {
      setErrorProducto('El nombre del producto es obligatorio');
      return false;
    }

    if (diasRetiroLeche.trim()) {
      const retiroNum = parseInt(diasRetiroLeche.trim(), 10);
      if (isNaN(retiroNum) || retiroNum < 0) {
        setErrorGeneral('Los días de retiro de leche deben ser un número mayor o igual a 0');
        return false;
      }
    }

    return true;
  };

  const manejarGuardar = async () => {
    if (!validarFormulario()) return;

    setGuardando(true);
    try {
      const retiroNum = diasRetiroLeche.trim()
        ? parseInt(diasRetiroLeche.trim(), 10)
        : undefined;

      await onGuardar({
        animalId: esGrupal || !animal ? undefined : animal.id,
        esGrupal: esGrupal || !animal ? 1 : 0,
        fecha: fecha.trim(),
        tipo,
        producto: producto.trim(),
        dosis: dosis.trim() || undefined,
        responsable: responsable.trim() || undefined,
        proximaDosis: proximaDosisSugerida || undefined,
        diasRetiroLeche: retiroNum,
        observaciones: observaciones.trim() || undefined,
      });

      onCerrar();
    } catch (err) {
      if (err instanceof Error) {
        setErrorGeneral(err.message);
      } else {
        setErrorGeneral('Error inesperado al guardar el evento sanitario');
      }
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onCerrar}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalFondo}
      >
        <View style={styles.modalContenedor}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.filaHeader}>
              <View style={styles.iconoHeaderContenedor}>
                <Syringe size={20} color={COLORES.verdeEsmeralda} />
              </View>
              <View>
                <Text style={styles.modalTitulo}>Registrar Evento Sanitario</Text>
                <Text style={styles.modalSubtitulo}>
                  {animal && !esGrupal
                    ? `Animal #${animal.arete} ${animal.nombre ? `(${animal.nombre})` : ''}`
                    : 'Aplicación a todo el hato'}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={onCerrar}
              hitSlop={12}
              style={({ pressed }) =>
                pressed ? styles.botonCerrarPresionado : styles.botonCerrar
              }
            >
              <X size={20} color={COLORES.textoOscuro} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.cuerpoScroll}
          >
            {/* Error General */}
            {Boolean(errorGeneral) && (
              <View style={styles.cajaError}>
                <AlertCircle size={16} color={COLORES.rojoError} />
                <Text style={styles.textoError}>{errorGeneral}</Text>
              </View>
            )}

            {/* Switch Grupal si viene con animal */}
            {Boolean(animal) && (
              <View style={styles.cajaToggleGrupal}>
                <View style={styles.filaInfoToggle}>
                  {esGrupal ? (
                    <Users size={18} color={COLORES.verdeEsmeralda} />
                  ) : (
                    <User size={18} color={COLORES.tealOscuro} />
                  )}
                  <View style={styles.columnaToggleTexto}>
                    <Text style={styles.tituloToggle}>
                      {esGrupal ? 'Evento Grupal (Todo el Hato)' : 'Evento Individual'}
                    </Text>
                    <Text style={styles.subtituloToggle}>
                      {esGrupal
                        ? 'Se aplicará a todo el rebaño en general'
                        : `Solo se registrará para ${animal?.especie ? obtenerNombreAnimal(animal.especie, animal.sexo) : 'el animal'} #${animal?.arete}`}
                    </Text>
                  </View>
                </View>

                <Switch
                  value={esGrupal}
                  onValueChange={setEsGrupal}
                  trackColor={{ false: COLORES.bordeClaro, true: COLORES.verdeEsmeralda }}
                  thumbColor={COLORES.blanco}
                />
              </View>
            )}

            {/* SECCIÓN 1: Fecha */}
            <SelectorFecha
              label="FECHA DEL EVENTO"
              valor={fecha}
              onChange={(val) => {
                setFecha(val);
                setErrorFecha('');
              }}
              requerido
              maximo={format(new Date(), 'yyyy-MM-dd')}
              error={errorFecha}
            />

            {/* SECCIÓN 2: Tipo de Evento */}
            <View style={styles.campoContenedor}>
              <Text style={styles.etiquetaCampo}>TIPO DE EVENTO SANITARIO *</Text>
              <View style={styles.gridTipos}>
                {TIPOS_DISPONIBLES.map((t) => {
                  const seleccionado = tipo === t;
                  return (
                    <Pressable
                      key={t}
                      style={[
                        styles.chipTipo,
                        seleccionado && styles.chipTipoSeleccionado,
                      ]}
                      onPress={() => setTipo(t)}
                    >
                      <Text
                        style={[
                          styles.textoChipTipo,
                          seleccionado && styles.textoChipTipoSeleccionado,
                        ]}
                      >
                        {labelTipoEvento(t)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* SECCIÓN 3: Producto */}
            <View style={styles.campoContenedor}>
              <Text style={styles.etiquetaCampo}>PRODUCTO O VACUNA *</Text>
              <TextInput
                style={[styles.inputTexto, Boolean(errorProducto) && styles.inputError]}
                value={producto}
                onChangeText={setProducto}
                placeholder="Ej: Aftogan, Ivermectina 1%, Oxitetraciclina"
                placeholderTextColor={COLORES.textoMudo}
              />
              {Boolean(errorProducto) && (
                <Text style={styles.textoErrorCampo}>{errorProducto}</Text>
              )}
            </View>

            {/* SECCIÓN 4: Dosis y Responsable */}
            <View style={styles.filaDosColumnas}>
              <View style={styles.columnaMedia}>
                <Text style={styles.etiquetaCampo}>DOSIS</Text>
                <TextInput
                  style={styles.inputTexto}
                  value={dosis}
                  onChangeText={setDosis}
                  placeholder="Ej: 5 ml, 1 frasco"
                  placeholderTextColor={COLORES.textoMudo}
                />
              </View>

              <View style={styles.columnaMedia}>
                <Text style={styles.etiquetaCampo}>RESPONSABLE</Text>
                <TextInput
                  style={styles.inputTexto}
                  value={responsable}
                  onChangeText={setResponsable}
                  placeholder="Veterinario / Vacunador"
                  placeholderTextColor={COLORES.textoMudo}
                />
              </View>
            </View>

            {/* SECCIÓN 5: Días de Retiro de Leche */}
            <View style={styles.campoContenedor}>
              <View style={styles.filaEtiqueta}>
                <ShieldAlert size={14} color={COLORES.ambarOscuro} />
                <Text style={styles.etiquetaCampo}>DÍAS DE RETIRO DE LECHE (OPCIONAL)</Text>
              </View>
              <TextInput
                style={styles.inputTexto}
                value={diasRetiroLeche}
                onChangeText={setDiasRetiroLeche}
                placeholder="Ej: 3 (dejar vacío si no requiere retiro)"
                placeholderTextColor={COLORES.textoMudo}
                keyboardType="numeric"
              />
              <Text style={styles.textoHintRetiro}>
                Aplica para tratamientos con antibióticos o medicamentos con período de carencia.
              </Text>
            </View>

            {/* SECCIÓN 6: Observaciones */}
            <View style={styles.campoContenedor}>
              <Text style={styles.etiquetaCampo}>OBSERVACIONES</Text>
              <TextInput
                style={styles.inputTextArea}
                value={observaciones}
                onChangeText={setObservaciones}
                placeholder="Notas adicionales sobre la reacción, lote o vía de aplicación..."
                placeholderTextColor={COLORES.textoMudo}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* PANEL PREVIEW EN VIVO: Próxima Dosis Sugerida */}
            <View style={styles.tarjetaPreview}>
              <View style={styles.filaPreviewCabecera}>
                <Clock size={16} color={COLORES.verdeEsmeralda} />
                <Text style={styles.tituloPreview}>Recordatorio de Próxima Dosis</Text>
              </View>

              {proximaDosisSugerida ? (
                <View style={styles.cajaDosisSugerida}>
                  <CheckCircle2 size={16} color={COLORES.verdeOscuro} />
                  <Text style={styles.textoDosisSugerida}>
                    {`Próxima dosis sugerida: ${proximaDosisSugerida}`}
                  </Text>
                </View>
              ) : (
                <Text style={styles.textoSinRecordatorio}>
                  Sin recordatorio automático para este tipo de evento.
                </Text>
              )}
            </View>

            {/* Botones de Acción */}
            <View style={styles.filaBotonesAccion}>
              <Pressable
                onPress={onCerrar}
                style={styles.botonCancelar}
                disabled={guardando}
              >
                <Text style={styles.textoBotonCancelar}>Cancelar</Text>
              </Pressable>

              <Pressable
                onPress={manejarGuardar}
                style={styles.botonGuardar}
                disabled={guardando}
              >
                {guardando ? (
                  <ActivityIndicator size="small" color={COLORES.blanco} />
                ) : (
                  <Text style={styles.textoBotonGuardar}>Guardar Evento</Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalFondo: {
    flex: 1,
    backgroundColor: COLORES.blancoTransparente80,
    justifyContent: 'flex-end',
  },
  modalContenedor: {
    backgroundColor: COLORES.blanco,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
    shadowColor: COLORES.textoOscuro,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 20,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORES.bordeClaro,
  },
  filaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconoHeaderContenedor: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORES.verdeMentha,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitulo: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORES.tealOscuro,
  },
  modalSubtitulo: {
    fontSize: 12,
    color: COLORES.textoSecundario,
    marginTop: 2,
  },
  botonCerrar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORES.fondoApp,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonCerrarPresionado: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORES.bordeClaro,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cuerpoScroll: {
    padding: 20,
    paddingBottom: 40,
  },
  cajaError: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.rojoClaro,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  textoError: {
    fontSize: 12,
    color: COLORES.rojoError,
    fontWeight: '600',
    flex: 1,
  },
  cajaToggleGrupal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORES.fondoApp,
    padding: 14,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  filaInfoToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 12,
  },
  columnaToggleTexto: {
    flex: 1,
  },
  tituloToggle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORES.tealOscuro,
  },
  subtituloToggle: {
    fontSize: 11,
    color: COLORES.textoSecundario,
    marginTop: 2,
  },
  campoContenedor: {
    marginBottom: 16,
  },
  filaEtiqueta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  etiquetaCampo: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORES.textoMudo,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  inputTexto: {
    backgroundColor: COLORES.fondoApp,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORES.textoOscuro,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  inputTextArea: {
    backgroundColor: COLORES.fondoApp,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORES.textoOscuro,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: COLORES.rojoError,
  },
  textoErrorCampo: {
    fontSize: 11,
    color: COLORES.rojoError,
    marginTop: 4,
  },
  textoHintRetiro: {
    fontSize: 11,
    color: COLORES.textoSecundario,
    marginTop: 4,
    fontStyle: 'italic',
  },
  gridTipos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipTipo: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: COLORES.fondoApp,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  chipTipoSeleccionado: {
    backgroundColor: COLORES.verdeEsmeralda,
    borderColor: COLORES.verdeOscuro,
  },
  textoChipTipo: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORES.tealOscuro,
  },
  textoChipTipoSeleccionado: {
    color: COLORES.blanco,
    fontWeight: '800',
  },
  filaDosColumnas: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  columnaMedia: {
    flex: 1,
  },
  tarjetaPreview: {
    backgroundColor: COLORES.fondoApp,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    marginBottom: 20,
  },
  filaPreviewCabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tituloPreview: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORES.tealOscuro,
    textTransform: 'uppercase',
  },
  cajaDosisSugerida: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORES.verdeMentha,
    padding: 10,
    borderRadius: 10,
  },
  textoDosisSugerida: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORES.verdeOscuro,
  },
  textoSinRecordatorio: {
    fontSize: 12,
    color: COLORES.textoMudo,
    fontStyle: 'italic',
  },
  filaBotonesAccion: {
    flexDirection: 'row',
    gap: 12,
  },
  botonCancelar: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORES.fondoApp,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  textoBotonCancelar: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORES.textoSecundario,
  },
  botonGuardar: {
    flex: 2,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORES.verdeEsmeralda,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoBotonGuardar: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORES.blanco,
    letterSpacing: 0.5,
  },
});
