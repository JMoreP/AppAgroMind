import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { HeartPulse, Beef, Syringe, FileText } from 'lucide-react-native';
import { COLORES } from '../theme/colores';
import { IconoArete, IconoOrdeno } from './IconosModulos';
import { useEventosSanitarios } from '../../features/sanidad/hooks/useEventosSanitarios';
import { estaEnAlerta } from '../../features/sanidad/utils/calculosSanidad';

export function SeccionModulos() {
  const router = useRouter();
  const { proximasDosis, vencidos } = useEventosSanitarios();

  const totalAlertasSanidad = useMemo(() => {
    const enAlerta = proximasDosis.filter((p) => estaEnAlerta(p.proximaDosis)).length;
    return enAlerta + vencidos.length;
  }, [proximasDosis, vencidos]);

  return (
    <View style={styles.contenedorModulos}>
      <Text style={styles.tituloSeccion}>LIVESTOCK OVERVIEW</Text>
      <View style={styles.filaModulos}>
        <TarjetaModulo 
          titulo="Ordeño Rápido" 
          Icono={IconoOrdeno} 
          iconSize={86} 
          onPress={() => router.push('/(tabs)/operaciones')}
        />
        <TarjetaModulo 
          titulo="Búsqueda por Arete" 
          Icono={IconoArete} 
          onPress={() => router.push('/(tabs)/rebano')}
        />
      </View>
      <View style={styles.filaModulosInferior}>
        <TarjetaModulo 
          titulo="Reproducción" 
          Icono={IconoReproduccion} 
          iconSize={42}
          onPress={() => router.push('/reproduccion')}
        />
        <TarjetaModulo 
          titulo="Control de Ceba" 
          Icono={IconoCeba} 
          iconSize={42}
          onPress={() => router.push('/ceba')}
        />
      </View>
      <View style={styles.filaModulosInferior}>
        <TarjetaModulo 
          titulo="Sanidad" 
          Icono={IconoSanidad} 
          iconSize={42}
          badgeCount={totalAlertasSanidad}
          onPress={() => router.push('/sanidad')}
        />
        <TarjetaModulo 
          titulo="Reportes" 
          Icono={IconoReportes} 
          iconSize={42}
          onPress={() => router.push('/reportes')}
        />
      </View>
    </View>
  );
}

function IconoReproduccion({ size = 48 }: { size?: number }) {
  return <HeartPulse size={size} color={COLORES.verdeEsmeralda} />;
}

function IconoCeba({ size = 48 }: { size?: number }) {
  return <Beef size={size} color={COLORES.verdeEsmeralda} />;
}

function IconoSanidad({ size = 48 }: { size?: number }) {
  return <Syringe size={size} color={COLORES.verdeEsmeralda} />;
}

function IconoReportes({ size = 48 }: { size?: number }) {
  return <FileText size={size} color={COLORES.verdeEsmeralda} />;
}

interface TarjetaModuloProps {
  titulo: string;
  Icono: React.ComponentType<{ size?: number; color?: string }>;
  iconSize?: number;
  badgeCount?: number;
  onPress?: () => void;
}

function TarjetaModulo({ 
  titulo, 
  Icono, 
  iconSize = 64,
  badgeCount,
  onPress
}: TarjetaModuloProps) {
  return (
    <Pressable 
      style={({ pressed }) => pressed ? styles.tarjetaModuloOuterPresionada : styles.tarjetaModuloOuter} 
      onPress={onPress}
    >
      <View style={styles.glowingBlobModulo}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100">
          <Defs>
            <RadialGradient id="glowMod" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor={COLORES.esmeraldaNeon} stopOpacity="0.6" />
              <Stop offset="100%" stopColor={COLORES.esmeraldaNeon} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx="50" cy="50" r="50" fill="url(#glowMod)" />
        </Svg>
      </View>

      <BlurView intensity={65} tint="light" style={styles.tarjetaModuloInner}>
        {Boolean(badgeCount && badgeCount > 0) && (
          <View style={styles.badgeAlertaFlotante}>
            <Text style={styles.textoBadgeAlerta}>{badgeCount}</Text>
          </View>
        )}
        <View style={styles.contenedorIcono}>
          <Icono size={iconSize} />
        </View>
        <Text style={styles.tituloModulo}>{titulo}</Text>
      </BlurView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  contenedorModulos: {
    marginTop: 8,
  },
  tituloSeccion: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORES.textoSecundario,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  filaModulos: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  filaModulosInferior: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 8,
  },
  espaciadorModulo: {
    flex: 1,
  },
  tarjetaModuloOuter: {
    flex: 1,
    height: 155,
    backgroundColor: 'transparent',
    borderRadius: 20,
    padding: 2,
    overflow: 'hidden',
  },
  tarjetaModuloOuterPresionada: {
    flex: 1,
    height: 155,
    backgroundColor: 'transparent',
    borderRadius: 20,
    padding: 2,
    overflow: 'hidden',
    transform: [{ scale: 0.96 }],
    opacity: 0.85,
  },
  glowingBlobModulo: {
    position: 'absolute',
    bottom: -40,
    right: -20,
    width: 120,
    height: 120,
  },
  tarjetaModuloInner: {
    flex: 1,
    backgroundColor: COLORES.blancoTransparente45,
    borderRadius: 18,
    paddingHorizontal: 8,
    paddingBottom: 16,
    paddingTop: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORES.blancoTransparente70,
  },
  contenedorIcono: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tituloModulo: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORES.negroIndustrial,
    textAlign: 'center',
    marginTop: 0,
    minHeight: 36,
    textAlignVertical: 'center',
    lineHeight: 18,
    letterSpacing: -0.3,
  },
  badgeAlertaFlotante: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORES.rojoError,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    zIndex: 10,
  },
  textoBadgeAlerta: {
    color: COLORES.blanco,
    fontSize: 10,
    fontWeight: '800',
  },
});
