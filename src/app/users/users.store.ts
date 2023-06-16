import {
  rxEffect,
  signalStore,
  SignalStoreUpdate,
  withComputed,
  withEffects,
  withHooks,
  withState,
} from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { debounceTime, from, map, of, pipe, switchMap, tap } from 'rxjs';
import { UsersService } from './users.service';
import { User } from './user.model';
import {
  withLoadEntities,
  withLoadEntitiesEffect,
} from '../../lib/features/entities/with-load-entities';
import { withEntitiesLocalFilter } from '../../lib/features/entities/with-entities-filter';
import { withEntitiesLocalPagination } from '../../lib/features/entities/with-entities-local-pagination';

type UsersState = {
  users: User[];
  loading: boolean;
  query: string;
  pageSize: number;
};

const initialState: UsersState = {
  users: [],
  loading: false,
  query: '',
  pageSize: 5,
};

export const UsersStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withLoadEntities<User>(),
  withEntitiesLocalFilter<User, { name?: string }>({
    defaultFilter: {},
    filterFn: (entity, filter) =>
      !filter?.name ||
      entity?.name.toLowerCase().includes(filter?.name.toLowerCase()),
  }),
  withEntitiesLocalPagination<User>({ pageSize: 5 }),
  withLoadEntitiesEffect(({}) => from(inject(UsersService).getAll())),
  withHooks({
    onInit: ({ loadEntities }) => loadEntities(),
  })
);
