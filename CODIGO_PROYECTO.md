# Código Completo del Proyecto GanaSmartApp (AgroMind)

Este documento contiene la estructura completa y el código fuente del proyecto **GanaSmartApp** (AdminAgro Bufalino / AgroMind), listo para ser analizado o procesado por una Inteligencia Artificial.

## 🛠️ Tecnologías y Arquitectura
- **Framework:** React Native + Expo (Expo Router)
- **Lenguaje:** TypeScript
- **Arquitectura:** Feature-Based Clean Architecture + Local-First (SQLite vía `expo-sqlite`)
- **Gestión de Estado:** Zustand
- **UI/Estilos:** `StyleSheet` centralizado con tema de colores (`colores.ts`)

## 📁 Estructura del Proyecto

```
.gitignore
AGENTS.md
README.md
app.json
package.json
tsconfig.json
src/app/(tabs)/_layout.tsx
src/app/(tabs)/ajustes.tsx
src/app/(tabs)/index.tsx
src/app/(tabs)/operaciones.tsx
src/app/(tabs)/rebano.tsx
src/app/_layout.tsx
src/app/animal/ficha.tsx
src/database/sqlite/db.ts
src/database/sqlite/schema.ts
src/features/animales/components/SeccionRecientes.tsx
src/features/animales/components/TarjetaArete.tsx
src/features/animales/hooks/useAnimales.ts
src/features/animales/repositories/AnimalRepository.ts
src/features/animales/types/Animal.ts
src/features/ordeno/components/TarjetaHeroOrdeno.tsx
src/features/sincronizacion/components/BadgeEstadoOffline.tsx
src/shared/components/EncabezadoPrincipal.tsx
src/shared/components/IconosModulos.tsx
src/shared/components/LogoGanaSmart.tsx
src/shared/components/SeccionModulos.tsx
src/shared/store/useAnimalStore.ts
src/shared/theme/colores.ts
```

---

# 📄 Contenido de los Archivos

## Archivo: `.gitignore`

```
# Learn more https://docs.github.com/en/get-started/getting-started-with-git/ignoring-files

# dependencies
node_modules/

# Expo
.expo/
dist/
web-build/
expo-env.d.ts

# Native
.kotlin/
*.orig.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision

# Metro
.metro-health-check*

# debug
npm-debug.*
yarn-debug.*
yarn-error.*

# macOS
.DS_Store
*.pem

# local env files
.env*.local

# typescript
*.tsbuildinfo

example

# generated native folders
/ios
/android

```

## Archivo: `AGENTS.md`

