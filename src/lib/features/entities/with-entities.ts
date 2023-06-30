import { withComputed, withState, withUpdaters } from '@ngrx/signals';
import { Dictionary } from '../../../app/users/call-state';
import { signalStoreFeature } from '../../signal-store';
import { computed } from '@angular/core';
import { toMap } from './util';

export interface EntityState<T> {
  ids: string[] | number[];
  entities: Dictionary<T>;
}
export function withEntities<Entity>({
  selectId = (entity: Entity) => (entity as any).id,
}: {
  selectId?: (entity: Entity) => string | number;
  // collection?: string; // TODO
} = {}) {
  const initialState: EntityState<Entity> = { entities: {}, ids: [] };
  return signalStoreFeature(
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
          ids: entities.map((e) => selectId(e) as any),
          entities: toMap(entities, selectId),
        }),
    }))
  );
}
