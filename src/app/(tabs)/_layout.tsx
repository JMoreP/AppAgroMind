import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLORES } from "../../shared/theme/colores";

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Home, Settings } from 'lucide-react-native';

// ── Botón central flotante (Estilo iOS Premium Flotante) ───────────────
function BotonCentralPersonalizado(props: any) {
  const activo = props.accessibilityState?.selected;
  return (
    <View style={[props.style, { alignItems: 'center' }]} pointerEvents="box-none">
      <View style={estilos.dipContenedor} pointerEvents="box-none">
        <Pressable onPress={props.onPress} style={estilos.botonCentral}>
          <Text style={estilos.iconoMas}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ── Layout principal con tabs ─────────────────────────────────────────────────
export default function LayoutTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: estilos.barraInferior,
        tabBarBackground: () => (
          <BlurView tint="light" intensity={80} style={StyleSheet.absoluteFill} />
        ),
        tabBarActiveTintColor: COLORES.negroIndustrial,
        tabBarInactiveTintColor: COLORES.grisIOSInactivo,
        tabBarLabelStyle: estilos.etiquetaTab,
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home size={26} color={color} strokeWidth={color === COLORES.negroIndustrial ? 2.5 : 2} />,
        }}
      />

      <Tabs.Screen
        name="rebano"
        options={{
          title: "Herd",
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="cow" size={30} color={color} />,
        }}
      />

      <Tabs.Screen
        name="operaciones"
        options={{
          tabBarButton: (props) => <BotonCentralPersonalizado {...props} />,
        }}
      />

      <Tabs.Screen
        name="ajustes"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Settings size={26} color={color} strokeWidth={color === COLORES.negroIndustrial ? 2.5 : 2} />,
        }}
      />
    </Tabs>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const estilos = StyleSheet.create({
  barraInferior: {
    position: 'absolute',
    backgroundColor: COLORES.tabBarFondo, // Transparente para dejar ver el Glass
    borderTopWidth: 1,
    borderTopColor: COLORES.tabBarBorde, // Borde cortante ultra premium
    height: 88,
    paddingBottom: 24,
    paddingTop: 8,
    elevation: 0,
  },
  etiquetaTab: {
    fontSize: 10,
    fontWeight: "500",
    marginTop: 2,
  },
  dipContenedor: {
    position: "absolute",
    top: -24, // Flota naturalmente sobre el cristal
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    height: 60,
    zIndex: 10,
  },
  botonCentral: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORES.negroIndustrial, // Contraste industrial puro Apple
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORES.negroIndustrial,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  iconoMas: {
    fontSize: 36,
    color: COLORES.blanco,
    fontWeight: "300", // Líneas extra finas
    lineHeight: 40,
  },
});
