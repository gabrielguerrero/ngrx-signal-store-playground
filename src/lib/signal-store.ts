import { Injectable, WritableSignal, Type, Signal } from '@angular/core';
import {
  SignalStoreFeature,
  SignalStoreFeatureFactory,
  SignalStoreUpdate,
  SignalStoreUpdateFn,
  StaticState,
} from './models';
import { injectDestroy } from './inject-destroy';
import { RequiredValidator } from '@angular/forms';

type SignalStoreConfig = { providedIn: 'root' };

type FeatureResult<Feature extends SignalStoreFeature> = Feature['state'] &
  Feature['computed'] &
  Feature['updaters'] &
  Feature['effects'];

type F1Factory<F1 extends SignalStoreFeature> = (
  input: SignalStoreFeature & SignalStoreUpdate<{}>
) => F1;

type F2Factory<F1 extends SignalStoreFeature, F2 extends SignalStoreFeature> = (
  input: F1 & SignalStoreUpdate<StaticState<F1['state']>>
) => F2;

type MergeSignalStoreFeature<T extends SignalStoreFeature[]> = {
  state: UnionToIntersection<T[number]['state']>;
  computed: UnionToIntersection<T[number]['computed']>;
  updaters: UnionToIntersection<T[number]['updaters']>;
  effects: UnionToIntersection<T[number]['effects']>;
  hooks: {
    onInit: () => void;
    onDestroy: () => void;
  };
};

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

type F2Union<F1 extends SignalStoreFeature, F2 extends SignalStoreFeature> = {
  state: F1['state'] & F2['state'];
  computed: F1['computed'] & F2['computed'];
  updaters: F1['updaters'] & F2['updaters'];
  effects: F1['effects'] & F2['effects'];
  hooks: {
    onInit: () => void;
    onDestroy: () => void;
  };
};

type F3Union<
  F1 extends SignalStoreFeature,
  F2 extends SignalStoreFeature,
  F3 extends SignalStoreFeature
> = {
  state: F1['state'] & F2['state'] & F3['state'];
  computed: F1['computed'] & F2['computed'] & F3['computed'];
  updaters: F1['updaters'] & F2['updaters'] & F3['updaters'];
  effects: F1['effects'] & F2['effects'] & F3['effects'];
  hooks: {
    onInit: () => void;
    onDestroy: () => void;
  };
};

type F4Union<
  F1 extends SignalStoreFeature,
  F2 extends SignalStoreFeature,
  F3 extends SignalStoreFeature,
  F4 extends SignalStoreFeature
> = {
  state: F1['state'] & F2['state'] & F3['state'] & F4['state'];
  computed: F1['computed'] & F2['computed'] & F3['computed'] & F4['computed'];
  updaters: F1['updaters'] & F2['updaters'] & F3['updaters'] & F4['updaters'];
  effects: F1['effects'] & F2['effects'] & F3['effects'] & F4['effects'];
  hooks: {
    onInit: () => void;
    onDestroy: () => void;
  };
};

type F5Union<
  F1 extends SignalStoreFeature,
  F2 extends SignalStoreFeature,
  F3 extends SignalStoreFeature,
  F4 extends SignalStoreFeature,
  F5 extends SignalStoreFeature
> = {
  state: F1['state'] & F2['state'] & F3['state'] & F4['state'] & F5['state'];
  computed: F1['computed'] &
    F2['computed'] &
    F3['computed'] &
    F4['computed'] &
    F5['computed'];
  updaters: F1['updaters'] &
    F2['updaters'] &
    F3['updaters'] &
    F4['updaters'] &
    F5['updaters'];
  effects: F1['effects'] &
    F2['effects'] &
    F3['effects'] &
    F4['effects'] &
    F5['effects'];
  hooks: {
    onInit: () => void;
    onDestroy: () => void;
  };
};

type F6Union<
  F1 extends SignalStoreFeature,
  F2 extends SignalStoreFeature,
  F3 extends SignalStoreFeature,
  F4 extends SignalStoreFeature,
  F5 extends SignalStoreFeature,
  F6 extends SignalStoreFeature
