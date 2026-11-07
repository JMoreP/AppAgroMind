import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import {
  Syringe,
  Pill,
  Stethoscope,
  Trash2,
  Calendar,
  User,
  ShieldAlert,
  Clock,
  Sparkles,
} from 'lucide-react-native';
import { EventoSanitario } from '../types/EventoSanitario';
import {
  labelTipoEvento,
  estaEnAlerta,
  estaVencido,
} from '../utils/calculosSanidad';
import { COLORES } from '../../../shared/theme/colores';

export interface HistorialEventosSanitariosProps {
  eventos: EventoSanitario[];
  onEliminar?: (id: string) => void;
}

export function HistorialEventosSanitarios({
  eventos,
  onEliminar,
}: HistorialEventosSanitariosProps) {
  if (!eventos || eventos.length === 0) {
    return (
      <View style={styles.contenedorVacio}>
        <Syringe size={28} color={COLORES.textoMudo} />
        <Text style={styles.textoVacio}>Sin eventos sanitarios registrados</Text>
      </View>
    );
  }

  const confirmarEliminar = (evento: EventoSanitario) => {
    if (!onEliminar) return;

    Alert.alert(
      'Eliminar Evento Sanitario',
      `¿Deseas eliminar el registro de ${labelTipoEvento(evento.tipo)} (${evento.producto})?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => onEliminar(evento.id),
        },
      ]
    );
  };

  const obtenerIconoTipo = (tipo: string) => {
    switch (tipo) {
      case 'aftosa':
      case 'clostridiales':
      case 'rabia':
      case 'brucelosis':
        return <Syringe size={16} color={COLORES.verdeEsmeralda} />;
      case 'desparasitacion':
      case 'vitaminas':
        return <Sparkles size={16} color={COLORES.olivaOscuro} />;
      case 'antibiotico':
      case 'antiinflamatorio':
      case 'mastitis':
      default:
        return <Stethoscope size={16} color={COLORES.azulRey} />;
    }
  };

  return (
    <View style={styles.contenedor}>
      {eventos.map((ev) => {
        const enAlerta = estaEnAlerta(ev.proximaDosis);
        const vencido = estaVencido(ev.proximaDosis);
        const tieneRetiro = ev.diasRetiroLeche != null && ev.diasRetiroLeche > 0;

        return (
          <View key={ev.id} style={styles.tarjetaItem}>
            {/* Fila Cabecera */}
            <View style={styles.filaCabecera}>
              <View style={styles.filaTipo}>
                <View style={styles.contenedorIconoTipo}>
                  {obtenerIconoTipo(ev.tipo)}
                </View>
                <View>
                  <Text style={styles.textoTipo}>{labelTipoEvento(ev.tipo)}</Text>
                  <Text style={styles.textoProducto}>{ev.producto}</Text>
                </View>
              </View>

              {onEliminar && (
                <Pressable
                  onPress={() => confirmarEliminar(ev)}
                  style={styles.botonEliminar}
                  hitSlop={8}
                >
                  <Trash2 size={16} color={COLORES.rojoError} />
                </Pressable>
              )}
            </View>

            {/* Dosis y Responsable */}
            {(ev.dosis || ev.responsable) && (
              <View style={styles.filaDetalles}>
                {ev.dosis && (
                  <View style={styles.badgeDetalle}>
                    <Pill size={12} color={COLORES.textoSecundario} />
                    <Text style={styles.textoBadgeDetalle}>{`Dosis: ${ev.dosis}`}</Text>
                  </View>
                )}
                {ev.responsable && (
                  <View style={styles.badgeDetalle}>
                    <User size={12} color={COLORES.textoSecundario} />
                    <Text style={styles.textoBadgeDetalle}>{ev.responsable}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Badges de Estado */}
            <View style={styles.filaBadges}>
              {/* Fecha de Aplicación */}
              <View style={styles.badgeFecha}>
                <Calendar size={12} color={COLORES.textoMudo} />
                <Text style={styles.textoBadgeFecha}>{ev.fecha}</Text>
              </View>

              {/* Retiro de leche si aplica */}
              {tieneRetiro && (
                <View style={styles.badgeRetiro}>
                  <ShieldAlert size={12} color={COLORES.azulRey} />
                  <Text style={styles.textoBadgeRetiro}>
                    {`Retiro: ${ev.diasRetiroLeche} días`}
                  </Text>
                </View>
              )}

              {/* Estado de Próxima Dosis */}
              {vencido ? (
                <View style={styles.badgeVencido}>
                  <Clock size={12} color={COLORES.rojoError} />
                  <Text style={styles.textoBadgeVencido}>
                    {`Vencida: ${ev.proximaDosis}`}
                  </Text>
                </View>
              ) : enAlerta ? (
                <View style={styles.badgeAlerta}>
                  <Clock size={12} color={COLORES.ambarOscuro} />
                  <Text style={styles.textoBadgeAlerta}>
                    {`Próxima: ${ev.proximaDosis}`}
                  </Text>
                </View>
              ) : ev.proximaDosis ? (
                <View style={styles.badgeAlDia}>
                  <Clock size={12} color={COLORES.verdeOscuro} />
                  <Text style={styles.textoBadgeAlDia}>
                    {`Próxima: ${ev.proximaDosis}`}
                  </Text>
                </View>
              ) : (
                <View style={styles.badgeAlDia}>
                  <Text style={styles.textoBadgeAlDia}>Al día</Text>
                </View>
              )}
            </View>

            {/* Observaciones si existen */}
            {ev.observaciones && (
              <Text style={styles.textoObservaciones}>{ev.observaciones}</Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: 10,
  },
  contenedorVacio: {
    backgroundColor: COLORES.blanco,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    gap: 8,
  },
  textoVacio: {
    fontSize: 13,
    color: COLORES.textoMudo,
    fontWeight: '600',
  },
  tarjetaItem: {
    backgroundColor: COLORES.blanco,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  filaCabecera: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  filaTipo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  contenedorIconoTipo: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORES.fondoApp,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoTipo: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORES.tealOscuro,
  },
  textoProducto: {
    fontSize: 12,
    color: COLORES.textoSecundario,
    marginTop: 1,
  },
  botonEliminar: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORES.rojoClaro,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filaDetalles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  badgeDetalle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORES.fondoApp,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  textoBadgeDetalle: {
    fontSize: 11,
    color: COLORES.textoSecundario,
    fontWeight: '600',
  },
  filaBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  badgeFecha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORES.fondoApp,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  textoBadgeFecha: {
    fontSize: 11,
    color: COLORES.textoMudo,
    fontWeight: '600',
  },
  badgeRetiro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORES.aquaClaro,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  textoBadgeRetiro: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORES.azulRey,
  },
  badgeVencido: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORES.rojoClaro,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  textoBadgeVencido: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORES.rojoError,
  },
  badgeAlerta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORES.ambarClaro,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  textoBadgeAlerta: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORES.ambarOscuro,
  },
  badgeAlDia: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORES.verdeMentha,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  textoBadgeAlDia: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORES.verdeOscuro,
  },
  textoObservaciones: {
    fontSize: 11,
    color: COLORES.textoMudo,
    marginTop: 8,
    fontStyle: 'italic',
  },
});
