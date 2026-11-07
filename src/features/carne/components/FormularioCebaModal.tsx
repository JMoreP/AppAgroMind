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
} from 'react-native';
import { X, Calendar, Scale, Tag, Dna, AlertCircle, TrendingUp, Info } from 'lucide-react-native';
import { COLORES } from '../../../shared/theme/colores';
import { SelectorFecha } from '../../../shared/components/SelectorFecha';
import { Animal } from '../../animales/types/Animal';
import { Ceba } from '../types/Ceba';
import {
  calcularDiasCeba,
  calcularGananciaPesoDiaria,
  calcularEdadDias,
  calcularEdadMeses,
  obtenerPesoObjetivoPorEspecie,
} from '../utils/calculosCeba';

export interface FormularioCebaModalProps {
  visible: boolean;
  animal: Animal;
  cebaExistente?: Ceba | null;
  onGuardar: (datos: Partial<Ceba>) => Promise<void>;
  onCerrar: () => void;
}

export function FormularioCebaModal({
  visible,
  animal,
  cebaExistente,
  onGuardar,
  onCerrar,
}: FormularioCebaModalProps) {
  const hoyISO = new Date().toISOString().split('T')[0];

  // Identificación
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [pesoDestete, setPesoDestete] = useState('');
  const [padreNro, setPadreNro] = useState('');
  const [raza, setRaza] = useState('');

  // Etapa I (obligatoria)
  const [fechaInicio, setFechaInicio] = useState(hoyISO);
  const [pesoI, setPesoI] = useState('');

  // Etapa II (opcional)
  const [fechaII, setFechaII] = useState('');
  const [pesoII, setPesoII] = useState('');

  // Etapa III (opcional)
  const [fechaIII, setFechaIII] = useState('');
  const [pesoIII, setPesoIII] = useState('');

  // Etapa IV (opcional)
  const [fechaIV, setFechaIV] = useState('');
  const [pesoIV, setPesoIV] = useState('');

  // Observaciones
  const [observaciones, setObservaciones] = useState('');

  const [guardando, setGuardando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState('');

  useEffect(() => {
    if (visible) {
      if (cebaExistente) {
        setFechaNacimiento(cebaExistente.fechaNacimiento || animal.fechaNacimiento || '');
        setPesoDestete(cebaExistente.pesoDestete != null ? String(cebaExistente.pesoDestete) : (animal.pesoInicial ? String(animal.pesoInicial) : ''));
        setPadreNro(cebaExistente.padreNro || animal.padreNro || '');
        setRaza(cebaExistente.raza || animal.raza || '');

        setFechaInicio(cebaExistente.fechaInicio || hoyISO);
        setPesoI(cebaExistente.pesoI != null ? String(cebaExistente.pesoI) : '');

        setFechaII(cebaExistente.fechaII || '');
        setPesoII(cebaExistente.pesoII != null ? String(cebaExistente.pesoII) : '');

        setFechaIII(cebaExistente.fechaIII || '');
        setPesoIII(cebaExistente.pesoIII != null ? String(cebaExistente.pesoIII) : '');

        setFechaIV(cebaExistente.fechaIV || '');
        setPesoIV(cebaExistente.pesoIV != null ? String(cebaExistente.pesoIV) : '');

        setObservaciones(cebaExistente.observaciones || '');
      } else {
        setFechaNacimiento(animal.fechaNacimiento || '');
        setPesoDestete(animal.pesoInicial ? String(animal.pesoInicial) : '');
        setPadreNro(animal.padreNro || '');
        setRaza(animal.raza || '');

        setFechaInicio(hoyISO);
        setPesoI('');
        setFechaII('');
        setPesoII('');
        setFechaIII('');
        setPesoIII('');
        setFechaIV('');
        setPesoIV('');
        setObservaciones('');
      }
      setErrorGeneral('');
      setGuardando(false);
    }
  }, [visible, cebaExistente, animal]);

  // Cálculos en vivo para el panel de preview
  const previewData = useMemo(() => {
    let edadInicioDias = 0;
    let edadInicioMeses = 0;
    let gpTotalInicio = 0;

    const regexFecha = /^\d{4}-\d{2}-\d{2}$/;

    if (regexFecha.test(fechaNacimiento.trim()) && regexFecha.test(fechaInicio.trim())) {
      try {
        edadInicioDias = calcularEdadDias(fechaNacimiento.trim(), fechaInicio.trim());
        edadInicioMeses = calcularEdadMeses(fechaNacimiento.trim(), fechaInicio.trim());
      } catch {
        edadInicioDias = 0;
        edadInicioMeses = 0;
      }
    }

    const pI = parseFloat(pesoI.replace(',', '.'));
    if (!isNaN(pI) && pI > 0 && edadInicioDias > 0) {
      gpTotalInicio = Number(((pI - 30) / edadInicioDias).toFixed(2));
    }

    // Cálculos por etapa
    const pII = parseFloat(pesoII.replace(',', '.'));
    let diasEtapaII = 0;
    let gpEtapaII = 0;
    if (regexFecha.test(fechaII.trim()) && !isNaN(pII) && pII > 0 && !isNaN(pI) && pI > 0) {
      try {
        diasEtapaII = calcularDiasCeba(fechaInicio.trim(), fechaII.trim());
        gpEtapaII = calcularGananciaPesoDiaria(pI, pII, diasEtapaII);
      } catch {
        diasEtapaII = 0;
        gpEtapaII = 0;
      }
    }

    const pIII = parseFloat(pesoIII.replace(',', '.'));
    let diasEtapaIII = 0;
    let gpEtapaIII = 0;
    if (regexFecha.test(fechaIII.trim()) && !isNaN(pIII) && pIII > 0 && !isNaN(pI) && pI > 0) {
      try {
        diasEtapaIII = calcularDiasCeba(fechaInicio.trim(), fechaIII.trim());
        gpEtapaIII = calcularGananciaPesoDiaria(pI, pIII, diasEtapaIII);
      } catch {
        diasEtapaIII = 0;
        gpEtapaIII = 0;
      }
    }

    const pIV = parseFloat(pesoIV.replace(',', '.'));
    let diasEtapaIV = 0;
    let gpEtapaIV = 0;
    if (regexFecha.test(fechaIV.trim()) && !isNaN(pIV) && pIV > 0 && !isNaN(pI) && pI > 0) {
      try {
        diasEtapaIV = calcularDiasCeba(fechaInicio.trim(), fechaIV.trim());
        gpEtapaIV = calcularGananciaPesoDiaria(pI, pIV, diasEtapaIV);
      } catch {
        diasEtapaIV = 0;
        gpEtapaIV = 0;
      }
    }

    return {
      edadInicioDias,
      edadInicioMeses,
      gpTotalInicio,
      diasEtapaII,
      gpEtapaII,
      diasEtapaIII,
      gpEtapaIII,
      diasEtapaIV,
      gpEtapaIV,
    };
  }, [fechaNacimiento, fechaInicio, pesoI, fechaII, pesoII, fechaIII, pesoIII, fechaIV, pesoIV]);

  const validarFormulario = (): boolean => {
    setErrorGeneral('');
    const regexFecha = /^\d{4}-\d{2}-\d{2}$/;

    if (!fechaInicio.trim()) {
      setErrorGeneral('La fecha de inicio de la Etapa I es obligatoria.');
      return false;
    }

    const pI = parseFloat(pesoI.replace(',', '.'));
    if (isNaN(pI) || pI <= 0) {
      setErrorGeneral('El Peso I de la Etapa I es obligatorio y debe ser un número positivo.');
      return false;
    }

    if (fechaII.trim()) {
      if (!regexFecha.test(fechaII.trim())) {
        setErrorGeneral('La fecha de la Etapa II debe tener formato YYYY-MM-DD.');
        return false;
      }
      if (fechaII.trim() <= fechaInicio.trim()) {
        setErrorGeneral('La fecha de la Etapa II debe ser posterior a la fecha de inicio.');
        return false;
      }
    }

    if (fechaIII.trim()) {
      if (!regexFecha.test(fechaIII.trim())) {
        setErrorGeneral('La fecha de la Etapa III debe tener formato YYYY-MM-DD.');
        return false;
      }
      const fechaAnterior = fechaII.trim() || fechaInicio.trim();
      if (fechaIII.trim() <= fechaAnterior) {
        setErrorGeneral('La fecha de la Etapa III debe ser posterior a la etapa previa.');
        return false;
      }
    }

    if (fechaIV.trim()) {
      if (!regexFecha.test(fechaIV.trim())) {
        setErrorGeneral('La fecha de la Etapa IV debe tener formato YYYY-MM-DD.');
        return false;
      }
      const fechaAnterior = fechaIII.trim() || fechaII.trim() || fechaInicio.trim();
      if (fechaIV.trim() <= fechaAnterior) {
        setErrorGeneral('La fecha de la Etapa IV debe ser posterior a la etapa previa.');
        return false;
      }
    }

    return true;
  };

  const manejarGuardar = async () => {
    if (!validarFormulario()) return;

    setGuardando(true);
    try {
      const pDesteteNum = pesoDestete.trim() ? parseFloat(pesoDestete.replace(',', '.')) : undefined;
      const pINum = parseFloat(pesoI.replace(',', '.'));
      const pIINum = pesoII.trim() ? parseFloat(pesoII.replace(',', '.')) : undefined;
      const pIIINum = pesoIII.trim() ? parseFloat(pesoIII.replace(',', '.')) : undefined;
      const pIVNum = pesoIV.trim() ? parseFloat(pesoIV.replace(',', '.')) : undefined;

      const datosCeba: Partial<Ceba> = {
        animalId: animal.id,
        fechaNacimiento: fechaNacimiento.trim() || undefined,
        pesoDestete: pDesteteNum && !isNaN(pDesteteNum) ? pDesteteNum : undefined,
        padreNro: padreNro.trim() || undefined,
        raza: raza.trim() || undefined,
        fechaInicio: fechaInicio.trim(),
        pesoI: pINum,
        fechaII: fechaII.trim() || undefined,
        pesoII: pIINum && !isNaN(pIINum) ? pIINum : undefined,
        fechaIII: fechaIII.trim() || undefined,
        pesoIII: pIIINum && !isNaN(pIIINum) ? pIIINum : undefined,
        fechaIV: fechaIV.trim() || undefined,
        pesoIV: pIVNum && !isNaN(pIVNum) ? pIVNum : undefined,
        pesoObjetivo: cebaExistente?.pesoObjetivo ?? obtenerPesoObjetivoPorEspecie(animal.especie || 'bufalino'),
        observaciones: observaciones.trim() || undefined,
      };

      await onGuardar(datosCeba);
      onCerrar();
    } catch (err) {
      if (err instanceof Error) {
        setErrorGeneral(err.message);
      } else {
        setErrorGeneral('Error inesperado al guardar el control de ceba');
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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.fondoModal}
      >
        <View style={styles.contenedorModal}>
          {/* Header */}
          <View style={styles.encabezadoModal}>
            <View style={styles.encabezadoIconoTexto}>
              <View style={styles.iconoEncabezadoBadge}>
                <Scale size={20} color={COLORES.verdeOscuro} />
              </View>
              <View>
                <Text style={styles.tituloModal}>
                  {cebaExistente ? 'Actualizar Pesajes de Ceba' : 'Iniciar Ciclo de Ceba'}
                </Text>
                <Text style={styles.subtituloModal}>
                  Búfalo #{animal.arete} {animal.nombre ? `• ${animal.nombre}` : ''}
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
            {/* Error general */}
            {Boolean(errorGeneral) && (
              <View style={styles.cajaError}>
                <AlertCircle size={16} color={COLORES.rojoError} />
                <Text style={styles.textoError}>{errorGeneral}</Text>
              </View>
            )}

            {/* SECCIÓN 1 — Identificación */}
            <View style={styles.seccionHeader}>
              <Tag size={15} color={COLORES.verdeOscuro} />
              <Text style={styles.seccionTitulo}>1. Identificación y Antecedentes</Text>
            </View>

            <View style={styles.filaDosColumnas}>
              <View style={styles.columnaMedia}>
                <SelectorFecha
                  label="FECHA DE NACIMIENTO"
                  valor={fechaNacimiento}
                  onChange={setFechaNacimiento}
                  maximo={hoyISO}
                />
              </View>
              <View style={styles.columnaMedia}>
                <Text style={styles.etiquetaCampo}>PESO DESTETE (KG)</Text>
                <TextInput
                  style={styles.inputTexto}
                  value={pesoDestete}
                  onChangeText={setPesoDestete}
                  placeholder="Ej: 140"
                  placeholderTextColor={COLORES.grisIOSInactivo}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.filaDosColumnas}>
              <View style={styles.columnaMedia}>
                <Text style={styles.etiquetaCampo}>PADRE NRO (TORO)</Text>
                <TextInput
                  style={styles.inputTexto}
                  value={padreNro}
                  onChangeText={setPadreNro}
                  placeholder="Ej: T-09"
                  placeholderTextColor={COLORES.grisIOSInactivo}
                />
              </View>
              <View style={styles.columnaMedia}>
                <Text style={styles.etiquetaCampo}>RAZA</Text>
                <TextInput
                  style={styles.inputTexto}
                  value={raza}
                  onChangeText={setRaza}
                  placeholder="Ej: Murrah"
                  placeholderTextColor={COLORES.grisIOSInactivo}
                />
              </View>
            </View>

            {/* SECCIÓN 2 — Etapa I (Obligatoria) */}
            <View style={styles.seccionHeader}>
              <View style={styles.badgeEtapaNumero}>
                <Text style={styles.textoBadgeEtapaNumero}>I</Text>
              </View>
              <Text style={styles.seccionTitulo}>Etapa I — Entrada a Ceba *</Text>
            </View>

            <View style={styles.filaDosColumnas}>
              <View style={styles.columnaMedia}>
                <SelectorFecha
                  label="FECHA INICIO"
                  valor={fechaInicio}
                  onChange={setFechaInicio}
                  requerido
                  maximo={hoyISO}
                />
              </View>
              <View style={styles.columnaMedia}>
                <Text style={styles.etiquetaCampo}>PESO I (KG) *</Text>
                <TextInput
                  style={styles.inputTexto}
                  value={pesoI}
                  onChangeText={setPesoI}
                  placeholder="Ej: 210.5"
                  placeholderTextColor={COLORES.grisIOSInactivo}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* SECCIÓN 3 — Etapa II (Opcional) */}
            <View style={styles.seccionHeader}>
              <View style={styles.badgeEtapaNumero}>
                <Text style={styles.textoBadgeEtapaNumero}>II</Text>
              </View>
              <Text style={styles.seccionTitulo}>Etapa II — Segundo Control</Text>
            </View>

            <View style={styles.filaDosColumnas}>
              <View style={styles.columnaMedia}>
                <SelectorFecha
                  label="FECHA II"
                  valor={fechaII}
                  onChange={setFechaII}
                  minimo={fechaInicio || undefined}
                  maximo={hoyISO}
                />
              </View>
              <View style={styles.columnaMedia}>
                <Text style={styles.etiquetaCampo}>PESO II (KG)</Text>
                <TextInput
                  style={styles.inputTexto}
                  value={pesoII}
                  onChangeText={setPesoII}
                  placeholder="Ej: 275"
                  placeholderTextColor={COLORES.grisIOSInactivo}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* SECCIÓN 4 — Etapa III (Opcional) */}
            <View style={styles.seccionHeader}>
              <View style={styles.badgeEtapaNumero}>
                <Text style={styles.textoBadgeEtapaNumero}>III</Text>
              </View>
              <Text style={styles.seccionTitulo}>Etapa III — Tercer Control</Text>
            </View>

            <View style={styles.filaDosColumnas}>
              <View style={styles.columnaMedia}>
                <SelectorFecha
                  label="FECHA III"
                  valor={fechaIII}
                  onChange={setFechaIII}
                  minimo={fechaII || fechaInicio || undefined}
                  maximo={hoyISO}
                />
              </View>
              <View style={styles.columnaMedia}>
                <Text style={styles.etiquetaCampo}>PESO III (KG)</Text>
                <TextInput
                  style={styles.inputTexto}
                  value={pesoIII}
                  onChangeText={setPesoIII}
                  placeholder="Ej: 340"
                  placeholderTextColor={COLORES.grisIOSInactivo}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* SECCIÓN 5 — Etapa IV (Opcional) */}
            <View style={styles.seccionHeader}>
              <View style={styles.badgeEtapaNumero}>
                <Text style={styles.textoBadgeEtapaNumero}>IV</Text>
              </View>
              <Text style={styles.seccionTitulo}>Etapa IV — Cierre / Peso Final</Text>
            </View>

            <View style={styles.filaDosColumnas}>
              <View style={styles.columnaMedia}>
                <SelectorFecha
                  label="FECHA IV"
                  valor={fechaIV}
                  onChange={setFechaIV}
                  minimo={fechaIII || fechaII || fechaInicio || undefined}
                  maximo={hoyISO}
                />
              </View>
              <View style={styles.columnaMedia}>
                <Text style={styles.etiquetaCampo}>PESO IV (KG)</Text>
                <TextInput
                  style={styles.inputTexto}
                  value={pesoIV}
                  onChangeText={setPesoIV}
                  placeholder="Ej: 420"
                  placeholderTextColor={COLORES.grisIOSInactivo}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* PANEL DE PREVIEW EN VIVO */}
            <View style={styles.panelPreview}>
              <View style={styles.headerPreview}>
                <TrendingUp size={16} color={COLORES.verdeOscuro} />
                <Text style={styles.tituloPanelPreview}>MÉTRICAS ESTIMADAS EN VIVO</Text>
              </View>

              <View style={styles.filaMetricasPreview}>
                <View style={styles.cajaMetricaPreview}>
                  <Text style={styles.etiquetaMetricaPreview}>EDAD AL INICIO</Text>
                  <Text style={styles.valorMetricaPreview}>
                    {previewData.edadInicioMeses} m ({previewData.edadInicioDias} d)
                  </Text>
                </View>
                <View style={styles.cajaMetricaPreview}>
                  <Text style={styles.etiquetaMetricaPreview}>GP TOTAL INICIO</Text>
                  <Text style={styles.valorMetricaPreview}>
                    {previewData.gpTotalInicio} kg/d
                  </Text>
                </View>
              </View>

              {/* GP Ceba Etapas */}
              {previewData.diasEtapaII > 0 && (
                <View style={styles.filaEtapaCalculada}>
                  <Text style={styles.textoEtapaCalculada}>
                    Etapa II: {previewData.diasEtapaII} días en ceba • GP Ceba:{' '}
                    <Text style={styles.valorDestacadoGP}>{previewData.gpEtapaII} kg/d</Text>
                  </Text>
                </View>
              )}
              {previewData.diasEtapaIII > 0 && (
                <View style={styles.filaEtapaCalculada}>
                  <Text style={styles.textoEtapaCalculada}>
                    Etapa III: {previewData.diasEtapaIII} días en ceba • GP Ceba:{' '}
                    <Text style={styles.valorDestacadoGP}>{previewData.gpEtapaIII} kg/d</Text>
                  </Text>
                </View>
              )}
              {previewData.diasEtapaIV > 0 && (
                <View style={styles.filaEtapaCalculada}>
                  <Text style={styles.textoEtapaCalculada}>
                    Etapa IV: {previewData.diasEtapaIV} días en ceba • GP Ceba:{' '}
                    <Text style={styles.valorDestacadoGP}>{previewData.gpEtapaIV} kg/d</Text>
                  </Text>
                </View>
              )}
            </View>

            {/* SECCIÓN 6 — Observaciones */}
            <Text style={styles.etiquetaCampo}>OBSERVACIONES (OPCIONAL)</Text>
            <TextInput
              style={styles.inputTextArea}
              value={observaciones}
              onChangeText={setObservaciones}
              placeholder="Notas de alimentación, ración, suplementación, potrero de pastoreo, etc."
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
                  <Text style={styles.textoBotonGuardar}>
                    {cebaExistente ? 'Actualizar Pesajes' : 'Iniciar Ceba'}
                  </Text>
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
    maxHeight: '92%',
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
  seccionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    marginBottom: 10,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORES.bordeClaro,
  },
  seccionTitulo: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORES.tealOscuro,
    letterSpacing: 0.3,
  },
  badgeEtapaNumero: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORES.verdeMentha,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBadgeEtapaNumero: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORES.verdeOscuro,
  },
  filaDosColumnas: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  columnaMedia: {
    flex: 1,
  },
  etiquetaCampo: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORES.textoSecundario,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  inputTexto: {
    backgroundColor: COLORES.fondoApp,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORES.textoOscuro,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  contenedorInputConIcono: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORES.fondoApp,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  inputConIcono: {
    flex: 1,
    fontSize: 14,
    color: COLORES.textoOscuro,
    padding: 0,
    fontWeight: '600',
  },
  panelPreview: {
    backgroundColor: COLORES.fondoApp,
    borderRadius: 16,
    padding: 14,
    marginTop: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  headerPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  tituloPanelPreview: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORES.verdeOscuro,
    letterSpacing: 0.5,
  },
  filaMetricasPreview: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  cajaMetricaPreview: {
    flex: 1,
    backgroundColor: COLORES.blanco,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  etiquetaMetricaPreview: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORES.textoSecundario,
  },
  valorMetricaPreview: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORES.textoOscuro,
    marginTop: 2,
  },
  filaEtapaCalculada: {
    backgroundColor: COLORES.blanco,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 6,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  textoEtapaCalculada: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORES.textoOscuro,
  },
  valorDestacadoGP: {
    fontWeight: '900',
    color: COLORES.verdeOscuro,
  },
  inputTextArea: {
    backgroundColor: COLORES.fondoApp,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORES.textoOscuro,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  filaAcciones: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
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
