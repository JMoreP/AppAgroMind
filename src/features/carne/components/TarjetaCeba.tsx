import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ChevronRight, Scale, Clock, TrendingUp } from 'lucide-react-native';
import { COLORES } from '../../../shared/theme/colores';
import { CebaConAnimal } from '../types/Ceba';
import {
  calcularPesoActual,
  determinarEtapaActual,
  calcularDiasCeba,
  calcularGananciaPesoDiaria,
} from '../utils/calculosCeba';

export interface TarjetaCebaProps {
  ceba: CebaConAnimal;
  onPress: () => void;
}

export function TarjetaCeba({ ceba, onPress }: TarjetaCebaProps) {
  const pesoActual = calcularPesoActual(ceba);
  const etapaActual = determinarEtapaActual(ceba);

  let fechaFin = ceba.fechaInicio;
  if (etapaActual === 'IV' && ceba.fechaIV) fechaFin = ceba.fechaIV;
  else if (etapaActual === 'III' && ceba.fechaIII) fechaFin = ceba.fechaIII;
  else if (etapaActual === 'II' && ceba.fechaII) fechaFin = ceba.fechaII;

  let diasEnCeba = 0;
  try {
    diasEnCeba = calcularDiasCeba(ceba.fechaInicio, fechaFin);
  } catch {
    diasEnCeba = 0;
  }

  const gpCeba = calcularGananciaPesoDiaria(ceba.pesoI ?? 0, pesoActual, diasEnCeba);

  // Eficiencia de GP: >0.8 verde, 0.4-0.8 ambar, <0.4 rojo
  const esAltaEficiencia = gpCeba >= 0.8;
  const esMediaEficiencia = gpCeba >= 0.4 && gpCeba < 0.8;

  const estiloBadgeGP = esAltaEficiencia
    ? styles.badgeGPVerde
    : esMediaEficiencia
    ? styles.badgeGPAmbar
    : styles.badgeGPRojo;

  const estiloTextoGP = esAltaEficiencia
    ? styles.textoGPVerde
    : esMediaEficiencia
    ? styles.textoGPAmbar
    : styles.textoGPRojo;

  return (
    <Pressable
      style={({ pressed }) =>
        pressed ? styles.tarjetaPresionada : styles.tarjeta
      }
      onPress={onPress}
    >
      <View style={styles.filaSuperior}>
        {/* Identificación del Animal */}
        <View style={styles.columnaInfoAnimal}>
          <View style={styles.filaAreteBadge}>
            <Text style={styles.textoArete}>#{ceba.areteAnimal}</Text>
            {Boolean(ceba.nombreAnimal) && (
              <Text style={styles.textoNombre}>• {ceba.nombreAnimal}</Text>
            )}
            <View
              style={[
                styles.badgeEspecie,
                ceba.especieAnimal === 'bovino' ? styles.badgeBovino : styles.badgeBufalino,
              ]}
            >
              <Text
                style={[
                  styles.textoBadgeEspecie,
                  ceba.especieAnimal === 'bovino' ? styles.textoBadgeBovino : styles.textoBadgeBufalino,
                ]}
              >
                {ceba.especieAnimal === 'bovino' ? '🐄 Bov' : '🐃 Buf'}
              </Text>
            </View>
            <View style={styles.badgeEtapa}>
              <Text style={styles.textoBadgeEtapa}>Etapa {etapaActual}</Text>
            </View>
          </View>
          {Boolean(ceba.raza) && (
            <Text style={styles.textoRaza}>Raza: {ceba.raza}</Text>
          )}
        </View>

        <ChevronRight size={18} color={COLORES.textoMudo} style={styles.chevron} />
      </View>

      {/* Métricas Inferiores */}
      <View style={styles.filaMetricas}>
        {/* Peso Actual */}
        <View style={styles.cajaMetrica}>
          <View style={styles.filaIconoEtiqueta}>
            <Scale size={12} color={COLORES.textoSecundario} />
            <Text style={styles.etiquetaMetrica}>PESO ACTUAL</Text>
          </View>
          <Text style={styles.valorMetrica}>{pesoActual} kg</Text>
        </View>

        {/* Días en Ceba */}
        <View style={styles.cajaMetrica}>
          <View style={styles.filaIconoEtiqueta}>
            <Clock size={12} color={COLORES.textoSecundario} />
            <Text style={styles.etiquetaMetrica}>DÍAS CEBA</Text>
          </View>
          <Text style={styles.valorMetrica}>{diasEnCeba} d</Text>
        </View>

        {/* GP Ceba */}
        <View style={styles.cajaMetrica}>
          <View style={styles.filaIconoEtiqueta}>
            <TrendingUp size={12} color={COLORES.textoSecundario} />
            <Text style={styles.etiquetaMetrica}>GP CEBA</Text>
          </View>
          <View style={estiloBadgeGP}>
            <Text style={estiloTextoGP}>{gpCeba} kg/d</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: COLORES.blanco,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    shadowColor: COLORES.textoOscuro,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  tarjetaPresionada: {
    backgroundColor: COLORES.fondoApp,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    transform: [{ scale: 0.98 }],
  },
  filaSuperior: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  columnaInfoAnimal: {
    flex: 1,
  },
  filaAreteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  textoArete: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORES.tealOscuro,
  },
  textoNombre: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORES.textoMudo,
  },
  badgeEtapa: {
    backgroundColor: COLORES.verdeMentha,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORES.verdeEsmeralda,
  },
  textoBadgeEtapa: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORES.verdeOscuro,
    letterSpacing: 0.3,
  },
  textoRaza: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORES.textoSecundario,
    marginTop: 2,
  },
  chevron: {
    marginLeft: 6,
  },
  filaMetricas: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: COLORES.bordeClaro,
    paddingTop: 10,
  },
  cajaMetrica: {
    flex: 1,
    backgroundColor: COLORES.fondoApp,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  filaIconoEtiqueta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  etiquetaMetrica: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORES.textoSecundario,
    letterSpacing: 0.4,
  },
  valorMetrica: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORES.textoOscuro,
  },
  badgeGPVerde: {
    backgroundColor: COLORES.verdeMentha,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 1,
  },
  badgeGPAmbar: {
    backgroundColor: COLORES.ambarClaro,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 1,
  },
  badgeGPRojo: {
    backgroundColor: COLORES.rojoClaro,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 1,
  },
  textoGPVerde: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORES.verdeOscuro,
  },
  textoGPAmbar: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORES.ambarOscuro,
  },
  textoGPRojo: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORES.rojoError,
  },
  badgeEspecie: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeBovino: {
    backgroundColor: COLORES.badgeBovinoFondo,
  },
  badgeBufalino: {
    backgroundColor: COLORES.badgeBufalinoFondo,
  },
  textoBadgeEspecie: {
    fontSize: 10,
    fontWeight: '700',
  },
  textoBadgeBovino: {
    color: COLORES.badgeBovinoTexto,
  },
  textoBadgeBufalino: {
    color: COLORES.badgeBufalinoTexto,
  },
});
