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
import { X, AlertTriangle, AlertCircle } from 'lucide-react-native';
import { COLORES } from '../../../shared/theme/colores';
import { SelectorFecha } from '../../../shared/components/SelectorFecha';
import { Animal } from '../../animales/types/Animal';
import { obtenerNombreAnimal } from '../../../shared/config/configuracionEspecie';

export interface FormularioMortalidadModalProps {
  visible: boolean;
  animal: Animal;
  onGuardar: (datos: { fecha: string; causa: string; observaciones?: string }) => Promise<void>;
  onCerrar: () => void;
}

export function FormularioMortalidadModal({
  visible,
  animal,
  onGuardar,
  onCerrar,
}: FormularioMortalidadModalProps) {
  const hoyISO = new Date().toISOString().split('T')[0];

  const [fecha, setFecha] = useState<string>(hoyISO);
  const [causa, setCausa] = useState<string>('');
  const [observaciones, setObservaciones] = useState<string>('');
  const [guardando, setGuardando] = useState<boolean>(false);
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setFecha(hoyISO);
      setCausa('');
      setObservaciones('');
      setErrorValidacion(null);
      setGuardando(false);
    }
  }, [visible, hoyISO]);

  const handleGuardar = async () => {
    if (!causa.trim()) {
      setErrorValidacion('Debes ingresar la causa de la muerte.');
      return;
    }

    if (!fecha) {
      setErrorValidacion('Debes seleccionar la fecha de la muerte.');
      return;
    }

    if (fecha > hoyISO) {
      setErrorValidacion('La fecha no puede ser futura.');
      return;
    }

    setErrorValidacion(null);
    setGuardando(true);
    try {
      await onGuardar({
        fecha,
        causa: causa.trim(),
        observaciones: observaciones.trim() ? observaciones.trim() : undefined,
      });
      onCerrar();
    } catch (err) {
      if (err instanceof Error) {
        setErrorValidacion(err.message);
      } else {
        setErrorValidacion('Ocurrió un error al registrar la muerte.');
      }
    } finally {
      setGuardando(false);
    }
  };

  const nombreEspecie = obtenerNombreAnimal(animal.especie, animal.sexo);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCerrar}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContainer}>
          {/* Encabezado */}
          <View style={styles.header}>
            <View style={styles.headerIconContainer}>
              <AlertTriangle size={24} color={COLORES.rojoError} />
            </View>
            <View style={styles.headerTextos}>
              <Text style={styles.headerTitulo}>Registrar Muerte</Text>
              <Text style={styles.headerSubtitulo}>
                {`${nombreEspecie} #${animal.arete}${animal.nombre ? ` (${animal.nombre})` : ''}`}
              </Text>
            </View>
            <Pressable
              onPress={onCerrar}
              style={styles.botonCerrar}
              disabled={guardando}
              hitSlop={8}
            >
              <X size={20} color={COLORES.textoMudo} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Banner de advertencia */}
            <View style={styles.cajaAdvertencia}>
              <AlertCircle size={20} color={COLORES.rojoError} style={styles.iconoAdvertencia} />
              <Text style={styles.textoAdvertencia}>
                Esta acción marcará al animal como muerto y no podrá usarse en otras operaciones. Puedes revertirlo eliminando el registro.
              </Text>
            </View>

            {/* Selector de fecha */}
            <SelectorFecha
              label="Fecha de Muerte"
              valor={fecha}
              onChange={setFecha}
              maximo={hoyISO}
              requerido
            />

            {/* Causa */}
            <View style={styles.campoGrupo}>
              <Text style={styles.campoLabel}>
                Causa de la Muerte <Text style={styles.asterisco}>*</Text>
              </Text>
              <TextInput
                style={styles.inputTexto}
                value={causa}
                onChangeText={(val) => {
                  setCausa(val);
                  if (errorValidacion) setErrorValidacion(null);
                }}
                placeholder="Ej. Neumonía, timpanismo, parto complicado..."
                placeholderTextColor={COLORES.textoMudo}
                editable={!guardando}
              />
            </View>

            {/* Observaciones */}
            <View style={styles.campoGrupo}>
              <Text style={styles.campoLabel}>Observaciones</Text>
              <TextInput
                style={[styles.inputTexto, styles.inputTextArea]}
                value={observaciones}
                onChangeText={setObservaciones}
                placeholder="Detalles sobre síntomas previos, tratamiento aplicado o necropsia..."
                placeholderTextColor={COLORES.textoMudo}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                editable={!guardando}
              />
            </View>

            {/* Error de validación */}
            {errorValidacion ? (
              <View style={styles.cajaError}>
                <AlertCircle size={16} color={COLORES.rojoError} />
                <Text style={styles.textoError}>{errorValidacion}</Text>
              </View>
            ) : null}
          </ScrollView>

          {/* Botones de acción */}
          <View style={styles.footerAcciones}>
            <Pressable
              style={styles.botonCancelar}
              onPress={onCerrar}
              disabled={guardando}
            >
              <Text style={styles.textoBotonCancelar}>Cancelar</Text>
            </Pressable>

            <Pressable
              style={[styles.botonConfirmarMuerte, guardando && styles.botonDeshabilitado]}
              onPress={handleGuardar}
              disabled={guardando}
            >
              {guardando ? (
                <ActivityIndicator size="small" color={COLORES.blanco} />
              ) : (
                <Text style={styles.textoBotonConfirmar}>Confirmar Muerte</Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 52, 56, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORES.blanco,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORES.bordeClaro,
  },
  headerIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORES.rojoClaro,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTextos: {
    flex: 1,
  },
  headerTitulo: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORES.tealOscuro,
  },
  headerSubtitulo: {
    fontSize: 13,
    color: COLORES.textoMudo,
    marginTop: 2,
    fontWeight: '600',
  },
  botonCerrar: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: COLORES.fondoApp,
  },
  scrollArea: {
    maxHeight: 460,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  cajaAdvertencia: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORES.rojoClaro,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORES.rojoClaro,
  },
  iconoAdvertencia: {
    marginRight: 10,
    marginTop: 2,
  },
  textoAdvertencia: {
    flex: 1,
    fontSize: 13,
    color: COLORES.rojoError,
    lineHeight: 18,
    fontWeight: '600',
  },
  campoGrupo: {
    gap: 6,
  },
  campoLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORES.tealOscuro,
  },
  asterisco: {
    color: COLORES.rojoError,
  },
  inputTexto: {
    backgroundColor: COLORES.fondoApp,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORES.tealOscuro,
  },
  inputTextArea: {
    minHeight: 80,
    paddingTop: 12,
  },
  cajaError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORES.rojoClaro,
    padding: 12,
    borderRadius: 10,
  },
  textoError: {
    flex: 1,
    fontSize: 13,
    color: COLORES.rojoError,
    fontWeight: '600',
  },
  footerAcciones: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORES.bordeClaro,
  },
  botonCancelar: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORES.fondoApp,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  textoBotonCancelar: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORES.textoMudo,
  },
  botonConfirmarMuerte: {
    flex: 2,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORES.rojoError,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
  textoBotonConfirmar: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORES.blanco,
  },
});
