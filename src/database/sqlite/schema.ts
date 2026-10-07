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
    
    console.log("✅ Esquema de base de datos SQLite inicializado correctamente.");
  } catch (error) {
    console.error("❌ Error creando las tablas SQLite:", error);
  }
}


