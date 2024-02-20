import {
  type,
  withHooks,
  withMethods,
  withComputed,
  withState,
  signalStoreFeature,
  patchState,
  SignalStoreFeature,
  signalState,
} from '@ngrx/signals';
import { computed, effect, Signal } from '@angular/core';
import type { EntitiesFilterState } from './with-entities-filter';
import {
  withEntities,
  EntityState,
  NamedEntityState,
} from '@ngrx/signals/entities';
import { capitalize, Prettify } from './util';
import {
  EntitySignals,
  NamedEntitySignals,
} from '@ngrx/signals/entities/src/models';
import { SignalState } from '../../signal-state-models';

export type EntitiesPaginationLocalState = {
  pagination: {
    currentPage: number;
    pageSize: number;
  };
};
export type NamedEntitiesPaginationLocalState<Collection extends string> = {
  [K in Collection as `${K}Pagination`]: {
    currentPage: number;
    pageSize: number;
  };
};

export type EntitiesPaginationLocalComputed<Entity> = {
  entitiesCurrentPage: Signal<{
    entities: Entity[];
    pageIndex: number;
    total: number | undefined;
    pageSize: number;
    pagesCount: number | undefined;
    hasPrevious: boolean;
    hasNext: boolean;
  }>;
};
export type NamedEntitiesPaginationLocalComputed<
  Entity,
  Collection extends string
> = {
  [K in Collection as `${K}CurrentPage`]: Signal<{
    entities: Entity[];
    pageIndex: number;
    total: number | undefined;
    pageSize: number;
    pagesCount: number | undefined;
    hasPrevious: boolean;
    hasNext: boolean;
  }>;
};

export type EntitiesPaginationLocalMethods = {
  loadEntitiesPage: (options: { pageIndex: number }) => void;
};
export type NamedEntitiesPaginationLocalMethods<Collection extends string> = {
  [K in Collection as `load${Capitalize<string & K>}Page`]: (options: {
    pageIndex: number;
  }) => void;
};
function getEntitiesPaginationKeys(config?: { collection?: string }) {
  const collection = config?.collection;
  const capitalizedProp = collection && capitalize(collection);
  return {
    paginationKey: collection ? `${config.collection}Pagination` : 'pagination',
    entitiesCurrentPageKey: collection
      ? `${config.collection}CurrentPage`
      : 'entitiesCurrentPage',
    entitiesKey: collection ? `${config.collection}Entities` : 'entities',
    loadEntitiesPageKey: collection
      ? `load${capitalizedProp}Page`
      : 'loadEntitiesPage',
    filterKey: collection ? `${config.collection}Filter` : 'filter',
  };
}
export function withEntitiesLocalPagination<
  Entity extends { id: string | number }
>(config: {
  pageSize?: number;
  currentPage?: number;
  entity?: Entity;
}): SignalStoreFeature<
  // {
  //   state: {}; //EntityState<Entity>;
  //   signals: {}; //EntitySignals<Entity>;
  //   methods: {};
  // },
  {
    state: EntityState<Entity>;
    signals: EntitySignals<Entity>;
    methods: {};
  },
  {
    state: EntitiesPaginationLocalState;
    signals: EntitiesPaginationLocalComputed<Entity>;
    methods: EntitiesPaginationLocalMethods;
  }
>;
export function withEntitiesLocalPagination<
  Entity extends { id: string | number },
  Collection extends string
>(config: {
  pageSize?: number;
  currentPage?: number;
  entity?: Entity;
  collection?: Collection;
}): SignalStoreFeature<
  // {
  //   state: {};
  //   signals: NamedEntitySignals<Entity, Collection>;
  //   methods: {};
  // },
  {
    state: NamedEntityState<Entity, any>; // if put Collection the some props get lost and can only be access ['prop'] weird bug
    signals: NamedEntitySignals<Entity, Collection>;
    methods: {};
  },
  {
    state: NamedEntitiesPaginationLocalState<Collection>;
    // state: {};
    // signals: {};
    // methods: {};
    signals: NamedEntitiesPaginationLocalComputed<Entity, Collection>;
    methods: NamedEntitiesPaginationLocalMethods<Collection>;
  }
  // {
  //   state: Prettify<NamedEntityState<Entity, Collection>>;
  //   signals: Prettify<NamedEntitySignals<Entity, Collection>>;
  //   methods: {};
  // },
  // {
  //   state: Prettify<NamedEntitiesPaginationLocalState<Collection>>;
  //   // state: {};
  //   // signals: {};
  //   // methods: {};
  //   signals: Prettify<NamedEntitiesPaginationLocalComputed<Collection>>;
  //   methods: Prettify<NamedEntitiesPaginationLocalMethods<Collection>>;
  // }
