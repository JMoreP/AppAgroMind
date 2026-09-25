import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Rect, Path, Circle } from 'react-native-svg';

export function IconoOrdeno({ size = 48 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Defs>
        <LinearGradient id="gradOrdeno" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#10b981" />
          <Stop offset="100%" stopColor="#6ee7b7" />
        </LinearGradient>
      </Defs>
      <Rect x="8" y="16" width="30" height="6" rx="3" fill="url(#gradOrdeno)" />
      <Path d="M 12 22 h 4 l 1 10 a 2 2 0 0 1 -2 2 h -2 a 2 2 0 0 1 -2 -2 z" fill="url(#gradOrdeno)" />
      <Rect x="13.5" y="34" width="1" height="4" fill="url(#gradOrdeno)" />
      <Path d="M 20 22 h 6 l 1 14 a 3 3 0 0 1 -3 3 h -2 a 3 3 0 0 1 -3 -3 z" fill="url(#gradOrdeno)" />
      <Rect x="22" y="39" width="2" height="6" fill="url(#gradOrdeno)" />
      <Path d="M 30 22 h 4 l 1 10 a 2 2 0 0 1 -2 2 h -2 a 2 2 0 0 1 -2 -2 z" fill="url(#gradOrdeno)" />
      <Rect x="31.5" y="34" width="1" height="4" fill="url(#gradOrdeno)" />
      <Path d="M 44 26 h 4 v -5 l 10 9 l -10 9 v -5 h -4 z" fill="url(#gradOrdeno)" />
    </Svg>
  );
}

export function IconoArete({ size = 48 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Defs>
        <LinearGradient id="gradArete" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#10b981" />
          <Stop offset="100%" stopColor="#6ee7b7" />
        </LinearGradient>
      </Defs>
      <Path d="M 6 30 c 0 -3 3 -5 6 -5 h 14 c 3 0 6 2 6 5 v 16 c 0 3 -3 5 -6 5 h -14 c -3 0 -6 -2 -6 -5 z M 13 25 v -9 c 0 -3 2 -4 6 -4 c 4 0 6 1 6 4 v 9 z M 19 15 a 2.5 2.5 0 1 0 0 5 a 2.5 2.5 0 1 0 0 -5 z" fill="url(#gradArete)" fillRule="evenodd" />
      <Circle cx="44" cy="38" r="12" stroke="url(#gradArete)" strokeWidth="4" fill="none" />
      <Path d="M 36 32 a 8 8 0 0 1 8 -2" stroke="url(#gradArete)" strokeWidth="2" strokeLinecap="round" fill="none" />
      <Path d="M 52.5 46.5 L 60 54" stroke="url(#gradArete)" strokeWidth="6" strokeLinecap="round" />
    </Svg>
  );
}

export function IconoSalud({ size = 48 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Defs>
        <LinearGradient id="gradSalud" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#10b981" />
          <Stop offset="100%" stopColor="#6ee7b7" />
        </LinearGradient>
      </Defs>
      <Path d="M 12 14 c 0 20 20 20 20 0" stroke="url(#gradSalud)" strokeWidth="5" fill="none" strokeLinecap="round" />
      <Path d="M 22 24 v 16 c 0 4 3 6 7 6 h 3" stroke="url(#gradSalud)" strokeWidth="5" fill="none" strokeLinecap="round" />
      <Circle cx="36" cy="46" r="7" stroke="url(#gradSalud)" strokeWidth="5" fill="none" />
      <Circle cx="12" cy="12" r="4" fill="url(#gradSalud)" />
      <Circle cx="32" cy="12" r="4" fill="url(#gradSalud)" />
      <Rect x="46" y="16" width="12" height="26" rx="6" transform="rotate(45 52 29)" fill="url(#gradSalud)" />
      <Path d="M 44 29 L 60 29" stroke="#ffffff" strokeWidth="2" transform="rotate(45 52 29)" />
    </Svg>
  );
}
