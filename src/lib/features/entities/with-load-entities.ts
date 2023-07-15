import {
  rxEffect,
  signalStoreFeatureFactory,
  withMethods,
  withState,
} from '@ngrx/signals';

import {
  EntityState,
  setLoading,
  withCallState,
} from '../../../app/users/call-state';
import { exhaustMap, Observable, pipe, tap } from 'rxjs';
import { Signal } from '@angular/core';
import { withEntities } from './with-entities';
import { SignalStateUpdate } from '../../signal-state-update';
import {
  signalStoreFeature,
  SignalStoreFeatureInput,
  SignalStoreSlices,
} from '../../signal-store-feature';

export function withLoadEntities<Entity>() {
  // getAll: () => Observable<Entity[]> // or: Promise<Entity[]>
  return signalStoreFeatureFactory()(
    withCallState(),
    withEntities<Entity>(),
    withMethods(({ $update, setAll }) => ({
      setResult: (entities: Entity[]) => setAll(entities),
    }))

    // withEffects(({ setLoaded, setAll }) => ({
    //   loadEntities: rxEffect<void>(
    //     pipe(
    //       tap(() => setLoading()),
    //       exhaustMap(() => getAll()),
    //       tap((entities) => {
    //         setAll(entities);
    //         setLoaded();
    //       })
    //     )
    //   ),
    // }))
  );
}

export function withLoadEntitiesEffect<
  State extends Record<string, unknown>,
  Signals extends Record<string, Signal<any>>,
  PreviousMethods extends Record<string, (...args: any[]) => any>,
  Methods extends Record<string, (...args: any[]) => any>,
  Entity extends { id: string | number }
>(
  getAll: (
    input: SignalStateUpdate<State> &
      SignalStoreSlices<State> &
      Signals &
      PreviousMethods
  ) => Observable<Entity[]> // or: Promise<Entity[]>
) {
  return (
    previousFeature: SignalStoreFeatureInput<{
      state: State;
      signals: Signals;
      methods: PreviousMethods;
    }>
  ) => {
    return signalStoreFeature(
      {
        input: previousFeature, // this gets us the type of the previousFeature
      },
      withMethods(({ setAll, setLoaded }) => ({
        loadEntities: rxEffect<void>(
          pipe(
            tap(() => setLoading()),
            exhaustMap(() =>
              getAll({
                $update: previousFeature.$update,
                ...previousFeature.slices,
                ...previousFeature.signals,
                ...previousFeature.methods,
              })
            ),
            tap((entities) => {
              setAll(entities);
              setLoaded();
            })
          )
        ),
      }))
    )(previousFeature); // we execute the factory so we can pass the input
  };
}

export function withLoadEntitiesEffectOld<
  State extends Record<string, unknown>,
  Signals extends Record<string, Signal<any>>,
  PreviousMethods extends Record<string, (...args: any[]) => any>,
  Methods extends Record<string, (...args: any[]) => any>,
  Entity extends { id: string | number }
>(
  getAll: (
    input: SignalStateUpdate<State> &
      SignalStoreSlices<State> &
      Signals &
      PreviousMethods
  ) => Observable<Entity[]> // or: Promise<Entity[]>
) {
  return (
    featureInput: SignalStoreFeatureInput<{
      state: State;
      signals: Signals;
      methods: PreviousMethods;
    }>
  ) => {
    // We could have not use signalStoreFeature to implement this hook and use the feature param types to restrict the
    // use and unsure a withLoadEntities is before but the type will be more complicated
    const withEntities1 = withLoadEntities<Entity>();
    const loadEntitiesFeature =
      signalStoreFeatureFactory<ReturnType<typeof withEntities1>>();
    const loadEntitiesFeature1 = loadEntitiesFeature(
      withState({ a: 1 }), // test this was breaking previous implementation of signalStoreFeatureFactory
      withMethods(({ setAll, setLoaded }) => ({
        loadEntities: rxEffect<void>(
          pipe(
            tap(() => setLoading()),
            exhaustMap(() =>
              getAll({
                $update: featureInput.$update,
                ...featureInput.slices,
                ...featureInput.signals,
                ...featureInput.methods,
              })
            ),
            tap((entities) => {
              setAll(entities);
              setLoaded();
            })
          )
        ),
      }))
    );
    return loadEntitiesFeature1(featureInput as any);
  };
}
