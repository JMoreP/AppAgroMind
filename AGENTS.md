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