```markdown
## 1. Arquitectura en Capas (Feature-based Clean Architecture)

Reglas de oro para la escalabilidad:
Patrón Repositorio (Repository Pattern): En tus pantallas no llames a firebase.getDocs(). Crea un intermediario:

AnimalRepository.getById(id) -> Este método primero busca en SQLite local. Si no está y hay red, lo busca en Firebase.

Si el día de mañana cambias de base de datos, tus pantallas no se enteran ni se rompen.

Estado Global con Zustand: Evita Redux por el exceso de código redundante. Zustand es súper ligero, rápido y se lleva perfecto con persistencia local.

3. ¿Firebase te limitará en el futuro?No te va a limitar, siempre y cuando no trates a Firestore como si fuera una base de datos SQL relacional.Muchos proyectos colisionan con Firebase por dos razones: costos sorpresa por lecturas masivas o consultas complejas con múltiples filtros cruzados (JOINs). 

Aquí te digo dónde están los riesgos y cómo blindarte:Posible cuello de botella en FirebaseCómo resolverlo para no tener problemasConsultas relacionales complejas (ej: "Búfalas mayores a 3 años, del lote 2, con mastitis y más de 8 litros de promedio"). Firestore no hace JOINs.Desnormaliza datos. Si la ficha de la búfala necesita el último pesaje, guarda el campo ultimoPesajeLitros directamente en el documento de la búfala, no hagas una consulta a toda la tabla de pesajes.Costos por lecturas en la nube al crecer el rebaño.La arquitectura Local-First lo soluciona. Al tener la base de datos completa en SQLite en el teléfono, las búsquedas por arete, filtros y conteos diarios se ejecutan en el CPU del celular a costo $0. Firebase solo se usa como respaldo central y sincronización.Migración futura: Si la finca crece a 20,000 animales o se convierte en un SaaS con cientos de clientes y necesitas Postgres/Supabase.Gracias al Patrón Repositorio, solo tendrías que cambiar la capa de services/remote por llamadas a tu nueva API, sin reescribir la app.

Reglas de Desarrollo del Proyecto: AdminAgro Bufalino

Actúa como un Desarrollador Senior de Software especializado en React Native con Expo, TypeScript, arquitectura de datos Local-First y Firebase/Firestore. Debes seguir de forma obligatoria y sin excepciones las siguientes pautas técnicas y directrices de diseño para este repositorio.

1. Principio Fundamental: Arquitectura Local-First y Offline
Persistencia Primaria en Local: La aplicación opera en zonas rurales sin conexión. La fuente de la verdad para la interfaz de usuario es siempre la base de datos local (SQLite vía expo-sqlite).

Escritura Inmediata: Toda acción de inserción o actualización (pesaje de leche, parto, dosis médica, etc.) debe ejecutarse primero en SQLite local con la bandera sincronizado = 0. La interfaz no debe esperar respuestas de red ni mostrar loaders bloqueantes dependientes de internet.

Capa de Sincronización en Segundo Plano: Las subidas a Firebase Firestore se realizan de forma aislada mediante un servicio sincronizador disparado por eventos de red (@react-native-community/netinfo), sin interferir con el hilo principal ni con la UI.

2. Arquitectura de Código y Reglas de Escalabilidad
Feature-Based Clean Architecture: Organiza el código por dominios de negocio dentro de src/features/ (ej: animales/, ordeno/, carne/, sanidad/, sincronizacion/).

Patrón Repositorio Estricto (Repository Pattern):

Prohibido llamar a métodos directos de Firebase (getDoc, setDoc, etc.) o consultas SQL dentro de componentes visuales o pantallas de Expo Router.

Toda interacción de datos debe abstraerse en repositorios (ej: AnimalRepository, PesajeRepository).

La UI interactúa exclusivamente con hooks y repositorios. Si se reemplaza la base de datos en la nube en el futuro, los componentes no deben modificarse.

Manejo de Estado Global: Utiliza únicamente Zustand para estados globales que requieran reactividad transversal (sesión activa, estado de red, búfala seleccionada). No agregues Redux ni Context API innecesarios.

Estilos y UI: Aplica StyleSheet de React Native (estándar). Prioriza interfaces de alto contraste legibles bajo la luz solar intensa.

3. Prevención de Cuellos de Botella y Optimización de Firebase
Para evitar costos elevados por operaciones masivas y limitaciones de rendimiento de Firestore, sigue estas directrices:

Desnormalización de Datos Obligatoria:

Firestore no soporta operaciones JOIN ni agregaciones relacionales complejas.

Duplica métricas calculadas en el documento raíz del animal. Por ejemplo, dentro del documento de la búfala se deben mantener campos como ultimoPesajeLitros, promedioLitros, estadoReproductivo y totalPartos.

No diseñes flujos que obliguen a leer una colección completa de pesajes para calcular el promedio de una sola búfala en pantalla.

Cero Costo de Lectura en Listados/Filtros:

Búsquedas complejas, conteos por lote, búfalas en ordeño y filtros se resuelven consultando SQLite localmente en el procesador del dispositivo.

Firestore se utiliza como respaldo centralizado y repositorio de sincronización, no como motor de búsqueda diaria para la app móvil.

Manejo de Lotes (Batch Writes):

Al sincronizar con la nube, agrupa los registros pendientes en lotes utilizando writeBatch() de Firestore (hasta 500 escrituras por operación de lote) para maximizar la velocidad de subida al recuperar señal.

Prohibición de Base64:

Nunca almacenes cadenas de imágenes o archivos pesados en documentos de Firestore. Si se implementa registro fotográfico, el archivo debe procesarse y un servicio aparte que probablemente sea Cloudinary (o similar) guardando únicamente la URL resultante en el registro.

- **Principio de Responsabilidad Única (SRP):** Las funciones y componentes deben ser pequeños, legibles y hacer una sola cosa.
- Extrae la lógica compleja a funciones auxiliares puras o *custom hooks*.
- Evita el anidamiento excesivo de bloques `if/else` (prefiere *early returns* o guard clauses).

## 3. Nomenclatura y Convenciones
- **Idioma:** Nombres de variables, funciones, tipos e interfaces en **Español**.
- **Variables y funciones:** Usar *camelCase* (ej: `obtenerDatosUsuario`, `esActivo`).
- **Componentes y Tipos/Interfaces:** Usar *PascalCase* (ej: `PerfilUsuario`, `ButtonProps`).
- **Constantes globales:** Usar *UPPER_CASE* (ej: `MAX_RETRIES`).
- Los nombres deben ser autoexplicativos; evita abreviaturas crípticas.

## 4. Manejo de Errores y Programación Defensiva
- Implementa bloques `try/catch` robustos en operaciones asíncronas (`async/await`) o llamadas a APIs.
- Tipa correctamente los errores capturados (evita `catch (error: any)`, usa validaciones de tipo como `if (error instanceof Error)`).
- Controla de forma defensiva los estados nulos, indefinidos o vacíos (`null`/`undefined`).

## 5. Estilo de Código y Buenas Prácticas
- Prefiere la sintaxis moderna de ES6+ (desestructuración, operadores de propagación `...`, operadores de encadenamiento opcional `?.` y fusión nula `??`).
- No dejes código comentado ("código muerto") ni console.logs de prueba a menos que se solicite explícitamente.
- Prioriza la inmutabilidad de los datos.

## 6. Reglas Estrictas de UI, Estilos y Colores (StyleSheet y Theme)
- **Prohibición Total de Estilos Inline:** NUNCA escribas estilos directamente dentro de los componentes JSX (ej. `style={{ ... }}` o arreglos de estilo inline). Todos los estilos deben ser definidos formalmente en el objeto `StyleSheet.create`.
- **Centralización Obligatoria de Colores (Theme):** Queda estrictamente PROHIBIDO escribir códigos de colores en hexadecimal (ej: `'#6EE7B7'`, `'#ECFDF5'`, `'#A7F3D0'`) o cadenas de color directamente en pantallas o componentes. Todos los colores de la aplicación DEBEN ser registrados y consumidos exclusivamente a través del objeto `COLORES` definido en `src/shared/theme/colores.ts`.

agromind/
│
├── src/
│   ├── app/                           # 📱 PANTALLAS Y NAVEGACIÓN (Expo Router)
│   │   ├── _layout.tsx                # Layout global (Barra de pestañas inferior)
│   │   ├── index.tsx                  # Pestaña 1: Dashboard / Inicio
│   │   ├── rebano.tsx                 # Pestaña 2: Rebaño (Lista y Fichas sin foto)
│   │   ├── operaciones.tsx            # Pestaña 3: HUB de Campo (Leche, Carne, Salud, Partos)
│   │   └── mas.tsx                    # Pestaña 4: Más (Reportes, Sincronización, Ajustes)
│   │
│   ├── features/                      # 🧱 MÓDULOS DE NEGOCIO (Monolito Modular)
│   │   │
│   │   ├── animales/                  # Módulo: Fichas, Aretes y Datos de Búfalas
│   │   │   ├── components/            # TarjetaArete.tsx, BuscadorArete.tsx
│   │   │   ├── hooks/                 # useAnimales.ts, useBuscarPorArete.ts
│   │   │   ├── repositories/          # AnimalRepository.ts (Busca en SQLite / Firestore)
│   │   │   └── types/                 # Animal.ts (Interfaz del animal)
│   │   │
│   │   ├── ordeno/                    # Módulo: Leche y Ordeño Rápido en Lote
│   │   │   ├── components/            # ContadorLitros.tsx, BotonGuardarSiguiente.tsx
│   │   │   ├── hooks/                 # useOrdenoLote.ts
│   │   │   ├── repositories/          # PesajeRepository.ts
│   │   │   └── types/                 # PesajeLeche.ts
│   │   │
│   │   ├── carne/                     # Módulo: Engorde y Pesaje Corporal (Kg)
│   │   │   ├── components/            # TarjetaPesoKg.tsx, SelectorLoteEngorde.tsx
│   │   │   ├── hooks/                 # usePesajeCarne.ts
│   │   │   ├── repositories/          # CarneRepository.ts
│   │   │   └── types/                 # PesajeCorporal.ts
│   │   │
│   │   ├── sanidad/                   # Módulo: Salud, Vacunas, Dosis y Mastitis
│   │   │   ├── components/            # AlertaRetiroLeche.tsx, ExamenMastitis.tsx
│   │   │   ├── repositories/          # SanidadRepository.ts
│   │   │   └── types/                 # Tratamiento.ts
│   │   │
│   │   ├── reproduccion/              # Módulo: Montas, Inseminación, Partos y FPP
│   │   │   ├── repositories/          # ReproduccionRepository.ts
│   │   │   └── types/                 # Parto.ts
│   │   │
│   │   ├── reportes/                  # Módulo: Gráficas y Exportación PDF/Excel
│   │   │   ├── services/              # ExportarPDFService.ts, ExportarExcelService.ts
│   │   │   └── components/            # GraficaProduccion.tsx
│   │   │
│   │   └── sincronizacion/            # Módulo: Motor Offline y Subida a Cloud
│   │       ├── services/              # SyncService.ts (Subida en lotes a Firestore)
│   │       └── components/            # BadgeEstadoOffline.tsx
│   │
│   ├── database/                      # 💾 PERSISTENCIA DE DATOS (Local-First)
│   │   ├── sqlite/                    # Tablas y consultas locales en el teléfono
│   │   │   ├── db.ts                  # Inicializador SQLite de expo-sqlite
│   │   │   └── schema.ts              # Tablas (animales, pesajes, sanidad)
│   │   │
│   │   └── firestore/                 # Cliente de respaldo en la nube
│   │       └── client.ts              # Configuración de Firebase
│   │
│   └── shared/                        # 🎨 RECURSOS COMPARTIDOS
│       ├── components/                # BotonPrimario.tsx, TarjetaGlass.tsx, InputTexto.tsx
│       ├── store/                     # Estado global con Zustand (useRedStore.ts, useSesionStore.ts)
│       └── theme/                     # Paleta de colores (Verde Esmeralda, Fondo #F8FAFC)
│
├── package.json                       # Librerías y scripts
├── app.json                           # Ajustes de Expo
└── AGENTS.md                          # Reglas técnicas del proyecto
```

