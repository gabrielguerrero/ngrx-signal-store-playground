import {
  withState,
  withMethods,
  withComputed,
  type,
  signalStoreFeature,
  patchState,
  SignalStoreFeature,
  getState,
} from '@ngrx/signals';
import { computed, Signal } from '@angular/core';
import {
  concatMap,
  debounce,
  distinctUntilChanged,
  EMPTY,
  of,
  pipe,
  tap,
  timer,
} from 'rxjs';
import { NotAllowedStateCheck } from '../../signal-state-models';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  EntityState,
  NamedEntityState,
  setAllEntities,
} from '@ngrx/signals/entities';
import { StateSignal } from '@ngrx/signals/src/state-signal';
import {
  EntitySignals,
  NamedEntitySignals,
} from '@ngrx/signals/entities/src/models';
import { capitalize, Prettify } from './util';
import { Sort, sortData } from './sort-entities.utils';

export declare type SortDirection = 'asc' | 'desc' | '';

export interface EntitiesSortState<Entity> {
  sort: {
    current: Sort<Entity>;
    default: Sort<Entity>;
  };
}
export type NamedEntitiesSortState<Entity, Collection extends string> = {
  [K in Collection as `${K}Sort`]: {
    current: Sort<Entity>;
    default: Sort<Entity>;
  };
};

export type EntitiesSortMethods<Entity> = {
  sortEntities: (options: { sort: Sort<Entity> }) => void;
  resetEntitiesSort: (options: { sort: Sort<Entity> }) => void;
};
export type NamedEntitiesSortMethods<Entity, Collection extends string> = {
  [K in Collection as `sort${Capitalize<string & K>}Entities`]: (options: {
    sort: Sort<Entity>;
  }) => void;
} & {
  [K in Collection as `resetSort${Capitalize<string & K>}Entities`]: () => void;
};
function getEntitiesSortKeys(config?: { collection?: string }) {
  const collection = config?.collection;
  const capitalizedProp = collection && capitalize(collection);
  return {
    sortKey: collection ? `${config.collection}Sort` : 'sort',
    entitiesKey: collection ? `${config.collection}Entities` : 'entities',
    sortEntitiesKey: collection
      ? `sort${capitalizedProp}Entities`
      : 'sortEntities',
    setLoadingKey: collection ? `set${capitalizedProp}Loading` : 'setLoading',
  };
}

export function withEntitiesLocalSort<
  Entity extends { id: string | number },
  Sort extends Record<string, unknown>
>(options: {
  filterFn: (entity: Entity, filter?: Sort) => boolean;
  defaultSort: Sort & NotAllowedStateCheck<Sort>;
  entity?: Entity;
}): SignalStoreFeature<
  {
    state: EntityState<Entity>;
    signals: EntitySignals<Entity>;
    methods: {};
  },
  {
    state: EntitiesSortState<Entity>;
    signals: {};
    methods: EntitiesSortMethods<Entity>;
  }
>;
export function withEntitiesLocalSort<
  Entity extends { id: string | number },
  Collection extends string,
  Sort extends Record<string, unknown>
>(options: {
  defaultSort: Sort & NotAllowedStateCheck<Sort>;
  entity?: Entity;
  collection?: Collection;
}): SignalStoreFeature<
  // TODO: the problem seems be with the state pro, when set to empty
  //  it works but is it has a namedstate it doesnt
  {
    state: NamedEntityState<Entity, any>;
    signals: NamedEntitySignals<Entity, Collection>;
    methods: {};
  },
  {
    state: NamedEntitiesSortState<Entity, Collection>;
    signals: {};
    methods: NamedEntitiesSortMethods<Collection, Collection>;
  }
>;
export function withEntitiesLocalSort<
  Entity extends { id: string | number },
  Collection extends string
>({
  defaultSort,
  ...config
}: {
  defaultSort: Sort<Entity>;
  entity?: Entity;
  collection?: Collection;
}): any {
  // TODO throw error if pagination trait is present before this one or find a way to make it not matter
  const { sortEntitiesKey, sortKey, entitiesKey } = getEntitiesSortKeys(config);
  return signalStoreFeature(
    withState({ [sortKey]: { current: defaultSort, default: defaultSort } }),
    withComputed((state: Record<string, Signal<unknown>>) => {
      const entities = state[entitiesKey] as Signal<Entity[]>;
      const sort = state[sortKey] as Signal<EntitiesSortState<Entity>['sort']>;
      return {
        [entitiesKey]: computed(() => {
          // console.log('state', getState(state as any));
          console.log('sort', sortData(entities(), sort().current));
          return sortData(entities(), sort().current);
        }),
      };
    }),
    withMethods((state: Record<string, Signal<unknown>>) => {
      const sortState = state[sortKey] as Signal<
        EntitiesSortState<Entity>['sort']
      >;
      return {
        [sortEntitiesKey]: ({ sort: newSort }: { sort: Sort<Entity> }) => {
          patchState(
            state as any,
            {
              [sortKey]: { ...sortState(), current: newSort },
            } as any,
            config.collection
              ? setAllEntities(sortData(state[entitiesKey]() as any, newSort), {
                  collection: config.collection,
                })
              : (setAllEntities(
                  sortData(state[entitiesKey]() as any, newSort)
                ) as any)
          );
        }, // TODO fix the any type here
      };
    })
  );
}

export function withEntitiesRemoteSort<
  Entity extends { id: string | number }
>(options: {
  defaultSort: Sort<Entity>;
  entity?: Entity;
}): SignalStoreFeature<
  {
    state: EntityState<Entity>;
    signals: EntitySignals<Entity>;
    methods: {};
  },
  {
    state: EntitiesSortState<Entity>;
    signals: {};
    methods: EntitiesSortMethods<Entity>;
  }
>;
export function withEntitiesRemoteSort<
  Entity extends { id: string | number },
  Collection extends string
>(options: {
  defaultSort: Sort<Entity>;
  entity?: Entity;
  collection?: Collection;
}): SignalStoreFeature<
  {
    state: NamedEntityState<Entity, Collection>;
    signals: NamedEntitySignals<Entity, Collection>;
    methods: {
      setLoading: () => void;
    };
  },
  {
    state: NamedEntitiesSortState<Entity, Collection>;
    signals: {};
    methods: NamedEntitiesSortMethods<Entity, Collection>;
  }
>;
export function withEntitiesRemoteSort<
  Entity extends { id: string | number },
  Collection extends string
>({
  defaultSort,
  ...config
}: {
  entity?: Entity;
  collection?: Collection;
  defaultSort: Sort<Entity>;
}): any {
  // TODO fix the any type here
  const { sortKey, setLoadingKey, sortEntitiesKey } =
    getEntitiesSortKeys(config);
  return signalStoreFeature(
    withState({ [sortKey]: defaultSort }),
    withMethods((state: Record<string, Signal<unknown>>) => {
      const setLoading = state[setLoadingKey] as () => void;

      return {
        [sortEntitiesKey]: ({ newSort }: { newSort: Sort<Entity> }) => {
          const sortState = state[sortKey] as Signal<
            EntitiesSortState<Entity>['sort']
          >;
          patchState(state as any, {
            [sortKey]: { ...sortState(), current: newSort },
          });
          setLoading();
        }, // TODO fix the any type here
      };
    })
  );
}
