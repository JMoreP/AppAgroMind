import React from 'react';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { COLORES } from '../theme/colores';

interface LogoGanaSmartProps {
  tamaño?: number;
}

export function LogoGanaSmart({ tamaño = 36 }: LogoGanaSmartProps) {
  return (
    <Svg width={tamaño} height={tamaño} viewBox="0 0 120 120" fill="none">
      <Defs>
        <LinearGradient id="gradienteG" x1="10" y1="10" x2="110" y2="110" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor={COLORES.esmeraldaMedio} />
          <Stop offset="50%" stopColor={COLORES.esmeraldaNeon} />
          <Stop offset="100%" stopColor={COLORES.esmeraldaPrimario} />
        </LinearGradient>

        <LinearGradient id="gradienteHoja" x1="15" y1="65" x2="105" y2="45" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor={COLORES.badgeOfflineBorde} />
          <Stop offset="100%" stopColor={COLORES.esmeraldaNeon} />
        </LinearGradient>
      </Defs>

      {/* Estructura de la Letra G estilizada */}
      <Path
        d="M 88 38 C 76 22 50 18 34 33 C 16 50 16 75 34 90 C 50 104 80 102 90 84 C 94 77 94 62 94 58 L 56 58 L 56 70 L 80 70 C 79 78 72 86 58 86 C 44 86 32 75 32 60 C 32 45 44 33 58 33 C 68 33 76 39 80 46 L 92 36 Z"
        fill="url(#gradienteG)"
      />

      {/* Hoja / Ola Orgánica cruzando la G */}
      <Path
        d="M 22 74 C 42 84 62 70 82 52 C 96 39 104 36 106 36 C 104 42 94 54 78 67 C 56 86 36 86 22 74 Z"
        fill="url(#gradienteHoja)"
      />
    </Svg>
  );
}
