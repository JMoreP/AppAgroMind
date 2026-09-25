import { Tabs } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { COLORES } from "../shared/theme/colores";

// ── Íconos SVG Personalizados ────────────────────────────────────────────────
function IconoHome({ color }: { color: any }) {
  return (
    <Svg width="26" height="26" viewBox="0 0 24 24" fill={color === COLORES.tabActivo ? color : "none"} stroke={color} strokeWidth={color === COLORES.tabActivo ? "0" : "1.8"} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 9.5L12 3l9 6.5V21h-5v-6h-8v6H3V9.5z" />
    </Svg>
  );
}

function IconoHerd({ color }: { color: any }) {
  return (
    <Svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M 4 12 c 0 -2 1 -3 3 -3 h 2 c 1 -1 2 -2 3 -2 h 5 c 2 0 3 1 4 2 v 2 c 1 0 1 1 1 2 v 4 h -2 v -3 h -8 v 3 h -2 v -3 h -3 c -1 0 -2 -1 -2 -2 z" />
      <Path d="M 3 9 l 1 -2 l 1 2" />
      <Path d="M 21 13 c 1 0 1 2 1 3" />
      <Path d="M 12 16 a 1.5 1.5 0 0 0 3 0" />
    </Svg>
  );
}

function IconoHealth({ color }: { color: any }) {
  return (
    <Svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      <Path d="M 8 11 h 2 l 1.5 -3 l 2 6 l 1.5 -3 h 1" />
    </Svg>
  );
}

function IconoSettings({ color }: { color: any }) {
  return (
    <Svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
      <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </Svg>
  );
}

// ── Botón central flotante (Cutout Illusion y Hitbox Estricto) ───────────────
function BotonCentralPersonalizado(props: any) {
  const activo = props.accessibilityState?.selected;
  return (
    <View style={[props.style, { alignItems: 'center' }]} pointerEvents="box-none">
      {/* Contenedor del botón con pointerEvents="box-none" para ignorar clics fuera del + */}
      <View style={estilos.dipContenedor} pointerEvents="box-none">
        <View style={estilos.dipFondo} pointerEvents="box-none">
          <Pressable onPress={props.onPress} style={estilos.botonCentral}>
            <Text style={[estilos.iconoMas, activo && { color: COLORES.esmeraldaNeon }]}>+</Text>
          </Pressable>
        </View>
      </View>
      {/* Etiqueta estática ignorando toques (el área debajo del botón no será clickeable) */}
      <View pointerEvents="none" style={{ position: 'absolute', bottom: 12 }}>

      </View>
    </View>
  );
}

// ── Layout principal con tabs ─────────────────────────────────────────────────
export default function LayoutPrincipal() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: estilos.barraInferior,
        tabBarActiveTintColor: COLORES.esmeraldaNeon,
        tabBarInactiveTintColor: COLORES.tabInactivo,
        tabBarLabelStyle: estilos.etiquetaTab,
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <IconoHome color={color} />,
        }}
      />

      <Tabs.Screen
        name="rebano"
        options={{
          title: "Herd",
          tabBarIcon: ({ color }) => <IconoHerd color={color} />,
        }}
      />

      <Tabs.Screen
        name="operaciones"
        options={{
          tabBarButton: (props) => <BotonCentralPersonalizado {...props} />,
        }}
      />

      <Tabs.Screen
        name="mas"
        options={{
          title: "Health",
          tabBarIcon: ({ color }) => <IconoHealth color={color} />,
        }}
      />

      <Tabs.Screen
        name="ajustes"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <IconoSettings color={color} />,
        }}
      />
    </Tabs>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const estilos = StyleSheet.create({
  barraInferior: {
    backgroundColor: "#ffffff",
    borderTopWidth: 0,
    height: 84,
    paddingBottom: 16,
    paddingTop: 8,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  etiquetaTab: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
  },

  // Botón central flotante (ilusión Cutout)
  dipContenedor: {
    position: "absolute",
    top: -40, // Modificado de -22 a -46 para subir el botón
    alignItems: "center",
    justifyContent: "center",
    width: 76,
    height: 76,
    zIndex: 10,
  },
  dipFondo: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORES.fondoPrincipal, // Mismo color de fondo de la app para ocultar la barra blanca detrás
    alignItems: "center",
    justifyContent: "center",
  },
  botonCentral: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  iconoMas: {
    fontSize: 32,
    color: "#2d2d2d",
    fontWeight: "300",
    lineHeight: 36,
  },
  etiquetaBotonCentral: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORES.tabInactivo,
    marginTop: 0,
  },
});
