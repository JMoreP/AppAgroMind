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

  // Errores / Validaciones
  rojoError: "#DC2626",
  rojoClaro: "#FEE2E2",
} as const;

export type TipoColor = keyof typeof COLORES;
