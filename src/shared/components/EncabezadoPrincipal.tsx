import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { LogoGanaSmart } from './LogoGanaSmart';
import { BadgeEstadoOffline } from '../../features/sincronizacion/components/BadgeEstadoOffline';
import { COLORES } from '../theme/colores';

const URL_AVATAR_DEFECTO = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';

export function EncabezadoPrincipal() {
  return (
    <View style={styles.contenedorEncabezado}>
      <View style={styles.filaTituloYBadge}>
        <View style={styles.contenedorLogo}>
          <LogoGanaSmart tamaño={45} />
        </View>

        <BadgeEstadoOffline />

        <View style={styles.anilloAvatar}>
          <Image
            source={{ uri: URL_AVATAR_DEFECTO }}
            style={styles.imagenAvatar}
          />
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
    gap: 10,
  },
  contenedorLogo: {
    flex: 1,
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
