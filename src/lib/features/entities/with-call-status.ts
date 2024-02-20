import {
  patchState,
  SignalStoreFeature,
  signalStoreFeature,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { computed, Signal } from '@angular/core';
import { capitalize } from './util';

export type CallStatus = 'init' | 'loading' | 'loaded' | { error: string };
export interface DictionaryNum<T> {
  [id: number]: T | undefined;
}
export declare abstract class Dictionary<T> implements DictionaryNum<T> {
  [id: string]: T | undefined;
}

export type CallState = {
  callStatus: CallStatus;
};
export type CallStateComputed = {
  loading: Signal<boolean>;
} & {
  loaded: Signal<boolean>;
} & {
  error: Signal<string | null>;
};
export type CallStateMethods = {
  setLoading: () => void;
} & {
  setLoaded: () => void;
} & {
  setFail: () => void;
};
export type NamedCallState<Prop extends string> = {
  [K in Prop as `${K}CallStatus`]: CallStatus;
};
export type NamedCallStateComputed<Prop extends string> = {
  [K in Prop as `${K}Loading`]: Signal<boolean>;
} & {
  [K in Prop as `${K}Loaded`]: Signal<boolean>;
} & {
  [K in Prop as `${K}Error`]: Signal<string | null>;
};
export type NamedCallStateMethods<Prop extends string> = {
  [K in Prop as `set${Capitalize<string & K>}Loading`]: () => void;
} & {
  [K in Prop as `set${Capitalize<string & K>}Loaded`]: () => void;
} & {
  [K in Prop as `set${Capitalize<string & K>}Fail`]: () => void;
};

export function setLoading(): { callState: 'loading' } {
  return { callState: 'loading' };
}

export function setLoaded(): { callState: 'loaded' } {
  return { callState: 'loaded' };
}

export function withCallStatus(): SignalStoreFeature<
  { state: {}; signals: {}; methods: {} },
  {
    state: CallState;
    signals: CallStateComputed;
    methods: CallStateMethods;
  }
>;
export function withCallStatus<Prop extends string>(config: {
  prop: Prop;
}): SignalStoreFeature<
  { state: {}; signals: {}; methods: {} },
  {
    state: NamedCallState<Prop>;
    signals: NamedCallStateComputed<Prop>;
    methods: NamedCallStateMethods<Prop>;
  }
>;
export function withCallStatus<Prop extends string>(config?: {
  prop: Prop;
}): SignalStoreFeature {
  const {
    callStatusKey,
    errorKey,
    loadedKey,
    loadingKey,
    setLoading,
    setLoaded,
    setFail,
  } = getCallStatusKeys(config);

  return signalStoreFeature(
    withState({ [callStatusKey]: 'init' }),
    withComputed((state: Record<string, Signal<unknown>>) => {
      const callState = state[callStatusKey] as Signal<CallStatus>;

      return {
        [loadingKey]: computed(() => callState() === 'loading'),
        [loadedKey]: computed(() => callState() === 'loaded'),
        [errorKey]: computed(() => {
          const v = callState();
          return typeof v === 'object' ? v.error : null;
        }),
      };
    }),
    withMethods((store) => ({
      [setLoading]: () => patchState(store, { [callStatusKey]: 'loading' }),
      [setLoaded]: () => patchState(store, { [callStatusKey]: 'loaded' }),
      [setFail]: () => patchState(store, { [callStatusKey]: 'fail' }),
    }))
  );
}

function getCallStatusKeys(config?: { prop: string }) {
  const prop = config?.prop;
  const capitalizedProp = prop && capitalize(prop);
  return {
    callStatusKey: prop ? `${config.prop}CallStatus` : 'callStatus',
    loadingKey: prop ? `${config.prop}Loading` : 'loading',
    loadedKey: prop ? `${config.prop}Loaded` : 'loaded',
    errorKey: prop ? `${config.prop}Error` : 'error',
    setLoading: prop ? `set${capitalizedProp}Loading` : 'setLoading',
    setLoaded: prop ? `set${capitalizedProp}Loaded` : 'setLoaded',
    setFail: prop ? `set${capitalizedProp}Fail` : 'setFail',
  };
}
