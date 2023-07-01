import { Route } from '@angular/router';
import { CounterComponent } from './counter/counter.component';
import { UsersComponent } from './users/users.component';
import { TodosComponent } from './todos/todos.component';
import { Users2Component } from './users/users2.component';

export const appRoutes: Route[] = [
  { path: '', redirectTo: '/counter', pathMatch: 'full' },
  { path: 'counter', component: CounterComponent },
  { path: 'users', component: UsersComponent },
  { path: 'users2', component: Users2Component },
  { path: 'todos', component: TodosComponent },
];
