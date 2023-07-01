import {
  signalStoreFeatureFactory,
  withMethods,
  withSignals,
  withState,
} from '@ngrx/signals';
import { Dictionary } from '../../../app/users/call-state';
import { computed, Signal } from '@angular/core';
import { toMap } from './util';
import { signalStoreFeature, type } from '../../signal-store-feature';

export type EntityState<T> = {
  ids: string[] | number[];
  entities: Dictionary<T>;
};

export function withEntities2<Entity>({
  selectId = (entity: Entity) => (entity as any).id,
}: {
  selectId?: (entity: Entity) => string | number;
  // collection?: string; // TODO
} = {}) {
  const initialState: EntityState<Entity> = { entities: {}, ids: [] };
  const entitiesFeature = signalStoreFeatureFactory();
  return entitiesFeature(
    withState<EntityState<Entity>>(initialState),
    withSignals(({ entities, ids }) => {
      return {
        entitiesList: computed(() => {
          const map = entities();
          return ids().map((id) => {
            return map[id]!;
          });
        }),
      };
    }),
    withMethods(({ $update }) => ({
      setAll: (entities: Entity[]) =>
        $update({
          ids: entities.map((e) => selectId(e) as any),
          entities: toMap(entities, selectId),
        }),
    }))
  );
}
export function withEntities<Entity>({
  selectId = (entity: Entity) => (entity as any).id,
}: {
  selectId?: (entity: Entity) => string | number;
  // collection?: string; // TODO
} = {}) {
  const initialState: EntityState<Entity> = { entities: {}, ids: [] };
  return signalStoreFeature(
    // {
    //   input: withState<EntityState<Entity>>(initialState),
    //   // input: {
    //   //   state: type<EntityState<Entity>>(),
    //   //   signals: type<{ z: Signal<number> }>(),
    //   // },
    //   // input: type<{
    //   //   state: EntityState<Entity>;
    //   //   signals: { z: Signal<number> };
    //   // }>(),
    // },
    withState<EntityState<Entity>>(initialState),
    withSignals(({ entities, ids }) => {
      return {
        entitiesList: computed(() => {
          const map = entities();
          return ids().map((id) => {
            return map[id]!;
          });
        }),
      };
    }),
    withMethods(({ $update }) => ({
      setAll: (entities: Entity[]) =>
        $update({
          ids: entities.map((e) => selectId(e) as any),
          entities: toMap(entities, selectId),
        }),
    }))
  );
}
