import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { Trash2, Stethoscope, Calendar, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { COLORES } from '../../../shared/theme/colores';
import { DiagnosticoPrenez } from '../types/DiagnosticoPrenez';

interface Props {
  diagnosticos: DiagnosticoPrenez[];
  onEliminar?: (id: string) => void;
}

export function HistorialDiagnosticos({ diagnosticos, onEliminar }: Props) {
  if (!diagnosticos || diagnosticos.length === 0) {
    return (
      <View style={styles.contenedorVacio}>
        <Text style={styles.textoVacio}>Sin diagnósticos registrados.</Text>
      </View>
    );
  }

  const confirmarEliminar = (id: string, fecha: string) => {
    Alert.alert(
      'Eliminar Diagnóstico',
      `¿Deseas eliminar el diagnóstico con fecha ${fecha}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => onEliminar?.(id),
        },
      ]
    );
  };

  const formatearMetodo = (metodo?: string) => {
    switch (metodo) {
      case 'palpacion':
        return 'Palpación rectal';
      case 'ecografia':
        return 'Ecografía';
      case 'otro':
        return 'Otro método';
      default:
        return null;
    }
  };

  return (
    <View style={styles.contenedor}>
      {diagnosticos.map((diag, index) => {
        const esUltimo = index === diagnosticos.length - 1;
        const esPrenada = diag.resultado === 'preñada';
        const metodoTexto = formatearMetodo(diag.metodo);

        return (
          <View
            key={diag.id}
            style={
              esUltimo
                ? styles.tarjetaDiagnostico
                : styles.tarjetaDiagnosticoConBorde
            }
          >
            <View style={styles.filaSuperior}>
              {/* Ícono de Resultado y Fecha */}
              <View style={styles.infoFechaFila}>
                <View
                  style={
                    esPrenada
                      ? styles.iconoDiagnosticoPrenada
                      : styles.iconoDiagnosticoVacia
                  }
                >
                  {esPrenada ? (
                    <CheckCircle2 size={16} color={COLORES.verdeOscuro} />
                  ) : (
                    <AlertCircle size={16} color={COLORES.textoSecundario} />
                  )}
                </View>

                <View>
                  <View style={styles.fechaConIcono}>
                    <Calendar size={13} color={COLORES.textoSecundario} />
                    <Text style={styles.textoFecha}>{diag.fecha}</Text>
                  </View>
                  {Boolean(metodoTexto) && (
                    <Text style={styles.textoMetodo}>{metodoTexto}</Text>
                  )}
                </View>
              </View>

              {/* Badge de Resultado & Botón Eliminar */}
              <View style={styles.accionesFila}>
                <View
                  style={
                    esPrenada ? styles.badgePrenada : styles.badgeVacia
                  }
                >
                  <Text
                    style={
                      esPrenada
                        ? styles.textoResultadoPrenada
                        : styles.textoResultadoVacia
                    }
                  >
                    {esPrenada ? 'PREÑADA' : 'VACÍA'}
                  </Text>
                </View>

                {Boolean(onEliminar) && (
                  <Pressable
                    onPress={() => confirmarEliminar(diag.id, diag.fecha)}
                    hitSlop={10}
                    style={({ pressed }) =>
                      pressed
                        ? styles.botonEliminarPresionado
                        : styles.botonEliminar
                    }
                  >
                    <Trash2 size={15} color={COLORES.rojoError} />
                  </Pressable>
                )}
              </View>
            </View>

            {/* Veterinario */}
            {Boolean(diag.veterinario) && (
              <View style={styles.filaDetalle}>
                <Stethoscope size={13} color={COLORES.textoSecundario} />
                <Text style={styles.textoDetalle}>
                  Evaluador: {diag.veterinario}
                </Text>
              </View>
            )}

            {/* Observaciones */}
            {Boolean(diag.observaciones) && (
              <Text style={styles.textoObservaciones}>
                "{diag.observaciones}"
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    backgroundColor: COLORES.blanco,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  contenedorVacio: {
    backgroundColor: COLORES.blanco,
    borderRadius: 18,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  textoVacio: {
    fontSize: 13,
    color: COLORES.textoSecundario,
    fontWeight: '500',
  },
  tarjetaDiagnostico: {
    paddingVertical: 14,
  },
  tarjetaDiagnosticoConBorde: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORES.bordeClaro,
  },
  filaSuperior: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoFechaFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconoDiagnosticoPrenada: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORES.verdeMentha,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconoDiagnosticoVacia: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORES.fondoApp,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fechaConIcono: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  textoFecha: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORES.textoOscuro,
  },
  textoMetodo: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORES.textoSecundario,
    marginTop: 2,
  },
  accionesFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badgePrenada: {
    backgroundColor: COLORES.verdeMentha,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORES.verdeEsmeralda,
  },
  badgeVacia: {
    backgroundColor: COLORES.fondoApp,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  textoResultadoPrenada: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORES.verdeOscuro,
    letterSpacing: 0.3,
  },
  textoResultadoVacia: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORES.textoSecundario,
    letterSpacing: 0.3,
  },
  botonEliminar: {
    padding: 6,
    borderRadius: 8,
  },
  botonEliminarPresionado: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: COLORES.rojoClaro,
  },
  filaDetalle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    marginLeft: 42,
  },
  textoDetalle: {
    fontSize: 12,
    color: COLORES.textoSecundario,
    fontWeight: '500',
  },
  textoObservaciones: {
    fontSize: 12,
    fontStyle: 'italic',
    color: COLORES.textoOscuro,
    marginTop: 6,
    marginLeft: 42,
  },
});
