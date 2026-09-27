import * as SQLite from 'expo-sqlite';

// Inicializar la base de datos de manera sincrónica (Recomendado en Expo SDK 51+)
let db: SQLite.SQLiteDatabase | null = null;

try {
  db = SQLite.openDatabaseSync('agromind.db');
} catch (error) {
  console.error("Error al inicializar la base de datos local (SQLite):", error);
}

export { db };
