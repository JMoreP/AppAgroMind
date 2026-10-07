import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { Trash2, Droplet } from 'lucide-react-native';
import { PesajeConAnimal } from '../types/PesajeLeche';
import { COLORES } from '../../../shared/theme/colores';

interface Props {
  pesajes: PesajeConAnimal[];
  onEliminar: (id: string) => void;
}

export function ListaPesajesRecientes({ pesajes, onEliminar }: Props) {
  const confirmarEliminacion = (pesaje: PesajeConAnimal) => {
    Alert.alert(
      'Eliminar Pesaje',
      `¿Deseas eliminar el pesaje de ${pesaje.litros} L para la búfala #${pesaje.arete}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => onEliminar(pesaje.id)
        }
      ]
    );
  };

  if (pesajes.length === 0) {
    return (
      <View style={styles.contenedorVacio}>
        <Text style={styles.textoVacio}>Aún no se han registrado pesajes en este turno.</Text>
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <View style={styles.headerRow}>
        <Text style={styles.tituloSeccion}>REGISTRADOS EN ESTE TURNO ({pesajes.length})</Text>
      </View>

      {pesajes.slice(0, 10).map((item) => (
        <View key={item.id} style={styles.filaItem}>
          <View style={styles.badgeArete}>
            <Text style={styles.textoArete}>#{item.arete}</Text>
          </View>

          <View style={styles.infoCol}>
            <Text style={styles.nombreTexto} numberOfLines={1}>
              {item.nombre || 'Búfala'}
            </Text>
            {item.loteId && (
              <Text style={styles.loteTexto}>{item.loteId}</Text>
            )}
          </View>

          <View style={styles.litrosCol}>
            <Droplet size={14} color={COLORES.verdeEsmeralda} />
            <Text style={styles.litrosTexto}>{item.litros.toFixed(1)}</Text>
            <Text style={styles.unidadTexto}>L</Text>
          </View>

          <Pressable 
            style={styles.btnEliminar}
            onPress={() => confirmarEliminacion(item)}
          >
            <Trash2 size={16} color={COLORES.rojoError} />
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    width: '100%',
    marginTop: 12,
  },
  contenedorVacio: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoVacio: {
    fontSize: 13,
    color: COLORES.textoMudo,
    fontWeight: '500',
  },
  headerRow: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  tituloSeccion: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORES.textoMudo,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  filaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.blanco,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    gap: 10,
  },
  badgeArete: {
    backgroundColor: COLORES.tealOscuro,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  textoArete: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORES.blanco,
  },
  infoCol: {
    flex: 1,
  },
  nombreTexto: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORES.tealOscuro,
  },
  loteTexto: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORES.textoMudo,
    marginTop: 2,
  },
  litrosCol: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
    backgroundColor: COLORES.aquaClaro,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  litrosTexto: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORES.verdeOscuro,
  },
  unidadTexto: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORES.verdeOscuro,
  },
  btnEliminar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORES.rojoClaro,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
