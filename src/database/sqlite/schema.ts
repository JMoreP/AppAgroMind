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