## Archivo: `README.md`

````markdown
# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

````

## Archivo: `app.json`

```json
{
  "expo": {
    "name": "agromind",
    "slug": "agromind",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "agromind",
    "userInterfaceStyle": "automatic",
    "ios": {
      "icon": "./assets/expo.icon"
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#E6F4FE",
        "foregroundImage": "./assets/images/android-icon-foreground.png",
        "backgroundImage": "./assets/images/android-icon-background.png",
        "monochromeImage": "./assets/images/android-icon-monochrome.png"
      },
      "predictiveBackGestureEnabled": false
    },
    "web": {
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "backgroundColor": "#208AEF",
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 76
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true,
      "reactCompiler": true
    }
  }
}

```

## Archivo: `package.json`

```json
{
  "name": "agromind",
  "main": "expo-router/entry",
  "version": "1.0.0",
  "dependencies": {
    "@expo/ui": "~57.0.18",
    "@expo/vector-icons": "^15.1.1",
    "expo": "~57.0.22",
    "expo-blur": "~57.0.3",
    "expo-constants": "~57.0.18",
    "expo-device": "~57.0.2",
    "expo-font": "~57.0.4",
    "expo-glass-effect": "~57.0.3",
    "expo-image": "~57.0.5",
    "expo-linear-gradient": "^57.0.2",
    "expo-linking": "~57.0.10",
    "expo-router": "~57.0.21",
    "expo-splash-screen": "~57.0.9",
    "expo-sqlite": "^57.0.3",
    "expo-status-bar": "~57.0.1",
    "expo-symbols": "~57.0.3",
    "expo-system-ui": "~57.0.4",
    "expo-web-browser": "~57.0.3",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "react-native": "0.86.3",
    "react-native-gesture-handler": "~2.32.0",
    "react-native-reanimated": "4.5.1",
    "react-native-safe-area-context": "~5.7.0",
    "react-native-screens": "~4.26.0",
    "react-native-shadow-2": "^7.1.2",
    "react-native-svg": "15.15.4",
    "react-native-web": "~0.21.0",
    "react-native-worklets": "0.10.1",
    "zustand": "^5.0.15"
  },
  "devDependencies": {
    "@types/react": "~19.2.2",
    "typescript": "~6.0.3"
  },
  "scripts": {
    "start": "expo start",
    "reset-project": "node ./scripts/reset-project.js",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "lint": "expo lint"
  },
  "private": true
}

```

## Archivo: `tsconfig.json`

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": [
        "./src/*"
      ],
      "@/assets/*": [
        "./assets/*"
      ]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ]
}

```

## Archivo: `src/app/(tabs)/_layout.tsx`

```tsx
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

```

## Archivo: `src/app/(tabs)/ajustes.tsx`

```tsx
import { View, Text, StyleSheet } from 'react-native';

export default function PantallaAjustes() {
  return (
    <View style={styles.container}>
      <Text>Settings (Ajustes) - En construcción</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

```

## Archivo: `src/app/(tabs)/index.tsx`

```tsx
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORES } from '../../shared/theme/colores';

// Importaciones según la Arquitectura Clean Feature-based (AGENTS.md)
import { EncabezadoPrincipal } from '../../shared/components/EncabezadoPrincipal';
import { TarjetaHeroOrdeno } from '../../features/ordeno/components/TarjetaHeroOrdeno';
import { SeccionModulos } from '../../shared/components/SeccionModulos';
import { SeccionRecientes } from '../../features/animales/components/SeccionRecientes';

export default function PantallaInicio() {
  return (
    <SafeAreaView style={styles.contenedorSeguro}>
      <ScrollView
        contentContainerStyle={styles.contenidoScroll}
        showsVerticalScrollIndicator={false}
      >
        {/* PASO 1: ENCABEZADO EXACTO */}
        <EncabezadoPrincipal />

        {/* PASO 2: TARJETA HERO - MEDIDOR CIRCULAR SVG DE ORDEÑO */}
        <TarjetaHeroOrdeno totalLitros="480.5 L" />

        {/* PASO 3: LIVESTOCK OVERVIEW (Tarjetas Modulares Glass) */}
        <SeccionModulos />

        {/* PASO 4: RECENTS (Últimos Registros - Grey Glass) */}
        <SeccionRecientes />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedorSeguro: {
    flex: 1,
    backgroundColor: COLORES.fondoPrincipal,
  },
  contenidoScroll: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
});

```

## Archivo: `src/app/(tabs)/operaciones.tsx`

```tsx
import { View, Text, StyleSheet } from 'react-native';

export default function PantallaOperaciones() {
  return (
    <View style={styles.container}>
      <Text>Analytics (Operaciones) - En construcción</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

```

## Archivo: `src/app/(tabs)/rebano.tsx`

```tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, SlidersHorizontal, X } from 'lucide-react-native';
import { useAnimales } from '../../features/animales/hooks/useAnimales';
import { TarjetaArete } from '../../features/animales/components/TarjetaArete';
import { COLORES } from '../../shared/theme/colores';

export default function PantallaRebano() {
  const { animales, busqueda, setBusqueda, cargando } = useAnimales();
  const [mostrarBuscador, setMostrarBuscador] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* ── Header Estilo "My Herds" ── */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.tituloHeader}>Mi Rebaño</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable 
            style={styles.actionBtn}
            onPress={() => setMostrarBuscador(!mostrarBuscador)}
          >
            {mostrarBuscador ? (
              <X size={20} color={COLORES.tealOscuro} />
            ) : (
              <Search size={20} color={COLORES.tealOscuro} />
            )}
          </Pressable>
          <Pressable style={styles.actionBtn}>
            <Plus size={20} color={COLORES.tealOscuro} />
          </Pressable>
        </View>
      </View>

      {/* ── Buscador Desplegable ── */}
      {mostrarBuscador && (
        <View style={styles.contenedorBuscador}>
          <View style={styles.barraBusqueda}>
            <Search size={18} color={COLORES.textoMudo} style={styles.iconoBuscar} />
            <TextInput
              style={styles.inputBusqueda}
              placeholder="Buscar por arete o nombre..."
              placeholderTextColor={COLORES.textoMudo}
              value={busqueda}
              onChangeText={setBusqueda}
              clearButtonMode="while-editing"
              autoFocus
            />
          </View>
          <Pressable style={styles.botonFiltro}>
            <SlidersHorizontal size={18} color={COLORES.tealOscuro} />
          </Pressable>
        </View>
      )}

      {/* ── Lista de Animales ── */}
      {cargando ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={COLORES.verdeEsmeralda} />
        </View>
      ) : (
        <FlatList
          data={animales}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TarjetaArete animal={item} />}
          contentContainerStyle={styles.listaPadding}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.subtituloHeader}>
                {animales.length} {animales.length === 1 ? 'cabeza registrada' : 'cabezas registradas'}
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.centroVacio}>
              <Text style={styles.textoVacio}>No se encontraron animales.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORES.fondoApp 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTitleContainer: {
    flex: 1,
  },
  tituloHeader: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORES.tealOscuro,
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORES.blanco,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
    shadowColor: COLORES.tealOscuro,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  contenedorBuscador: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
    alignItems: 'center',
    gap: 12,
  },
  barraBusqueda: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.blanco,
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  iconoBuscar: {
    marginRight: 8,
  },
  inputBusqueda: {
    flex: 1,
    fontSize: 15,
    color: COLORES.tealOscuro,
    height: '100%',
  },
  botonFiltro: {
    width: 44,
    height: 44,
    backgroundColor: COLORES.blanco,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  listHeader: {
    marginBottom: 16,
  },
  subtituloHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORES.textoMudo,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listaPadding: {
    paddingHorizontal: 24,
    paddingBottom: 120, // Extra space for bottom tabs
  },
  centro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centroVacio: {
    paddingVertical: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoVacio: {
    fontSize: 16,
    color: COLORES.textoMudo,
    fontWeight: '500',
  }
});

