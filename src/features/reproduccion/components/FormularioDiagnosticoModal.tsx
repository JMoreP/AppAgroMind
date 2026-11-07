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
import { X, Calendar, Stethoscope, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react-native';
import { format } from 'date-fns';
import { COLORES } from '../../../shared/theme/colores';
import { SelectorFecha } from '../../../shared/components/SelectorFecha';
import { Animal } from '../../animales/types/Animal';
import { ServicioReproductivo } from '../types/ServicioReproductivo';
import { calcularFechaProbableParto } from '../utils/calculosReproductivos';
import { obtenerNombreAnimal, obtenerGestacionDias } from '../../../shared/config/configuracionEspecie';

export interface FormularioDiagnosticoModalProps {
  visible: boolean;
  animal: Animal;
  servicioPendiente?: ServicioReproductivo | null;
  onGuardar: (datos: {
    animalId: string;
    servicioId?: string;
    fecha: string;
    resultado: 'preñada' | 'vacia';
    metodo?: 'palpacion' | 'ecografia' | 'otro';
    veterinario?: string;
    observaciones?: string;
  }) => Promise<void>;
  onCerrar: () => void;
}

type TipoMetodo = 'palpacion' | 'ecografia' | 'otro';

export function FormularioDiagnosticoModal({
  visible,
  animal,
  servicioPendiente,
  onGuardar,
  onCerrar,
}: FormularioDiagnosticoModalProps) {
  const hoyISO = new Date().toISOString().split('T')[0];

  const [fecha, setFecha] = useState(hoyISO);
  const [resultado, setResultado] = useState<'preñada' | 'vacia'>('preñada');
  const [metodo, setMetodo] = useState<TipoMetodo>('palpacion');
  const [veterinario, setVeterinario] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const [guardando, setGuardando] = useState(false);
  const [errorFecha, setErrorFecha] = useState('');
  const [errorGeneral, setErrorGeneral] = useState('');

  useEffect(() => {
    if (visible) {
      setFecha(new Date().toISOString().split('T')[0]);
      setResultado('preñada');
      setMetodo('palpacion');
      setVeterinario(servicioPendiente?.veterinario || '');
      setObservaciones('');
      setErrorFecha('');
      setErrorGeneral('');
      setGuardando(false);
    }
  }, [visible, servicioPendiente]);

  const validarFormulario = (): boolean => {
    setErrorFecha('');
    setErrorGeneral('');

    if (!fecha.trim()) {
      setErrorFecha('La fecha del diagnóstico es obligatoria');
      return false;
    }

    if (!resultado) {
      setErrorGeneral('Debe seleccionar el resultado del diagnóstico.');
      return false;
    }

    return true;
  };

  const manejarGuardar = async () => {
    if (!validarFormulario()) return;

    setGuardando(true);
    try {
      await onGuardar({
        animalId: animal.id,
        servicioId: servicioPendiente?.id,
        fecha: fecha.trim(),
        resultado,
        metodo,
        veterinario: veterinario.trim() || undefined,
        observaciones: observaciones.trim() || undefined,
      });
      onCerrar();
    } catch (err) {
      if (err instanceof Error) {
        setErrorGeneral(err.message);
      } else {
        setErrorGeneral('Error inesperado al guardar el diagnóstico');
      }
    } finally {
      setGuardando(false);
    }
  };

  // Detalle del servicio vinculado para mostrar en el resumen
  const detalleServicio = servicioPendiente
    ? servicioPendiente.tipo === 'inseminacion'
      ? `Inseminación${servicioPendiente.numeroPajuela ? ` (Pajuela #${servicioPendiente.numeroPajuela})` : ''}`
      : `Monta natural${servicioPendiente.toroNumero ? ` (Toro #${servicioPendiente.toroNumero})` : ''}`
    : null;

  // Fecha base para la FPP: fecha del servicio pendiente si existe, sino fecha del diagnóstico
  const fechaBaseFPP = servicioPendiente?.fecha || fecha;
  const fppEstimada = calcularFechaProbableParto(fechaBaseFPP, animal.especie || 'bufalino');

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onCerrar}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.fondoModal}
      >
        <View style={styles.contenedorModal}>
          {/* Header */}
          <View style={styles.encabezadoModal}>
            <View style={styles.encabezadoIconoTexto}>
              <View style={styles.iconoEncabezadoBadge}>
                <Stethoscope size={20} color={COLORES.verdeOscuro} />
              </View>
              <View>
                <Text style={styles.tituloModal}>Diagnóstico de Preñez</Text>
                <Text style={styles.subtituloModal}>
                  {`${obtenerNombreAnimal(animal.especie || 'bufalino', animal.sexo)} ${animal.arete} ${animal.nombre ? `• ${animal.nombre}` : ''}`}
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
            {/* Resumen del Servicio Vinculado */}
            {servicioPendiente && (
              <View style={styles.tarjetaServicioVinculado}>
                <Text style={styles.etiquetaServicioVinculado}>
                  SERVICIO PENDIENTE VINCULADO
                </Text>
                <Text style={styles.textoServicioVinculado}>
                  Servicio del {servicioPendiente.fecha} • {detalleServicio}
                </Text>
                {servicioPendiente.veterinario ? (
                  <Text style={styles.textoServicioVet}>
                    Inseminador: {servicioPendiente.veterinario}
                  </Text>
                ) : null}
              </View>
            )}

            {/* Error general */}
            {Boolean(errorGeneral) && (
              <View style={styles.cajaError}>
                <AlertCircle size={16} color={COLORES.rojoError} />
                <Text style={styles.textoError}>{errorGeneral}</Text>
              </View>
            )}

            {/* Selector de Resultado (Grande y Visual) */}
            <Text style={styles.etiquetaCampo}>RESULTADO DE LA EVALUACIÓN *</Text>
            <View style={styles.filaResultado}>
              <Pressable
                onPress={() => setResultado('preñada')}
                style={
                  resultado === 'preñada'
                    ? styles.tarjetaResultadoPreñadaActiva
                    : styles.tarjetaResultadoInactiva
                }
              >
                <CheckCircle2
                  size={24}
                  color={
                    resultado === 'preñada'
                      ? COLORES.verdeOscuro
                      : COLORES.textoSecundario
                  }
                />
                <Text
                  style={
                    resultado === 'preñada'
                      ? styles.textoResultadoPreñadaActivo
                      : styles.textoResultadoInactivo
                  }
                >
                  PREÑADA
                </Text>
                <Text style={styles.subtextoResultado}>Confirmar preñez</Text>
              </Pressable>

              <Pressable
                onPress={() => setResultado('vacia')}
                style={
                  resultado === 'vacia'
                    ? styles.tarjetaResultadoVaciaActiva
                    : styles.tarjetaResultadoInactiva
                }
              >
                <AlertCircle
                  size={24}
                  color={
                    resultado === 'vacia'
                      ? COLORES.rojoError
                      : COLORES.textoSecundario
                  }
                />
                <Text
                  style={
                    resultado === 'vacia'
                      ? styles.textoResultadoVaciaActivo
                      : styles.textoResultadoInactivo
                  }
                >
                  VACÍA
                </Text>
                <Text style={styles.subtextoResultado}>Sin concepción</Text>
              </Pressable>
            </View>

            {/* Fecha del Diagnóstico */}
            <SelectorFecha
              label="FECHA DEL DIAGNÓSTICO"
              valor={fecha}
              onChange={(val) => {
                setFecha(val);
                setErrorFecha('');
              }}
              requerido
              minimo={servicioPendiente?.fecha}
              maximo={format(new Date(), 'yyyy-MM-dd')}
              error={errorFecha}
            />

            {/* Selector de Método */}
            <Text style={styles.etiquetaCampo}>MÉTODO DE EVALUACIÓN</Text>
            <View style={styles.filaMetodos}>
              <Pressable
                onPress={() => setMetodo('palpacion')}
                style={
                  metodo === 'palpacion'
                    ? styles.botonMetodoActivo
                    : styles.botonMetodoInactivo
                }
              >
                <Text
                  style={
                    metodo === 'palpacion'
                      ? styles.textoMetodoActivo
                      : styles.textoMetodoInactivo
                  }
                >
                  Palpación
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setMetodo('ecografia')}
                style={
                  metodo === 'ecografia'
                    ? styles.botonMetodoActivo
                    : styles.botonMetodoInactivo
                }
              >
                <Text
                  style={
                    metodo === 'ecografia'
                      ? styles.textoMetodoActivo
                      : styles.textoMetodoInactivo
                  }
                >
                  Ecografía
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setMetodo('otro')}
                style={
                  metodo === 'otro'
                    ? styles.botonMetodoActivo
                    : styles.botonMetodoInactivo
                }
              >
                <Text
                  style={
                    metodo === 'otro'
                      ? styles.textoMetodoActivo
                      : styles.textoMetodoInactivo
                  }
                >
                  Otro
                </Text>
              </Pressable>
            </View>

            {/* Veterinario / Profesional */}
            <Text style={styles.etiquetaCampo}>VETERINARIO / EVALUADOR</Text>
            <TextInput
              style={styles.inputTexto}
              value={veterinario}
              onChangeText={setVeterinario}
              placeholder="Ej: Dr. Roberto Hernández"
              placeholderTextColor={COLORES.grisIOSInactivo}
            />

            {/* Observaciones */}
            <Text style={styles.etiquetaCampo}>OBSERVACIONES (OPCIONAL)</Text>
            <TextInput
              style={styles.inputTextArea}
              value={observaciones}
              onChangeText={setObservaciones}
              placeholder="Comentarios adicionales sobre el estado ovárico, desarrollo fetal, etc."
              placeholderTextColor={COLORES.grisIOSInactivo}
              multiline
              numberOfLines={3}
            />

            {/* Preview de Parto Probable (Solo si PREÑADA) */}
            {resultado === 'preñada' && (
              <View style={styles.tarjetaPreviewParto}>
                <View style={styles.iconoPreviewParto}>
                  <Sparkles size={18} color={COLORES.verdeOscuro} />
                </View>
                <View style={styles.textoPreviewContenedor}>
                  <Text style={styles.tituloPreviewParto}>
                    {`FECHA PROBABLE DE PARTO (+${obtenerGestacionDias(animal.especie || 'bufalino')} DÍAS)`}
                  </Text>
                  <Text style={styles.fechaPreviewParto}>{fppEstimada}</Text>
                  <Text style={styles.subtextoPreviewParto}>
                    {servicioPendiente
                      ? `Calculada a partir del servicio del ${servicioPendiente.fecha}`
                      : `Calculada a partir de la fecha del servicio`}
                  </Text>
                </View>
              </View>
            )}

            {/* Botones de acción */}
            <View style={styles.filaAcciones}>
              <Pressable
                onPress={onCerrar}
                style={({ pressed }) =>
                  pressed ? styles.botonCancelarPresionado : styles.botonCancelar
                }
                disabled={guardando}
              >
                <Text style={styles.textoBotonCancelar}>Cancelar</Text>
              </Pressable>

              <Pressable
                onPress={manejarGuardar}
                style={({ pressed }) =>
                  pressed ? styles.botonGuardarPresionado : styles.botonGuardar
                }
                disabled={guardando}
              >
                {guardando ? (
                  <ActivityIndicator size="small" color={COLORES.blanco} />
                ) : (
                  <Text style={styles.textoBotonGuardar}>Guardar Diagnóstico</Text>
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
  fondoModal: {
    flex: 1,
    backgroundColor: COLORES.negroIndustrial,
    justifyContent: 'flex-end',
  },
  contenedorModal: {
    backgroundColor: COLORES.blanco,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  encabezadoModal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORES.bordeClaro,
  },
  encabezadoIconoTexto: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconoEncabezadoBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORES.verdeMentha,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tituloModal: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORES.textoOscuro,
  },
  subtituloModal: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORES.textoSecundario,
    marginTop: 2,
  },
  botonCerrar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORES.fondoApp,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonCerrarPresionado: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORES.bordeClaro,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cuerpoScroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  tarjetaServicioVinculado: {
    backgroundColor: COLORES.ambarClaro,
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORES.ambarAlerta,
  },
  etiquetaServicioVinculado: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORES.ambarOscuro,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  textoServicioVinculado: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORES.textoOscuro,
  },
  textoServicioVet: {
    fontSize: 12,
    color: COLORES.textoSecundario,
    marginTop: 2,
  },
  cajaError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORES.rojoClaro,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  textoError: {
    fontSize: 13,
    color: COLORES.rojoError,
    flex: 1,
    fontWeight: '600',
  },
  etiquetaCampo: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORES.textoSecundario,
    letterSpacing: 0.6,
    marginTop: 12,
    marginBottom: 8,
  },
  filaResultado: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  tarjetaResultadoPreñadaActiva: {
    flex: 1,
    backgroundColor: COLORES.verdeMentha,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORES.verdeEsmeralda,
  },
  tarjetaResultadoVaciaActiva: {
    flex: 1,
    backgroundColor: COLORES.rojoClaro,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORES.rojoError,
  },
  tarjetaResultadoInactiva: {
    flex: 1,
    backgroundColor: COLORES.fondoApp,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORES.bordeClaro,
  },
  textoResultadoPreñadaActivo: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORES.verdeOscuro,
    marginTop: 6,
  },
  textoResultadoVaciaActivo: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORES.rojoError,
    marginTop: 6,
  },
  textoResultadoInactivo: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORES.textoSecundario,
    marginTop: 6,
  },
  subtextoResultado: {
    fontSize: 11,
    color: COLORES.textoSecundario,
    marginTop: 2,
  },
  contenedorInputConIcono: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORES.fondoApp,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  inputConIcono: {
    flex: 1,
    fontSize: 15,
    color: COLORES.textoOscuro,
    padding: 0,
    fontWeight: '600',
  },
  textoErrorValidacion: {
    fontSize: 12,
    color: COLORES.rojoError,
    marginTop: 4,
    fontWeight: '500',
  },
  filaMetodos: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  botonMetodoActivo: {
    flex: 1,
    backgroundColor: COLORES.verdeEsmeralda,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  botonMetodoInactivo: {
    flex: 1,
    backgroundColor: COLORES.fondoApp,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  textoMetodoActivo: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORES.blanco,
  },
  textoMetodoInactivo: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORES.textoSecundario,
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
    minHeight: 80,
    textAlignVertical: 'top',
  },
  tarjetaPreviewParto: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORES.verdeMentha,
    borderRadius: 16,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORES.verdeEsmeralda,
  },
  iconoPreviewParto: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORES.blanco,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoPreviewContenedor: {
    flex: 1,
  },
  tituloPreviewParto: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORES.verdeOscuro,
    letterSpacing: 0.6,
  },
  fechaPreviewParto: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORES.textoOscuro,
    marginTop: 2,
  },
  subtextoPreviewParto: {
    fontSize: 11,
    color: COLORES.verdeOscuro,
    marginTop: 2,
  },
  filaAcciones: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  botonCancelar: {
    flex: 1,
    backgroundColor: COLORES.fondoApp,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  botonCancelarPresionado: {
    flex: 1,
    backgroundColor: COLORES.bordeClaro,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  textoBotonCancelar: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORES.textoSecundario,
  },
  botonGuardar: {
    flex: 2,
    backgroundColor: COLORES.verdeEsmeralda,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  botonGuardarPresionado: {
    flex: 2,
    backgroundColor: COLORES.verdeOscuro,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  textoBotonGuardar: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORES.blanco,
  },
});
