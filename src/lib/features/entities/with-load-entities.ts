import {
  EmptyFeatureResult,
  Prettify,
  rxMethod,
  SignalStoreFeature,
  type,
  withMethods,
} from '@ngrx/signals';

import { setLoading, withCallState } from '../../../app/users/call-state';
import { exhaustMap, Observable, pipe, tap, Unsubscribable } from 'rxjs';
import { withEntities } from './with-entities';
import { signalStoreFeature } from '../../signal-store-feature';
import {
  InnerSignalStore,
  SignalStoreFeatureResult,
  SignalStoreInternals,
  SignalStoreSlices,
} from '../../signal-store-models';

export function withLoadEntities<Entity>() {
  // getAll: () => Observable<Entity[]> // or: Promise<Entity[]>
  return signalStoreFeature(
    withCallState(),
    withEntities<Entity>(),
    withMethods(({ setAll }) => ({
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
  Input extends SignalStoreFeatureResult,
  Entity extends { id: string | number }
>(
  getAll: (
    input: Prettify<
      SignalStoreSlices<Input['state']> & Input['signals'] & Input['methods']
    >
  ) => Observable<Entity[]> // or: Promise<Entity[]>
): SignalStoreFeature<
  Input,
  EmptyFeatureResult & { methods: { loadEntities: () => Unsubscribable } }
> {
  return (
    store: InnerSignalStore<Input['state'], Input['signals'], Input['methods']>
  ) => {
    return signalStoreFeature(
      type<typeof store>(),
      withMethods(({ setAll, setLoaded }) => ({
        loadEntities: rxMethod<void>(
          pipe(
            tap(() => setLoading()),
            exhaustMap(() =>
              getAll({
                ...store.slices,
                ...store.signals,
                ...store.methods,
              })
            ),
            tap((entities) => {
              setAll(entities);
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