> = {
  state: F1['state'] &
    F2['state'] &
    F3['state'] &
    F4['state'] &
    F5['state'] &
    F6['state'];
  computed: F1['computed'] &
    F2['computed'] &
    F3['computed'] &
    F4['computed'] &
    F5['computed'] &
    F6['computed'];
  updaters: F1['updaters'] &
    F2['updaters'] &
    F3['updaters'] &
    F4['updaters'] &
    F5['updaters'] &
    F6['updaters'];
  effects: F1['effects'] &
    F2['effects'] &
    F3['effects'] &
    F4['effects'] &
    F5['effects'] &
    F6['effects'];
  hooks: {
    onInit: () => void;
    onDestroy: () => void;
  };
};

type F7Union<
  F1 extends SignalStoreFeature,
  F2 extends SignalStoreFeature,
  F3 extends SignalStoreFeature,
  F4 extends SignalStoreFeature,
  F5 extends SignalStoreFeature,
  F6 extends SignalStoreFeature,
  F7 extends SignalStoreFeature
> = {
  state: F1['state'] &
    F2['state'] &
    F3['state'] &
    F4['state'] &
    F5['state'] &
    F6['state'] &
    F7['state'];
  computed: F1['computed'] &
    F2['computed'] &
    F3['computed'] &
    F4['computed'] &
    F5['computed'] &
    F6['computed'] &
    F7['computed'];
  updaters: F1['updaters'] &
    F2['updaters'] &
    F3['updaters'] &
    F4['updaters'] &
    F5['updaters'] &
    F6['updaters'] &
    F7['updaters'];
  effects: F1['effects'] &
    F2['effects'] &
    F3['effects'] &
    F4['effects'] &
    F5['effects'] &
    F6['effects'] &
    F7['effects'];
  hooks: {
    onInit: () => void;
    onDestroy: () => void;
  };
};

type F3Factory<
  F1 extends SignalStoreFeature,
  F2 extends SignalStoreFeature,
  F3 extends SignalStoreFeature
> = (
  input: {
    state: F1['state'] & F2['state'];
    computed: F1['computed'] & F2['computed'];
    updaters: F1['updaters'] & F2['updaters'];
    effects: F1['effects'] & F2['effects'];
    hooks: {
      onInit: () => void;
      onDestroy: () => void;
    };
  } & SignalStoreUpdate<StaticState<F1['state'] & F2['state']>>
) => F3;

type F4Factory<
  F1 extends SignalStoreFeature,
  F2 extends SignalStoreFeature,
  F3 extends SignalStoreFeature,
  F4 extends SignalStoreFeature
> = (
  input: {
    state: F1['state'] & F2['state'] & F3['state'];
    computed: F1['computed'] & F2['computed'] & F3['computed'];
    updaters: F1['updaters'] & F2['updaters'] & F3['updaters'];
    effects: F1['effects'] & F2['effects'] & F3['effects'];
    hooks: {
      onInit: () => void;
      onDestroy: () => void;
    };
  } & SignalStoreUpdate<StaticState<F1['state'] & F2['state'] & F3['state']>>
) => F4;

// TODO test this
type MergeSignalStoreFeatureFactory<
  T extends SignalStoreFeature[],
  R extends SignalStoreFeature
> = (input: {
  state: UnionToIntersection<T[number]['state']>;
  computed: UnionToIntersection<T[number]['computed']>;
  updaters: UnionToIntersection<T[number]['updaters']>;
  effects: UnionToIntersection<T[number]['effects']>;
  hooks: {
    onInit: () => void;
    onDestroy: () => void;
  } & SignalStoreUpdate<
    StaticState<
      Record<string, Signal<any>> & UnionToIntersection<T[number]['state']>
    >
  >;
}) => R;

type F5Factory<
  F1 extends SignalStoreFeature,
  F2 extends SignalStoreFeature,
  F3 extends SignalStoreFeature,
  F4 extends SignalStoreFeature,
  F5 extends SignalStoreFeature
> = (
  input: {
    state: F1['state'] & F2['state'] & F3['state'] & F4['state'];
    computed: F1['computed'] & F2['computed'] & F3['computed'] & F4['computed'];
    updaters: F1['updaters'] & F2['updaters'] & F3['updaters'] & F4['updaters'];
    effects: F1['effects'] & F2['effects'] & F3['effects'] & F4['effects'];
    hooks: {
      onInit: () => void;
      onDestroy: () => void;
    };
  } & SignalStoreUpdate<
    StaticState<F1['state'] & F2['state'] & F3['state'] & F4['state']>
  >
) => F5;

