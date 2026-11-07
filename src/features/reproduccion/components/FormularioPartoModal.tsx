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
import { X, Calendar, AlertTriangle, Baby, Scale, Tag, AlertCircle } from 'lucide-react-native';
import { format } from 'date-fns';
import { COLORES } from '../../../shared/theme/colores';
import { SelectorFecha } from '../../../shared/components/SelectorFecha';
import { Animal } from '../../animales/types/Animal';

export interface FormularioPartoModalProps {
  visible: boolean;
  animal: Animal;
  onGuardar: (datos: {
    fecha: string;
    sexoCria: 'M' | 'H';
    pesoCria?: number;
    areteCria?: string;
    observaciones?: string;
  }) => Promise<void>;
  onCerrar: () => void;
}

export function FormularioPartoModal({
  visible,
  animal,
  onGuardar,
  onCerrar,
}: FormularioPartoModalProps) {
  const hoyISO = new Date().toISOString().split('T')[0];

  const [fecha, setFecha] = useState(hoyISO);
  const [sexoCria, setSexoCria] = useState<'M' | 'H'>('H');
  const [pesoCria, setPesoCria] = useState('');
  const [areteCria, setAreteCria] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const [guardando, setGuardando] = useState(false);
  const [errorFecha, setErrorFecha] = useState('');
  const [errorGeneral, setErrorGeneral] = useState('');

  useEffect(() => {
    if (visible) {
      setFecha(new Date().toISOString().split('T')[0]);
      setSexoCria('H');
      setPesoCria('');
      setAreteCria('');
      setObservaciones('');
      setErrorFecha('');
      setErrorGeneral('');
      setGuardando(false);
    }
  }, [visible]);

  const validarFormulario = (): boolean => {
    setErrorFecha('');
    setErrorGeneral('');

    if (!fecha.trim()) {
      setErrorFecha('La fecha del parto es obligatoria');
      return false;
    }

    if (!sexoCria) {
      setErrorGeneral('Debe seleccionar el sexo de la cría.');
      return false;
    }

    return true;
  };

  const manejarGuardar = async () => {
    if (!validarFormulario()) return;

    setGuardando(true);
    try {
      const pesoNum = pesoCria.trim() ? parseFloat(pesoCria.replace(',', '.')) : undefined;

      await onGuardar({
        fecha: fecha.trim(),
        sexoCria,
        pesoCria: pesoNum && !isNaN(pesoNum) ? pesoNum : undefined,
        areteCria: areteCria.trim() || undefined,
        observaciones: observaciones.trim() || undefined,
      });
      onCerrar();
    } catch (err) {
      if (err instanceof Error) {
        setErrorGeneral(err.message);
      } else {
        setErrorGeneral('Error inesperado al registrar el parto');
      }
    } finally {
      setGuardando(false);
    }
  };

  const noEstaPrenada = animal.estadoReproductivo !== 'preñada';

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
                <Baby size={20} color={COLORES.verdeOscuro} />
              </View>
              <View>
                <Text style={styles.tituloModal}>Registrar Parto</Text>
                <Text style={styles.subtituloModal}>
                  Madre #{animal.arete} {animal.nombre ? `• ${animal.nombre}` : ''}
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
            {/* Advertencia si no está preñada */}
            {noEstaPrenada && (
              <View style={styles.tarjetaAdvertenciaNoPrenada}>
                <View style={styles.filaAdvertencia}>
                  <AlertTriangle size={18} color={COLORES.ambarOscuro} />
                  <Text style={styles.tituloAdvertencia}>AVISO DE REPRODUCCIÓN</Text>
                </View>
                <Text style={styles.textoAdvertencia}>
                  Este animal no está marcado actualmente como preñado (estado actual: {animal.estadoReproductivo.toUpperCase()}).
                  Al guardar, se registrará el evento y pasará a estado LACTANCIA.
                </Text>
              </View>
            )}

            {/* Error general */}
            {Boolean(errorGeneral) && (
              <View style={styles.cajaError}>
                <AlertCircle size={16} color={COLORES.rojoError} />
                <Text style={styles.textoError}>{errorGeneral}</Text>
              </View>
            )}

            {/* Fecha del Parto */}
            <SelectorFecha
              label="FECHA DEL PARTO"
              valor={fecha}
              onChange={(val) => {
                setFecha(val);
                setErrorFecha('');
              }}
              requerido
              maximo={format(new Date(), 'yyyy-MM-dd')}
              error={errorFecha}
            />

            {/* Radio Sexo de la Cría (Grande y Visual) */}
            <Text style={styles.etiquetaCampo}>SEXO DE LA CRÍA *</Text>
            <View style={styles.filaSexoCria}>
              <Pressable
                onPress={() => setSexoCria('H')}
                style={
                  sexoCria === 'H'
                    ? styles.tarjetaSexoHembraActiva
                    : styles.tarjetaSexoInactiva
                }
              >
                <Text
                  style={
                    sexoCria === 'H'
                      ? styles.iconoSexoHembraActivo
                      : styles.iconoSexoInactivo
                  }
                >
                  ♀
                </Text>
                <Text
                  style={
                    sexoCria === 'H'
                      ? styles.textoSexoHembraActivo
                      : styles.textoSexoInactivo
                  }
                >
                  HEMBRA (Bucerina)
                </Text>
                <Text style={styles.subtextoSexo}>Futura productora</Text>
              </Pressable>

              <Pressable
                onPress={() => setSexoCria('M')}
                style={
                  sexoCria === 'M'
                    ? styles.tarjetaSexoMachoActiva
                    : styles.tarjetaSexoInactiva
                }
              >
                <Text
                  style={
                    sexoCria === 'M'
                      ? styles.iconoSexoMachoActivo
                      : styles.iconoSexoInactivo
                  }
                >
                  ♂
                </Text>
                <Text
                  style={
                    sexoCria === 'M'
                      ? styles.textoSexoMachoActivo
                      : styles.textoSexoInactivo
                  }
                >
                  MACHO (Bucerro)
                </Text>
                <Text style={styles.subtextoSexo}>Cría macho</Text>
              </Pressable>
            </View>

            {/* Peso de la Cría (kg) */}
            <Text style={styles.etiquetaCampo}>PESO AL NACER (KG) - OPCIONAL</Text>
            <View style={styles.contenedorInputConIcono}>
              <Scale size={18} color={COLORES.textoSecundario} />
              <TextInput
                style={styles.inputConIcono}
                value={pesoCria}
                onChangeText={setPesoCria}
                placeholder="Ej: 32.5"
                placeholderTextColor={COLORES.grisIOSInactivo}
                keyboardType="numeric"
              />
            </View>

            {/* Arete de la Cría */}
            <Text style={styles.etiquetaCampo}>ARETE / IDENTIFICADOR DE LA CRÍA - OPCIONAL</Text>
            <View style={styles.contenedorInputConIcono}>
              <Tag size={18} color={COLORES.textoSecundario} />
              <TextInput
                style={styles.inputConIcono}
                value={areteCria}
                onChangeText={setAreteCria}
                placeholder="Ej: CRIA-104"
                placeholderTextColor={COLORES.grisIOSInactivo}
              />
            </View>

            {/* Observaciones */}
            <Text style={styles.etiquetaCampo}>OBSERVACIONES (OPCIONAL)</Text>
            <TextInput
              style={styles.inputTextArea}
              value={observaciones}
              onChangeText={setObservaciones}
              placeholder="Detalles del parto (distócico, eutócico, condición del neonato, etc.)"
              placeholderTextColor={COLORES.grisIOSInactivo}
              multiline
              numberOfLines={3}
            />

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
                  <Text style={styles.textoBotonGuardar}>Guardar Parto</Text>
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
  tarjetaAdvertenciaNoPrenada: {
    backgroundColor: COLORES.ambarClaro,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORES.ambarAlerta,
  },
  filaAdvertencia: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  tituloAdvertencia: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORES.ambarOscuro,
    letterSpacing: 0.5,
  },
  textoAdvertencia: {
    fontSize: 12,
    color: COLORES.ambarOscuro,
    lineHeight: 16,
    fontWeight: '500',
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
  filaSexoCria: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  tarjetaSexoHembraActiva: {
    flex: 1,
    backgroundColor: COLORES.verdeMentha,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORES.verdeEsmeralda,
  },
  tarjetaSexoMachoActiva: {
    flex: 1,
    backgroundColor: COLORES.aquaClaro,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORES.azulRey,
  },
  tarjetaSexoInactiva: {
    flex: 1,
    backgroundColor: COLORES.fondoApp,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORES.bordeClaro,
  },
  iconoSexoHembraActivo: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORES.verdeOscuro,
  },
  iconoSexoMachoActivo: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORES.azulRey,
  },
  iconoSexoInactivo: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORES.textoSecundario,
  },
  textoSexoHembraActivo: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORES.verdeOscuro,
    marginTop: 4,
    textAlign: 'center',
  },
  textoSexoMachoActivo: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORES.azulRey,
    marginTop: 4,
    textAlign: 'center',
  },
  textoSexoInactivo: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORES.textoSecundario,
    marginTop: 4,
    textAlign: 'center',
  },
  subtextoSexo: {
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
