import {
  withEffects,
  rxEffect,
  withState,
  withComputed,
  withUpdaters,
} from '@ngrx/signals';

import { EntityState, setLoading, withCallState } from './call-state';
import { exhaustMap, Observable, pipe, tap } from 'rxjs';
import { signalStoreFeature } from '../../lib/signal-store';
import { computed } from '@angular/core';

export function withLoadEntities<Entity extends { id: string | number }>(
  getAll: () => Observable<Entity[]> // or: Promise<Entity[]>
) {
  const initialState: EntityState<Entity> = { entities: {}, ids: [] };
  return signalStoreFeature(
    withCallState(),
    withState<EntityState<Entity>>(initialState),
    withComputed(({ entities, ids }) => {
      return {
        entitiesList: computed(() => {
          const map = entities();
          return ids().map((id) => {
            return map[id]!;
          });
        }),
      };
    }),
    withUpdaters(({ update }) => ({
      setAll: (entities: Entity[]) =>
        update({
          ids: entities.map((e) => e.id as any),
          entities: toMap(entities),
        }),
    })),
    withEffects(({ setLoaded, setAll }) => ({
      loadEntities: rxEffect<void>(
        pipe(
          tap(() => setLoading()),
          exhaustMap(() => getAll()),
          tap((entities) => {
            setAll(entities);
            setLoaded();
          })
        )
      ),
    }))
  );
}

export function toMap<T extends { id: string | number }>(
  a: Array<T>,
  selectId: (item: T) => string | number = (item) => item.id
) {
  return a.reduce((acum: { [key: string]: T }, value) => {
    acum[selectId(value)] = value;
    return acum;
  }, {}) as { [key: string]: T };
}
