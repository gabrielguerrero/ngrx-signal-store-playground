import {
  signalStore,
  type,
  withHooks,
  withMethods,
  withComputed,
  withState,
  signalStoreFeature,
  patchState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { computed, effect } from '@angular/core';
import { pipe, tap } from 'rxjs';
import { withLoadEntities } from './with-load-entities';
import { EntitiesFilterState } from './with-entities-filter';
import { SignalState } from '../../signal-state-models';

export type EntitiesPaginationRemoteState = {
  pagination: {
    currentPage: number;
    requestPage: number;
    pageSize: number;
    total: number | undefined;
    pagesToCache: number;
    cache: {
      start: number;
      end: number;
    };
  };
};

export function withEntitiesRemotePagination<
  Entity extends { id: string | number }
>({ pageSize = 10, currentPage = 0, pagesToCache = 3 }) {
  const withEntities1 = withLoadEntities<Entity>();
  return signalStoreFeature(
    type<ReturnType<typeof withEntities1>>(),
    withState<EntitiesPaginationRemoteState>({
      pagination: {
        pageSize,
        currentPage,
        requestPage: currentPage,
        pagesToCache,
        total: undefined,
        cache: {
          start: 0,
          end: 0,
        },
      },
    }),

    withComputed(({ entities, pagination }) => {
      const entitiesCurrentPageList = computed(() => {
        const page = pagination().currentPage;
        const startIndex =
          page * pagination().pageSize - pagination().cache.start;
        let endIndex = startIndex + pagination().pageSize;
        endIndex =
          endIndex < pagination().cache.end ? endIndex : pagination().cache.end;
        return entities().slice(startIndex, endIndex);
      });

      const entitiesPageInfo = computed(() => {
        const pagesCount =
          pagination().total && pagination().total! > 0
            ? Math.ceil(pagination().total! / pagination().pageSize)
            : undefined;
        return {
          pageIndex: pagination().currentPage,
          total: pagination().total,
          pageSize: pagination().pageSize,
          pagesCount,
          hasPrevious: pagination().currentPage - 1 >= 0,
          hasNext:
            pagesCount && pagination().total && pagination().total! > 0
              ? pagination().currentPage + 1 < pagesCount
              : true,
        };
      });
      const entitiesPagedRequest = computed(() => ({
        startIndex: pagination().pageSize * pagination().requestPage,
        size: pagination().pageSize * pagination().pagesToCache,
        page: pagination().requestPage,
      }));
      return {
        entitiesList: entitiesCurrentPageList,
        entitiesPageInfo,
        entitiesPagedRequest,
      };
    }),
    withMethods(
      ({ setLoading, pagination, setResult, entitiesList, ...store }) => {
        return {
          setResult: (entities: Entity[], total: number) => {
            const isPreloadNextPages =
              pagination().currentPage + 1 === pagination().requestPage;

            const start = pagination().currentPage * pagination().pageSize;
            const newEntities = isPreloadNextPages
              ? [...entitiesList(), ...entities]
              : entities;
            setResult(newEntities);
            patchState(store, {
              pagination: {
                ...pagination(),
                total,
                cache: {
                  ...pagination().cache,
                  start,
                  end: start + entities.length,
                },
              },
            });
          },
          loadEntitiesPage: rxMethod<{ index: number; forceLoad?: boolean }>(
            pipe(
              tap(({ index, forceLoad }) => {
                patchState(store, {
                  pagination: {
                    ...pagination(),
                    currentPage: index,
                    requestPage: index,
                  },
                });
                if (isEntitiesPageInCache(index, pagination()) && !forceLoad) {
                  if (!isEntitiesPageInCache(index + 1, pagination())) {
                    // preload next page
                    patchState(store, {
                      pagination: {
                        ...pagination(),
                        currentPage: index,
                        requestPage: index + 1,
                      },
                    });
                    setLoading();
                  }
                  return;
                }
                setLoading();
              })
            )
          ),
        };
      }
    ),
    withHooks({
      onInit: (input) => {
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
                patchState(input, {
                  pagination: {
                    ...input.pagination(),
                    currentPage: 0,
                    requestPage: 0,
                  },
                });
              }
            },
            { allowSignalWrites: true }
          );
        }
      },
    })
  );
}

function isEntitiesPageInCache(
  page: number,
  pagination: EntitiesPaginationRemoteState['pagination']
) {
  const startIndex = page * pagination.pageSize;
  let endIndex = startIndex + pagination.pageSize - 1;
  endIndex =
    pagination.total && endIndex > pagination.total
      ? pagination.total - 1
      : endIndex;
  return (
    startIndex >= pagination.cache.start && endIndex <= pagination.cache.end
  );
}
export const test = signalStore(withState({ test: false }));
