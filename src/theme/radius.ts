/**
 * Radius Tokens
 *
 * 单一可信来源：docs/project-设计-docs/docs/04_Design_System.md § 4.5
 */

export const radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const

export type RadiusToken = keyof typeof radius
