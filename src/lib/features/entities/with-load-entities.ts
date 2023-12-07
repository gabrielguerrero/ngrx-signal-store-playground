import {
  SignalStoreFeature,
  type,
  withMethods,
  signalStoreFeature,
  patchState,
} from '@ngrx/signals';

import { setLoading, withCallState } from '../../../app/users/call-state';
import { exhaustMap, Observable, pipe, tap, Unsubscribable } from 'rxjs';
import {
  EmptyFeatureResult,
  InnerSignalStore,
  SignalStoreFeatureResult,
  SignalStoreInternals,
  SignalStoreSlices,
} from '../../signal-store-models';
import { withEntities, setAllEntities } from '@ngrx/signals/entities';
import { EntityId } from '@ngrx/signals/entities/src/models';
// import { STATE_SIGNAL, StateSignal } from '@ngrx/signals/src/state-signal';
import { rxMethod } from '@ngrx/signals/rxjs-interop';

export function withLoadEntities<
  Entity extends {
    id: EntityId;
  }
>() {
  // getAll: () => Observable<Entity[]> // or: Promise<Entity[]>
  return signalStoreFeature(
    withCallState(),
    withEntities({ entity: type<Entity>() }),
    withMethods((store) => ({
      setResult: (entities: Entity[]) =>
        patchState(store, setAllEntities(entities)),
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
  Input extends SignalStoreFeatureResult,
  Entity extends { id: string | number }
>(
  getAll: (
    store: Prettify<
      SignalStoreSlices<Input['state']> & Input['signals'] & Input['methods']
    >
  ) => Observable<Entity[]> // or: Promise<Entity[]>
): SignalStoreFeature<
  Input,
  EmptyFeatureResult & { methods: { loadEntities: () => Unsubscribable } }
> {
  return (store) => {
    return signalStoreFeature(
      type<typeof store>(),
      withMethods(({ setResult, setLoaded }) => ({
        loadEntities: rxMethod<void>(
          pipe(
            tap(() => setLoading()),
            exhaustMap(() =>
              getAll({
                ...store.slices,
                ...store.signals,
                ...store.methods,
              } as Prettify<SignalStoreSlices<Input['state']> & Input['signals'] & Input['methods']>)
            ),
            tap((entities) => {
              console.log('entities', entities);
              setResult(entities);
              setLoaded();
            })
          )
        ),
      }))
    )(store); // we execute the factory so we can pass the input
  };
}

// export function withLoadEntitiesEffectOld<
//   State extends Record<string, unknown>,
//   Signals extends Record<string, Signal<any>>,
//   PreviousMethods extends Record<string, (...args: any[]) => any>,
//   Methods extends Record<string, (...args: any[]) => any>,
//   Entity extends { id: string | number }
// >(
//   getAll: (
//     input: SignalStateUpdate<State> &
//       SignalStoreSlices<State> &
//       Signals &
//       PreviousMethods
//   ) => Observable<Entity[]> // or: Promise<Entity[]>
// ) {
//   return (
//     featureInput: SignalStoreFeatureInput<{
//       state: State;
//       signals: Signals;
//       methods: PreviousMethods;
//     }>
//   ) => {
//     // We could have not use signalStoreFeature to implement this hook and use the feature param types to restrict the
//     // use and unsure a withLoadEntities is before but the type will be more complicated
//     const withEntities1 = withLoadEntities<Entity>();
//     const loadEntitiesFeature =
//       signalStoreFeatureFactory<ReturnType<typeof withEntities1>>();
//     const loadEntitiesFeature1 = loadEntitiesFeature(
//       withState({ a: 1 }), // test this was breaking previous implementation of signalStoreFeatureFactory
//       withMethods(({ setAll, setLoaded }) => ({
//         loadEntities: rxEffect<void>(
//           pipe(
//             tap(() => setLoading()),
//             exhaustMap(() =>
//               getAll({
//                 $update: featureInput.$update,
//                 ...featureInput.slices,
//                 ...featureInput.signals,
//                 ...featureInput.methods,
//               })
//             ),
//             tap((entities) => {
//               setAll(entities);
//               setLoaded();
//             })
//           )
//         ),
//       }))
//     );
//     return loadEntitiesFeature1(featureInput as any);
//   };
// }
export type Prettify<T> = { [K in keyof T]: T[K] } & {};
