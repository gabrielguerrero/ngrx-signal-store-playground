import { signalStoreFeature } from '../../lib/signal-store';
import { withState } from '@ngrx/signals';
import { withLoadEntities } from './load-entities';

export function withLocalFilterEntities<
  Entity extends { id: string | number },
  Filter
>({
  filterFn,
  defaultValue,
}: {
  filterFn: (filter: Filter, entity: Entity) => boolean;
  defaultValue?: Filter;
}) {
  return signalStoreFeature(
    {
      requires: withLoadEntities<Entity>(),
    },
    withState<{ filter?: Filter }>({ filter: defaultValue })
  );
}
