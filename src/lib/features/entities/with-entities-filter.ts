import { signalStoreFeature } from '../../signal-store';
import {
  rxEffect,
  withComputed,
  withEffects,
  withHooks,
  withState,
  withUpdaters,
} from '@ngrx/signals';
import { withLoadEntities } from './with-load-entities';
import { withEntities } from './with-entities';
import { computed, effect, Signal } from '@angular/core';
import {
  concatMap,
  debounce,
  distinctUntilChanged,
  EMPTY,
  exhaustMap,
  of,
  pairwise,
  pipe,
  startWith,
  tap,
  timer,
} from 'rxjs';
import { setLoading } from '../../../app/users/call-state';
import { SignalState, SignalStoreUpdateFn, StaticState } from '../../models';

export function withEntitiesLocalFilter<
  Entity extends { id: string | number },
  Filter
>({
  filterFn,
  defaultFilter,
}: {
  filterFn: (entity: Entity, filter?: Filter) => boolean;
  defaultFilter: Filter;
}) {
  // TODO throw error if paginaton trait is present before this one
  return signalStoreFeature(
    {
      requires: withEntities<Entity>(),
    },
    withState<{ filter: Filter }>({ filter: defaultFilter }),
    withComputed(({ entitiesList, filter }) => {
      return {
        entitiesList: computed(() => {
          return entitiesList().filter((entity) => {
            return filterFn(entity, filter?.());
          });
        }),
      };
    }),
    withEffects(({ filter, update }) => ({
      filterEntities: rxEffect<{
        filter: Filter;
        debounce?: number;
        patch?: boolean;
        forceLoad?: boolean;
      }>(debounceFilterPipe(filter, update)),
    }))
  );
  // TODO how do we reset the page to 0 if there is a filter call
}

export function withEntitiesRemoteFilter<Entity, Filter>({
  defaultFilter,
}: {
  defaultFilter: Filter;
}) {
  return signalStoreFeature(
    {
      requires: withLoadEntities<Entity>(),
    },
    withState<{ filter: Filter }>({ filter: defaultFilter }),
    withUpdaters(({ pagination, update }) => ({
      loadEntitiesPage: ({ pageIndex }: { pageIndex: number }) => {
        update({
          pagination: {
            ...pagination(),
            currentPage: pageIndex,
          },
        });
      },
    })),
    withEffects(({ filter, update, setLoading }) => ({
      filterEntities: rxEffect<{
        filter: Filter;
        debounce?: number;
        patch?: boolean;
        forceLoad?: boolean;
      }>(
        pipe(
          debounceFilterPipe(filter, update),
          tap(() => setLoading())
        )
      ),
    }))
  );
}

function debounceFilterPipe<Filter>(
  filter: Signal<Filter>,
  update: SignalStoreUpdateFn<EntitiesFilterState<Filter>>
) {
  return pipe(
    debounce(
      (value: {
        filter: Filter;
        debounce?: number;
        patch?: boolean;
        forceLoad?: boolean;
      }) => (value?.forceLoad ? EMPTY : timer(value.debounce || 300))
    ),
    concatMap((payload) =>
      payload.patch
        ? of({
            ...payload,
            filter: { ...filter?.() },
          })
        : of(payload)
    ),
    distinctUntilChanged(
      (previous, current) =>
        !current?.forceLoad &&
        JSON.stringify(previous?.filter) === JSON.stringify(current?.filter)
    ),
    tap((value) => {
      update({ filter: value.filter });
    })
  );
}

export type EntitiesFilterState<Filter> = { filter: Filter };
