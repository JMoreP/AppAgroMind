export const COLORES = {
  // Fondos y Tarjetas
  fondoPrincipal: "#e9eef1",
  tarjetaFondo: "#e0e0e0",
  bordeTarjeta: "rgba(16, 185, 129, 0.2)",
  bordeTarjetaHero: "rgba(226, 232, 240, 0.8)",
  sombraTarjetaHero: "rgba(15, 23, 42, 0.08)",
  degradadoHeroFin: "rgba(16, 185, 129, 0.08)",

  // Gama Verde Esmeralda
  esmeraldaOscuro: "#064E3B",
  esmeraldaPrimario: "#059669",
  esmeraldaNeon: "#10B981",
  esmeraldaMedio: "#34D399",
  esmeraldaClaro: "#ECFDF5",
  verdeBordeAvatar: "#6EE7B7",

  // Insignia Offline Sync
  badgeOfflineFondo: "#ECFDF5",
  badgeOfflineBorde: "#A7F3D0",
  badgeOfflineTexto: "#047857",

  // Gradientes Medidor Circular SVG
  gradienteArcoInicio: "#10B981",
  gradienteArcoMedio: "#34D399",
  gradienteArcoFin: "#A7F3D0",
  arcoInactivo: "#ECFDF5",
  lineaSparkline: "#34D399",

  // Paginación y Puntos
  puntoInactivo: "#CBD5E1",
  puntoActivo: "#94A3B8",

  // Tipografía
  textoOscuro: "#0F172A",
  textoSecundario: "#64748B",

  // Badges y Alertas
  badgeNaranja: "#F97316",
  badgeNaranjaFondo: "#FEF3C7",
  bordeGris: "#E2E8F0",

  // Navegación Pestañas
  tabActivo: "#059669",
  tabInactivo: "#94A3B8",
} as const;

export type TipoColor = keyof typeof COLORES;
