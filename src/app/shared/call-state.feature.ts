import { signalStoreFeature, withComputed, withState } from '@ngrx/signals';
import { computed } from '@angular/core';

export type CallState = 'init' | 'loading' | 'loaded' | { error: string };

export function withCallState() {
  return signalStoreFeature(
    withState({ callState: 'init' }),
    withComputed(({ callState }) => ({
      loading: computed(() => callState() === 'loading'),
      loaded: computed(() => callState() === 'loaded'),
      error: computed(() => (typeof callState === 'object' ? callState : null)),
    }))
  );
}

export function setLoading(): { callState: CallState } {
  return { callState: 'loading' };
}

export function setLoaded(): { callState: CallState } {
  return { callState: 'loaded' };
}

export function setError(error: string): { callState: CallState } {
  return { callState: { error } };
}
