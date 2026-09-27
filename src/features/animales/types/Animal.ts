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