type F6Factory<
  F1 extends SignalStoreFeature,
  F2 extends SignalStoreFeature,
  F3 extends SignalStoreFeature,
  F4 extends SignalStoreFeature,
  F5 extends SignalStoreFeature,
  F6 extends SignalStoreFeature
> = (
  input: {
    state: F1['state'] & F2['state'] & F3['state'] & F4['state'] & F5['state'];
    computed: F1['computed'] &
      F2['computed'] &
      F3['computed'] &
      F4['computed'] &
      F5['computed'];
    updaters: F1['updaters'] &
      F2['updaters'] &
      F3['updaters'] &
      F4['updaters'] &
      F5['updaters'];
    effects: F1['effects'] &
      F2['effects'] &
      F3['effects'] &
      F4['effects'] &
      F5['effects'];
    hooks: {
      onInit: () => void;
      onDestroy: () => void;
    };
  } & SignalStoreUpdate<
    StaticState<
      F1['state'] & F2['state'] & F3['state'] & F4['state'] & F5['state']
    >
  >
) => F6;

type F7Factory<
  F1 extends SignalStoreFeature,
  F2 extends SignalStoreFeature,
  F3 extends SignalStoreFeature,
  F4 extends SignalStoreFeature,
  F5 extends SignalStoreFeature,
  F6 extends SignalStoreFeature,
  F7 extends SignalStoreFeature
> = (
  input: {
    state: F1['state'] &
      F2['state'] &
      F3['state'] &
      F4['state'] &
      F5['state'] &
      F7['state'];
    computed: F1['computed'] &
      F2['computed'] &
      F3['computed'] &
      F4['computed'] &
      F5['computed'] &
      F6['computed'];
    updaters: F1['updaters'] &
      F2['updaters'] &
      F3['updaters'] &
      F4['updaters'] &
      F5['computed'] &
      F6['computed'];
    effects: F1['effects'] &
      F2['effects'] &
      F3['effects'] &
      F4['effects'] &
      F5['effects'] &
      F6['effects'];
    hooks: {
      onInit: () => void;
      onDestroy: () => void;
    };
  } & SignalStoreUpdate<
    StaticState<
      F1['state'] &
        F2['state'] &
        F3['state'] &
        F4['state'] &
        F5['state'] &
        F6['state']
    >
  >
) => F7;

type F1Result<F1 extends SignalStoreFeature> = FeatureResult<F1> &
  SignalStoreUpdate<StaticState<F1['state']>>;

type F2Result<
  F1 extends SignalStoreFeature,
  F2 extends SignalStoreFeature
> = FeatureResult<F1> &
  FeatureResult<F2> &
  SignalStoreUpdate<StaticState<F1['state'] & F2['state']>>;

type F3Result<
  F1 extends SignalStoreFeature,
  F2 extends SignalStoreFeature,
  F3 extends SignalStoreFeature
> = FeatureResult<F1> &
  FeatureResult<F2> &
  FeatureResult<F3> &
  SignalStoreUpdate<StaticState<F1['state'] & F2['state'] & F3['state']>>;

type F4Result<
  F1 extends SignalStoreFeature,
  F2 extends SignalStoreFeature,
  F3 extends SignalStoreFeature,
  F4 extends SignalStoreFeature
> = FeatureResult<F1> &
  FeatureResult<F2> &
  FeatureResult<F3> &
  FeatureResult<F4> &
  SignalStoreUpdate<
    StaticState<F1['state'] & F2['state'] & F3['state'] & F4['state']>
  >;

type F5Result<
  F1 extends SignalStoreFeature,
  F2 extends SignalStoreFeature,
  F3 extends SignalStoreFeature,
  F4 extends SignalStoreFeature,
  F5 extends SignalStoreFeature
> = FeatureResult<F1> &
  FeatureResult<F2> &
  FeatureResult<F3> &
  FeatureResult<F4> &
  FeatureResult<F5> &
  SignalStoreUpdate<
    StaticState<
      F1['state'] & F2['state'] & F3['state'] & F4['state'] & F5['state']
    >
  >;

type F6Result<
  F1 extends SignalStoreFeature,
  F2 extends SignalStoreFeature,
  F3 extends SignalStoreFeature,
  F4 extends SignalStoreFeature,
  F5 extends SignalStoreFeature,
  F6 extends SignalStoreFeature
