import type { SelectOption } from '@/lib/options';

export const MODALIDAD_OPTIONS: SelectOption[] = [
  { value: 'presencial', label: 'Presencial' },
  { value: 'remoto', label: 'Remoto' },
  { value: 'hibrido', label: 'Híbrido' },
];

export const CONDICION_OPTIONS: SelectOption[] = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'flex', label: 'Flexible' },
];
