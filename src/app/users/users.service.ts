import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { User } from './user.model';
import { Filter } from '../shared/filter.feature';

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
  getAll(): Promise<User[]> {
    console.log('calling fetch users');
    return new Promise((resolve) => {
      setTimeout(() => resolve(usersMock), 1000);
    });
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
