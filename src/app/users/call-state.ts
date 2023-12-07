import {
  patchState,
  signalStoreFeature,
  withComputed,
  withMethods,
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
    withComputed(({ callState }) => ({
      loading: computed(() => callState() === 'loading'),
      loaded: computed(() => callState() === 'loaded'),
      fail: computed(() => callState() === 'fail'),
    })),
    withMethods((store) => ({
      setLoading: () => patchState(store, { callState: 'loading' }),
      setLoaded: () => patchState(store, { callState: 'loaded' }),
      setFail: () => patchState(store, { callState: 'fail' }),
    }))
  );
}
