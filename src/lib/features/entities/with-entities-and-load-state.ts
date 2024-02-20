import {
  patchState,
  signalStoreFeature,
  SignalStoreFeature,
  type,
  withMethods,
} from '@ngrx/signals';

import {
  CallState,
  NamedCallState,
  setLoading,
  withCallStatus,
} from './with-call-status';
import { exhaustMap, Observable, pipe, tap, Unsubscribable } from 'rxjs';
import {
  EmptyFeatureResult,
  SignalStoreFeatureResult,
  SignalStoreSlices,
} from '../../signal-store-models';
import {
  EntityState,
  NamedEntityState,
  setAllEntities,
  withEntities,
} from '@ngrx/signals/entities';
import { EntityId } from '@ngrx/signals/entities/src/models';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { Prettify } from './util';
import type {
  EntitiesPaginationRemoteMethods,
  NamedEntitiesPaginationRemoteMethods,
} from './with-entities-remote-pagination';

export type EntitiesAndLoadState<Entity> = EntityState<Entity> & CallState;
export type NamedEntitiesAndLoadState<
  Collection extends string,
  Entity
> = NamedEntityState<Entity, Collection> & NamedCallState<Collection>;

export type EntitiesRemoteMethods<Entity> = {
  setResult: (entities: Entity[]) => void;
  // Should setResult maybe be call setAllEntities? or setEntities? or setLoadResult?
  // or setLoadedEntities?
};
export type NamedEntitiesRemoteMethods<Collection extends string, Entity> = {
  [K in Collection as `set${Capitalize<string & K>}Result`]: (
    entities: Entity[]
  ) => void;
};

export function withEntitiesAndLoadState<
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

export function withEntitiesLoadingCall<
  Input extends SignalStoreFeatureResult,
  Entity extends { id: string | number }
>(
  {
    fetchEntities,
  }: {
    fetchEntities: (
      store: Prettify<
        SignalStoreSlices<Input['state']> & Input['signals'] & Input['methods']
      >
    ) =>
      | Observable<
          Input['methods'] extends EntitiesPaginationRemoteMethods<Entity>
            ? { entities: Entity[]; total: number }
            : Entity[] | { entities: Entity[] } // should this be { entities: Entity[];} for consistency?
        >
      | Promise<
          Input['methods'] extends EntitiesPaginationRemoteMethods<Entity>
            ? { entities: Entity[]; total: number }
            : Entity[] | { entities: Entity[] }
        >;
  } // or: Promise<Entity[]>
): SignalStoreFeature<
  Input,
  EmptyFeatureResult & { methods: { loadEntities: () => Unsubscribable } }
>;

export function withEntitiesLoadingCall<
  Input extends SignalStoreFeatureResult,
  Entity extends { id: string | number },
  Collection extends string
>(
  {
    fetchEntities,
  }: {
    entity?: Entity; // is this needed? entity can come from the method fetchEntities return type
    collection?: Collection;
    fetchEntities: (
      store: Prettify<
        SignalStoreSlices<Input['state']> & Input['signals'] & Input['methods']
      >
    ) =>
      | Observable<
          Input['methods'] extends NamedEntitiesPaginationRemoteMethods<
            Entity,
            Collection
          >
            ? { entities: Entity[]; total: number }
            : Entity[] | { entities: Entity[] } // should this be { entities: Entity[];} for consistency?
        >
      | Promise<
          Input['methods'] extends NamedEntitiesPaginationRemoteMethods<
            Entity,
            Collection
          >
            ? { entities: Entity[]; total: number }
            : Entity[] | { entities: Entity[] } // should this be { entities: Entity[];} for consistency?
        >;
  } // or: Promise<Entity[]>
): SignalStoreFeature<
  Input,
  EmptyFeatureResult & { methods: { loadEntities: () => Unsubscribable } }
>;

export function withEntitiesLoadingCall<
  Input extends SignalStoreFeatureResult,
  Entity extends { id: string | number },
  Collection extends string
>(
  {
    fetchEntities,
  }: {
    entity?: Entity; // is this needed? entity can come from the method fetchEntities return type
    collection?: Collection;
    fetchEntities: (
      store: Prettify<
        SignalStoreSlices<Input['state']> & Input['signals'] & Input['methods']
      >
    ) => Observable<any> | Promise<any>;
  } // or: Promise<Entity[]>
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
              fetchEntities({
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
