import {
  signalStoreFeature,
  withMethods,
  withSignals,
  withState,
} from '@ngrx/signals';
import { computed } from '@angular/core';

export type CallState = 'init' | 'loading' | 'loaded' | 'fail';
export interface DictionaryNum<T> {
  [id: number]: T | undefined;
}
export declare abstract class Dictionary<T> implements DictionaryNum<T> {
  [id: string]: T | undefined;
}
export interface EntityState<T> {
  ids: string[] | number[];
  entities: Dictionary<T>;
}

export function setLoading(): { callState: 'loading' } {
  return { callState: 'loading' };
}

export function setLoaded(): { callState: 'loaded' } {
  return { callState: 'loaded' };
}

export function withCallState() {
  const callState: { callState: CallState } = { callState: 'init' };

  return signalStoreFeature(
    withState(callState),
    withSignals(({ callState }) => ({
      loading: computed(() => callState() === 'loading'),
      loaded: computed(() => callState() === 'loaded'),
      fail: computed(() => callState() === 'fail'),
    })),
    withMethods(({ $update }) => ({
      setLoading: () => $update({ callState: 'loading' }),
      setLoaded: () => $update({ callState: 'loaded' }),
      setFail: () => $update({ callState: 'fail' }),
    }))
  );
}
