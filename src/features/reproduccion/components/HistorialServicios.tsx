import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { Trash2, Syringe, Calendar } from 'lucide-react-native';
import { COLORES } from '../../../shared/theme/colores';
import { ServicioReproductivo } from '../types/ServicioReproductivo';

interface Props {
  servicios: ServicioReproductivo[];
  onEliminar?: (id: string) => void;
}

export function HistorialServicios({ servicios, onEliminar }: Props) {
  if (!servicios || servicios.length === 0) {
    return (
      <View style={styles.contenedorVacio}>
        <Text style={styles.textoVacio}>Sin servicios registrados.</Text>
      </View>
    );
  }

  const confirmarEliminar = (id: string, fecha: string) => {
    Alert.alert(
      'Eliminar Servicio',
      `¿Deseas eliminar el registro del servicio con fecha ${fecha}?`,
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

  const obtenerEstiloBadge = (resultado: ServicioReproductivo['resultado']) => {
    switch (resultado) {
      case 'preñada':
        return styles.badgePrenada;
      case 'vacia':
        return styles.badgeVacia;
      case 'pendiente':
      default:
        return styles.badgePendiente;
    }
  };

  const obtenerEstiloTexto = (resultado: ServicioReproductivo['resultado']) => {
    switch (resultado) {
      case 'preñada':
        return styles.textoResultadoPrenada;
      case 'vacia':
        return styles.textoResultadoVacia;
      case 'pendiente':
      default:
        return styles.textoResultadoPendiente;
    }
  };

  const obtenerLabelResultado = (resultado: ServicioReproductivo['resultado']) => {
    switch (resultado) {
      case 'preñada':
        return 'PREÑADA';
      case 'vacia':
        return 'VACÍA';
      case 'pendiente':
      default:
        return 'PENDIENTE';
    }
  };

  return (
    <View style={styles.contenedor}>
      {servicios.map((servicio, index) => {
        const esUltimo = index === servicios.length - 1;
        const esInseminacion = servicio.tipo === 'inseminacion';

        const badgeResultadoEstilo = obtenerEstiloBadge(servicio.resultado);
        const textoResultadoEstilo = obtenerEstiloTexto(servicio.resultado);
        const labelResultado = obtenerLabelResultado(servicio.resultado);

        return (
          <View
            key={servicio.id}
            style={[styles.tarjetaServicio, !esUltimo && styles.bordeInferior]}
          >
            <View style={styles.filaSuperior}>
              {/* Tipo e Ícono */}
              <View style={styles.tipoInfoFila}>
                {esInseminacion ? (
                  <View style={styles.iconoInseminacion}>
                    <Syringe size={14} color={COLORES.verdeOscuro} />
                  </View>
                ) : (
                  <View style={styles.iconoMonta}>
                    <Text style={styles.textoIconoToro}>🐂</Text>
                  </View>
                )}
                <View>
                  <Text style={styles.textoTipo}>
                    {esInseminacion ? 'Inseminación Artificial' : 'Monta Natural'}
                  </Text>
                  <Text style={styles.textoFecha}>{servicio.fecha}</Text>
                </View>
              </View>

              {/* Badge de Resultado */}
              <View style={styles.accionesFila}>
                <View style={badgeResultadoEstilo}>
                  <Text style={textoResultadoEstilo}>{labelResultado}</Text>
                </View>

                {onEliminar && (
                  <Pressable
                    style={styles.botonEliminar}
                    onPress={() => confirmarEliminar(servicio.id, servicio.fecha)}
                  >
                    <Trash2 size={16} color={COLORES.rojoError} />
                  </Pressable>
                )}
              </View>
            </View>

            {/* Detalles específicos del servicio */}
            <View style={styles.detallesFila}>
              {esInseminacion ? (
                <>
                  {servicio.numeroPajuela && (
                    <Text style={styles.textoDetalle}>
                      Pajuela: <Text style={styles.textoDetalleBold}>{servicio.numeroPajuela}</Text>
                    </Text>
                  )}
                  {servicio.razaToro && (
                    <Text style={styles.textoDetalle}>
                      Raza: <Text style={styles.textoDetalleBold}>{servicio.razaToro}</Text>
                    </Text>
                  )}
                  {servicio.veterinario && (
                    <Text style={styles.textoDetalle}>
                      Técnico: <Text style={styles.textoDetalleBold}>{servicio.veterinario}</Text>
                    </Text>
                  )}
                </>
              ) : (
                <>
                  {servicio.toroNumero && (
                    <Text style={styles.textoDetalle}>
                      Toro: <Text style={styles.textoDetalleBold}>{servicio.toroNumero}</Text>
                    </Text>
                  )}
                  {servicio.toroRaza && (
                    <Text style={styles.textoDetalle}>
                      Raza: <Text style={styles.textoDetalleBold}>{servicio.toroRaza}</Text>
                    </Text>
                  )}
                </>
              )}
            </View>

            {/* Fecha Probable de Parto */}
            {servicio.resultado !== 'vacia' && servicio.fechaProbableParto && (
              <View style={styles.filaFpp}>
                <Calendar size={13} color={COLORES.verdeOscuro} style={styles.iconoCalendar} />
                <Text style={styles.textoFpp}>
                  Parto Estimado: <Text style={styles.textoFppValor}>{servicio.fechaProbableParto}</Text>
                </Text>
              </View>
            )}

            {/* Observaciones */}
            {servicio.observaciones && (
              <Text style={styles.textoObservaciones} numberOfLines={2}>
                "{servicio.observaciones}"
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
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    marginBottom: 20,
  },
  contenedorVacio: {
    backgroundColor: COLORES.blanco,
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    marginBottom: 20,
  },
  textoVacio: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORES.textoMudo,
  },
  tarjetaServicio: {
    paddingVertical: 12,
  },
  bordeInferior: {
    borderBottomWidth: 1,
    borderBottomColor: COLORES.bordeClaro,
  },
  filaSuperior: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tipoInfoFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconoInseminacion: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORES.verdeMentha,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconoMonta: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORES.limaClaro,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoIconoToro: {
    fontSize: 14,
  },
  textoTipo: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORES.tealOscuro,
  },
  textoFecha: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORES.textoMudo,
    marginTop: 1,
  },
  accionesFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgePendiente: {
    backgroundColor: COLORES.ambarClaro,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORES.ambarAlerta,
  },
  textoResultadoPendiente: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORES.ambarOscuro,
    letterSpacing: 0.5,
  },
  badgePrenada: {
    backgroundColor: COLORES.verdeMentha,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORES.verdeEsmeralda,
  },
  textoResultadoPrenada: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORES.verdeOscuro,
    letterSpacing: 0.5,
  },
  badgeVacia: {
    backgroundColor: COLORES.fondoApp,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  textoResultadoVacia: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORES.textoMudo,
    letterSpacing: 0.5,
  },
  botonEliminar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORES.rojoClaro,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detallesFila: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
    marginLeft: 42,
  },
  textoDetalle: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORES.textoMudo,
  },
  textoDetalleBold: {
    fontWeight: '700',
    color: COLORES.tealOscuro,
  },
  filaFpp: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginLeft: 42,
  },
  iconoCalendar: {
    marginRight: 6,
  },
  textoFpp: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORES.verdeOscuro,
  },
  textoFppValor: {
    fontWeight: '800',
    color: COLORES.verdeOscuro,
  },
  textoObservaciones: {
    fontSize: 11,
    fontStyle: 'italic',
    color: COLORES.textoMudo,
    marginTop: 6,
    marginLeft: 42,
  },
});
