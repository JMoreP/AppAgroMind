import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, X, Check } from 'lucide-react-native';
import { COLORES } from '../theme/colores';

export interface SelectorFechaProps {
  label: string;
  valor: string; // Formato 'YYYY-MM-DD' o ''
  onChange: (fecha: string) => void;
  requerido?: boolean;
  minimo?: string; // 'YYYY-MM-DD'
  maximo?: string; // 'YYYY-MM-DD'
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

function parsearFechaLocal(fechaStr?: string): Date | null {
  if (!fechaStr || typeof fechaStr !== 'string') return null;
  const partes = fechaStr.split('-');
  if (partes.length !== 3) return null;
  const anio = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10) - 1;
  const dia = parseInt(partes[2], 10);
  if (isNaN(anio) || isNaN(mes) || isNaN(dia)) return null;
  const d = new Date(anio, mes, dia, 12, 0, 0);
  return isValid(d) ? d : null;
}

function formatearParaMostrar(fechaStr: string): string {
  const d = parsearFechaLocal(fechaStr);
  if (!d) return fechaStr;
  try {
    return format(d, "d 'de' MMM, yyyy", { locale: es });
  } catch {
    return fechaStr;
  }
}

export function SelectorFecha({
  label,
  valor,
  onChange,
  requerido = false,
  minimo,
  maximo,
  placeholder = 'Seleccionar fecha',
  error,
  disabled = false,
}: SelectorFechaProps) {
  const [modalIOSVisible, setModalIOSVisible] = useState(false);

  // Fecha seleccionada temporalmente para el modal de iOS
  const fechaActual = useMemo(() => {
    return parsearFechaLocal(valor) ?? new Date();
  }, [valor]);

  const [fechaTemporalIOS, setFechaTemporalIOS] = useState<Date>(fechaActual);

  const minDate = useMemo(() => (minimo ? parsearFechaLocal(minimo) ?? undefined : undefined), [minimo]);
  const maxDate = useMemo(() => (maximo ? parsearFechaLocal(maximo) ?? undefined : undefined), [maximo]);

  const abrirPicker = () => {
    if (disabled) return;

    if (Platform.OS === 'android') {
      try {
        DateTimePickerAndroid.open({
          value: fechaActual,
          onChange: (event: DateTimePickerEvent, selectedDate?: Date) => {
            if (event.type === 'set' && selectedDate) {
              const fechaISO = format(selectedDate, 'yyyy-MM-dd');
              onChange(fechaISO);
            }
          },
          mode: 'date',
          minimumDate: minDate,
          maximumDate: maxDate,
        });
      } catch (err) {
        if (err instanceof Error) {
          console.warn('Error al abrir DateTimePicker en Android:', err.message);
        }
      }
    } else {
      setFechaTemporalIOS(fechaActual);
      setModalIOSVisible(true);
    }
  };

  const confirmarFechaIOS = () => {
    const fechaISO = format(fechaTemporalIOS, 'yyyy-MM-dd');
    onChange(fechaISO);
    setModalIOSVisible(false);
  };

  const cancelarFechaIOS = () => {
    setModalIOSVisible(false);
  };

  const limpiarFecha = () => {
    if (disabled) return;
    onChange('');
  };

  const textoMostrado = valor ? formatearParaMostrar(valor) : placeholder;

  return (
    <View style={styles.contenedor}>
      {/* Label */}
      <View style={styles.filaLabel}>
        <Text style={styles.label}>{label}</Text>
        {requerido && <Text style={styles.asteriscoRequerido}> *</Text>}
      </View>

      {/* Input de Fecha (Pressable) */}
      <Pressable
        onPress={abrirPicker}
        disabled={disabled}
        style={[
          styles.cajaInput,
          error ? styles.cajaInputError : null,
          disabled ? styles.cajaInputDeshabilitada : null,
        ]}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <View style={styles.filaContenido}>
          <Calendar
            size={18}
            color={error ? COLORES.rojoError : COLORES.verdeEsmeralda}
            style={styles.iconoCalendario}
          />
          <Text
            numberOfLines={1}
            style={valor ? styles.textoValor : styles.textoPlaceholder}
          >
            {textoMostrado}
          </Text>
        </View>

        {!!valor && !disabled && (
          <Pressable
            onPress={limpiarFecha}
            hitSlop={8}
            style={styles.botonLimpiar}
            accessibilityRole="button"
            accessibilityLabel="Limpiar fecha"
          >
            <X size={16} color={COLORES.textoMudo} />
          </Pressable>
        )}
      </Pressable>

      {/* Mensaje de Error */}
      {!!error && <Text style={styles.textoError}>{error}</Text>}

      {/* Modal para iOS */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={modalIOSVisible}
          transparent
          animationType="fade"
          onRequestClose={cancelarFechaIOS}
        >
          <View style={styles.overlayModalIOS}>
            <View style={styles.tarjetaModalIOS}>
              {/* Header Modal iOS */}
              <View style={styles.headerModalIOS}>
                <Pressable onPress={cancelarFechaIOS} style={styles.botonHeaderModalIOS}>
                  <Text style={styles.textoCancelarModalIOS}>Cancelar</Text>
                </Pressable>
                <Text style={styles.tituloModalIOS}>{label}</Text>
                <Pressable onPress={confirmarFechaIOS} style={styles.botonHeaderModalIOS}>
                  <Text style={styles.textoConfirmarModalIOS}>Listo</Text>
                </Pressable>
              </View>

              {/* Picker iOS */}
              <View style={styles.contenedorPickerIOS}>
                <DateTimePicker
                  value={fechaTemporalIOS}
                  mode="date"
                  display="spinner"
                  locale="es"
                  minimumDate={minDate}
                  maximumDate={maxDate}
                  onChange={(_, selectedDate) => {
                    if (selectedDate) {
                      setFechaTemporalIOS(selectedDate);
                    }
                  }}
                  textColor={COLORES.tealOscuro}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    marginBottom: 12,
  },
  filaLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORES.tealOscuro,
  },
  asteriscoRequerido: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORES.rojoError,
  },
  cajaInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORES.fondoApp,
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  cajaInputError: {
    borderColor: COLORES.rojoError,
    backgroundColor: COLORES.rojoClaro,
  },
  cajaInputDeshabilitada: {
    opacity: 0.5,
  },
  filaContenido: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconoCalendario: {
    marginRight: 2,
  },
  textoValor: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORES.tealOscuro,
  },
  textoPlaceholder: {
    fontSize: 15,
    color: COLORES.textoMudo,
  },
  botonLimpiar: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoError: {
    fontSize: 12,
    color: COLORES.rojoError,
    marginTop: 4,
    fontWeight: '600',
  },
  overlayModalIOS: {
    flex: 1,
    backgroundColor: COLORES.blancoTransparente80,
    justifyContent: 'flex-end',
  },
  tarjetaModalIOS: {
    backgroundColor: COLORES.blanco,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderColor: COLORES.bordeClaro,
    shadowColor: COLORES.negroIndustrial,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  headerModalIOS: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORES.bordeClaro,
  },
  botonHeaderModalIOS: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  tituloModalIOS: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORES.tealOscuro,
  },
  textoCancelarModalIOS: {
    fontSize: 15,
    color: COLORES.textoMudo,
    fontWeight: '600',
  },
  textoConfirmarModalIOS: {
    fontSize: 15,
    color: COLORES.verdeEsmeralda,
    fontWeight: '700',
  },
  contenedorPickerIOS: {
    alignItems: 'center',
    paddingVertical: 12,
  },
});
