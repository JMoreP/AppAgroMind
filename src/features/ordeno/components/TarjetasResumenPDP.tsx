import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Droplet, Calendar, TrendingUp } from 'lucide-react-native';
import { COLORES } from '../../../shared/theme/colores';
import { ResumenPDPAnimal } from '../types/PesajeLeche';

interface Props {
  resumen: ResumenPDPAnimal;
}

export function TarjetasResumenPDP({ resumen }: Props) {
  const formatearValor = (valor: number): string => {
    if (valor <= 0) return '0.0';
    return valor % 1 === 0 ? valor.toFixed(1) : valor.toFixed(1);
  };

  return (
    <View style={styles.contenedor}>
      
      {/* Tarjeta Hoy */}
      <View style={styles.tarjetaResumen}>
        <View style={styles.iconoFila}>
          <View style={styles.circuloIconoVerde}>
            <Droplet size={16} color={COLORES.verdeOscuro} />
          </View>
          <Text style={styles.tituloPeriodo}>HOY</Text>
        </View>
        <View style={styles.valorFila}>
          <Text style={styles.valorGrande}>{formatearValor(resumen.litrosHoy)}</Text>
          <Text style={styles.unidadTexto}>L</Text>
        </View>
        <Text style={styles.subtextoDetalle}>Producción día</Text>
      </View>

      {/* Tarjeta Últimos 7 Días (PDP 7d) */}
      <View style={styles.tarjetaResumen}>
        <View style={styles.iconoFila}>
          <View style={styles.circuloIconoLima}>
            <Calendar size={16} color={COLORES.olivaOscuro} />
          </View>
          <Text style={styles.tituloPeriodo}>7 DÍAS</Text>
        </View>
        <View style={styles.valorFila}>
          <Text style={styles.valorGrande}>{formatearValor(resumen.pdp7Dias)}</Text>
          <Text style={styles.unidadTexto}>L/d</Text>
        </View>
        <Text style={styles.subtextoDetalle}>
          {resumen.totalLitros7Dias > 0 ? `${resumen.totalLitros7Dias} L total` : 'Sin registros'}
        </Text>
      </View>

      {/* Tarjeta Últimos 30 Días (PDP 30d) */}
      <View style={styles.tarjetaResumen}>
        <View style={styles.iconoFila}>
          <View style={styles.circuloIconoAzul}>
            <TrendingUp size={16} color={COLORES.azulRey} />
          </View>
          <Text style={styles.tituloPeriodo}>30 DÍAS</Text>
        </View>
        <View style={styles.valorFila}>
          <Text style={styles.valorGrande}>{formatearValor(resumen.pdp30Dias)}</Text>
          <Text style={styles.unidadTexto}>L/d</Text>
        </View>
        <Text style={styles.subtextoDetalle}>
          {resumen.totalLitros30Dias > 0 ? `${resumen.totalLitros30Dias} L total` : 'Sin registros'}
        </Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 20,
  },
  tarjetaResumen: {
    flex: 1,
    backgroundColor: COLORES.blanco,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    alignItems: 'flex-start',
    shadowColor: COLORES.textoOscuro,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  iconoFila: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  circuloIconoVerde: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORES.verdeMentha,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circuloIconoLima: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORES.limaClaro,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circuloIconoAzul: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORES.aquaClaro,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tituloPeriodo: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORES.textoMudo,
    letterSpacing: 0.8,
  },
  valorFila: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  valorGrande: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORES.tealOscuro,
    letterSpacing: -0.5,
  },
  unidadTexto: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORES.verdeEsmeralda,
    marginLeft: 3,
  },
  subtextoDetalle: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORES.textoMudo,
    marginTop: 4,
  },
});
