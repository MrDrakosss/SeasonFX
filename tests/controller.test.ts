// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SeasonController } from '../src/core/SeasonController';

const themeStyle = () => document.head.querySelector('style[data-season-ui-theme]');
const christmasEve = new Date(2026, 11, 24);

let controller: SeasonController | null = null;
const create = (options: ConstructorParameters<typeof SeasonController>[0]) => {
  controller = new SeasonController(options);
  return controller;
};

beforeEach(() => {
  // jsdom has no canvas; the engine handles a missing 2D context by drawing nothing.
  HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext;
  localStorage.clear();
  document.head.innerHTML = '';
  document.documentElement.removeAttribute('data-season-theme');
});

afterEach(() => {
  controller?.stop();
  controller = null;
});

describe('SeasonController', () => {
  it('has no side effects before start', () => {
    create({ defaultEnabled: true, date: christmasEve, features: { theme: true } });
    expect(themeStyle()).toBeNull();
    expect(controller!.getState().season?.id).toBe('christmas');
  });

  it('applies and removes the theme with the master switch', () => {
    const c = create({ defaultEnabled: true, date: christmasEve, features: { theme: true } });
    c.start();
    expect(themeStyle()).not.toBeNull();
    expect(document.documentElement.getAttribute('data-season-theme')).toBe('christmas');

    c.setEnabled(false);
    expect(themeStyle()).toBeNull();
    expect(document.documentElement.hasAttribute('data-season-theme')).toBe(false);
    expect(localStorage.getItem('season-ui:enabled')).toBe('0');
  });

  it('reads the stored choice on start', () => {
    localStorage.setItem('season-ui:enabled', '1');
    const c = create({ defaultEnabled: false, date: christmasEve, features: { theme: true } });
    c.start();
    expect(c.getState().enabled).toBe(true);
    expect(themeStyle()).not.toBeNull();
  });

  it('does not persist in controlled mode and reports changes', () => {
    const onEnabledChange = vi.fn();
    const c = create({ enabled: true, onEnabledChange, date: christmasEve });
    c.start();
    c.toggle();
    expect(onEnabledChange).toHaveBeenCalledWith(false);
    expect(localStorage.getItem('season-ui:enabled')).toBeNull();
    expect(c.getState().enabled).toBe(true);
    c.update({ enabled: false, onEnabledChange, date: christmasEve });
    expect(c.getState().enabled).toBe(false);
  });

  it('lets the user turn off a single feature', () => {
    const c = create({ defaultEnabled: true, date: christmasEve, features: { theme: true } });
    c.start();
    c.setPreferences({ theme: false });
    expect(themeStyle()).toBeNull();
    expect(JSON.parse(localStorage.getItem('season-ui:preferences')!)).toEqual({ theme: false });
    expect(c.getState().running.theme).toBe(false);
  });

  it('replaces the early head style without leaving duplicates', () => {
    const early = document.createElement('style');
    early.setAttribute('data-season-ui-early', '');
    document.head.appendChild(early);
    const c = create({ defaultEnabled: true, date: christmasEve, features: { theme: true } });
    c.start();
    expect(document.head.querySelectorAll('style[data-season-ui-early]')).toHaveLength(0);
    expect(document.head.querySelectorAll('style[data-season-ui-theme]')).toHaveLength(1);
  });

  it('keeps the state object stable when nothing changes', () => {
    const c = create({ defaultEnabled: true, date: christmasEve, features: { theme: true } });
    c.start();
    const before = c.getState();
    c.update({ defaultEnabled: true, date: christmasEve, features: { theme: true } });
    expect(c.getState()).toBe(before);
  });

  it('binds any element as a toggle', () => {
    const c = create({ defaultEnabled: false, date: christmasEve });
    c.start();
    const button = document.createElement('button');
    document.body.appendChild(button);
    const unbind = c.bindToggle(button);
    expect(button.getAttribute('aria-checked')).toBe('false');
    button.click();
    expect(c.getState().enabled).toBe(true);
    expect(button.getAttribute('aria-checked')).toBe('true');
    expect(button.hasAttribute('data-season-ignore')).toBe(true);
    unbind();
    button.remove();
  });

  it('cleans up everything on stop', () => {
    const c = create({ defaultEnabled: true, date: christmasEve, exposeAttribute: true, features: { theme: true } });
    c.start();
    c.stop();
    expect(themeStyle()).toBeNull();
    expect(document.documentElement.hasAttribute('data-season')).toBe(false);
    expect(document.documentElement.hasAttribute('data-season-theme')).toBe(false);
  });
});
