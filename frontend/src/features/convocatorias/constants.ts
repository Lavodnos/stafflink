import type { SelectOption } from '@/lib/options';

export const MODALIDAD_OPTIONS: SelectOption[] = [
  { value: 'presencial', label: 'Presencial' },
  { value: 'hibrido', label: 'Híbrido' },
  { value: 'remoto', label: 'Remoto' },
];

export const CONDICION_OPTIONS: SelectOption[] = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'flex', label: 'Flexible' },
];

export const HORARIO_OPTIONS: SelectOption[] = [
  { value: '09:00 - 18:00', label: '09:00 - 18:00' },
  { value: '08:00 - 17:00', label: '08:00 - 17:00' },
  { value: 'OTRO / PART TIME', label: 'Otro / Part time' },
];

export const DESCANSO_OPTIONS: SelectOption[] = [
  { value: 'DOMINGOS Y FERIADOS', label: 'DOMINGOS Y FERIADOS' },
  { value: 'SABADO Y FERIADOS', label: 'SABADO Y FERIADOS' },
];

export const TIPO_CONTRATACION_OPTIONS: SelectOption[] = [
  { value: 'RXH', label: 'RXH' },
];

export const RAZON_SOCIAL_OPTIONS: SelectOption[] = [
  { value: 'GEA', label: 'GEA' },
  { value: 'SET', label: 'SET' },
];

export const CARGO_CONTRACTUAL_OPTIONS: SelectOption[] = [
  { value: 'AGENTE TMK OUTBOUND', label: 'AGENTE TMK OUTBOUND' },
  { value: 'AGENTE TMK INBOUND', label: 'AGENTE TMK INBOUND' },
  { value: 'AGENTE TMK RETENCIONES', label: 'AGENTE TMK RETENCIONES' },
];
