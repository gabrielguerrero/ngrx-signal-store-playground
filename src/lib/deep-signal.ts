import { Signal } from '@angular/core';
import { selectSignal } from './select-signal';
import { isRecord } from './helpers';

export type DeepSignal<T> = T extends Record<string, unknown>
  ? Signal<T> & { [K in keyof T]: DeepSignal<T[K]> }
  : Signal<T>;

export function toDeepSignal<T>(signal: Signal<T>): DeepSignal<T> {
  return new Proxy(signal, {
    get(target: any, prop) {
      if (!target[prop]) {
        target[prop] = selectSignal(() => target()[prop]);
      }

      return isRecord(target()[prop])
        ? toDeepSignal(target[prop])
        : target[prop];
    },
  });
}
