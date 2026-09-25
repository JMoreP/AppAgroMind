import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORES } from '../../../shared/theme/colores';

export function BadgeEstadoOffline() {
  return (
    <View style={styles.badgeOffline}>
      <IconoRayo color={COLORES.esmeraldaNeon} size={14} />
      <Text style={styles.textoBadgeOffline}>Offline Sync Ready</Text>
    </View>
  );
}

function IconoRayo({ color = COLORES.esmeraldaNeon, size = 14 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  badgeOffline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORES.badgeOfflineFondo,
    borderColor: COLORES.badgeOfflineBorde,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  textoBadgeOffline: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORES.badgeOfflineTexto,
  },
});