```

## Archivo: `src/app/_layout.tsx`

```tsx
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { inicializarBaseDatos } from '../database/sqlite/schema';

export default function RootLayout() {
  useEffect(() => {
    // Inicializamos SQLite al nivel más alto de la aplicación
    inicializarBaseDatos();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* El grupo (tabs) contiene la barra inferior */}
      <Stack.Screen name="(tabs)" />
      
      {/* Otras pantallas que NO deben tener barra inferior van aquí */}
      <Stack.Screen name="animal/ficha" />
    </Stack>
  );
}

```

## Archivo: `src/app/animal/ficha.tsx`

```tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Edit3, Droplet, Weight, CalendarDays, ActivitySquare, Stethoscope, Fingerprint } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useAnimalStore } from '../../shared/store/useAnimalStore';
import { COLORES } from '../../shared/theme/colores';

export default function PantallaFicha() {
  const router = useRouter();
  const { animalSeleccionado } = useAnimalStore();

  if (!animalSeleccionado) return null;
  const animal = animalSeleccionado;

  const getStatusHeroStyle = () => {
    switch(animal.estadoReproductivo) {
      case 'lactancia': return styles.heroStatusLactancia;
      case 'preñada': return styles.heroStatusPrenada;
      case 'secado': return styles.heroStatusSecado;
      case 'vacia': return styles.heroStatusVacia;
      default: return styles.heroStatusDefault;
    }
  };

  const getStatusHeroDotStyle = () => {
    switch(animal.estadoReproductivo) {
      case 'lactancia': return styles.heroDotLactancia;
      case 'preñada': return styles.heroDotPrenada;
      case 'secado': return styles.heroDotSecado;
      case 'vacia': return styles.heroDotVacia;
      default: return styles.heroDotDefault;
    }
  };
  
  const getStatusHeroTextStyle = () => {
    switch(animal.estadoReproductivo) {
      case 'lactancia': return styles.heroTextLactancia;
      case 'preñada': return styles.heroTextPrenada;
      case 'secado': return styles.heroTextSecado;
      case 'vacia': return styles.heroTextVacia;
      default: return styles.heroTextDefault;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />
      
      {/* ── Top Navigation ── */}
      <View style={styles.headerNav}>
        <Pressable onPress={() => router.back()} style={styles.btnNav}>
          <ChevronLeft size={24} color={COLORES.tealOscuro} />
        </Pressable>
        <Text style={styles.headerTitle}>Ficha Técnica</Text>
        <Pressable style={styles.btnNav}>
          <Edit3 size={20} color={COLORES.tealOscuro} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollPadding} showsVerticalScrollIndicator={false}>
        
        {/* ── Premium Dark Hero Card ── */}
        <View style={styles.heroCard}>
          <View style={styles.heroBgPattern1} />
          <View style={styles.heroBgPattern2} />
          
          <View style={styles.heroTop}>
            <View style={getStatusHeroStyle()}>
              <View style={getStatusHeroDotStyle()} />
              <Text style={getStatusHeroTextStyle()}>{animal.estadoReproductivo.toUpperCase()}</Text>
            </View>
            <View style={styles.idBadgeDark}>
              <Fingerprint size={12} color={COLORES.limaBrillante} />
              <Text style={styles.idBadgeTextDark}>VERIFICADO</Text>
            </View>
          </View>
          
          <View style={styles.heroCenter}>
            <Text style={styles.areteGiant}>#{animal.arete}</Text>
            <Text style={styles.nombreDark}>{animal.nombre || 'Búfala N/A'}</Text>
          </View>
          
          <View style={styles.heroBottomRow}>
            <View style={styles.heroTagDark}>
              <CalendarDays size={14} color={COLORES.verdeMentha} style={styles.iconoTag} />
              <Text style={styles.heroTagTextDark}>{animal.fechaNacimiento}</Text>
            </View>
            <View style={styles.heroTagDark}>
              <Text style={styles.heroTagTextDark}>LOTE A</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Métricas Diarias</Text>

        {/* ── Minimalist Metrics Grid ── */}
        <View style={styles.grid}>
          
          {/* Tarjeta Leche */}
          <View style={styles.tarjetaGlassOuter}>
            <View style={styles.glowingBlob}>
              <Svg width="100%" height="100%" viewBox="0 0 100 100">
                <Defs>
                  <RadialGradient id="glowMilk" cx="50%" cy="50%" rx="50%" ry="50%">
                    <Stop offset="0%" stopColor={COLORES.limaBrillante} stopOpacity="0.4" />
                    <Stop offset="100%" stopColor={COLORES.limaBrillante} stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <Circle cx="50" cy="50" r="50" fill="url(#glowMilk)" />
              </Svg>
            </View>

            <BlurView intensity={65} tint="light" style={styles.tarjetaGlassInner}>
              <View style={styles.gridHeader}>
                <View style={styles.iconMilk}>
                  <Droplet size={18} color={COLORES.verdeOscuro} />
                </View>
                <Text style={styles.metricLabel}>Leche</Text>
              </View>
              <View style={styles.metricValueRow}>
                <Text style={styles.metricValue}>{animal.ultimoPesajeLitros.toFixed(1)}</Text>
                <Text style={styles.metricUnit}>Lts</Text>
              </View>
            </BlurView>
          </View>

          {/* Tarjeta Peso */}
          <View style={styles.tarjetaGlassOuter}>
            <View style={styles.glowingBlob}>
              <Svg width="100%" height="100%" viewBox="0 0 100 100">
                <Defs>
                  <RadialGradient id="glowWeight" cx="50%" cy="50%" rx="50%" ry="50%">
                    <Stop offset="0%" stopColor={COLORES.verdeEsmeralda} stopOpacity="0.4" />
                    <Stop offset="100%" stopColor={COLORES.verdeEsmeralda} stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <Circle cx="50" cy="50" r="50" fill="url(#glowWeight)" />
              </Svg>
            </View>

            <BlurView intensity={65} tint="light" style={styles.tarjetaGlassInner}>
              <View style={styles.gridHeader}>
                <View style={styles.iconWeight}>
                  <Weight size={18} color={COLORES.verdeOscuro} />
                </View>
                <Text style={styles.metricLabel}>Peso Vivo</Text>
              </View>
              <View style={styles.metricValueRow}>
                <Text style={styles.metricValue}>{animal.ultimoPesajeCarne.toFixed(0)}</Text>
                <Text style={styles.metricUnit}>Kg</Text>
              </View>
            </BlurView>
          </View>

        </View>

        {/* ── Clean Status Cards ── */}
        <Text style={styles.sectionTitle}>Historial Clínico</Text>
        
        <View style={styles.healthCard}>
          <View style={styles.healthLeftWarn}>
            <ActivitySquare size={24} color={COLORES.olivaOscuro} />
          </View>
          <View style={styles.healthCenter}>
            <Text style={styles.healthTitle}>Chequeo Reproductivo</Text>
            <Text style={styles.healthDesc}>Próxima revisión en 15 días</Text>
          </View>
          <View style={styles.healthRightWarn}>
            <Text style={styles.healthAlertText}>Pendiente</Text>
          </View>
        </View>

        <View style={styles.healthCard}>
          <View style={styles.healthLeftOk}>
            <Stethoscope size={24} color={COLORES.verdeEsmeralda} />
          </View>
          <View style={styles.healthCenter}>
            <Text style={styles.healthTitle}>Sanidad al día</Text>
            <Text style={styles.healthDesc}>Esquema de vacunación completo</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORES.fondoApp,
  },
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 60,
  },
  btnNav: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORES.blanco,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORES.tealOscuro,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  scrollPadding: {
    paddingHorizontal: 20,
    paddingBottom: 60,
    paddingTop: 16,
  },
  
  // Hero Premium (Dark Mode)
  heroCard: {
    backgroundColor: COLORES.verdeOscuro,
    borderRadius: 32,
    padding: 28,
    marginBottom: 32,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: COLORES.verdeOscuro,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  heroBgPattern1: {
    position: 'absolute',
    top: -80,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORES.tealOscuro,
    opacity: 0.5,
  },
  heroBgPattern2: {
    position: 'absolute',
    bottom: -60,
    left: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORES.verdeEsmeralda,
    opacity: 0.3,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  idBadgeDark: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.limaTransparente15, // limaBrillante opacity
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: COLORES.limaTransparente30,
  },
  idBadgeTextDark: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORES.limaBrillante,
    letterSpacing: 1,
    marginLeft: 4,
  },
  heroCenter: {
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  areteGiant: {
    fontSize: 56,
    fontWeight: '900',
    color: COLORES.blanco,
    letterSpacing: -2,
    lineHeight: 64,
  },
  nombreDark: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORES.verdeMentha,
    letterSpacing: 0.5,
  },
  heroBottomRow: {
    flexDirection: 'row',
  },
  heroTagDark: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.blancoTransparente10, // white opacity
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    marginRight: 12,
  },
  iconoTag: {
    marginRight: 6,
  },
  heroTagTextDark: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORES.blanco,
    letterSpacing: 0.5,
    marginLeft: 6,
  },
  
  // Hero Status Dynamic Styles (No inline)
  heroStatusLactancia: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORES.limaBrillante, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100 },
  heroDotLactancia: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORES.verdeOscuro, marginRight: 8 },
  heroTextLactancia: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, color: COLORES.verdeOscuro },

  heroStatusPrenada: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORES.azulRey, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100 },
  heroDotPrenada: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORES.blanco, marginRight: 8 },
  heroTextPrenada: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, color: COLORES.blanco },

  heroStatusSecado: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORES.limaClaro, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100 },
  heroDotSecado: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORES.olivaOscuro, marginRight: 8 },
  heroTextSecado: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, color: COLORES.olivaOscuro },

  heroStatusVacia: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORES.textoMudo, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100 },
  heroDotVacia: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORES.blanco, marginRight: 8 },
  heroTextVacia: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, color: COLORES.blanco },

  heroStatusDefault: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORES.blancoTransparente20, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100 },
  heroDotDefault: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORES.blanco, marginRight: 8 },
  heroTextDefault: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, color: COLORES.blanco },

  // Sections
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORES.textoMudo,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 16,
    marginLeft: 4,
  },
  
  // Grid Premium
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  tarjetaGlassOuter: {
    flex: 1,
    height: 140,
    backgroundColor: 'transparent',
    borderRadius: 24,
    padding: 2,
    overflow: 'hidden',
  },
  glowingBlob: {
    position: 'absolute',
    bottom: -30,
    right: -20,
    width: 120,
    height: 120,
  },
  tarjetaGlassInner: {
    flex: 1,
    backgroundColor: COLORES.blancoTransparente45,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1.5,
    borderColor: COLORES.blancoTransparente70,
    justifyContent: 'space-between',
  },
  gridHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconMilk: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORES.verdeMentha,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  iconWeight: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORES.verdeMentha,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORES.tealOscuro,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricValue: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORES.verdeOscuro,
    letterSpacing: -1,
  },
  metricUnit: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORES.limaBrillante,
    marginLeft: 6,
  },
  
  // Clean Health Cards
  healthCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.blanco,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  healthLeftWarn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORES.limaClaro,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  healthLeftOk: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORES.verdeMentha,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  healthCenter: {
    flex: 1,
  },
  healthTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORES.tealOscuro,
    marginBottom: 4,
  },
  healthDesc: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORES.textoMudo,
  },
  healthRightWarn: {
    backgroundColor: COLORES.limaClaro,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: COLORES.olivaOscuro,
  },
  healthAlertText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORES.olivaOscuro,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  }
});

