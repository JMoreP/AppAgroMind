import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { COLORES } from '../theme/colores';
import { IconoArete, IconoOrdeno, IconoSalud } from './IconosModulos';

export function SeccionModulos() {
  const router = useRouter();

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
        <TarjetaModulo 
          titulo="Salud & Dosis" 
          Icono={IconoSalud} 
        />
      </View>
    </View>
  );
}

function TarjetaModulo({ 
  titulo, 
  Icono, 
  iconSize = 64,
  onPress
}: { 
  titulo: string; 
  Icono: any; 
  iconSize?: number;
  onPress?: () => void;
}) {
  return (
    <Pressable 
      style={({ pressed }) => [styles.tarjetaModuloOuter, pressed && styles.tarjetaPresionada]} 
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
  tarjetaModuloOuter: {
    flex: 1,
    height: 155,
    backgroundColor: 'transparent',
    borderRadius: 20,
    padding: 2,
    overflow: 'hidden',
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
    fontSize: 16, // Aumento significativo de tamaño
    fontWeight: '900',
    color: COLORES.negroIndustrial, // Alto contraste
    textAlign: 'center',
    marginTop: 0,
    minHeight: 36, // Obliga a que todos los textos ocupen el mismo bloque
    textAlignVertical: 'center',    lineHeight: 18,
    letterSpacing: -0.3,
  },
  tarjetaPresionada: {
    transform: [{ scale: 0.96 }],
    opacity: 0.85,
  },
});
