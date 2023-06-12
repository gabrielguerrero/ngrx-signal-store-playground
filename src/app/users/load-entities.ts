import {
  withEffects,
  rxEffect,
  withState,
  withComputed,
  withUpdaters,
} from '@ngrx/signals';

import {
  CallState,
  EntityState,
  setLoading,
  withCallState,
} from './call-state';
import { exhaustMap, Observable, pipe, tap } from 'rxjs';
import { signalStoreFeature } from '../../lib/signal-store';
import { computed, Signal } from '@angular/core';

export function withLoadEntities<Entity extends { id: string | number }>() {
  // getAll: () => Observable<Entity[]> // or: Promise<Entity[]>
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
    }))
    // withEffects(({ setLoaded, setAll }) => ({
    //   loadEntities: rxEffect<void>(
    //     pipe(
    //       tap(() => setLoading()),
    //       exhaustMap(() => getAll()),
    //       tap((entities) => {
    //         setAll(entities);
    //         setLoaded();
    //       })
    //     )
    //   ),
    // }))
  );
}

export function withLoadEntitiesEffect<
  Entity extends { id: string | number }
  // State extends Record<string, Signal<any>>,
  // Computed extends Record<string, Signal<any>>,
  // Updaters extends Record<string, (...args: any[]) => void>,
  // PreviousEffects extends Record<string, (...args: any[]) => any>,
  // Effects extends Record<string, (...args: any[]) => any>
>(
  getAll: () => Observable<Entity[]> // or: Promise<Entity[]>
) {
  // const initialState: EntityState<Entity> = { entities: {}, ids: [] };
  //   <{
  //   state: EntityState<Entity> & { callState: CallState },
  //   computed?: {};
  //   updaters?: {};
  //   effects?: {};
  // }>
  // type S = ReturnType<ReturnType<typeof withLoadEntities>>;
  // const s = {} as S;
  // type x = typeof withState<EntityState<Entity>>(initialState);
  // s.state.entities;
  var signalStoreFeature1 = signalStoreFeature(
    // withCallState(),
    // withState<EntityState<Entity>>(initialState),
    // withComputed(({ entities, ids }) => {
    //   return {
    //     entitiesList: computed(() => {
    //       const map = entities();
    //       return ids().map((id) => {
    //         return map[id]!;
    //       });
    //     }),
    //   };
    // }),
    // withUpdaters(({ update }) => ({
    //   setAll: (entities: Entity[]) =>
    //     update({
    //       ids: entities.map((e) => e.id as any),
    //       entities: toMap(entities),
    //     }),
    // })),
    // withLoadEntities<Entity>(),
    // noopFeature(withLoadEntities<Entity>()),
    withEffects(({ setAll, setLoaded }) => ({
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
    })),
    {
      requires: withLoadEntities<Entity>(),
    }
  );
  return signalStoreFeature1;
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