```

## Archivo: `src/database/sqlite/db.ts`

```typescript
import * as SQLite from 'expo-sqlite';

// Inicializar la base de datos de manera sincrónica (Recomendado en Expo SDK 51+)
let db: SQLite.SQLiteDatabase | null = null;

try {
  db = SQLite.openDatabaseSync('agromind.db');
} catch (error) {
  console.error("Error al inicializar la base de datos local (SQLite):", error);
}

export { db };

```

## Archivo: `src/database/sqlite/schema.ts`

```typescript
import { db } from './db';

/**
 * Inicializa la estructura de la base de datos local SQLite.
 * Debe ser llamada al arrancar la aplicación (ej: en _layout.tsx).
 */
export async function inicializarBaseDatos() {
  if (!db) {
    console.error("No se puede inicializar el esquema porque la DB no está disponible.");
    return;
  }

  try {
    // PRAGMA foreign_keys = ON; es buena práctica, pero aquí nos enfocamos en la tabla principal
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS animales (
        id TEXT PRIMARY KEY NOT NULL,
        arete TEXT NOT NULL,
        nombre TEXT,
        fechaNacimiento TEXT NOT NULL,
        sexo TEXT NOT NULL,
        estadoReproductivo TEXT NOT NULL,
        ultimoPesajeLitros REAL NOT NULL DEFAULT 0,
        ultimoPesajeCarne REAL NOT NULL DEFAULT 0,
        loteId TEXT,
        sincronizado INTEGER NOT NULL DEFAULT 0,
        fechaActualizacion TEXT NOT NULL
      );
    `);

    // Crear un índice para la búsqueda instantánea por arete
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_animales_arete ON animales (arete);
    `);
    
    console.log("✅ Esquema de base de datos SQLite inicializado correctamente.");
  } catch (error) {
    console.error("❌ Error creando las tablas SQLite:", error);
  }
}

