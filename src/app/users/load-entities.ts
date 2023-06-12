import {
  withEffects,
  rxEffect,
  withState,
  withComputed,
  withUpdaters,
  SignalStoreUpdate,
} from '@ngrx/signals';

import { EntityState, setLoading, withCallState } from './call-state';
import { exhaustMap, Observable, pipe, tap } from 'rxjs';
import { signalStoreFeature } from '../../lib/signal-store';
import { computed, Signal } from '@angular/core';
import { SignalState, StaticState } from '../../lib/models';

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
  State extends Record<string, Signal<any>>,
  Computed extends Record<string, Signal<any>>,
  Updaters extends Record<string, (...args: any[]) => void>,
  PreviousEffects extends Record<string, (...args: any[]) => any>,
  Entity extends { id: string | number }
>(
  getAll: (
    input: State &
      Computed &
      Updaters &
      PreviousEffects &
      SignalStoreUpdate<StaticState<State>>
  ) => Observable<Entity[]> // or: Promise<Entity[]>
) {
  return (
    feature: {
      state: State;
      computed: Computed;
      updaters: Updaters;
      effects: PreviousEffects;
    } & SignalStoreUpdate<StaticState<State>>
  ) =>
    // We could have not use signalStoreFeature to implement this hook and use the feature param types to restrict the
    // use and unsure a withLoadEntities is before but the type will be more complicated
    signalStoreFeature(
      {
        requires: withLoadEntities<Entity>(),
      },
      withEffects(({ setAll, setLoaded }) => ({
        loadEntities: rxEffect<void>(
          pipe(
            tap(() => setLoading()),
            exhaustMap(() =>
              getAll({
                ...feature.state,
                ...feature.computed,
                ...feature.updaters,
                ...feature.effects,
                update: feature.update,
              })
            ),
            tap((entities) => {
              setAll(entities);
              setLoaded();
            })
          )
        ),
      }))
    )(feature as any);
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
