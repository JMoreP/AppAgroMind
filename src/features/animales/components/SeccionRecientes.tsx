import { BlurView } from 'expo-blur';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORES } from '../../../shared/theme/colores';

export function SeccionRecientes() {
  return (
    <View style={styles.contenedorSeccionRecientes}>
      <Text style={styles.tituloSeccion}>RECENTS</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollRecientes}>
        <TarjetaReciente nombre="Vaca #452" subtitulo="e.a. #452" valorPrincipal="33.9" valorSecundario="10.0" />
        <TarjetaReciente nombre="Vaca #109" subtitulo="e.a. #109" valorPrincipal="10.0" valorSecundario="10.6%" />
      </ScrollView>
    </View>
  );
}

function TarjetaReciente({ nombre, subtitulo, valorPrincipal, valorSecundario }: any) {
  return (
    <View style={styles.tarjetaRecienteOuter}>
      <BlurView intensity={80} tint="light" style={styles.tarjetaRecienteInner}>
        
        {/* Contenido alineado al estilo Apple Wallet / Health Widget */}
        <View style={styles.contenidoWidget}>
          
          {/* Ícono Izquierdo (Limpieza total) */}
          <View style={styles.circuloIcono}>
            <Text style={styles.emojiIcono}>🐮</Text>
          </View>
          
          {/* Textos Centrales */}
          <View style={styles.cuerpoTextos}>
            <Text style={styles.textoNombreReciente}>{nombre}</Text>
            <Text style={styles.textoSubtituloReciente}>{subtitulo}</Text>
          </View>

          {/* Valores a la derecha */}
          <View style={styles.seccionValores}>
            <Text style={styles.textoValorPrincipal}>{valorPrincipal} <Text style={styles.unidadTexto}>L</Text></Text>
            <Text style={styles.textoValorSecundario}>{valorSecundario}</Text>
          </View>

        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  tituloSeccion: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORES.textoSecundario,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  contenedorSeccionRecientes: {
    marginTop: 24,
    marginBottom: 80,
  },
  scrollRecientes: {
    paddingRight: 20,
    paddingBottom: 24, // Espacio vital para que la sombra y la tarjeta no se corten abajo
    paddingTop: 8,
    gap: 12,
  },
  tarjetaRecienteOuter: {
    width: 260, 
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORES.blancoTransparente90, 
    shadowColor: COLORES.negroIndustrial,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05, 
    shadowRadius: 16,
    elevation: 4, // Ayuda al renderizado en Android
  },
  tarjetaRecienteInner: {
    padding: 16,
    backgroundColor: COLORES.blancoTransparente65,
    borderRadius: 23, // Ligeramente menor para que calce perfecto en el outer sin desbordar
    overflow: 'hidden',
  },
  contenidoWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  circuloIcono: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORES.blancoTransparente80,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORES.negroIndustrial,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  emojiIcono: {
    fontSize: 20,
  },
  cuerpoTextos: {
    flex: 1,
    justifyContent: 'center',
  },
  seccionValores: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  textoNombreReciente: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORES.negroIndustrial, // Negro puro Apple
    letterSpacing: -0.3,
  },
  textoSubtituloReciente: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORES.grisIOSInactivo, // Gris típico iOS
    marginTop: 2,
  },
  textoValorPrincipal: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORES.negroIndustrial,
    letterSpacing: -0.5,
  },
  unidadTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORES.grisIOSInactivo,
  },
  textoValorSecundario: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORES.esmeraldaNeon, // Damos el toque positivo en el porcentaje
    marginTop: 2,
  },
});
