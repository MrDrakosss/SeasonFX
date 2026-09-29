import { getSeasonScript } from './ssr/getSeasonScript';
import type { SeasonScriptOptions } from './ssr/getSeasonScript';

/** Props of {@link SeasonScript}: the same options as the Provider, plus an optional CSP nonce. */
export interface SeasonScriptProps extends SeasonScriptOptions {
  /** Content Security Policy nonce for the inline script, if your site uses one. */
  nonce?: string;
}

/**
 * Renders the inline `<head>` script that applies the page theme before the
 * first paint, so server-rendered pages do not flash without the theme.
 *
 * @remarks
 * Only needed with server rendering (Next.js, Remix, Gatsby, ...) and only when
 * the `theme` feature is on; it renders nothing otherwise. Pass the same options
 * as to `<SeasonProvider>` (share one config object). Because the script sets
 * `data-season-theme` on `<html>` before React hydrates, add
 * `suppressHydrationWarning` to your `<html>` element.
 *
 * @example Next.js App Router
 * ```tsx
 * // app/season-config.ts
 * export const seasonConfig = { features: { theme: true, ambient: true } } satisfies SeasonOptions;
 *
 * // app/layout.tsx
 * <html lang="en" suppressHydrationWarning>
 *   <head>
 *     <SeasonScript {...seasonConfig} />
 *   </head>
 *   <body>
 *     <Providers>{children}</Providers>   // renders <SeasonProvider {...seasonConfig}>
 *   </body>
 * </html>
 * ```
 */
export function SeasonScript(props: SeasonScriptProps) {
  const { nonce, ...options } = props;
  const script = getSeasonScript(options);
  if (!script) return null;
  return <script nonce={nonce} dangerouslySetInnerHTML={{ __html: script }} />;
}