```

## Archivo: `src/features/animales/components/SeccionRecientes.tsx`

```tsx
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

```

## Archivo: `src/features/animales/components/TarjetaArete.tsx`

```tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Animal } from '../types/Animal';
import { useAnimalStore } from '../../../shared/store/useAnimalStore';
import { useRouter } from 'expo-router';
import { COLORES } from '../../../shared/theme/colores';

interface Props {
  animal: Animal;
}

export function TarjetaArete({ animal }: Props) {
  const { seleccionarAnimal } = useAnimalStore();
  const router = useRouter();

  const manejarPress = () => {
    seleccionarAnimal(animal);
    router.push(`/animal/ficha`);
  };

  const statusLabel = animal.estadoReproductivo.charAt(0).toUpperCase() + animal.estadoReproductivo.slice(1);

  return (
    <Pressable 
      style={({ pressed }) => [
        styles.tarjetaRecienteOuter, 
        pressed && styles.cardPressed
      ]}
      onPress={manejarPress}
    >
      <View style={styles.tarjetaRecienteInner}>
        {/* Contenido alineado al estilo Apple Wallet / Health Widget */}
        <View style={styles.contenidoWidget}>
          
          {/* Ícono Izquierdo Circular (Estilo Home Screen) */}
          <View style={styles.circuloIcono}>
            <Text style={styles.textoIconoArete}>#{animal.arete}</Text>
          </View>
          
          {/* Textos Centrales */}
          <View style={styles.cuerpoTextos}>
            <Text style={styles.textoNombreReciente} numberOfLines={1}>
              {animal.nombre || 'Búfala N/A'}
            </Text>
            <Text style={styles.textoSubtituloReciente}>{statusLabel}</Text>
          </View>

          {/* Valores a la derecha */}
          <View style={styles.seccionValores}>
            <Text style={styles.textoValorPrincipal}>
              {animal.ultimoPesajeLitros.toFixed(1)} <Text style={styles.unidadTexto}>L</Text>
            </Text>
            <Text style={styles.textoValorSecundario}>PROD</Text>
          </View>

        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tarjetaRecienteOuter: {
    width: '100%', 
    marginBottom: 12,
    borderRadius: 24,
    // Fondo sólido es OBLIGATORIO en Android para que la elevación no genere un cuadro gris gigante
    backgroundColor: COLORES.blanco, 
    borderWidth: 1,
    borderColor: COLORES.bordeClaro, 
    shadowColor: COLORES.tealOscuro,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04, 
    shadowRadius: 12,
    elevation: 3, 
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
    borderColor: COLORES.verdeEsmeralda,
  },
  tarjetaRecienteInner: {
    padding: 16,
    borderRadius: 24, 
    overflow: 'hidden',
  },
  contenidoWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  circuloIcono: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORES.fondoApp, // Usar el fondo de la app para un contraste súper sutil
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORES.bordeClaro,
  },
  textoIconoArete: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORES.tealOscuro,
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
    fontSize: 17,
    fontWeight: '700',
    color: COLORES.tealOscuro,
    letterSpacing: -0.3,
  },
  textoSubtituloReciente: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORES.textoMudo, 
    marginTop: 2,
  },
  textoValorPrincipal: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORES.verdeOscuro,
    letterSpacing: -0.5,
  },
  unidadTexto: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORES.textoMudo,
  },
  textoValorSecundario: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORES.limaBrillante, 
    marginTop: 2,
    letterSpacing: 0.5,
  },
});

```

## Archivo: `src/features/animales/hooks/useAnimales.ts`

```typescript
import { useState, useEffect } from 'react';
import { Animal } from '../types/Animal';
import { AnimalRepository } from '../repositories/AnimalRepository';

