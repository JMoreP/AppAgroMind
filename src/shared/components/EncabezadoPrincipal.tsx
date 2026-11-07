import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { LogoGanaSmart } from './LogoGanaSmart';
import { BadgeEstadoOffline } from '../../features/sincronizacion/components/BadgeEstadoOffline';
import { useConfiguracion } from '../../features/configuracion/hooks/useConfiguracion';
import { COLORES } from '../theme/colores';

const URL_AVATAR_DEFECTO = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';

export function EncabezadoPrincipal() {
  const router = useRouter();
  const { configuracion } = useConfiguracion();

  const nombreFinca = configuracion.nombre?.trim();
  const propietario = configuracion.propietario?.trim();

  const tituloMostrar = nombreFinca || 'GanaSmart';
  const subtituloMostrar = propietario ? `Hola, ${propietario}` : 'Ganadería';

  return (
    <View style={styles.contenedorEncabezado}>
      <View style={styles.filaTituloYBadge}>
        <View style={styles.contenedorLogoYTextos}>
          <LogoGanaSmart tamaño={42} />
          <View style={styles.textosHeader}>
            <Text style={styles.tituloHeader} numberOfLines={1}>
              {tituloMostrar}
            </Text>
            <Text style={styles.subtituloHeader} numberOfLines={1}>
              {subtituloMostrar}
            </Text>
          </View>
        </View>

        <View style={styles.accionesHeader}>
          <BadgeEstadoOffline />

          <Pressable
            onPress={() => router.push('/ajustes')}
            style={styles.botonAvatar}
            accessibilityRole="button"
            accessibilityLabel="Ir a ajustes"
          >
            <View style={styles.anilloAvatar}>
              <Image
                source={{ uri: URL_AVATAR_DEFECTO }}
                style={styles.imagenAvatar}
              />
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedorEncabezado: {
    marginTop: 8,
    marginBottom: 16,
  },
  filaTituloYBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contenedorLogoYTextos: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginRight: 8,
  },
  textosHeader: {
    flex: 1,
  },
  tituloHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORES.tealOscuro,
    letterSpacing: -0.3,
  },
  subtituloHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORES.textoMudo,
    marginTop: 1,
  },
  accionesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  botonAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  anilloAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: COLORES.verdeBordeAvatar,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORES.esmeraldaClaro,
  },
  imagenAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
});
