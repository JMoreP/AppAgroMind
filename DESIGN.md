# Sistema de Diseño: AgroMind (React Native)

Actúa como un Diseñador UI/UX Senior. Para todas las pantallas y componentes que construyas en este proyecto, debes acatar estrictamente los siguientes Design Tokens. Queda estrictamente PROHIBIDO inventar valores, colores, espaciados o curvaturas que no estén en esta lista. 

Si necesitas un elemento visual, consulta esta guía primero.

## 1. Tokens de Color (Importar siempre desde `src/shared/theme/colores.ts`)
Nunca uses códigos HEX directamente en el código de los componentes.
- **Fondo General**: `COLORES.fondoPrincipal` (#F8FAFC - Gris Azulado muy claro).
- **Acento Principal**: `COLORES.esmeraldaNeon` (#10b981). Solo usar para llamadas a la acción (CTAs), botones primarios, medidores de éxito e íconos activos.
- **Textos**: 
  - Primario: `COLORES.textoOscuro` (#1E293B) - Para títulos, cantidades de litros, nombres de vacas y datos principales.
  - Secundario: `COLORES.textoSecundario` (#64748B) - Para subtítulos, etiquetas ("Total Milk Today") y descripciones.
- **Bordes y Cristal**: Usar siempre RGBA con opacidades integradas en StyleSheet (Ej: `rgba(255, 255, 255, 0.6)` para bordes finos de tarjetas de cristal).

## 2. Tokens de Espaciado (Padding / Margin / Gap)
Todo el sistema está basado en múltiplos de 4. No uses valores como 5, 10, o 15.
- `xs`: 4px (Separaciones muy finas, gap entre icono y texto)
- `sm`: 8px (Separación entre un título y un subtítulo, o gap entre tarjetas modulares)
- `md`: 12px o 16px (Padding interno estándar de Tarjetas Modulares y Listas)
- `lg`: 20px o 24px (Márgenes laterales de la pantalla, o separación vertical entre grandes bloques)
- `xl`: 32px o 40px (Márgenes inferiores al final de ScrolViews para no chocar con la TabBar)

## 3. Tokens de Tipografía (Pesos y Tamaños)
*Nota: Se usan los pesos de fuentes nativos de React Native. Prioriza alto contraste.*
- **Títulos Hero (Ej. Litros Totales)**: `fontSize: 36`, `fontWeight: '800'`, `letterSpacing: -0.5`.
- **Títulos de Sección (Ej. "RECENTS")**: `fontSize: 13`, `fontWeight: '700'`, `letterSpacing: 1.2`, `textTransform: 'uppercase'`.
- **Nombres de Ítems (Ej. "Vaca #452")**: `fontSize: 16`, `fontWeight: '800'`.
- **Subtítulos/Detalles Modulares**: `fontSize: 10` o `13`, `fontWeight: '500'`, `lineHeight: 12`.

## 4. Radios de Curvatura (Border Radius)
NUNCA uses bordes afilados o cuadrados (0px). La estética de AgroMind es "Soft & Modern" (Premium Apple-like).
- **Botones pequeños, Píldoras o Badges**: `12px`, `20px` o `999px` (Totalmente redondos como pastillas).
- **Tarjetas secundarias (Listas/Recents)**: `16px`.
- **Tarjetas principales modulares (Dashboard Glass)**: `20px` radio exterior (`Outer`), `18px` radio interior (`Inner` BlurView).
- **Tarjetas Hero gigantes**: `30px` radio exterior, `28px` radio interior.

## 5. El Efecto "Glassmorphism" y Neomorfismo Lumínico (Ley Estricta)
Cuando crees tarjetas modulares o componentes que requieran destacar como "cristal", debes seguir esta fórmula exacta usando `expo-blur` y `react-native-svg`:

1. **Contenedor Externo (`Outer`)**: 
   - `backgroundColor: 'transparent'`.
   - `padding: 2` (para crear el efecto Inset y mostrar el fondo borroso en los bordes).
   - `overflow: 'hidden'`.
2. **Blob Lumínico (`Glowing Blob` en SVG)**: 
   - Debe ir en posición absoluta detrás del contenido.
   - Esfera de luz usando `RadialGradient` de `esmeraldaNeon` a `0.6` o `0.4` de opacidad difuminándose a `0` (`transparent`) en los extremos.
3. **Contenedor Interno (`BlurView`)**: 
   - Componente: `<BlurView intensity={65} tint="light">` (o intensity 70 para piezas más grandes).
   - `backgroundColor`: `rgba(255, 255, 255, 0.45)` (Opcional, para blanquear el cristal).
   - `borderWidth`: 1.5.
   - `borderColor`: `rgba(255, 255, 255, 0.7)` (Borde cristalino brillante).

Cualquier componente visual nuevo que integres en `src/features/` o `src/shared/` debe heredar el ADN de este sistema.
