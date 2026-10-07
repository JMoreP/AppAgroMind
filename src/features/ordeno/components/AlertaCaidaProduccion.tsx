import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertTriangle, CheckCircle2, AlertCircle, Stethoscope } from 'lucide-react-native';
import { COLORES } from '../../../shared/theme/colores';
import { AlertaCaidaProduccionInfo } from '../types/PesajeLeche';

interface Props {
  alerta: AlertaCaidaProduccionInfo;
}

export function AlertaCaidaProduccion({ alerta }: Props) {
  if (alerta.nivelRiesgo === 'insuficiente') {
    return null;
  }

  if (alerta.hayAlerta || alerta.nivelRiesgo === 'critico') {
    return (
      <View style={styles.contenedorAlertaCritica}>
        <View style={styles.filaEncabezado}>
          <View style={styles.circuloIconoRojo}>
            <AlertTriangle size={20} color={COLORES.rojoError} />
          </View>
          <View style={styles.columnaTitulos}>
            <Text style={styles.tituloAlertaRojo}>ALERTA TEMPRANA DE SALUD</Text>
            <Text style={styles.subtituloAlertaRojo}>Caída de producción &gt; 25%</Text>
          </View>
          <View style={styles.badgePorcentajeRojo}>
            <Text style={styles.textoPorcentajeRojo}>-{alerta.porcentajeCaida}%</Text>
          </View>
        </View>

        <Text style={styles.descripcionTexto}>
          {alerta.mensaje}
        </Text>

        <View style={styles.recomendacionCajaRojo}>
          <Stethoscope size={16} color={COLORES.rojoError} style={styles.iconoRecomendacion} />
          <Text style={styles.recomendacionTextoRojo}>
            Recomendación: Realizar prueba CMT (California Mastitis Test) o revisión veterinaria inmediata.
          </Text>
        </View>
      </View>
    );
  }

  if (alerta.nivelRiesgo === 'moderado') {
    return (
      <View style={styles.contenedorAlertaModerada}>
        <View style={styles.filaEncabezado}>
          <View style={styles.circuloIconoOliva}>
            <AlertCircle size={20} color={COLORES.olivaOscuro} />
          </View>
          <View style={styles.columnaTitulos}>
            <Text style={styles.tituloAlertaOliva}>OBSERVACIÓN PREVENTIVA</Text>
            <Text style={styles.subtituloAlertaOliva}>Variación moderada de leche</Text>
          </View>
          <View style={styles.badgePorcentajeOliva}>
            <Text style={styles.textoPorcentajeOliva}>-{alerta.porcentajeCaida}%</Text>
          </View>
        </View>

        <Text style={styles.descripcionTexto}>
          {alerta.mensaje}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.contenedorEstadoOptimo}>
      <View style={styles.filaEncabezado}>
        <View style={styles.circuloIconoVerde}>
          <CheckCircle2 size={18} color={COLORES.verdeOscuro} />
        </View>
        <View style={styles.columnaTitulos}>
          <Text style={styles.tituloOptimoVerde}>PRODUCCIÓN ESTABLE</Text>
          <Text style={styles.subtituloOptimoVerde}>
            Rendimiento acorde al promedio histórico
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedorAlertaCritica: {
    backgroundColor: COLORES.rojoClaro,
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: COLORES.rojoError,
  },
  contenedorAlertaModerada: {
    backgroundColor: COLORES.limaClaro,
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORES.olivaOscuro,
  },
  contenedorEstadoOptimo: {
    backgroundColor: COLORES.verdeMentha,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORES.verdeEsmeralda,
  },
  filaEncabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circuloIconoRojo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORES.blanco,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  circuloIconoOliva: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORES.blanco,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  circuloIconoVerde: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORES.blanco,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  columnaTitulos: {
    flex: 1,
  },
  tituloAlertaRojo: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORES.rojoError,
    letterSpacing: 0.8,
  },
  subtituloAlertaRojo: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORES.textoOscuro,
    marginTop: 2,
  },
  badgePorcentajeRojo: {
    backgroundColor: COLORES.rojoError,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  textoPorcentajeRojo: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORES.blanco,
  },
  tituloAlertaOliva: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORES.olivaOscuro,
    letterSpacing: 0.8,
  },
  subtituloAlertaOliva: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORES.textoOscuro,
    marginTop: 2,
  },
  badgePorcentajeOliva: {
    backgroundColor: COLORES.olivaOscuro,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  textoPorcentajeOliva: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORES.blanco,
  },
  tituloOptimoVerde: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORES.verdeOscuro,
    letterSpacing: 0.8,
  },
  subtituloOptimoVerde: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORES.tealOscuro,
    marginTop: 2,
  },
  descripcionTexto: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORES.textoOscuro,
    marginTop: 10,
    lineHeight: 18,
  },
  recomendacionCajaRojo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORES.blanco,
    padding: 10,
    borderRadius: 12,
    marginTop: 10,
    gap: 8,
  },
  iconoRecomendacion: {
    marginTop: 2,
  },
  recomendacionTextoRojo: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: COLORES.rojoError,
    lineHeight: 16,
  },
});
