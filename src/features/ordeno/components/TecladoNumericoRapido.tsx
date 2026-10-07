import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Delete } from 'lucide-react-native';
import { COLORES } from '../../../shared/theme/colores';

interface Props {
  valor: string;
  onCambiarValor: (nuevoValor: string) => void;
}

export function TecladoNumericoRapido({ valor, onCambiarValor }: Props) {
  const presionarNumero = (num: string) => {
    // Si ya tiene punto y se presiona punto, ignorar
    if (num === '.' && valor.includes('.')) return;
    // Máximo 4 dígitos antes del punto o 1 decimal
    if (valor.includes('.') && valor.split('.')[1].length >= 1) return;
    if (!valor.includes('.') && valor.length >= 4 && num !== '.') return;

    if (valor === '0' && num !== '.') {
      onCambiarValor(num);
    } else {
      onCambiarValor(valor + num);
    }
  };

  const borrarUltimo = () => {
    if (valor.length > 0) {
      onCambiarValor(valor.slice(0, -1));
    }
  };

  const agregarRapido = (incremento: number) => {
    const actual = parseFloat(valor) || 0;
    const nuevo = Math.max(0, actual + incremento);
    onCambiarValor(nuevo.toFixed(1));
  };

  const limpiar = () => {
    onCambiarValor('');
  };

  return (
    <View style={styles.contenedorTeclado}>
      {/* Botones de ajuste rápido superior */}
      <View style={styles.filaAjusteRapido}>
        <Pressable 
          style={styles.btnAjusteRapido} 
          onPress={() => agregarRapido(0.5)}
        >
          <Text style={styles.textoAjusteRapido}>+0.5</Text>
        </Pressable>
        <Pressable 
          style={styles.btnAjusteRapido} 
          onPress={() => agregarRapido(1.0)}
        >
          <Text style={styles.textoAjusteRapido}>+1.0</Text>
        </Pressable>
        <Pressable 
          style={styles.btnAjusteRapido} 
          onPress={() => agregarRapido(2.0)}
        >
          <Text style={styles.textoAjusteRapido}>+2.0</Text>
        </Pressable>
        <Pressable 
          style={styles.btnAjusteLimpiar} 
          onPress={limpiar}
        >
          <Text style={styles.textoAjusteLimpiar}>C</Text>
        </Pressable>
      </View>

      {/* Cuadrícula de dígitos 1-9 */}
      <View style={styles.filaTeclas}>
        {['1', '2', '3'].map((digito) => (
          <Pressable
            key={digito}
            style={({ pressed }) => [styles.tecla, pressed && styles.teclaPresionada]}
            onPress={() => presionarNumero(digito)}
          >
            <Text style={styles.textoTecla}>{digito}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.filaTeclas}>
        {['4', '5', '6'].map((digito) => (
          <Pressable
            key={digito}
            style={({ pressed }) => [styles.tecla, pressed && styles.teclaPresionada]}
            onPress={() => presionarNumero(digito)}
          >
            <Text style={styles.textoTecla}>{digito}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.filaTeclas}>
        {['7', '8', '9'].map((digito) => (
          <Pressable
            key={digito}
            style={({ pressed }) => [styles.tecla, pressed && styles.teclaPresionada]}
            onPress={() => presionarNumero(digito)}
          >
            <Text style={styles.textoTecla}>{digito}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.filaTeclas}>
        <Pressable
          style={({ pressed }) => [styles.tecla, pressed && styles.teclaPresionada]}
          onPress={() => presionarNumero('.')}
        >
          <Text style={styles.textoTeclaPunto}>•</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.tecla, pressed && styles.teclaPresionada]}
          onPress={() => presionarNumero('0')}
        >
          <Text style={styles.textoTecla}>0</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.teclaBorrar, pressed && styles.teclaPresionada]}
          onPress={borrarUltimo}
        >
          <Delete size={24} color={COLORES.tealOscuro} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedorTeclado: {
    width: '100%',
    paddingHorizontal: 8,
    marginTop: 4,
  },
  filaAjusteRapido: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  btnAjusteRapido: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORES.blanco,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  textoAjusteRapido: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORES.verdeEsmeralda,
  },
  btnAjusteLimpiar: {
    width: 44,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORES.fondoApp,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  textoAjusteLimpiar: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORES.textoMudo,
  },
  filaTeclas: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  tecla: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORES.blanco,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    shadowColor: COLORES.tealOscuro,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  teclaBorrar: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORES.aquaClaro,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORES.verdeEsmeralda,
  },
  teclaPresionada: {
    backgroundColor: COLORES.verdeMentha,
    transform: [{ scale: 0.96 }],
  },
  textoTecla: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORES.tealOscuro,
  },
  textoTeclaPunto: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORES.tealOscuro,
    lineHeight: 28,
  },
});
