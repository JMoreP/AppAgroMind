import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Sun, Moon, ChevronDown, ChevronUp, Clock } from 'lucide-react-native';
import { COLORES } from '../../../shared/theme/colores';
import { PesajeLeche } from '../types/PesajeLeche';

interface Props {
  pesajes: PesajeLeche[];
  limiteInicial?: number;
}

export function ListaHistorialPesajes({ pesajes, limiteInicial = 6 }: Props) {
  const [expandido, setExpandido] = useState(false);

  if (!pesajes || pesajes.length === 0) {
    return (
      <View style={styles.contenedorVacio}>
        <Text style={styles.textoVacio}>No hay pesajes registrados en los últimos 30 días.</Text>
      </View>
    );
  }

  const itemsMostrados = expandido ? pesajes : pesajes.slice(0, limiteInicial);

  return (
    <View style={styles.tarjetaContenedor}>
      <View style={styles.cabeceraFila}>
        <View style={styles.filaTitulo}>
          <Clock size={16} color={COLORES.tealOscuro} style={styles.iconoTitulo} />
          <Text style={styles.tituloSecundario}>Historial de Pesajes (30d)</Text>
        </View>
        <Text style={styles.conteoTotal}>{pesajes.length} registros</Text>
      </View>

      <View style={styles.lista}>
        {itemsMostrados.map((pesaje, index) => {
          const esManana = pesaje.turno === 'mañana';
          const esUltimo = index === itemsMostrados.length - 1;

          return (
            <View 
              key={pesaje.id} 
              style={[styles.itemFila, !esUltimo && styles.bordeInferior]}
            >
              <View style={styles.infoIzquierda}>
                <View style={esManana ? styles.circuloTurnoManana : styles.circuloTurnoTarde}>
                  {esManana ? (
                    <Sun size={14} color={COLORES.olivaOscuro} />
                  ) : (
                    <Moon size={14} color={COLORES.azulRey} />
                  )}
                </View>
                <View>
                  <Text style={styles.fechaTexto}>{pesaje.fecha}</Text>
                  <Text style={styles.turnoTexto}>
                    Turno {esManana ? 'Mañana' : 'Tarde'}
                  </Text>
                </View>
              </View>

              <View style={styles.infoDerecha}>
                <Text style={styles.litrosTexto}>{pesaje.litros.toFixed(1)} L</Text>
                {pesaje.observaciones && (
                  <Text style={styles.observacionesTexto} numberOfLines={1}>
                    {pesaje.observaciones}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {pesajes.length > limiteInicial && (
        <Pressable 
          style={styles.botonExpandir}
          onPress={() => setExpandido(!expandido)}
        >
          <Text style={styles.textoBotonExpandir}>
            {expandido ? 'Ver menos' : `Ver todos (${pesajes.length})`}
          </Text>
          {expandido ? (
            <ChevronUp size={16} color={COLORES.verdeEsmeralda} />
          ) : (
            <ChevronDown size={16} color={COLORES.verdeEsmeralda} />
          )}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tarjetaContenedor: {
    backgroundColor: COLORES.blanco,
    borderRadius: 24,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  cabeceraFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  filaTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconoTitulo: {
    marginRight: 8,
  },
  tituloSecundario: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORES.tealOscuro,
  },
  conteoTotal: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORES.textoMudo,
  },
  lista: {
    gap: 2,
  },
  itemFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  bordeInferior: {
    borderBottomWidth: 1,
    borderBottomColor: COLORES.bordeClaro,
  },
  infoIzquierda: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  circuloTurnoManana: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORES.limaClaro,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circuloTurnoTarde: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORES.aquaClaro,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fechaTexto: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORES.tealOscuro,
  },
  turnoTexto: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORES.textoMudo,
    marginTop: 1,
  },
  infoDerecha: {
    alignItems: 'flex-end',
  },
  litrosTexto: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORES.verdeOscuro,
  },
  observacionesTexto: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORES.textoMudo,
    maxWidth: 120,
    marginTop: 2,
  },
  botonExpandir: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 14,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORES.bordeClaro,
    gap: 4,
  },
  textoBotonExpandir: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORES.verdeEsmeralda,
  },
  contenedorVacio: {
    backgroundColor: COLORES.blanco,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  textoVacio: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORES.textoMudo,
    textAlign: 'center',
  },
});