> = FeatureResult<F1> &
  FeatureResult<F2> &
  FeatureResult<F3> &
  FeatureResult<F4> &
  FeatureResult<F5> &
  FeatureResult<F6> &
  SignalStoreUpdate<
    StaticState<
      F1['state'] &
        F2['state'] &
        F3['state'] &
        F4['state'] &
        F5['state'] &
        F6['state']
    >
  >;

export function signalStore<F1 extends SignalStoreFeature>(
  f1: F1Factory<F1>
): Type<F1Result<F1>>;
export function signalStore<
  F1 extends SignalStoreFeature,
  F2 extends SignalStoreFeature
>(f1: F1Factory<F1>, f2: F2Factory<F1, F2>): Type<F2Result<F1, F2>>;
export function signalStore<
  F1 extends SignalStoreFeature,
  F2 extends SignalStoreFeature,
  F3 extends SignalStoreFeature
>(
  f1: F1Factory<F1>,
  f2: F2Factory<F1, F2>,
  f3: F3Factory<F1, F2, F3>
): Type<F3Result<F1, F2, F3>>;
export function signalStore<
  F1 extends SignalStoreFeature,
  F2 extends SignalStoreFeature,
  F3 extends SignalStoreFeature,
  F4 extends SignalStoreFeature
>(
  f1: F1Factory<F1>,
  f2: F2Factory<F1, F2>,
  f3: F3Factory<F1, F2, F3>,
  f4: F4Factory<F1, F2, F3, F4>
): Type<F4Result<F1, F2, F3, F4>>;
export function signalStore<
  F1 extends SignalStoreFeature,
  F2 extends SignalStoreFeature,
  F3 extends SignalStoreFeature,
  F4 extends SignalStoreFeature,
  F5 extends SignalStoreFeature
>(
  f1: F1Factory<F1>,
  f2: F2Factory<F1, F2>,
  f3: F3Factory<F1, F2, F3>,
  f4: F4Factory<F1, F2, F3, F4>,
  f5: F5Factory<F1, F2, F3, F4, F5>
): Type<F5Result<F1, F2, F3, F4, F5>>;
export function signalStore<
  F1 extends SignalStoreFeature,
  F2 extends SignalStoreFeature,
  F3 extends SignalStoreFeature,
  F4 extends SignalStoreFeature,
  F5 extends SignalStoreFeature,
  F6 extends SignalStoreFeature
>(
  f1: F1Factory<F1>,
  f2: F2Factory<F1, F2>,
  f3: F3Factory<F1, F2, F3>,
  f4: F4Factory<F1, F2, F3, F4>,
  f5: F5Factory<F1, F2, F3, F4, F5>,
  f6: F6Factory<F1, F2, F3, F4, F5, F6>
): Type<F6Result<F1, F2, F3, F4, F5, F6>>;

export function signalStore<F1 extends SignalStoreFeature>(
  config: SignalStoreConfig,
  f1: F1Factory<F1>
): Type<F1Result<F1>>;
export function signalStore<
  F1 extends SignalStoreFeature,
  F2 extends SignalStoreFeature
>(
  config: SignalStoreConfig,
  f1: F1Factory<F1>,
  f2: F2Factory<F1, F2>
): Type<F2Result<F1, F2>>;
export function signalStore<
  F1 extends SignalStoreFeature,
  F2 extends SignalStoreFeature,
  F3 extends SignalStoreFeature
>(
  config: SignalStoreConfig,
  f1: F1Factory<F1>,
  f2: F2Factory<F1, F2>,
  f3: F3Factory<F1, F2, F3>
): Type<F3Result<F1, F2, F3>>;
export function signalStore<
  F1 extends SignalStoreFeature,
  F2 extends SignalStoreFeature,
  F3 extends SignalStoreFeature,
  F4 extends SignalStoreFeature
>(
  config: SignalStoreConfig,
  f1: F1Factory<F1>,
  f2: F2Factory<F1, F2>,
  f3: F3Factory<F1, F2, F3>,
  f4: F4Factory<F1, F2, F3, F4>
): Type<F4Result<F1, F2, F3, F4>>;
export function signalStore<
  F1 extends SignalStoreFeature,
  F2 extends SignalStoreFeature,
  F3 extends SignalStoreFeature,
  F4 extends SignalStoreFeature,
  F5 extends SignalStoreFeature
