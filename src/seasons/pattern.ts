/**
 * Turns an SVG document into a CSS `url()` value, for use in theme patterns.
 *
 * @param svg - The SVG markup. Use single quotes for attributes.
 * @returns A `url("data:image/svg+xml,...")` string.
 *
 * @example
 * ```ts
 * pattern: svgUrl("<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><circle cx='20' cy='20' r='2' fill='#60a5fa'/></svg>")
 * ```
 */
export function svgUrl(svg: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svg.replace(/\s{2,}/g, ' ').trim())}")`;
}
