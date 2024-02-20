import { inject, Injectable } from '@angular/core';
import { delay, lastValueFrom, Observable, of } from 'rxjs';
import { User } from './user.model';
import { Filter } from '../shared/filter.feature';
import { HttpClient } from '@angular/common/http';

const usersMock: User[] = [
  { id: 1, name: 'Alex' },
  { id: 2, name: 'Brandon' },
  { id: 3, name: 'Marko' },
  { id: 4, name: 'Mike' },
  { id: 5, name: 'Tim' },
  { id: 6, name: 'Gabs' },
  { id: 7, name: 'Minko' },
  { id: 8, name: 'Jeremy' },
  { id: 9, name: 'Mike' },
];

@Injectable({ providedIn: 'root' })
export class UsersService {
  client = inject(HttpClient);
  getAll({
    filter,
    take,
    skip,
    sortField,
    sortDirection,
  }: {
    filter?: string;
    take?: number;
    skip?: number;
    sortField?: string;
    sortDirection?: 'asc' | 'desc' | '';
  } = {}) {
    return lastValueFrom(
      this.client.get<{ results: User[]; total: number }>(
        `http://localhost:3333/products?search=${filter}&take=${take}&skip=${skip}&sortField=${sortField}&sortDirection=${sortDirection}`
      )
    );
  }

  getByFilter(filter: Filter): Observable<User[]> {
    const filteredUsers = usersMock
      .filter(({ name }) =>
        name.toLowerCase().includes(filter.query.toLowerCase())
      )
      .slice(0, filter.pageSize);

    return of(filteredUsers).pipe(delay(1000));
  }
}
