import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Animal } from '../types/Animal';
import { useAnimalStore } from '../../../shared/store/useAnimalStore';
import { useRouter } from 'expo-router';
import { COLORES } from '../../../shared/theme/colores';

interface Props {
  animal: Animal;
}

export function TarjetaArete({ animal }: Props) {
  const router = useRouter();

  const manejarPress = () => {
    router.push(`/animal/${animal.id}`);
  };

  const statusLabel = animal.estadoReproductivo.charAt(0).toUpperCase() + animal.estadoReproductivo.slice(1);

  return (
    <Pressable 
      style={({ pressed }) => [
        styles.tarjetaRecienteOuter, 
        pressed && styles.cardPressed
      ]}
      onPress={manejarPress}
    >
      <View style={styles.tarjetaRecienteInner}>
        {/* Contenido alineado al estilo Apple Wallet / Health Widget */}
        <View style={styles.contenidoWidget}>
          
          {/* Ícono Izquierdo Circular (Estilo Home Screen) */}
          <View style={styles.circuloIcono}>
            <Text style={styles.textoIconoArete}>#{animal.arete}</Text>
          </View>
          
          {/* Textos Centrales */}
          <View style={styles.cuerpoTextos}>
            <Text style={styles.textoNombreReciente} numberOfLines={1}>
              {animal.nombre || 'Búfala N/A'}
            </Text>
            <Text style={styles.textoSubtituloReciente}>{statusLabel}</Text>
          </View>

          {/* Valores a la derecha */}
          <View style={styles.seccionValores}>
            <Text style={styles.textoValorPrincipal}>
              {animal.ultimoPesajeLitros.toFixed(1)} <Text style={styles.unidadTexto}>L</Text>
            </Text>
            <Text style={styles.textoValorSecundario}>PROD</Text>
          </View>

        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tarjetaRecienteOuter: {
    width: '100%', 
    marginBottom: 12,
    borderRadius: 24,
    // Fondo sólido es OBLIGATORIO en Android para que la elevación no genere un cuadro gris gigante
    backgroundColor: COLORES.blanco, 
    borderWidth: 1,
    borderColor: COLORES.bordeClaro, 
    shadowColor: COLORES.tealOscuro,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04, 
    shadowRadius: 12,
    elevation: 3, 
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
    borderColor: COLORES.verdeEsmeralda,
  },
  tarjetaRecienteInner: {
    padding: 16,
    borderRadius: 24, 
    overflow: 'hidden',
  },
  contenidoWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  circuloIcono: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORES.fondoApp, // Usar el fondo de la app para un contraste súper sutil
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  textoIconoArete: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORES.tealOscuro,
  },
  cuerpoTextos: {
    flex: 1,
    justifyContent: 'center',
  },
  seccionValores: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  textoNombreReciente: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORES.tealOscuro,
    letterSpacing: -0.3,
  },
  textoSubtituloReciente: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORES.textoMudo, 
    marginTop: 2,
  },
  textoValorPrincipal: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORES.verdeOscuro,
    letterSpacing: -0.5,
  },
  unidadTexto: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORES.textoMudo,
  },
  textoValorSecundario: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORES.limaBrillante, 
    marginTop: 2,
    letterSpacing: 0.5,
  },
});
