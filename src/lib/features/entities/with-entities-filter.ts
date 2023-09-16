import {
  rxMethod,
  withState,
  withMethods,
  withSignals,
  type,
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
import { signalStoreFeature } from '../../signal-store-feature';
import {
  NotAllowedStateCheck,
  SignalStateUpdate,
} from '../../signal-state-models';

export function withEntitiesLocalFilter<
  Entity extends { id: string | number },
  Filter extends Record<string, unknown>
>({
  filterFn,
  defaultFilter,
}: {
  filterFn: (entity: Entity, filter?: Filter) => boolean;
  defaultFilter: Filter & NotAllowedStateCheck<Filter>;
}) {
  // TODO throw error if pagination trait is present before this one
  const withEntities1 = withEntities<Entity>();
  return signalStoreFeature(
    type<ReturnType<typeof withEntities1>>(),
    withState<{ filter: Filter }>({ filter: defaultFilter }),
    withSignals(({ entitiesList, filter }) => {
      return {
        entitiesList: computed(() => {
          return entitiesList().filter((entity) => {
            return filterFn(entity, filter());
          });
        }),
      };
    }),
    withMethods(({ filter, $update }) => ({
      filterEntities: rxMethod<{
        filter: Filter;
        debounce?: number;
        patch?: boolean;
        forceLoad?: boolean;
      }>(debounceFilterPipe(filter, $update)),
    }))
  );
  // TODO how do we reset the page to 0 if there is a filter call
}

export function withEntitiesRemoteFilter<
  Entity,
  Filter extends Record<string, unknown>
>({ defaultFilter }: { defaultFilter: Filter & NotAllowedStateCheck<Filter> }) {
  const withEntities1 = withLoadEntities<Entity>();
  return signalStoreFeature(
    type<ReturnType<typeof withEntities1>>(),
    withState<{ filter: Filter }>({ filter: defaultFilter }),
    withMethods(({ $update, setLoading, filter }) => ({
      filterEntities: rxMethod<{
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