>(
  config: SignalStoreConfig,
  f1: F1Factory<F1>,
  f2: F2Factory<F1, F2>,
  f3: F3Factory<F1, F2, F3>,
  f4: F4Factory<F1, F2, F3, F4>,
  f5: F5Factory<F1, F2, F3, F4, F5>
): Type<F5Result<F1, F2, F3, F4, F5>>;
export function signalStore<
  F1 extends SignalStoreFeature,
  F2 extends SignalStoreFeature,
  F3 extends SignalStoreFeature,
  F4 extends SignalStoreFeature,
  F5 extends SignalStoreFeature,
  F6 extends SignalStoreFeature
>(
  config: SignalStoreConfig,
  f1: F1Factory<F1>,
  f2: F2Factory<F1, F2>,
  f3: F3Factory<F1, F2, F3>,
  f4: F4Factory<F1, F2, F3, F4>,
  f5: F5Factory<F1, F2, F3, F4, F5>,
  f6: F6Factory<F1, F2, F3, F4, F5, F6>
): Type<F6Result<F1, F2, F3, F4, F5, F6>>;

export function signalStore(
  ...args:
    | [SignalStoreConfig, ...SignalStoreFeatureFactory[]]
    | SignalStoreFeatureFactory[]
) {
  const [config, ...featureFactories] =
    'providedIn' in args[0]
      ? [args[0], ...(args.slice(1) as SignalStoreFeatureFactory[])]
      : [{}, ...(args as SignalStoreFeatureFactory[])];

  @Injectable({ providedIn: config.providedIn || null })
  class SignalStore {
    constructor() {
      return signalStoreFactory(featureFactories);
    }
  }

  return SignalStore;
}

function joinFeatures(featureFactories: SignalStoreFeatureFactory[]) {
  const rootFeature: SignalStoreFeature = {
    state: {},
    computed: {},
    updaters: {},
    effects: {},
    hooks: {
      onInit() {},
      onDestroy() {},
    },
  };

  const getCurrentState = () =>
    Object.keys(rootFeature['state']).reduce(
      (acc, key) => ({ ...acc, [key]: rootFeature['state'][key]() }),
      {} as Record<string, any>
    );

  const update: SignalStoreUpdateFn<any> = (...updaters) => {
    const updatedState: Record<string, any> = updaters.reduce(
      (currentState, updater) => ({
        ...currentState,
        ...(typeof updater === 'function' ? updater(currentState) : updater),
      }),
      getCurrentState()
    );

    Object.keys(updatedState).forEach((key) => {
      (rootFeature['state'][key] as WritableSignal<any>).set(updatedState[key]);
    });
  };

  for (const featureFactory of featureFactories) {
    const feature = featureFactory({
      update,
      ...rootFeature,
    });

    rootFeature.state = {
      ...rootFeature.state,
      ...feature.state,
    };
    rootFeature.computed = {
      ...rootFeature.computed,
      ...feature.computed,
    };
    rootFeature.updaters = {
      ...rootFeature.updaters,
      ...feature.updaters,
    };
    rootFeature.effects = {
      ...rootFeature.effects,
      ...feature.effects,
    };

    const rootOnInit = rootFeature.hooks.onInit;
    const rootOnDestroy = rootFeature.hooks.onDestroy;

    rootFeature.hooks = {
      onInit() {
        rootOnInit();
        feature.hooks.onInit();
      },
      onDestroy() {
        rootOnDestroy();
        feature.hooks.onDestroy();
      },
    };
  }
  return { rootFeature, update };
}

function signalStoreFactory(featureFactories: SignalStoreFeatureFactory[]) {
  const { rootFeature, update } = joinFeatures(featureFactories);

  const store = {
    update,
    ...rootFeature.state,
    ...rootFeature.computed,
    ...rootFeature.updaters,
    ...rootFeature.effects,
  };

  rootFeature.hooks.onInit();
  injectDestroy().subscribe(() => rootFeature.hooks.onDestroy());

  return store;
}

///// NEW

export function signalStoreFeature<
  F1 extends SignalStoreFeature,
  RequiredFeature extends SignalStoreFeature = SignalStoreFeature
>(
  f1: F1Factory<F1>,
  options?: { requires?: F1Factory<RequiredFeature> }
): (
  input: RequiredFeature &
    SignalStoreUpdate<StaticState<RequiredFeature['state']>>
) => MergeSignalStoreFeature<[RequiredFeature, F1]>;

