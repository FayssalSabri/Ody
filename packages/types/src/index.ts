/** Non-API domain labels shared outside generated client types. */
export const SETTING_KEYS = [
  'prep_time_minutes',
  'auto_accept',
  'service_available',
  'opening_hours'
] as const

export type SettingKey = (typeof SETTING_KEYS)[number]
