import {
  patchState,
  signalStoreFeature,
  SignalStoreFeature,
  type,
  withMethods,
} from '@ngrx/signals';

import {
  CallState,
  CallStateComputed,
  CallStateMethods,
  NamedCallState,
  NamedCallStateComputed,
  NamedCallStateMethods,
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
import {
  EntityId,
  EntitySignals,
  NamedEntitySignals,
} from '@ngrx/signals/entities/src/models';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { capitalize, Prettify } from './util';
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
  Input & {
    state: EntityState<Entity> & CallState;
    signals: EntitySignals<Entity> & CallStateComputed;
    methods: CallStateMethods;
  },
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
    // entity?: Entity; // is this needed? entity can come from the method fetchEntities return type
    collection: Collection;
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
  Input & {
    state: Prettify<
      NamedEntityState<Entity, Collection> & NamedCallState<Collection>
    >;
    signals: Prettify<
      NamedEntitySignals<Entity, Collection> &
        NamedCallStateComputed<Collection>
    >;
    methods: Prettify<NamedCallStateMethods<Collection>>;
  },
  EmptyFeatureResult & { methods: { loadEntities: () => Unsubscribable } }
>;

export function withEntitiesLoadingCall<
  Input extends SignalStoreFeatureResult,
  Entity extends { id: string | number },
  Collection extends string
>({
  fetchEntities,
}: {
  entity?: Entity; // is this needed? entity can come from the method fetchEntities return type
  collection?: Collection;
  fetchEntities: (
    store: Prettify<
      SignalStoreSlices<Input['state']> & Input['signals'] & Input['methods']
    >
  ) => Observable<any> | Promise<any>;
}): SignalStoreFeature<
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
// TODO move thi getKeys function to a util file so they can be shared
function getEntitiesLoadingCallKeys(config?: { collection?: string }) {
  const collection = config?.collection;
  const capitalizedProp = collection && capitalize(collection);
  return {
    paginationKey: collection ? `${config.collection}Pagination` : 'pagination',
    entitiesCurrentPageKey: collection
      ? `${config.collection}CurrentPage`
      : 'entitiesCurrentPage',
    entitiesPagedRequestKey: collection
      ? `${config.collection}PagedRequest`
      : 'entitiesPagedRequest',
    entitiesKey: collection ? `${config.collection}Entities` : 'entities',
    loadEntitiesPageKey: collection
      ? `load${capitalizedProp}Page`
      : 'loadEntitiesPage',
    setEntitiesLoadResult: collection
      ? `set${capitalizedProp}LoadedResult`
      : 'setEntitiesLoadedResult',
    filterKey: collection ? `${config.collection}Filter` : 'filter',
    callStatusKey: collection ? `${config.collection}CallStatus` : 'callStatus',
    loadingKey: collection ? `${config.collection}Loading` : 'loading',
    loadedKey: collection ? `${config.collection}Loaded` : 'loaded',
    errorKey: collection ? `${config.collection}Error` : 'error',
    setLoadingKey: collection ? `set${capitalizedProp}Loading` : 'setLoading',
    setLoadedKey: collection ? `set${capitalizedProp}Loaded` : 'setLoaded',
    setFailKey: collection ? `set${capitalizedProp}Fail` : 'setFail',
  };
}
