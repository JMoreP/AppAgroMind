import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { Trash2, Calendar, Scale, Tag } from 'lucide-react-native';
import { COLORES } from '../../../shared/theme/colores';
import { Parto } from '../types/Parto';

interface Props {
  partos: Parto[];
  onEliminar?: (id: string) => void;
}

export function HistorialPartos({ partos, onEliminar }: Props) {
  if (!partos || partos.length === 0) {
    return (
      <View style={styles.contenedorVacio}>
        <Text style={styles.textoVacio}>Sin partos registrados.</Text>
      </View>
    );
  }

  const confirmarEliminar = (id: string, fecha: string) => {
    Alert.alert(
      'Eliminar Parto',
      `¿Deseas eliminar el registro del parto del ${fecha}? Se recalculará automáticamente el total de partos de la madre.`,
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

  return (
    <View style={styles.contenedor}>
      {partos.map((parto, index) => {
        const esUltimo = index === partos.length - 1;
        const esHembra = parto.sexoCria === 'H';

        return (
          <View
            key={parto.id}
            style={
              esUltimo
                ? styles.tarjetaParto
                : styles.tarjetaPartoConBorde
            }
          >
            <View style={styles.filaSuperior}>
              {/* Sexo de la cría e Info Fecha */}
              <View style={styles.infoFechaFila}>
                <View
                  style={
                    esHembra
                      ? styles.iconoSexoHembraBadge
                      : styles.iconoSexoMachoBadge
                  }
                >
                  <Text
                    style={
                      esHembra
                        ? styles.textoIconoSexoHembra
                        : styles.textoIconoSexoMacho
                    }
                  >
                    {esHembra ? '♀' : '♂'}
                  </Text>
                </View>

                <View>
                  <View style={styles.fechaConIcono}>
                    <Calendar size={13} color={COLORES.textoSecundario} />
                    <Text style={styles.textoFecha}>{parto.fecha}</Text>
                  </View>
                  <Text
                    style={
                      esHembra
                        ? styles.textoSexoCriaHembra
                        : styles.textoSexoCriaMacho
                    }
                  >
                    Cría {esHembra ? 'Hembra' : 'Macho'}
                  </Text>
                </View>
              </View>

              {/* Botón Eliminar */}
              {Boolean(onEliminar) && (
                <Pressable
                  onPress={() => confirmarEliminar(parto.id, parto.fecha)}
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

            {/* Detalles de la Cría (Peso y Arete) */}
            <View style={styles.filaDetallesCria}>
              {parto.pesoCria != null && (
                <View style={styles.chipDetalle}>
                  <Scale size={12} color={COLORES.verdeOscuro} />
                  <Text style={styles.textoChipDetalle}>{parto.pesoCria} kg</Text>
                </View>
              )}

              {Boolean(parto.areteCria) && (
                <View style={styles.chipDetalle}>
                  <Tag size={12} color={COLORES.verdeOscuro} />
                  <Text style={styles.textoChipDetalle}>Arete: {parto.areteCria}</Text>
                </View>
              )}
            </View>

            {/* Observaciones */}
            {Boolean(parto.observaciones) && (
              <Text style={styles.textoObservaciones}>
                "{parto.observaciones}"
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
  tarjetaParto: {
    paddingVertical: 14,
  },
  tarjetaPartoConBorde: {
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
  iconoSexoHembraBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORES.verdeMentha,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconoSexoMachoBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORES.aquaClaro,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoIconoSexoHembra: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORES.verdeOscuro,
  },
  textoIconoSexoMacho: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORES.azulRey,
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
  textoSexoCriaHembra: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORES.verdeOscuro,
    marginTop: 2,
  },
  textoSexoCriaMacho: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORES.azulRey,
    marginTop: 2,
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
  filaDetallesCria: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    marginLeft: 42,
    flexWrap: 'wrap',
  },
  chipDetalle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORES.fondoApp,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  textoChipDetalle: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORES.textoOscuro,
  },
  textoObservaciones: {
    fontSize: 12,
    fontStyle: 'italic',
    color: COLORES.textoOscuro,
    marginTop: 6,
    marginLeft: 42,
  },
});
