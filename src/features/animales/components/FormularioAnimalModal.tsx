import React, { useState, useEffect } from 'react';
import { 
  Modal, 
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
import { X, Check, Tag, Calendar, Weight, Dna, Info, Layers } from 'lucide-react-native';
import { Animal } from '../types/Animal';
import { AnimalRepository } from '../repositories/AnimalRepository';
import { useLotes } from '../../lotes/hooks/useLotes';
import { COLORES } from '../../../shared/theme/colores';

interface Props {
  visible: boolean;
  animalEditar?: Animal | null;
  onCerrar: () => void;
  onAnimalGuardado: () => void;
  onCrearLoteSollicitado?: () => void;
}

export function FormularioAnimalModal({ 
  visible, 
  animalEditar, 
  onCerrar, 
  onAnimalGuardado,
  onCrearLoteSollicitado
}: Props) {
  const hoyStr = new Date().toISOString().split('T')[0];
  const { lotes } = useLotes();

  const [arete, setArete] = useState('');
  const [nombre, setNombre] = useState('');
  const [sexo, setSexo] = useState<'M' | 'H'>('H');
  const [fechaNacimiento, setFechaNacimiento] = useState(hoyStr);
  const [raza, setRaza] = useState('');
  const [pesoInicial, setPesoInicial] = useState('');
  const [pesoActual, setPesoActual] = useState('');
  const [padreNro, setPadreNro] = useState('');
  const [madreNro, setMadreNro] = useState('');
  const [loteId, setLoteId] = useState('');
  const [estadoReproductivo, setEstadoReproductivo] = useState<'vacia' | 'preñada' | 'lactancia' | 'secado' | 'ninguno'>('vacia');
  const [estadoVida, setEstadoVida] = useState<'activa' | 'muerta' | 'descartada'>('activa');

  const [guardando, setGuardando] = useState(false);
  const [errorArete, setErrorArete] = useState('');
  const [errorFecha, setErrorFecha] = useState('');

  useEffect(() => {
    if (visible) {
      if (animalEditar) {
        setArete(animalEditar.arete);
        setNombre(animalEditar.nombre || '');
        setSexo(animalEditar.sexo);
        setFechaNacimiento(animalEditar.fechaNacimiento);
        setRaza(animalEditar.raza || '');
        setPesoInicial(animalEditar.pesoInicial ? String(animalEditar.pesoInicial) : '');
        setPesoActual(animalEditar.pesoActual ? String(animalEditar.pesoActual) : '');
        setPadreNro(animalEditar.padreNro || '');
        setMadreNro(animalEditar.madreNro || '');
        setLoteId(animalEditar.loteId || '');
        setEstadoReproductivo(animalEditar.estadoReproductivo);
        setEstadoVida(animalEditar.estadoVida);
      } else {
        setArete('');
        setNombre('');
        setSexo('H');
        setFechaNacimiento(hoyStr);
        setRaza('');
        setPesoInicial('');
        setPesoActual('');
        setPadreNro('');
        setMadreNro('');
        setLoteId('');
        setEstadoReproductivo('vacia');
        setEstadoVida('activa');
      }
      setErrorArete('');
      setErrorFecha('');
    }
  }, [visible, animalEditar]);

  const cambiarSexo = (nuevoSexo: 'M' | 'H') => {
    setSexo(nuevoSexo);
    if (nuevoSexo === 'M') {
      setEstadoReproductivo('ninguno');
    } else if (estadoReproductivo === 'ninguno') {
      setEstadoReproductivo('vacia');
    }
  };

  const validarYGuardar = async () => {
    setErrorArete('');
    setErrorFecha('');

    const areteLimpio = arete.trim();
    if (!areteLimpio) {
      setErrorArete('El número de arete es obligatorio.');
      return;
    }

    if (!fechaNacimiento.trim()) {
      setErrorFecha('La fecha de nacimiento es obligatoria (YYYY-MM-DD).');
      return;
    }

    setGuardando(true);

    try {
      // Validar si ya existe otro animal con ese arete
      const existente = await AnimalRepository.getByArete(areteLimpio);
      if (existente && (!animalEditar || existente.id !== animalEditar.id)) {
        setErrorArete(`El arete "${areteLimpio}" ya pertenece a otro animal.`);
        setGuardando(false);
        return;
      }

      const fechaIso = new Date().toISOString();

      if (animalEditar) {
        // Modo Edición
        const cambios: Partial<Animal> = {
          arete: areteLimpio,
          nombre: nombre.trim() || undefined,
          sexo,
          fechaNacimiento: fechaNacimiento.trim(),
          raza: raza.trim() || undefined,
          pesoInicial: parseFloat(pesoInicial) || 0,
          pesoActual: parseFloat(pesoActual) || 0,
          padreNro: padreNro.trim() || undefined,
          madreNro: madreNro.trim() || undefined,
          loteId: loteId.trim() || undefined,
          estadoReproductivo: sexo === 'M' ? 'ninguno' : estadoReproductivo,
          estadoVida,
          sincronizado: 0,
          fechaActualizacion: fechaIso,
        };

        await AnimalRepository.update(animalEditar.id, cambios);
      } else {
        // Modo Creación
        const idUnico = Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
        const nuevoAnimal: Animal = {
          id: idUnico,
          arete: areteLimpio,
          nombre: nombre.trim() || undefined,
          sexo,
          fechaNacimiento: fechaNacimiento.trim(),
          raza: raza.trim() || undefined,
          pesoInicial: parseFloat(pesoInicial) || 0,
          pesoActual: parseFloat(pesoActual) || 0,
          padreNro: padreNro.trim() || undefined,
          madreNro: madreNro.trim() || undefined,
          loteId: loteId.trim() || undefined,
          estadoReproductivo: sexo === 'M' ? 'ninguno' : estadoReproductivo,
          totalPartos: 0,
          ultimoPesajeLitros: 0,
          promedioLitros: 0,
          estadoVida,
          sincronizado: 0,
          fechaActualizacion: fechaIso,
        };

        await AnimalRepository.create(nuevoAnimal);
      }

      onAnimalGuardado();
      onCerrar();
    } catch (err) {
      console.error('Error al guardar animal:', err);
      setErrorArete('Error al guardar en base de datos local.');
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
          {/* Header */}
          <View style={styles.header}>
            <Pressable style={styles.botonCerrar} onPress={onCerrar} disabled={guardando}>
              <X size={20} color={COLORES.tealOscuro} />
            </Pressable>
            <Text style={styles.tituloHeader}>
              {animalEditar ? 'Editar Ficha Animal' : 'Nueva Ficha Animal'}
            </Text>
            <Pressable 
              style={[styles.botonGuardar, guardando && styles.botonGuardarDeshabilitado]} 
              onPress={validarYGuardar}
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

          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Sección 1: Identificación Básica */}
            <View style={styles.seccionCard}>
              <View style={styles.seccionHeaderRow}>
                <Tag size={18} color={COLORES.verdeEsmeralda} />
                <Text style={styles.seccionTitulo}>DATOS DE IDENTIFICACIÓN</Text>
              </View>

              <Text style={styles.labelInput}>
                Arete / Caravana <Text style={styles.labelRequerido}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, !!errorArete && styles.inputError]}
                placeholder="Ej. B-104"
                placeholderTextColor={COLORES.textoMudo}
                value={arete}
                onChangeText={(val) => { setArete(val); setErrorArete(''); }}
                autoCapitalize="characters"
              />
              {!!errorArete && <Text style={styles.textoError}>{errorArete}</Text>}

              <Text style={styles.labelInput}>Nombre del Animal (Opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. Princesa, Titana..."
                placeholderTextColor={COLORES.textoMudo}
                value={nombre}
                onChangeText={setNombre}
              />

              <Text style={styles.labelInput}>
                Sexo <Text style={styles.labelRequerido}>*</Text>
              </Text>
              <View style={styles.selectorRow}>
                <Pressable
                  style={[styles.opcionSelector, sexo === 'H' && styles.opcionSelectorActiva]}
                  onPress={() => cambiarSexo('H')}
                >
                  <Text style={[styles.textoOpcion, sexo === 'H' && styles.textoOpcionActiva]}>
                    Hembra (Búfala)
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.opcionSelector, sexo === 'M' && styles.opcionSelectorActiva]}
                  onPress={() => cambiarSexo('M')}
                >
                  <Text style={[styles.textoOpcion, sexo === 'M' && styles.textoOpcionActiva]}>
                    Macho (Búfalo)
                  </Text>
                </Pressable>
              </View>

              <Text style={styles.labelInput}>Raza / Cruza</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. Murrah, Mediterráneo, Carabao..."
                placeholderTextColor={COLORES.textoMudo}
                value={raza}
                onChangeText={setRaza}
              />
            </View>

            {/* Sección 2: Fechas y Genealogía */}
            <View style={styles.seccionCard}>
              <View style={styles.seccionHeaderRow}>
                <Calendar size={18} color={COLORES.verdeEsmeralda} />
                <Text style={styles.seccionTitulo}>FECHAS Y GENEALOGÍA</Text>
              </View>

              <Text style={styles.labelInput}>
                Fecha de Nacimiento (YYYY-MM-DD) <Text style={styles.labelRequerido}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, !!errorFecha && styles.inputError]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={COLORES.textoMudo}
                value={fechaNacimiento}
                onChangeText={(val) => { setFechaNacimiento(val); setErrorFecha(''); }}
              />
              {!!errorFecha && <Text style={styles.textoError}>{errorFecha}</Text>}

              <Text style={styles.labelInput}>Nro Arete del Padre (Toro)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. T-01"
                placeholderTextColor={COLORES.textoMudo}
                value={padreNro}
                onChangeText={setPadreNro}
                autoCapitalize="characters"
              />

              <Text style={styles.labelInput}>Nro Arete de la Madre</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. B-05"
                placeholderTextColor={COLORES.textoMudo}
                value={madreNro}
                onChangeText={setMadreNro}
                autoCapitalize="characters"
              />
            </View>

            {/* Sección 3: Pesos Corporal */}
            <View style={styles.seccionCard}>
              <View style={styles.seccionHeaderRow}>
                <Weight size={18} color={COLORES.verdeEsmeralda} />
                <Text style={styles.seccionTitulo}>REGISTRO DE PESO (KG)</Text>
              </View>

              <View style={styles.gridDosColumnas}>
                <View style={styles.flexOne}>
                  <Text style={styles.labelInput}>Peso Inicial (Kg)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.0"
                    placeholderTextColor={COLORES.textoMudo}
                    keyboardType="numeric"
                    value={pesoInicial}
                    onChangeText={setPesoInicial}
                  />
                </View>
                <View style={styles.flexOne}>
                  <Text style={styles.labelInput}>Peso Actual (Kg)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.0"
                    placeholderTextColor={COLORES.textoMudo}
                    keyboardType="numeric"
                    value={pesoActual}
                    onChangeText={setPesoActual}
                  />
                </View>
              </View>
            </View>

            {/* Sección 4: Estado Reproductivo, Lote y Estado de Vida */}
            <View style={styles.seccionCard}>
              <View style={styles.seccionHeaderRow}>
                <Dna size={18} color={COLORES.verdeEsmeralda} />
                <Text style={styles.seccionTitulo}>ESTADO REPRODUCTIVO Y LOTE</Text>
              </View>

              {sexo === 'M' ? (
                <View style={styles.bannerInfo}>
                  <Info size={16} color={COLORES.textoMudo} />
                  <Text style={styles.textoBannerInfo}>
                    Los machos tienen automáticamente el estado reproductivo como "Ninguno".
                  </Text>
                </View>
              ) : (
                <>
                  <Text style={styles.labelInput}>Estado Reproductivo</Text>
                  <View style={styles.gridEstadoReproductivo}>
                    {(['vacia', 'preñada', 'lactancia', 'secado'] as const).map((estado) => (
                      <Pressable
                        key={estado}
                        style={[
                          styles.opcionEstadoChip,
                          estadoReproductivo === estado && styles.opcionEstadoChipActiva
                        ]}
                        onPress={() => setEstadoReproductivo(estado)}
                      >
                        <Text style={[
                          styles.textoEstadoChip,
                          estadoReproductivo === estado && styles.textoEstadoChipActivo
                        ]}>
                          {estado.toUpperCase()}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              )}

              {/* Asignación de Lote */}
              <View style={styles.headerSubRow}>
                <Layers size={14} color={COLORES.tealOscuro} />
                <Text style={styles.labelInputInline}>Asignar a Lote</Text>
              </View>
              
              <View style={styles.lotesChipsContainer}>
                <Pressable
                  style={[
                    styles.loteChipItem,
                    !loteId && styles.loteChipItemActivo
                  ]}
                  onPress={() => setLoteId('')}
                >
                  <Text style={[
                    styles.textoLoteChip,
                    !loteId && styles.textoLoteChipActivo
                  ]}>
                    Sin Lote
                  </Text>
                </Pressable>

                {lotes.map((lote) => {
                  const esSeleccionado = loteId === lote.id || loteId === lote.nombre;
                  return (
                    <Pressable
                      key={lote.id}
                      style={[
                        styles.loteChipItem,
                        esSeleccionado && styles.loteChipItemActivo,
                        { borderColor: lote.colorHex }
                      ]}
                      onPress={() => setLoteId(lote.nombre)}
                    >
                      <View style={[styles.dotColorLote, { backgroundColor: lote.colorHex }]} />
                      <Text style={[
                        styles.textoLoteChip,
                        esSeleccionado && styles.textoLoteChipActivo
                      ]}>
                        {lote.nombre}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {onCrearLoteSollicitado && (
                <Pressable style={styles.btnCrearLoteRapido} onPress={onCrearLoteSollicitado}>
                  <Text style={styles.textoBtnCrearLoteRapido}>+ Crear nuevo lote</Text>
                </Pressable>
              )}

              {/* Estado de Vida */}
              <Text style={styles.labelInput}>Estado de Vida</Text>
              <View style={styles.selectorRow}>
                {(['activa', 'muerta', 'descartada'] as const).map((est) => (
                  <Pressable
                    key={est}
                    style={[
                      styles.opcionSelector,
                      estadoVida === est && styles.opcionSelectorActiva
                    ]}
                    onPress={() => setEstadoVida(est)}
                  >
                    <Text style={[
                      styles.textoOpcion,
                      estadoVida === est && styles.textoOpcionActiva
                    ]}>
                      {est.charAt(0).toUpperCase() + est.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  seccionCard: {
    backgroundColor: COLORES.blanco,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  seccionHeaderRow: {
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
  labelInputInline: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORES.tealOscuro,
  },
  headerSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    marginBottom: 8,
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
  selectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  opcionSelector: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORES.fondoApp,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    justifyContent: 'center',
    alignItems: 'center',
  },
  opcionSelectorActiva: {
    backgroundColor: COLORES.verdeEsmeralda,
    borderColor: COLORES.verdeEsmeralda,
  },
  textoOpcion: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORES.textoMudo,
  },
  textoOpcionActiva: {
    color: COLORES.blanco,
    fontWeight: '700',
  },
  gridDosColumnas: {
    flexDirection: 'row',
    gap: 12,
  },
  gridEstadoReproductivo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  opcionEstadoChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORES.fondoApp,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  opcionEstadoChipActiva: {
    backgroundColor: COLORES.tealOscuro,
    borderColor: COLORES.tealOscuro,
  },
  textoEstadoChip: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORES.textoMudo,
    letterSpacing: 0.5,
  },
  textoEstadoChipActivo: {
    color: COLORES.blanco,
  },
  bannerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORES.fondoApp,
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  textoBannerInfo: {
    flex: 1,
    fontSize: 12,
    color: COLORES.textoMudo,
  },
  lotesChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  loteChipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORES.fondoApp,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    gap: 6,
  },
  loteChipItemActivo: {
    backgroundColor: COLORES.tealOscuro,
    borderColor: COLORES.tealOscuro,
  },
  dotColorLote: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  textoLoteChip: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORES.tealOscuro,
  },
  textoLoteChipActivo: {
    color: COLORES.blanco,
  },
  btnCrearLoteRapido: {
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 8,
  },
  textoBtnCrearLoteRapido: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORES.verdeEsmeralda,
  },
});