export function useAnimales() {
  const [animales, setAnimales] = useState<Animal[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let montado = true;
    async function cargarAnimales() {
      try {
        const datos = await AnimalRepository.getAll();
        if (montado) {
          setAnimales(datos);
        }
      } catch (error) {
        console.error('Error al cargar animales:', error);
      } finally {
        if (montado) {
          setCargando(false);
        }
      }
    }

    cargarAnimales();

    return () => {
      montado = false;
    };
  }, []);

  const animalesFiltrados = animales.filter(a => 
    a.arete.includes(busqueda) || 
    (a.nombre && a.nombre.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return {
    animales: animalesFiltrados,
    busqueda,
    setBusqueda,
    cargando
  };
}

```

## Archivo: `src/features/animales/repositories/AnimalRepository.ts`

```typescript
import { Animal } from '../types/Animal';

/**
 * Repositorio de Animales. Es el ÚNICO punto de acceso a datos de animales.
 * Toda pantalla debe consumir este repositorio a través de hooks, NUNCA 
 * consultar SQLite o Firebase directamente.
 */
export const AnimalRepository = {
  async getAll(): Promise<Animal[]> {
    // TODO: Implementar consulta real a SQLite
    return [];
  },

  async getById(id: string): Promise<Animal | null> {
    // TODO: Implementar
    return null;
  },

  async getByArete(arete: string): Promise<Animal | null> {
    // TODO: Implementar
    return null;
  },

  async create(animal: Animal): Promise<void> {
    // TODO: Implementar
  },

  async update(id: string, cambios: Partial<Animal>): Promise<void> {
    // TODO: Implementar
  },

  async delete(id: string): Promise<void> {
    // TODO: Implementar
  },
};

```

## Archivo: `src/features/animales/types/Animal.ts`

```typescript
export interface Animal {
  id: string; // UUID (Obligatorio para sincronización)
  arete: string; // Número visible del animal
  nombre?: string; // Opcional
  fechaNacimiento: string; // ISO 8601
  sexo: 'M' | 'H'; // Macho o Hembra
  
  // --- Datos desnormalizados para evitar subconsultas en listados ---
  estadoReproductivo: 'vacia' | 'preñada' | 'lactancia' | 'secado' | 'ninguno';
  ultimoPesajeLitros: number; // 0 si no aplica o no hay
  ultimoPesajeCarne: number; // Peso corporal en KG
  loteId?: string; // Referencia al lote de pastoreo/ordeño
  
  // --- Metadatos de sincronización Local-First ---
  sincronizado: 0 | 1; // 0 = pendiente de subir a Firebase, 1 = sincronizado
  fechaActualizacion: string; // Fecha de última modificación local (para resolver conflictos)
}

```

## Archivo: `src/features/ordeno/components/TarjetaHeroOrdeno.tsx`

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Circle, Defs, RadialGradient, Stop, Path, LinearGradient } from 'react-native-svg';
import { COLORES } from '../../../shared/theme/colores';

export function TarjetaHeroOrdeno({ totalLitros = '480.5 L' }: { totalLitros?: string }) {
  return (
    <View style={styles.contenedorTarjetaHero}>
      <View style={styles.tarjetaOuter}>
        {/* Esmeralda Glow Blob (Efecto Glass/Luz) */}
        <View style={styles.glowingBlob}>
          <Svg width="100%" height="100%" viewBox="0 0 100 100">
            <Defs>
              <RadialGradient id="glow" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset="0%" stopColor={COLORES.esmeraldaNeon} stopOpacity="0.4" />
                <Stop offset="100%" stopColor={COLORES.esmeraldaNeon} stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Circle cx="50" cy="50" r="50" fill="url(#glow)" />
          </Svg>
        </View>

        {/* Gráfico Sparkline de Fondo (Tendencia de Ordeño) */}
        <View style={styles.sparklineContainer}>
          <Svg width="100%" height="80" viewBox="0 0 300 80" preserveAspectRatio="none">
            <Defs>
              <LinearGradient id="gradSpark" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={COLORES.esmeraldaNeon} stopOpacity="0.5" />
                <Stop offset="100%" stopColor={COLORES.esmeraldaNeon} stopOpacity="0" />
              </LinearGradient>
            </Defs>
            <Path 
              d="M 0 60 Q 30 20 60 40 T 120 30 T 180 50 T 240 20 T 300 35 L 300 80 L 0 80 Z" 
              fill="url(#gradSpark)" 
            />
            <Path 
              d="M 0 60 Q 30 20 60 40 T 120 30 T 180 50 T 240 20 T 300 35" 
              fill="none" 
              stroke={COLORES.esmeraldaNeon} 
              strokeWidth="3" 
              strokeLinecap="round" 
            />
          </Svg>
        </View>

        {/* Tarjeta Interna (Superficie de Cristal Auténtico) */}
        <BlurView intensity={70} tint="light" style={styles.tarjetaInner}>
          <View style={styles.badgeCrecimiento}>
            <Text style={styles.textoBadgeCrecimiento}>▲ 12.5% vs ayer</Text>
          </View>
          <Text style={styles.textoLitrosCentral}>{totalLitros}</Text>
          <Text style={styles.etiquetaTotalLeche}>TOTAL MILK TODAY</Text>
        </BlurView>
      </View>

      {/* Indicadores de Paginación en la base (3 Puntos) */}
      <View style={styles.contenedorPuntosPaginacion}>
        <View style={styles.puntoPaginacionActivo} />
        <View style={styles.puntoPaginacionInactivo} />
        <View style={styles.puntoPaginacionInactivo} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedorTarjetaHero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  tarjetaOuter: {
    width: '100%',
    height: 180, // Fija altura horizontal
    backgroundColor: 'transparent',
    borderRadius: 30,
    padding: 2, // Inset
    overflow: 'hidden',
    shadowColor: COLORES.sombraTarjetaHero,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  glowingBlob: {
    position: 'absolute',
    bottom: -80,
    right: -40,
    width: 220,
    height: 220,
  },
  tarjetaInner: {
    flex: 1,
    backgroundColor: COLORES.blancoTransparente40,
    borderRadius: 28, // 30 (outer) - 2 (padding)
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORES.blancoTransparente80,
  },
  sparklineContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    opacity: 0.6,
  },
  badgeCrecimiento: {
    backgroundColor: COLORES.esmeraldaTransparente15,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORES.esmeraldaTransparente30,
  },
  textoBadgeCrecimiento: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORES.verdeBadgeCrecimiento, // Un verde más oscuro para legibilidad
    letterSpacing: 0.5,
  },
  textoLitrosCentral: {
    fontSize: 42,
    fontWeight: '900',
    color: COLORES.textoOscuro,
    letterSpacing: -1.5,
  },
  etiquetaTotalLeche: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORES.textoSecundario,
    letterSpacing: 1.5,
    marginTop: -2,
    textTransform: 'uppercase',
  },
  contenedorPuntosPaginacion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
  },
  puntoPaginacionInactivo: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORES.puntoInactivo,
  },
  puntoPaginacionActivo: {
    width: 18,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORES.puntoActivo,
  },
});

```

## Archivo: `src/features/sincronizacion/components/BadgeEstadoOffline.tsx`

```tsx
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

```

## Archivo: `src/shared/components/EncabezadoPrincipal.tsx`

```tsx
import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { LogoGanaSmart } from './LogoGanaSmart';
import { BadgeEstadoOffline } from '../../features/sincronizacion/components/BadgeEstadoOffline';
import { COLORES } from '../theme/colores';

const URL_AVATAR_DEFECTO = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';

export function EncabezadoPrincipal() {
  return (
    <View style={styles.contenedorEncabezado}>
      <View style={styles.filaTituloYBadge}>
        <View style={styles.contenedorLogo}>
          <LogoGanaSmart tamaño={45} />
        </View>

        <BadgeEstadoOffline />

        <View style={styles.anilloAvatar}>
          <Image
            source={{ uri: URL_AVATAR_DEFECTO }}
            style={styles.imagenAvatar}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedorEncabezado: {
    marginTop: 8,
    marginBottom: 16,
  },
  filaTituloYBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  contenedorLogo: {
    flex: 1,
  },
  anilloAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: COLORES.verdeBordeAvatar,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORES.esmeraldaClaro,
  },
  imagenAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
});

```

## Archivo: `src/shared/components/IconosModulos.tsx`

```tsx
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { COLORES } from '../theme/colores';

export function IconoOrdeno({ size = 48 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Defs>
        <LinearGradient id="gradOrdeno" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor={COLORES.esmeraldaGradienteInicio} />
          <Stop offset="100%" stopColor={COLORES.esmeraldaGradienteFin} />
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
          <Stop offset="0%" stopColor={COLORES.esmeraldaGradienteInicio} />
          <Stop offset="100%" stopColor={COLORES.esmeraldaGradienteFin} />
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
          <Stop offset="0%" stopColor={COLORES.esmeraldaGradienteInicio} />
          <Stop offset="100%" stopColor={COLORES.esmeraldaGradienteFin} />
        </LinearGradient>
      </Defs>
      <Path d="M 12 14 c 0 20 20 20 20 0" stroke="url(#gradSalud)" strokeWidth="5" fill="none" strokeLinecap="round" />
      <Path d="M 22 24 v 16 c 0 4 3 6 7 6 h 3" stroke="url(#gradSalud)" strokeWidth="5" fill="none" strokeLinecap="round" />
      <Circle cx="36" cy="46" r="7" stroke="url(#gradSalud)" strokeWidth="5" fill="none" />
      <Circle cx="12" cy="12" r="4" fill="url(#gradSalud)" />
      <Circle cx="32" cy="12" r="4" fill="url(#gradSalud)" />
      <Rect x="46" y="16" width="12" height="26" rx="6" transform="rotate(45 52 29)" fill="url(#gradSalud)" />
      <Path d="M 44 29 L 60 29" stroke={COLORES.blanco} strokeWidth="2" transform="rotate(45 52 29)" />
    </Svg>
  );
}

```

## Archivo: `src/shared/components/LogoGanaSmart.tsx`

```tsx
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

```

## Archivo: `src/shared/components/SeccionModulos.tsx`

```tsx
import { BlurView } from 'expo-blur';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { COLORES } from '../theme/colores';
import { IconoArete, IconoOrdeno, IconoSalud } from './IconosModulos';

export function SeccionModulos() {
  return (
    <View style={styles.contenedorModulos}>
      <Text style={styles.tituloSeccion}>LIVESTOCK OVERVIEW</Text>
      <View style={styles.filaModulos}>
        <TarjetaModulo titulo="Ordeño Rápido" Icono={IconoOrdeno} iconSize={86} />
        <TarjetaModulo titulo="Búsqueda por Arete" Icono={IconoArete} />
        <TarjetaModulo titulo="Salud & Dosis" Icono={IconoSalud} />
      </View>
    </View>
  );
}

function TarjetaModulo({ titulo, Icono, iconSize = 64 }: { titulo: string; Icono: any; iconSize?: number }) {
  return (
    <View style={styles.tarjetaModuloOuter}>
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
    </View>
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
});

```

## Archivo: `src/shared/store/useAnimalStore.ts`

```typescript
import { create } from 'zustand';
import { Animal } from '../../features/animales/types/Animal';

interface AnimalStore {
  animalSeleccionado: Animal | null;
  seleccionarAnimal: (animal: Animal) => void;
  limpiarSeleccion: () => void;
}

export const useAnimalStore = create<AnimalStore>((set) => ({
  animalSeleccionado: null,
  seleccionarAnimal: (animal) => set({ animalSeleccionado: animal }),
  limpiarSeleccion: () => set({ animalSeleccionado: null }),
}));

```

## Archivo: `src/shared/theme/colores.ts`

```typescript
export const COLORES = {
  // --- NUEVA PALETA PRINCIPAL ---
  // Gama Esmeralda
  verdeOscuro: "#044B39",
  verdeEsmeralda: "#1EA97B",
  verdeMentha: "#C8EFC1",

  // Gama Oliva / Lima
  olivaOscuro: "#264B04",
  limaBrillante: "#72C613",
  limaClaro: "#CBF39D",

  // Gama Azul / Teal
  tealOscuro: "#053438",
  azulRey: "#2180E6",
  aquaClaro: "#BDF0EC",

  // Neutros Básicos
  blanco: "#FFFFFF",
  negroIndustrial: "#000000",
  grisIOSInactivo: "#8E8E93",
  fondoApp: "#EDF2EE", // Un gris-menta súper sutil y elegante
  bordeClaro: "#E2E8F0",
  textoMudo: "#64748B",

  // --- COMPATIBILIDAD Y TOKENS TRANSPARENTES/ESTILOS ---
  blancoTransparente10: "rgba(255, 255, 255, 0.1)",
  blancoTransparente15: "rgba(255, 255, 255, 0.15)",
  blancoTransparente20: "rgba(255, 255, 255, 0.2)",
  blancoTransparente30: "rgba(255, 255, 255, 0.3)",
  blancoTransparente40: "rgba(255, 255, 255, 0.4)",
  blancoTransparente45: "rgba(255, 255, 255, 0.45)",
  blancoTransparente65: "rgba(255, 255, 255, 0.65)",
  blancoTransparente70: "rgba(255, 255, 255, 0.7)",
  blancoTransparente80: "rgba(255, 255, 255, 0.8)",
  blancoTransparente90: "rgba(255, 255, 255, 0.9)",

  verdeBadgeCrecimiento: "#047857",
  esmeraldaTransparente15: "rgba(16, 185, 129, 0.15)",
  esmeraldaTransparente30: "rgba(16, 185, 129, 0.3)",
  esmeraldaGradienteInicio: "#10b981",
  esmeraldaGradienteFin: "#6ee7b7",

  limaTransparente15: "rgba(114, 198, 19, 0.15)",
  limaTransparente30: "rgba(114, 198, 19, 0.3)",

  tabBarBorde: "rgba(255, 255, 255, 0.7)",
  tabBarFondo: "rgba(255, 255, 255, 0.3)",

  // --- TOKENS DE COMPATIBILIDAD (No borrar) ---
  fondoPrincipal: "#EDF2EE",
  tarjetaFondo: "#FFFFFF",
  bordeTarjeta: "rgba(30, 169, 123, 0.2)",
  bordeTarjetaHero: "rgba(226, 232, 240, 0.8)",
  sombraTarjetaHero: "rgba(5, 52, 56, 0.08)",
  degradadoHeroFin: "rgba(30, 169, 123, 0.08)",

  esmeraldaOscuro: "#044B39",
  esmeraldaPrimario: "#1EA97B",
  esmeraldaNeon: "#72C613",
  esmeraldaMedio: "#1EA97B",
  esmeraldaClaro: "#C8EFC1",
  verdeBordeAvatar: "#CBF39D",

  badgeOfflineFondo: "#C8EFC1",
  badgeOfflineBorde: "#1EA97B",
  badgeOfflineTexto: "#044B39",

  gradienteArcoInicio: "#72C613",
  gradienteArcoMedio: "#1EA97B",
  gradienteArcoFin: "#C8EFC1",
  arcoInactivo: "#BDF0EC",
  lineaSparkline: "#1EA97B",

  puntoInactivo: "#C8EFC1",
  puntoActivo: "#044B39",

  textoOscuro: "#053438",
  textoSecundario: "#64748B",

  badgeNaranja: "#2180E6",
  badgeNaranjaFondo: "#BDF0EC",
  bordeGris: "#E2E8F0",

  tabActivo: "#1EA97B",
  tabInactivo: "#C8EFC1",
} as const;

export type TipoColor = keyof typeof COLORES;

```
