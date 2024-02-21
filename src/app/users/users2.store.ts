import {
  getState,
  patchState,
  signalStore,
  signalStoreFeature,
  type,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { effect, inject } from '@angular/core';
import { from, of } from 'rxjs';
import { UsersService } from './users.service';
import { User } from './user.model';
import {
  withEntitiesAndLoadState,
  withEntitiesLoadingCall,
} from '../../lib/features/entities/with-entities-and-load-state';
import {
  withEntitiesLocalFilter,
  withEntitiesRemoteFilter,
} from '../../lib/features/entities/with-entities-filter';
import { withEntitiesLocalPagination } from '../../lib/features/entities/with-entities-local-pagination';
import { withEntitiesRemotePagination } from '../../lib/features/entities/with-entities-remote-pagination';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';
import { withCallStatus } from '../../lib/features/entities/with-call-status';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { getInitialInnerStore } from '@ngrx/signals/src/signal-store';
import { Prettify } from '../../lib';
import {
  withEntitiesLocalSort,
  withEntitiesRemoteSort,
} from '../../lib/features/entities/with-entities-sort';
import { withCallState } from '../shared/call-state.feature';

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

// export const Users2Store = signalStore(
//   { providedIn: 'root' },
//   withLoadEntities<User>(),
//   withEntitiesLocalFilter<User, { name: string }>({
//     defaultFilter: { name: '' },
//     filterFn: (entity, filter) =>
//       !filter?.name ||
//       entity?.name.toLowerCase().includes(filter?.name.toLowerCase()),
//   }),
//   withEntitiesLocalPagination<User>({ pageSize: 5 }),
//   withLoadEntitiesEffect(({}) => from(inject(UsersService).getAll())),
//   withHooks({
//     onInit: ({ loadEntities }) => loadEntities(),
//   })
// );
export const withFaviconFeature = signalStoreFeature(
  withMethods((store, faviconService = inject(UsersService)) => ({
    getAll: () => faviconService.getAll(),
  })),
  withHooks({
    onDestroy:
      (store, faviconService = inject(UsersService)) =>
      () =>
        faviconService.getAll(),
  })
);

export const Users3Store = signalStore(
  { providedIn: 'root' },
  withFaviconFeature,
  withEntitiesAndLoadState<User>(),
  withEntitiesRemoteFilter<User, { name: string }>({
    defaultFilter: { name: '' },
  }),
  withEntitiesRemotePagination<User>({ pageSize: 5 }),
  withEntitiesLoadingCall({
    fetchEntities: ({ filter }) =>
      from(
        inject(UsersService)
          .getAll()
          .then((d) => ({
            entities: d.results,
            total: d.total,
          }))
      ),
  }),
  withMethods((store, faviconService = inject(UsersService)) => ({
    getAll2: () => faviconService.getAll(),
  })),
  withMethods((store, faviconService = inject(UsersService)) => ({
    getAll3: () => faviconService.getAll(),
  })),
  withHooks({
    onInit: ({ loadEntities }) => loadEntities(),
  })
);

// export const Users4Store = signalStore(
//   { providedIn: 'root' },
//   withEntities<User>(),
//   withEntitiesRemoteFilter<User, { name: string }>({
//     defaultFilter: { name: '' },
//   }),
//   withEntitiesRemotePagination<User>({ pageSize: 5 }),
//   withEntitiesOnLoadingCall(({ filter, pagination }) =>
//     from(inject(UsersService).getAll())
//   ),
// );

// const f2 = withEntitiesLocalFilter({
//   entity: type<User>(),
//   collection: 'users',
//   defaultFilter: { name: '' },
//   filterFn: (entity, filter) =>
//     !filter?.name ||
//     entity?.name.toLowerCase().includes(filter?.name.toLowerCase()),
// });
// const f3 = withEntitiesLocalPagination({
//   entity: type<User>(),
//   collection: 'users',
//   pageSize: 5,
// });
// type ExpandRecursively<T> = T extends object
//   ? T extends infer O
//     ? { [K in keyof O]: ExpandRecursively<O[K]> }
//     : never
//   : T;

// type Test1 = ExpandRecursively<{ f: () => 1 }>; // type TestF = { f: {} }
//
// type Normalize<T> = T extends (...args: infer A) => infer R
//   ? (...args: Normalize<A>) => Normalize<R>
//   : T extends any
//   ? { [K in keyof T]: Normalize<T[K]> }
//   : never;
// type tt = Prettify<typeof f3>; // type TestF = { f: {} }
// const entitiesConfig = { entity: type<User>(), collection: 'users' } as const;

export const Users2Store = signalStore(
  { providedIn: 'root' },
  withEntities({ entity: type<User>(), collection: 'users' }),
  withCallStatus({ prop: 'users' }),
  withEntitiesRemoteFilter({
    entity: type<User>(),
    collection: 'users',
    defaultFilter: { name: '' },
  }),
  withEntitiesRemotePagination({
    entity: type<User>(),
    collection: 'users',
    pageSize: 5,
    pagesToCache: 2,
  }),
  withEntitiesRemoteSort({
    entity: type<User>(),
    collection: 'users',
    defaultSort: { field: 'name', direction: 'asc' },
  }),
  withEntitiesLoadingCall({
    collection: 'users',
    fetchEntities: ({ usersFilter, usersPagedRequest, usersSort }) =>
      inject(UsersService)
        .getAll({
          filter: usersFilter().name,
          skip: usersPagedRequest().startIndex,
          take: usersPagedRequest().size,
          sortField: usersSort().field,
          sortDirection: usersSort().direction,
        })
        .then((d) => ({
          entities: d.results,
          total: d.total,
        })),
  }),
  withHooks({
    onInit: (
      {
        usersFilter,
        usersPagedRequest,
        usersSort,
        usersLoading,
        setUsersLoadedResult,
        setUsersLoaded,
        ...store
      },
      usersService = inject(UsersService)
    ) => {
      effect(async () => {
        console.log('state', getState(store));
        if (usersLoading()) {
          const { results, total } = await usersService.getAll({
            filter: usersFilter().name,
            skip: usersPagedRequest().startIndex,
            take: usersPagedRequest().size,
            sortField: usersSort().field,
            sortDirection: usersSort().direction,
          });
          setUsersLoadedResult(results, total);
          setUsersLoaded();
        }
      });
    },
  })
);

// withMethods(
//   (
//     { usersFilter, usersSort, setUsersLoadResult, usersPagedRequest },
//     usersService = inject(UsersService)
//   ) => ({
//     loadData: async () => {
//       console.log({
//         filter: usersFilter().name,
//         skip: usersPagedRequest().startIndex,
//         take: usersPagedRequest().size,
//         sort: usersSort(),
//       });
//       const { results, total } = await usersService.getAll({
//         filter: usersFilter().name,
//         skip: usersPagedRequest().startIndex,
//         take: usersPagedRequest().size,
//         sortField: usersSort().field,
//         sortDirection: usersSort().direction,
//       });
//       setUsersLoadResult(results, total);
//     },
//   })
// ),

// export const Users2Store = signalStore(
//   { providedIn: 'root' },
//   withEntities({ entity: type<User>(), collection: 'users' }),
//   withEntitiesLocalFilter({
//     entity: type<User>(),
//     collection: 'users',
//     defaultFilter: { name: '' },
//     filterFn: (entity, filter) =>
//       !filter?.name ||
//       entity?.name.toLowerCase().includes(filter?.name.toLowerCase()),
//   }),
//
//   // f3,
//   withEntitiesLocalSort({
//     entity: type<User>(),
//     collection: 'users',
//     defaultSort: { field: 'name', direction: 'asc' },
//   }),
//   withEntitiesLocalPagination({
//     entity: type<User>(),
//     collection: 'users',
//     pageSize: 5,
//   }),
//   withCallStatus({ prop: 'users' }),
//   withMethods((store, usersService = inject(UsersService)) => ({
//     loadData: async () => {
//       from(usersService.getAll())
//         .pipe(takeUntilDestroyed())
//         .subscribe((data) => {
//           /// TODO types lost when withEntitiesLocalPagination and withEntitiesLocalFilter are used together
//           patchState(store, setAllEntities(data, { collection: 'users' }));
//         });
//     },
//   })),
//   // withLoadEntitiesEffect(({}) => from(inject(UsersService).getAll())),
//   withHooks({
//     onInit: ({ loadData, ...store }) => {
//       loadData();
//       effect(() => {
//         console.log('state', getState(store));
//       });
//     },
//   })
// );

// const ss = new Users2Store();
// // ss.users2Ids();
// ss.usersFilter();
// ss.filterUsersEntities;
// ss.usersCallStatus();
// ss.usersPagination();
// ss.sor;
// ss.users2Pagination();
// ss['usersPagination']();

// TODO types lost when withEntitiesLocalPagination is inline
//  in the store, when is a variable is ok,
// seems to be related to having to many named traits, moving the pagination trait
// before the filter makes the filter methods disappear

// export const Users3Store = signalStore(
//   { providedIn: 'root' },
//   withEntities({ entity: type<User>() }),
//   withEntitiesLocalFilter({
//     entity: type<User>(),
//     defaultFilter: { name: '' },
//     filterFn: (entity, filter) =>
//       !filter?.name ||
//       entity?.name.toLowerCase().includes(filter?.name.toLowerCase()),
//   }),
//   // f3,
//   withEntitiesLocalPagination({
//     entity: type<User>(),
//     pageSize: 5,
//   }),
//   withCallStatus({ prop: 'users' })
//   // withMethods((store, usersService = inject(UsersService)) => ({
//   //   loadData: async () => {
//   //     from(usersService.getAll())
//   //       .pipe(takeUntilDestroyed())
//   //       .subscribe((data) => {
//   //         /// TODO types lost when withEntitiesLocalPagination and withEntitiesLocalFilter are used together
//   //         patchState(store, setAllEntities(data, { collection: 'users' }));
//   //       });
//   //   },
//   // })),
//   // withLoadEntitiesEffect(({}) => from(inject(UsersService).getAll())),
//   // withHooks({
//   //   onInit: ({ loadData, ...store }) => {
//   //     loadData();
//   //     effect(() => {
//   //       console.log('state', getState(store));
//   //     });
//   //   },
//   // })
// );
// const ss3 = new Users3Store();
// ss3.entitiesPageInfo;
