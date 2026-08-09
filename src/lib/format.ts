/** Money helpers — all prices travel as integer euro cents to dodge float drift. */

export function euro(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

// Spoken money ("12 euro 50" — kinder to screen readers than a symbol) is
// per-locale and lives in the dictionaries: t().euroSpoken(cents).
