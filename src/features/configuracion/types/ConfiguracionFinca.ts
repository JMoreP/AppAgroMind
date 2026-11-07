export interface ConfiguracionFinca {
  nombre: string;
  propietario: string;
  ubicacion: string;
  moneda: string;             // 'Bs.', 'USD', 'COP', etc.
  precioLeche: number;
  especies: Array<'bovino' | 'bufalino'>;
}

export const MONEDAS_DISPONIBLES = [
  { codigo: 'Bs.', label: 'Bolívar (Bs.)' },
  { codigo: 'USD', label: 'Dólar ($)' },
  { codigo: 'COP', label: 'Peso colombiano (COP)' },
  { codigo: 'EUR', label: 'Euro (€)' },
];

export const CONFIGURACION_DEFAULT: ConfiguracionFinca = {
  nombre: '',
  propietario: '',
  ubicacion: '',
  moneda: 'Bs.',
  precioLeche: 0,
  especies: ['bufalino'],
};
