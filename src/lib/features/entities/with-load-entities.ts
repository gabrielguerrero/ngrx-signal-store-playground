import {
  rxEffect,
  SignalStoreUpdate,
  withEffects,
  withUpdaters,
} from '@ngrx/signals';

import {
  EntityState,
  setLoading,
  withCallState,
} from '../../../app/users/call-state';
import { exhaustMap, Observable, pipe, tap } from 'rxjs';
import { signalStoreFeature } from '../../signal-store';
import { Signal } from '@angular/core';
import { StaticState } from '../../models';
import { withEntities } from './with-entities';

export function withLoadEntities<Entity>() {
  // getAll: () => Observable<Entity[]> // or: Promise<Entity[]>
  const initialState: EntityState<Entity> = { entities: {}, ids: [] };
  return signalStoreFeature(
    withCallState(),
    withEntities<Entity>(),
    withUpdaters(({ update, setAll }) => ({
      setResult: (entities: Entity[]) => setAll(entities),
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
