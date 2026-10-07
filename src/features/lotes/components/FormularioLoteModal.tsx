import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Pressable, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Check, Layers } from 'lucide-react-native';
import { Lote } from '../types/Lote';
import { LoteRepository } from '../repositories/LoteRepository';
import { COLORES } from '../../../shared/theme/colores';

interface Props {
  visible: boolean;
  onCerrar: () => void;
  onLoteGuardado: () => void;
}

const OPCIONES_COLORES = [
  COLORES.verdeEsmeralda,
  COLORES.azulRey,
  COLORES.limaBrillante,
  COLORES.olivaOscuro,
  COLORES.tealOscuro,
];

export function FormularioLoteModal({ visible, onCerrar, onLoteGuardado }: Props) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [colorHex, setColorHex] = useState<string>(COLORES.verdeEsmeralda);
  const [guardando, setGuardando] = useState(false);
  const [errorNombre, setErrorNombre] = useState('');

  const resetFormulario = () => {
    setNombre('');
    setDescripcion('');
    setColorHex(COLORES.verdeEsmeralda);
    setErrorNombre('');
  };

  const guardarLote = async () => {
    setErrorNombre('');
    const nombreLimpio = nombre.trim();
    if (!nombreLimpio) {
      setErrorNombre('El nombre del lote es obligatorio.');
      return;
    }

    setGuardando(true);
    try {
      const idUnico = 'lote-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
      const nuevoLote: Lote = {
        id: idUnico,
        nombre: nombreLimpio,
        descripcion: descripcion.trim() || undefined,
        colorHex,
        sincronizado: 0,
        fechaActualizacion: new Date().toISOString(),
      };

      await LoteRepository.create(nuevoLote);
      resetFormulario();
      onLoteGuardado();
      onCerrar();
    } catch (error) {
      console.error('Error al crear lote:', error);
      setErrorNombre('No se pudo guardar el lote.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onCerrar}
    >
      <SafeAreaView style={styles.modalContainer} edges={['top', 'left', 'right', 'bottom']}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.flexOne}
        >
          <View style={styles.header}>
            <Pressable style={styles.botonCerrar} onPress={onCerrar} disabled={guardando}>
              <X size={20} color={COLORES.tealOscuro} />
            </Pressable>
            <Text style={styles.tituloHeader}>Crear Nuevo Lote</Text>
            <Pressable 
              style={[styles.botonGuardar, guardando && styles.botonGuardarDeshabilitado]} 
              onPress={guardarLote}
              disabled={guardando}
            >
              {guardando ? (
                <ActivityIndicator size="small" color={COLORES.blanco} />
              ) : (
                <>
                  <Check size={18} color={COLORES.blanco} />
                  <Text style={styles.textoBotonGuardar}>Guardar</Text>
                </>
              )}
            </Pressable>
          </View>

          <View style={styles.body}>
            <View style={styles.card}>
              <View style={styles.headerRow}>
                <Layers size={18} color={COLORES.verdeEsmeralda} />
                <Text style={styles.seccionTitulo}>INFORMACIÓN DEL LOTE</Text>
              </View>

              <Text style={styles.labelInput}>
                Nombre del Lote <Text style={styles.labelRequerido}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, !!errorNombre && styles.inputError]}
                placeholder="Ej. Lote A - Ordeño, Engorde 2..."
                placeholderTextColor={COLORES.textoMudo}
                value={nombre}
                onChangeText={(val) => { setNombre(val); setErrorNombre(''); }}
              />
              {!!errorNombre && <Text style={styles.textoError}>{errorNombre}</Text>}

              <Text style={styles.labelInput}>Descripción (Opcional)</Text>
              <TextInput
                style={styles.inputArea}
                placeholder="Ej. Potrero norte, búfalas en primera lactancia..."
                placeholderTextColor={COLORES.textoMudo}
                value={descripcion}
                onChangeText={setDescripcion}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.labelInput}>Color Identificador</Text>
              <View style={styles.coloresRow}>
                {OPCIONES_COLORES.map((cHex) => {
                  const esSeleccionado = colorHex === cHex;
                  return (
                    <Pressable
                      key={cHex}
                      style={[
                        styles.circuloColor,
                        { backgroundColor: cHex },
                        esSeleccionado && styles.circuloColorSeleccionado
                      ]}
                      onPress={() => setColorHex(cHex)}
                    >
                      {esSeleccionado && <Check size={16} color={COLORES.blanco} />}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORES.fondoApp,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORES.bordeClaro,
    backgroundColor: COLORES.blanco,
  },
  botonCerrar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORES.fondoApp,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tituloHeader: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORES.tealOscuro,
  },
  botonGuardar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.verdeEsmeralda,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  botonGuardarDeshabilitado: {
    opacity: 0.6,
  },
  textoBotonGuardar: {
    color: COLORES.blanco,
    fontSize: 14,
    fontWeight: '700',
  },
  body: {
    padding: 20,
  },
  card: {
    backgroundColor: COLORES.blanco,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORES.bordeClaro,
    paddingBottom: 10,
  },
  seccionTitulo: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORES.tealOscuro,
    letterSpacing: 0.5,
  },
  labelInput: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORES.tealOscuro,
    marginTop: 12,
    marginBottom: 6,
  },
  labelRequerido: {
    color: COLORES.rojoError,
  },
  input: {
    backgroundColor: COLORES.fondoApp,
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 14,
    fontSize: 15,
    color: COLORES.tealOscuro,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  inputArea: {
    backgroundColor: COLORES.fondoApp,
    borderRadius: 12,
    height: 80,
    paddingHorizontal: 14,
    paddingTop: 10,
    fontSize: 15,
    color: COLORES.tealOscuro,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: COLORES.rojoError,
    backgroundColor: COLORES.rojoClaro,
  },
  textoError: {
    fontSize: 12,
    color: COLORES.rojoError,
    marginTop: 4,
    fontWeight: '600',
  },
  coloresRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  circuloColor: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circuloColorSeleccionado: {
    borderWidth: 3,
    borderColor: COLORES.tealOscuro,
  },
});