>;

export function withEntitiesLocalPagination<
  Entity extends { id: string | number },
  Collection extends string
>({
  pageSize = 10,
  currentPage = 0,
  ...config
}: {
  pageSize?: number;
  currentPage?: number;
  entity?: Entity;
  collection?: Collection;
} = {}): any {
  // TODO fix the any type here
  // const withEntities1 = withEntities<Entity>(); // TODO small problem here, if we have a
  const {
    entitiesKey,
    loadEntitiesPageKey,
    entitiesCurrentPageKey,
    paginationKey,
    filterKey,
  } = getEntitiesPaginationKeys(config);

  return signalStoreFeature(
    // type<{
    //   state: SignalState<EntityState<Entity>>;
    //   signals: EntitySignals<Entity>;
    //   methods: {};
    // } | {
    //   state: SignalState<NamedEntityState<Entity, Collection>>;
    //   signals: NamedEntitySignals<Entity, Collection>;
    //   methods: {};
    // }>(),
    withState({
      [paginationKey]: {
        pageSize,
        currentPage,
      },
    }),
    withComputed((state: Record<string, Signal<unknown>>) => {
      const entities = state[entitiesKey] as Signal<Entity[]>;
      const pagination = state[paginationKey] as Signal<{
        pageSize: number;
        currentPage: number;
      }>;
      // TODO problem if a user puts the filter after the pagination, the filter overriden entities
      // will not work well
      // const entitiesCurrentPageList = computed(() => {
      //   const page = pagination().currentPage;
      //   const startIndex = page * pagination().pageSize;
      //   let endIndex = startIndex + pagination().pageSize;
      //   endIndex = endIndex < entities().length ? endIndex : entities().length;
      //   return entities().slice(startIndex, endIndex);
      // });
      const entitiesCurrentPage = computed(() => {
        const page = pagination().currentPage;
        const startIndex = page * pagination().pageSize;
        let endIndex = startIndex + pagination().pageSize;
        endIndex = endIndex < entities().length ? endIndex : entities().length;
        const pageEntities = entities().slice(startIndex, endIndex);
        console.log('entitiesCurrentPage', { entities: pageEntities });
        const total = entities().length;
        const pagesCount =
          total && total! > 0
            ? Math.ceil(total! / pagination().pageSize)
            : undefined;
        return {
          entities: pageEntities,
          pageIndex: pagination().currentPage,
          total: total,
          pageSize: pagination().pageSize,
          pagesCount,
          hasPrevious: pagination().currentPage - 1 >= 0,
          hasNext:
            pagesCount && total && total! > 0
              ? pagination().currentPage + 1 < pagesCount
              : true,
        };
      });
      return {
        [entitiesCurrentPageKey]: entitiesCurrentPage,
      };
    }),
    withMethods((state: Record<string, Signal<unknown>>) => {
      const pagination = state[paginationKey] as Signal<{
        pageSize: number;
        currentPage: number;
      }>;
      return {
        [loadEntitiesPageKey]: ({ pageIndex }: { pageIndex: number }) => {
          console.log(state, {
            // TODO this is a hack, we need to fix the type of state
            [paginationKey]: {
              ...pagination(),
              currentPage: pageIndex,
            },
          });
          patchState(state as any, {
            // TODO this is a hack, we need to fix the type of state
            [paginationKey]: {
              ...pagination(),
              currentPage: pageIndex,
            },
          });
        },
      };
    }),
    withHooks({
      onInit: (input) => {
        // we need reset the currentPage to 0 when the filter changes, not sure if I'm happy with this solution
        console.log('onInit', input);
        if (filterKey in input) {
          const filter = input[filterKey] as Signal<any>;
          let previousFilter: any = null;
          effect(
            () => {
              if (previousFilter !== filter()) {
                previousFilter = filter();

                input[loadEntitiesPageKey]({ pageIndex: 0 });
              }
            },
            { allowSignalWrites: true }
          );
        }
      },
    })
  );
}
