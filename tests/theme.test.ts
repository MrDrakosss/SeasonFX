import { describe, expect, it } from 'vitest';
import { christmas } from '../src/seasons';
import { buildThemeCss, resolveThemeOptions } from '../src/theme/buildThemeCss';

describe('buildThemeCss', () => {
  it('scopes every rule to the season attribute', () => {
    const css = buildThemeCss(christmas, resolveThemeOptions(true)!);
    const selectors = css.match(/^[^@\s}][^{]*\{/gm) ?? [];
    for (const sel of selectors) {
      if (sel.startsWith('from') || sel.startsWith('to') || /^\d/.test(sel)) continue;
      expect(sel).toContain('html[data-season-theme="christmas"]');
    }
  });

  it('never changes layout properties', () => {
    const css = buildThemeCss(christmas, resolveThemeOptions(true)!);
    expect(css).not.toMatch(/(^|[\s;{])(width|height|padding|margin|font-size|font-family|position):/m);
  });

  it('uses light tokens by default and adds dark tokens on request', () => {
    const light = buildThemeCss(christmas, resolveThemeOptions(true)!);
    expect(light).not.toContain('prefers-color-scheme');
    expect(light).toContain(`--season-surface: ${christmas.theme!.surface}`);

    const system = buildThemeCss(christmas, resolveThemeOptions({ colorScheme: 'system' })!);
    expect(system).toContain('@media (prefers-color-scheme: dark)');
    expect(system).toContain(`--season-surface: ${christmas.theme!.dark!.surface}`);

    const selector = buildThemeCss(christmas, resolveThemeOptions({ darkSelector: '.dark' })!);
    expect(selector).toContain('html[data-season-theme="christmas"]:is(.dark)');

    const dark = buildThemeCss(christmas, resolveThemeOptions({ colorScheme: 'dark' })!);
    expect(dark).not.toContain(`--season-surface: ${christmas.theme!.surface};`);
  });

  it('only includes the parts that are turned on', () => {
    const css = buildThemeCss(christmas, resolveThemeOptions({ buttons: '.cta' })!);
    expect(css).toContain(':is(.cta)');
    expect(css).not.toContain('scrollbar-color');
    expect(css).not.toContain(' body {');
  });
});
