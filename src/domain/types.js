/**
 * “Tipos” en JS (documentación) para mantener claridad.
 *
 * Product:
 * - id: string
 * - name: string
 * - sku: string
 * - category: string
 * - cost: number
 * - price: number
 * - minStock: number
 * - active: boolean
 *
 * Movement:
 * - id: string
 * - productId: string
 * - type: "IN" | "OUT" | "ADJUST"
 * - qty: number
 * - note: string
 * - user: string
 * - atISO: string
 */

export const MovementType = {
  IN: "IN",
  OUT: "OUT",
  ADJUST: "ADJUST"
};
