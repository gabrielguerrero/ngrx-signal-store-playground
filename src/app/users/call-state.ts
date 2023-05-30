import { withState, withComputed, withUpdaters } from '@ngrx/signals';
import { computed, Signal, signal } from '@angular/core';
import { SignalStoreFeature } from '../../lib/models';
import { signalStoreFeature } from '../../lib/signal-store';

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
// export function withCallState(): SignalStoreFeature {
//   return {
//     state: { callState: signal('init') },
//     computed: withComputed(({ callState }) => ({
//       loading: computed(() => callState() === 'loading'),
//       loaded: computed(() => callState() === 'loaded'),
//     })),
//   };
// }

export function setLoading(): { callState: 'loading' } {
  return { callState: 'loading' };
}

export function setLoaded(): { callState: 'loaded' } {
  return { callState: 'loaded' };
}

// function withCallState(): () => {
//   state: { callState: Signal<CallState> };
//   computed: {
//     loading: Signal<boolean>;
//     loaded: Signal<boolean>;
//     error: Signal<unknown>;
//   };
// } {
//   return () => {
//     const callState = signal<CallState>('init');
//
//     return {
//       state: { callState },
//       computed: {
//         loading: computed(() => callState() === 'loading'),
//         loaded: computed(() => callState() === 'loaded'),
//         error: computed(() =>
//           typeof callState() === 'object' ? callState().error : null
//         ),
//       },
//     };
//   };
// }

// function withCallState(): () => {
//   state: { callState: Signal<CallState> };
//   computed: {
//     loading: Signal<boolean>;
//     loaded: Signal<boolean>;
//     fail: Signal<boolean>;
//   };
// } {
//   return () => {
//     const callState = signal<CallState>('init');
//
//     return {
//       state: { callState },
//       computed: {
//         loading: computed(() => callState() === 'loading'),
//         loaded: computed(() => callState() === 'loaded'),
//         fail: computed(() => callState() === 'fail'),
//       },
//       effects: {},
//       hooks: {
//         onInit() {},
//         onDestroy() {},
//       },
//       updaters: {}
//     } satisfies SignalStoreFeature;
//   };
// }

export function withCallState() {
  const callState: { callState: CallState } = { callState: 'init' };

  return signalStoreFeature(
    withState(callState),
    withComputed(({ callState }) => ({
      loading: computed(() => callState() === 'loading'),
      loaded: computed(() => callState() === 'loaded'),
      fail: computed(() => callState() === 'fail'),
    })),
    withUpdaters(({ update }) => ({
      setLoading: () => update({ callState: 'loading' }),
      setLoaded: () => update({ callState: 'loaded' }),
      setFail: () => update({ callState: 'fail' }),
    }))
  );
}
