import {
  patchState,
  signalStoreFeature,
  SignalStoreFeature,
  type,
  withMethods,
} from '@ngrx/signals';

import {
  setLoading,
  withCallStatus,
} from '../../../app/users/with-call-status';
import { exhaustMap, Observable, pipe, tap, Unsubscribable } from 'rxjs';
import {
  EmptyFeatureResult,
  SignalStoreFeatureResult,
  SignalStoreSlices,
} from '../../signal-store-models';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';
import { EntityId } from '@ngrx/signals/entities/src/models';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { Prettify } from './util';

export function withLoadEntities<
  Entity extends {
    id: EntityId;
  }
>() {
  // getAll: () => Observable<Entity[]> // or: Promise<Entity[]>
  return signalStoreFeature(
    withCallStatus(),
    withEntities({ entity: type<Entity>() }),
    withMethods((store) => ({
      setResult: (
        entities: Entity[] // Should setResult maybe be call setAllEntities? or setEntities?
      ) => patchState(store, setAllEntities(entities)),
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
