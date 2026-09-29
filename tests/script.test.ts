import { afterEach, describe, expect, it } from 'vitest';
import { getSeasonScript } from '../src/ssr/getSeasonScript';
import type { SeasonDefinition } from '../src/types';

interface FakeEnv {
  storage: Record<string, string>;
  attrs: Record<string, string>;
  styles: string[];
}

/** Runs the generated script against a minimal fake document and localStorage. */
function run(script: string, storage: Record<string, string> = {}): FakeEnv {
  const env: FakeEnv = { storage, attrs: {}, styles: [] };
  const g = globalThis as Record<string, unknown>;
  g.window = { localStorage: { getItem: (k: string) => (k in storage ? storage[k] : null) } };
  g.document = {
    documentElement: { setAttribute: (k: string, v: string) => (env.attrs[k] = v) },
    head: { appendChild: (el: { textContent: string }) => env.styles.push(el.textContent) },
    createElement: () => ({ setAttribute() {}, textContent: '' }),
  };
  new Function(script)();
  return env;
}

afterEach(() => {
  const g = globalThis as Record<string, unknown>;
  delete g.window;
  delete g.document;
});

const christmasEve = new Date(2026, 11, 24);

describe('getSeasonScript', () => {
  it('is empty when the theme feature is off', () => {
    expect(getSeasonScript({ defaultEnabled: true })).toBe('');
  });

  it('applies the season theme before paint when enabled', () => {
    const env = run(getSeasonScript({ defaultEnabled: true, date: christmasEve, features: { theme: true } }));
    expect(env.attrs['data-seasonfx-theme']).toBe('christmas');
    expect(env.styles[0]).toContain('html[data-seasonfx-theme="christmas"]');
  });

  it('respects the stored master switch and theme preference', () => {
    const script = getSeasonScript({ defaultEnabled: true, date: christmasEve, features: { theme: true } });
    expect(run(script, { 'seasonfx:enabled': '0' }).styles).toHaveLength(0);
    expect(run(script, { 'seasonfx:preferences': '{"theme":false}' }).styles).toHaveLength(0);
    expect(run(script, { 'seasonfx:enabled': '1' }).styles).toHaveLength(1);
  });

  it('uses the controlled value over storage', () => {
    const script = getSeasonScript({ enabled: false, date: christmasEve, features: { theme: true } });
    expect(run(script, { 'seasonfx:enabled': '1' }).styles).toHaveLength(0);
  });

  it('evaluates Easter rules and returns nothing out of season', () => {
    const easterDay = new Date(2026, 3, 5);
    expect(run(getSeasonScript({ defaultEnabled: true, date: easterDay, features: { theme: true } })).attrs['data-seasonfx-theme']).toBe('easter');
    const september = new Date(2026, 8, 29);
    expect(run(getSeasonScript({ defaultEnabled: true, date: september, features: { theme: true } })).styles).toHaveLength(0);
  });

  it('does nothing when a non-serializable season comes first', () => {
    const custom: SeasonDefinition = { id: 'custom', name: 'Custom', isActive: () => true, particles: { shapes: ['star'] } };
    const env = run(getSeasonScript({ defaultEnabled: true, date: christmasEve, seasons: [custom], features: { theme: true } }));
    expect(env.styles).toHaveLength(0);
  });

  it('cannot be broken out of the script tag', () => {
    const evil: SeasonDefinition = {
      id: 'x</script><script>alert(1)</script>',
      name: 'x',
      isActive: () => true,
      particles: { shapes: ['star'] },
    };
    const script = getSeasonScript({ defaultEnabled: true, season: evil, features: { theme: true } });
    expect(script).not.toContain('</script');
  });
});
