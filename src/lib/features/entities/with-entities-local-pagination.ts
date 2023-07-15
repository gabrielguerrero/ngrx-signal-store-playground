import { withEntities } from './with-entities';
import {
  signalStoreFeatureFactory,
  withHooks,
  withMethods,
  withSignals,
  withState,
} from '@ngrx/signals';
import { computed, effect } from '@angular/core';
import type { EntitiesFilterState } from './with-entities-filter';
import { SignalState } from '../../signal-state';
import { signalStoreFeature } from '../../signal-store-feature';
import { withLoadEntities } from './with-load-entities';

export type EntitiesPaginationLocalState = {
  pagination: {
    currentPage: number;
    pageSize: number;
  };
};

export function withEntitiesLocalPagination<Entity>({
  pageSize = 10,
  currentPage = 0,
}) {
  return signalStoreFeature(
    {
      input: withLoadEntities<Entity>(),
    },
    withState<EntitiesPaginationLocalState>({
      pagination: {
        pageSize,
        currentPage,
      },
    }),
    withSignals(({ entitiesList, pagination }) => {
      // TODO problem if a user puts the filter after the pagination, the filter overriden entitiesList
      // will not work well
      const entitiesCurrentPageList = computed(() => {
        const page = pagination().currentPage;
        const startIndex = page * pagination().pageSize;
        let endIndex = startIndex + pagination().pageSize;
        endIndex =
          endIndex < entitiesList().length ? endIndex : entitiesList().length;
        return entitiesList().slice(startIndex, endIndex);
      });
      const entitiesPageInfo = computed(() => {
        const total = entitiesList().length;
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
        entitiesList: entitiesCurrentPageList,
        entitiesPageInfo,
      };
    }),
    withMethods(({ pagination, $update }) => ({
      loadEntitiesPage: ({ pageIndex }: { pageIndex: number }) => {
        $update({
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

export function withEntitiesLocalPaginationOld<Entity>({
  pageSize = 10,
  currentPage = 0,
}) {
  const withEntities1 = withEntities<Entity>();
  const paginationFeature =
    signalStoreFeatureFactory<ReturnType<typeof withEntities1>>();

  return paginationFeature(
    withState<EntitiesPaginationLocalState>({
      pagination: {
        pageSize,
        currentPage,
      },
    }),
    withSignals(({ entitiesList, pagination }) => {
      // TODO problem if a user puts the filter after the pagination, the filter overriden entitiesList
      // will not work well
      const entitiesCurrentPageList = computed(() => {
        const page = pagination().currentPage;
        const startIndex = page * pagination().pageSize;
        let endIndex = startIndex + pagination().pageSize;
        endIndex =
          endIndex < entitiesList().length ? endIndex : entitiesList().length;
        return entitiesList().slice(startIndex, endIndex);
      });
      const entitiesPageInfo = computed(() => {
        const total = entitiesList().length;
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
        entitiesList: entitiesCurrentPageList,
        entitiesPageInfo,
      };
    }),
    withMethods(({ pagination, $update }) => ({
      loadEntitiesPage: ({ pageIndex }: { pageIndex: number }) => {
        $update({
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
