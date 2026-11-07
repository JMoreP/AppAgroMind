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
    // 1. Crear tabla principal con todas las columnas actualizadas
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS animales (
        id TEXT PRIMARY KEY NOT NULL,
        arete TEXT NOT NULL,
        nombre TEXT,
        sexo TEXT NOT NULL,
        especie TEXT NOT NULL DEFAULT 'bufalino',
        fechaNacimiento TEXT NOT NULL,
        raza TEXT,
        pesoInicial REAL NOT NULL DEFAULT 0,
        pesoActual REAL NOT NULL DEFAULT 0,
        padreNro TEXT,
        madreNro TEXT,
        estadoReproductivo TEXT NOT NULL DEFAULT 'vacia',
        totalPartos INTEGER NOT NULL DEFAULT 0,
        fechaInseminacion TEXT,
        fechaProbableParto TEXT,
        ultimoPesajeLitros REAL NOT NULL DEFAULT 0,
        promedioLitros REAL NOT NULL DEFAULT 0,
        estadoVida TEXT NOT NULL DEFAULT 'activa',
        loteId TEXT,
        sincronizado INTEGER NOT NULL DEFAULT 0,
        fechaActualizacion TEXT NOT NULL
      );
    `);

    // 2. Migración defensiva para desarrollo si la tabla se creó previamente con menos columnas
    const tableInfo = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(animales);`);
    const columnasExistentes = new Set(tableInfo.map(col => col.name));

    const columnasDeseadas: { nombre: string; definicion: string }[] = [
      { nombre: 'especie', definicion: "TEXT NOT NULL DEFAULT 'bufalino'" },
      { nombre: 'raza', definicion: 'TEXT' },
      { nombre: 'pesoInicial', definicion: 'REAL NOT NULL DEFAULT 0' },
      { nombre: 'pesoActual', definicion: 'REAL NOT NULL DEFAULT 0' },
      { nombre: 'padreNro', definicion: 'TEXT' },
      { nombre: 'madreNro', definicion: 'TEXT' },
      { nombre: 'totalPartos', definicion: 'INTEGER NOT NULL DEFAULT 0' },
      { nombre: 'fechaInseminacion', definicion: 'TEXT' },
      { nombre: 'fechaProbableParto', definicion: 'TEXT' },
      { nombre: 'promedioLitros', definicion: 'REAL NOT NULL DEFAULT 0' },
      { nombre: 'estadoVida', definicion: "TEXT NOT NULL DEFAULT 'activa'" },
    ];

    for (const col of columnasDeseadas) {
      if (!columnasExistentes.has(col.nombre)) {
        await db.execAsync(`ALTER TABLE animales ADD COLUMN ${col.nombre} ${col.definicion};`);
      }
    }

    // 3. Crear índice para acelerar búsquedas por arete
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_animales_arete ON animales (arete);
    `);

    // 4. Crear tabla de lotes
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS lotes (
        id TEXT PRIMARY KEY NOT NULL,
        nombre TEXT NOT NULL,
        descripcion TEXT,
        colorHex TEXT NOT NULL DEFAULT '#1EA97B',
        sincronizado INTEGER NOT NULL DEFAULT 0,
        fechaActualizacion TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_lotes_nombre ON lotes (nombre);
    `);

    // 5. Crear tabla de pesajes de leche
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS pesajes_leche (
        id TEXT PRIMARY KEY NOT NULL,
        animalId TEXT NOT NULL,
        fecha TEXT NOT NULL,
        turno TEXT NOT NULL,
        litros REAL NOT NULL,
        observaciones TEXT,
        sincronizado INTEGER NOT NULL DEFAULT 0,
        fechaActualizacion TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_pesajes_fecha ON pesajes_leche (fecha);
      CREATE INDEX IF NOT EXISTS idx_pesajes_animal ON pesajes_leche (animalId);
      CREATE INDEX IF NOT EXISTS idx_pesajes_animal_fecha ON pesajes_leche (animalId, fecha);
    `);

    // 6. Crear tabla de servicios reproductivos
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS servicios_reproductivos (
        id TEXT PRIMARY KEY NOT NULL,
        animalId TEXT NOT NULL,
        fecha TEXT NOT NULL,
        tipo TEXT NOT NULL,
        
        numeroPajuela TEXT,
        razaToro TEXT,
        veterinario TEXT,
        
        toroNumero TEXT,
        toroRaza TEXT,
        
        resultado TEXT,
        fechaProbableParto TEXT,
        
        observaciones TEXT,
        sincronizado INTEGER NOT NULL DEFAULT 0,
        fechaActualizacion TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_servicios_animal ON servicios_reproductivos (animalId);
      CREATE INDEX IF NOT EXISTS idx_servicios_fecha ON servicios_reproductivos (fecha);
      CREATE INDEX IF NOT EXISTS idx_servicios_resultado ON servicios_reproductivos (resultado);
    `);

    // 7. Crear tabla de diagnósticos de preñez (palpación / ecografía)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS diagnosticos_prenez (
        id TEXT PRIMARY KEY NOT NULL,
        animalId TEXT NOT NULL,
        servicioId TEXT,
        fecha TEXT NOT NULL,
        resultado TEXT NOT NULL,
        metodo TEXT,
        veterinario TEXT,
        observaciones TEXT,
        sincronizado INTEGER NOT NULL DEFAULT 0,
        fechaActualizacion TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_diag_animal ON diagnosticos_prenez (animalId);
      CREATE INDEX IF NOT EXISTS idx_diag_fecha ON diagnosticos_prenez (fecha);
      CREATE INDEX IF NOT EXISTS idx_diag_servicio ON diagnosticos_prenez (servicioId);
    `);

    // 8. Crear tabla de partos y crías
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS partos (
        id TEXT PRIMARY KEY NOT NULL,
        animalId TEXT NOT NULL,
        fecha TEXT NOT NULL,
        sexoCria TEXT NOT NULL,
        pesoCria REAL,
        areteCria TEXT,
        observaciones TEXT,
        sincronizado INTEGER NOT NULL DEFAULT 0,
        fechaActualizacion TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_partos_animal ON partos (animalId);
      CREATE INDEX IF NOT EXISTS idx_partos_fecha ON partos (fecha);
    `);

    // 9. Crear tabla de ceba / engorde corporal
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS ceba (
        id TEXT PRIMARY KEY NOT NULL,
        animalId TEXT NOT NULL,
        fechaNacimiento TEXT,
        pesoDestete REAL,
        padreNro TEXT,
        raza TEXT,
        fechaInicio TEXT NOT NULL,
        pesoI REAL,
        fechaII TEXT,
        pesoII REAL,
        fechaIII TEXT,
        pesoIII REAL,
        fechaIV TEXT,
        pesoIV REAL,
        pesoObjetivo REAL DEFAULT 450,
        observaciones TEXT,
        activo INTEGER NOT NULL DEFAULT 1,
        sincronizado INTEGER NOT NULL DEFAULT 0,
        fechaActualizacion TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_ceba_animal ON ceba (animalId);
      CREATE INDEX IF NOT EXISTS idx_ceba_activo ON ceba (activo);
    `);

    // Migración para bases de datos existentes: pesoObjetivo en ceba
    const tableInfoCeba = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(ceba)`);
    const tienePesoObjetivo = tableInfoCeba.some((c) => c.name === 'pesoObjetivo');
    if (!tienePesoObjetivo) {
      await db.execAsync(`ALTER TABLE ceba ADD COLUMN pesoObjetivo REAL DEFAULT 450;`);
    }

    // 10. Crear tabla de eventos sanitarios (vacunas, desparasitación, tratamientos)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS eventos_sanitarios (
        id TEXT PRIMARY KEY NOT NULL,
        animalId TEXT,
        esGrupal INTEGER NOT NULL DEFAULT 0,
        fecha TEXT NOT NULL,
        tipo TEXT NOT NULL,
        producto TEXT NOT NULL,
        dosis TEXT,
        responsable TEXT,
        proximaDosis TEXT,
        diasRetiroLeche INTEGER,
        observaciones TEXT,
        sincronizado INTEGER NOT NULL DEFAULT 0,
        fechaActualizacion TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_sanidad_animal ON eventos_sanitarios (animalId);
      CREATE INDEX IF NOT EXISTS idx_sanidad_fecha ON eventos_sanitarios (fecha);
      CREATE INDEX IF NOT EXISTS idx_sanidad_tipo ON eventos_sanitarios (tipo);
      CREATE INDEX IF NOT EXISTS idx_sanidad_proxima ON eventos_sanitarios (proximaDosis);
    `);

    // 11. Crear tablas de bajas del hato (mortalidad y descarte)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS eventos_mortalidad (
        id TEXT PRIMARY KEY NOT NULL,
        animalId TEXT NOT NULL,
        fecha TEXT NOT NULL,
        causa TEXT NOT NULL,
        observaciones TEXT,
        sincronizado INTEGER NOT NULL DEFAULT 0,
        fechaActualizacion TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS eventos_descarte (
        id TEXT PRIMARY KEY NOT NULL,
        animalId TEXT NOT NULL,
        fecha TEXT NOT NULL,
        destino TEXT NOT NULL,
        precio REAL,
        observaciones TEXT,
        sincronizado INTEGER NOT NULL DEFAULT 0,
        fechaActualizacion TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_mort_animal ON eventos_mortalidad (animalId);
      CREATE INDEX IF NOT EXISTS idx_mort_fecha ON eventos_mortalidad (fecha);
      CREATE INDEX IF NOT EXISTS idx_desc_animal ON eventos_descarte (animalId);
      CREATE INDEX IF NOT EXISTS idx_desc_fecha ON eventos_descarte (fecha);
    `);

    // 12. Crear tabla de configuración de finca y aplicación (key-value)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS configuracion (
        clave TEXT PRIMARY KEY NOT NULL,
        valor TEXT NOT NULL,
        fechaActualizacion TEXT NOT NULL
      );
    `);
    
    console.log("✅ Esquema de base de datos SQLite inicializado correctamente.");
  } catch (error) {
    console.error("❌ Error creando las tablas SQLite:", error);
  }
}