export function signalStoreFeature<
  F1 extends SignalStoreFeature,
  F2 extends SignalStoreFeature,
  RequiredFeature extends SignalStoreFeature = SignalStoreFeature
>(
  f1: F2Factory<RequiredFeature, F1>,
  f2: F3Factory<RequiredFeature, F1, F2>,
  options?: { requires?: F1Factory<RequiredFeature> }
): (
  input: RequiredFeature
) => MergeSignalStoreFeature<[RequiredFeature, F1, F2]>;

export function signalStoreFeature<
  F1 extends SignalStoreFeature,
  F2 extends SignalStoreFeature,
  F3 extends SignalStoreFeature,
  RequiredFeature extends SignalStoreFeature = SignalStoreFeature
>(
  f1: F2Factory<RequiredFeature, F1>,
  f2: F3Factory<RequiredFeature, F1, F2>,
  f3: F4Factory<RequiredFeature, F1, F2, F3>,
  options?: { requires?: F1Factory<RequiredFeature> }
): (
  input: RequiredFeature &
    SignalStoreUpdate<StaticState<RequiredFeature['state']>>
) => MergeSignalStoreFeature<[RequiredFeature, F1, F2, F3]>;
export function signalStoreFeature<
  F1 extends SignalStoreFeature,
  F2 extends SignalStoreFeature,
  F3 extends SignalStoreFeature,
  F4 extends SignalStoreFeature,
  RequiredFeature extends SignalStoreFeature = SignalStoreFeature
>(
  f1: F2Factory<RequiredFeature, F1>,
  f2: F3Factory<RequiredFeature, F1, F2>,
  f3: F4Factory<RequiredFeature, F1, F2, F3>,
  f4: F5Factory<RequiredFeature, F1, F2, F3, F4>,
  options?: { requires?: F1Factory<RequiredFeature> }
): (
  input: RequiredFeature &
    SignalStoreUpdate<StaticState<RequiredFeature['state']>>
) => MergeSignalStoreFeature<[RequiredFeature, F1, F2, F3, F4]>;

export function signalStoreFeature<
  F1 extends SignalStoreFeature,
  F2 extends SignalStoreFeature,
  F3 extends SignalStoreFeature,
  F4 extends SignalStoreFeature,
  F5 extends SignalStoreFeature,
  RequiredFeature extends SignalStoreFeature = SignalStoreFeature
>(
  f1: F2Factory<RequiredFeature, F1>,
  f2: F3Factory<RequiredFeature, F1, F2>,
  f3: F4Factory<RequiredFeature, F1, F2, F3>,
  f4: F5Factory<RequiredFeature, F1, F2, F3, F4>,
  f5: F6Factory<RequiredFeature, F1, F2, F3, F4, F5>,
  options?: { requires?: F1Factory<RequiredFeature> }
): (
  input: RequiredFeature &
    SignalStoreUpdate<StaticState<RequiredFeature['state']>>
) => MergeSignalStoreFeature<[RequiredFeature, F1, F2, F3, F4, F5]>;
export function signalStoreFeature<
  F1 extends SignalStoreFeature,
  F2 extends SignalStoreFeature,
  F3 extends SignalStoreFeature,
  F4 extends SignalStoreFeature,
  F5 extends SignalStoreFeature,
  F6 extends SignalStoreFeature,
  RequiredFeature extends SignalStoreFeature = SignalStoreFeature
>(
  f1: F2Factory<RequiredFeature, F1>,
  f2: F3Factory<RequiredFeature, F1, F2>,
  f3: F4Factory<RequiredFeature, F1, F2, F3>,
  f4: F5Factory<RequiredFeature, F1, F2, F3, F4>,
  f5: F6Factory<RequiredFeature, F1, F2, F3, F4, F5>,
  f6: F7Factory<RequiredFeature, F1, F2, F3, F4, F5, F6>,
  options?: { requires?: F1Factory<RequiredFeature> }
): (
  input: RequiredFeature &
    SignalStoreUpdate<StaticState<RequiredFeature['state']>>
) => MergeSignalStoreFeature<[RequiredFeature, F1, F2, F3, F4, F5, F6]>;
export function signalStoreFeature<T extends Array<SignalStoreFeatureFactory>>(
  ...args: T
) {
  console.log({ args });

  return (input: any) => {
    const { update, rootFeature } = joinFeatures(args);
    return { ...rootFeature, update };
  };
}
