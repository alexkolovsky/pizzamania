/** Money helpers — all prices travel as integer euro cents to dodge float drift. */

export function euro(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

/**
 * Screen-reader-friendly money: "12 euro 50" reads far better than a symbol
 * that some screen readers spell out digit by digit.
 */
export function euroSpoken(cents: number): string {
  const whole = Math.floor(cents / 100);
  const rest = cents % 100;
  return rest === 0 ? `${whole} euro` : `${whole} euro ${rest}`;
}
