import {
  type,
  withHooks,
  withMethods,
  withComputed,
  withState,
  signalStoreFeature,
  patchState,
} from '@ngrx/signals';
import { computed, effect } from '@angular/core';
import type { EntitiesFilterState } from './with-entities-filter';
import { withLoadEntities } from './with-load-entities';
import { SignalState } from '../../signal-state-models';

export type EntitiesPaginationLocalState = {
  pagination: {
    currentPage: number;
    pageSize: number;
  };
};

export function withEntitiesLocalPagination<
  Entity extends { id: string | number }
>({ pageSize = 10, currentPage = 0 }) {
  const withEntities1 = withLoadEntities<Entity>();
  return signalStoreFeature(
    type<ReturnType<typeof withEntities1>>(),
    withState<EntitiesPaginationLocalState>({
      pagination: {
        pageSize,
        currentPage,
      },
    }),
    withComputed(({ entities, pagination }) => {
      // TODO problem if a user puts the filter after the pagination, the filter overriden entities
      // will not work well
      const entitiesCurrentPageList = computed(() => {
        const page = pagination().currentPage;
        const startIndex = page * pagination().pageSize;
        let endIndex = startIndex + pagination().pageSize;
        endIndex = endIndex < entities().length ? endIndex : entities().length;
        return entities().slice(startIndex, endIndex);
      });
      const entitiesPageInfo = computed(() => {
        const total = entities().length;
        const pagesCount =
          total && total! > 0
            ? Math.ceil(total! / pagination().pageSize)
            : undefined;
        return {
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
        entities: entitiesCurrentPageList,
        entitiesPageInfo,
      };
    }),
    withMethods(({ pagination, ...store }) => ({
      loadEntitiesPage: ({ pageIndex }: { pageIndex: number }) => {
        patchState(store, {
          pagination: {
            ...pagination(),
            currentPage: pageIndex,
          },
        });
      },
    })),
    withHooks({
      onInit: (input) => {
        const { loadEntitiesPage } = input;
        // we need reset the currentPage to 0 when the filter changes, not sure if I'm happy with this solution
        if ('filter' in input) {
          const { filter } = input as unknown as SignalState<
            EntitiesFilterState<any>
          >;
          let previousFilter: any = null;
          effect(
            () => {
              if (previousFilter !== filter()) {
                previousFilter = filter();
                loadEntitiesPage({ pageIndex: 0 });
              }
            },
            { allowSignalWrites: true }
          );
        }
      },
    })
  );
}
