import {
  withState,
  withMethods,
  withComputed,
  type,
  signalStoreFeature,
  patchState,
} from '@ngrx/signals';
import { withLoadEntities } from './with-load-entities';
// import { EntityState, withEntities } from './with-entities';
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
import {
  NotAllowedStateCheck,
  SignalState,
  SignalStateUpdate,
} from '../../signal-state-models';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { withEntities } from '@ngrx/signals/entities';
import { StateSignal } from '@ngrx/signals/src/state-signal';

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
  const withEntities1 = withEntities<Entity>({ entity: type<Entity>() });
  return signalStoreFeature(
    type<ReturnType<typeof withEntities1>>(),
    withState<{ filter: Filter }>({ filter: defaultFilter }),
    // withEntities({ entity: type<Entity>() }),
    withComputed(({ entities, filter }) => {
      return {
        entities: computed(() => {
          return entities().filter((entity) => {
            return filterFn(entity, filter());
          });
        }),
      };
    }),
    withMethods(({ filter, ...store }) => ({
      filterEntities: rxMethod<{
        filter: Filter;
        debounce?: number;
        patch?: boolean;
        forceLoad?: boolean;
      }>(debounceFilterPipe(filter, store)),
    }))
  );
  // TODO how do we reset the page to 0 if there is a filter call
}

export function withEntitiesRemoteFilter<
  Entity extends { id: string | number },
  Filter extends Record<string, unknown>
>({ defaultFilter }: { defaultFilter: Filter & NotAllowedStateCheck<Filter> }) {
  const withEntities1 = withLoadEntities<Entity>();
  return signalStoreFeature(
    type<ReturnType<typeof withEntities1>>(),
    withState<{ filter: Filter }>({ filter: defaultFilter }),
    withMethods(({ setLoading, filter, ...store }) => ({
      filterEntities: rxMethod<{
        filter: Filter;
        debounce?: number;
        patch?: boolean;
        forceLoad?: boolean;
      }>(
        pipe(
          debounceFilterPipe(filter, store),
          tap(() => setLoading())
        )
      ),
    }))
  );
}

function debounceFilterPipe<Filter>(
  filter: Signal<Filter>,
  store: StateSignal<EntitiesFilterState<Filter>>
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
      patchState(store, { filter: value.filter });
    })
  );
}

export type EntitiesFilterState<Filter> = { filter: Filter };
