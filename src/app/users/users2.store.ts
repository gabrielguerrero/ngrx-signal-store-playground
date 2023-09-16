import { signalStore, withHooks, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { from } from 'rxjs';
import { UsersService } from './users.service';
import { User } from './user.model';
import {
  withLoadEntities,
  withLoadEntitiesEffect,
} from '../../lib/features/entities/with-load-entities';
import {
  withEntitiesLocalFilter,
  withEntitiesRemoteFilter,
} from '../../lib/features/entities/with-entities-filter';
import { withEntitiesLocalPagination } from '../../lib/features/entities/with-entities-local-pagination';
import { withEntitiesRemotePagination } from '../../lib/features/entities/with-entities-remote-pagination';

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

export const Users2Store = signalStore(
  { providedIn: 'root' },
  withLoadEntities<User>(),
  withEntitiesLocalFilter<User, { name: string }>({
    defaultFilter: { name: '' },
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

export const Users3Store = signalStore(
  { providedIn: 'root' },
  withLoadEntities<User>(),
  withEntitiesRemoteFilter<User, { name: string }>({
    defaultFilter: { name: '' },
  }),
  withEntitiesRemotePagination<User>({ pageSize: 5 }),
  withLoadEntitiesEffect(({ filter, pagination }) =>
    from(inject(UsersService).getAll())
  ),
  withHooks({
    onInit: ({ loadEntities }) => loadEntities(),
  })
);
