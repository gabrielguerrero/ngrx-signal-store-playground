import {
  rxEffect,
  withState,
  withMethods,
  signalStoreFeatureFactory,
  withSignals,
} from '@ngrx/signals';
import { withLoadEntities } from './with-load-entities';
import { EntityState, withEntities } from './with-entities';
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
import { SignalStateUpdate } from '../../signal-state-update';

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
  const withEntities1 = withEntities<Entity>();
  const filterFeature =
    signalStoreFeatureFactory<ReturnType<typeof withEntities1>>();
  return filterFeature(
    withState<{ filter: Filter }>({ filter: defaultFilter }),
    withSignals(({ entitiesList, filter }) => {
      return {
        entitiesList: computed(() => {
          return entitiesList().filter((entity) => {
            return filterFn(entity, filter?.());
          });
        }),
      };
    }),
    withMethods(({ filter, $update }) => ({
      filterEntities: rxEffect<{
        filter: Filter;
        debounce?: number;
        patch?: boolean;
        forceLoad?: boolean;
      }>(debounceFilterPipe(filter, $update)),
    }))
  );
  // TODO how do we reset the page to 0 if there is a filter call
}

export function withEntitiesRemoteFilter<Entity, Filter>({
  defaultFilter,
}: {
  defaultFilter: Filter;
}) {
  const withEntities1 = withLoadEntities<Entity>();
  const filterFeature =
    signalStoreFeatureFactory<ReturnType<typeof withEntities1>>();
  return filterFeature(
    withState<{ filter: Filter }>({ filter: defaultFilter }),
    withMethods(({ $update, setLoading, filter }) => ({
      filterEntities: rxEffect<{
        filter: Filter;
        debounce?: number;
        patch?: boolean;
        forceLoad?: boolean;
      }>(
        pipe(
          debounceFilterPipe(filter, $update),
          tap(() => setLoading())
        )
      ),
    }))
  );
}

function debounceFilterPipe<Filter>(
  filter: Signal<Filter>,
  update: SignalStateUpdate<EntitiesFilterState<Filter>>['$update']
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
