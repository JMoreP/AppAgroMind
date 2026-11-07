import { differenceInMonths, parseISO, isValid } from 'date-fns';

export type Especie = 'bovino' | 'bufalino';

export interface ConfiguracionEspecie {
  gestacionDias: number;
  pesoFaenaDefault: number;
  razas: string[];
  categorias: {
    cria: { macho: string; hembra: string };
    joven: { macho: string; hembra: string };
    prenable: { macho: string; hembra: string };
    adulto: { macho: string; hembra: string };
  };
  nombreSingular: { macho: string; hembra: string };
  nombrePlural: string;
}

export const CONFIGURACION_ESPECIE: Record<Especie, ConfiguracionEspecie> = {
  bovino: {
    gestacionDias: 283,
    pesoFaenaDefault: 450,
    razas: [
      'Brahman',
      'Nelore',
      'Carora',
      'Guzerá',
      'Gir',
      'Pardo Suizo',
      'Holstein',
      'Gyrolando',
      'Senepol',
      'Brahman Rojo',
      'Wagyū',
      'Mestizo',
    ],
    categorias: {
      cria: { macho: 'Becerro', hembra: 'Becerra' },
      joven: { macho: 'Maute', hembra: 'Mauta' },
      prenable: { macho: 'Novillo', hembra: 'Novilla' },
      adulto: { macho: 'Toro', hembra: 'Vaca' },
    },
    nombreSingular: { macho: 'Bovino', hembra: 'Bovino hembra' },
    nombrePlural: 'Bovinos',
  },
  bufalino: {
    gestacionDias: 310,
    pesoFaenaDefault: 450,
    razas: [
      'Murrah',
      'Nili-Ravi',
      'Jafarabadi',
      'Mediterráneo',
      'Bufalipso',
      'Mestizo',
    ],
    categorias: {
      cria: { macho: 'Bucerro', hembra: 'Bucerra' },
      joven: { macho: 'Bumauto', hembra: 'Bumauta' },
      prenable: { macho: 'Bubillo', hembra: 'Bubilla' },
      adulto: { macho: 'Búfalo', hembra: 'Búfala' },
    },
    nombreSingular: { macho: 'Búfalo', hembra: 'Búfala' },
    nombrePlural: 'Búfalos',
  },
};

export function obtenerConfiguracion(especie: Especie): ConfiguracionEspecie {
  return CONFIGURACION_ESPECIE[especie] ?? CONFIGURACION_ESPECIE.bufalino;
}

export function obtenerRazas(especie: Especie): string[] {
  return obtenerConfiguracion(especie).razas;
}

export function obtenerGestacionDias(especie: Especie): number {
  return obtenerConfiguracion(especie).gestacionDias;
}

export function obtenerPesoFaenaDefault(especie: Especie): number {
  return obtenerConfiguracion(especie).pesoFaenaDefault;
}

export function obtenerNombreAnimal(especie: Especie, sexo: 'M' | 'H'): string {
  const config = obtenerConfiguracion(especie);
  return sexo === 'M' ? config.nombreSingular.macho : config.nombreSingular.hembra;
}

export function obtenerNombrePlural(especie: Especie): string {
  return obtenerConfiguracion(especie).nombrePlural;
}

export function labelAnimalGenerico(): string {
  return 'Animal';
}

/**
 * Calcula la categoría etaria según edad, partos, sexo y especie.
 */
export function calcularCategoriaEtaria(
  fechaNacimiento: string,
  totalPartos: number,
  sexo: 'M' | 'H',
  especie: Especie
): string {
  const config = obtenerConfiguracion(especie);

  let edadMeses = 0;
  if (fechaNacimiento) {
    try {
      const fechaNac = parseISO(fechaNacimiento);
      if (isValid(fechaNac)) {
        edadMeses = Math.max(0, differenceInMonths(new Date(), fechaNac));
      }
    } catch {
      edadMeses = 0;
    }
  }

  // Si totalPartos >= 1 o edad >= 37 -> adulto
  if (totalPartos >= 1 || edadMeses >= 37) {
    return sexo === 'M' ? config.categorias.adulto.macho : config.categorias.adulto.hembra;
  }

  // Si edad 19-36 -> prenable
  if (edadMeses >= 19) {
    return sexo === 'M' ? config.categorias.prenable.macho : config.categorias.prenable.hembra;
  }

  // Si edad 7-18 -> joven
  if (edadMeses >= 7) {
    return sexo === 'M' ? config.categorias.joven.macho : config.categorias.joven.hembra;
  }

  // Si edad 0-6 -> cria
  return sexo === 'M' ? config.categorias.cria.macho : config.categorias.cria.hembra;
}
