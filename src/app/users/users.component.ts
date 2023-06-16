import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersStore } from './users.store';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatPaginatorModule,
    MatListModule,
    MatCardModule,
  ],
  template: `
    <mat-card [style]="{margin: '20px'}">
      <mat-card-header>
        <mat-card-title>Users</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <mat-form-field [appearance]="'outline'">
          <mat-label>Search</mat-label>
          <input
            matInput
            placeholder="Name"
            [ngModel]="usersStore.filter().name"
            (ngModelChange)="
          usersStore.filterEntities({ filter: { name: $event } })
        "
          />
        </mat-form-field>

        <span *ngIf="usersStore.loading()">Loading ...</span>

        <mat-list>
          <mat-list-item *ngFor="let user of usersStore.entitiesList()">{{ user?.name }}</mat-list-item>
        </mat-list>

        <mat-paginator
          [pageSize]="usersStore.entitiesPageInfo().pageSize"
          [pageIndex]="usersStore.entitiesPageInfo().pageIndex"
          [length]="usersStore.entitiesPageInfo().total"
          (page)="usersStore.loadEntitiesPage({ pageIndex: $event.pageIndex })"
        />
      </mat-card-content>
    </mat-card>
  `,
})
export class UsersComponent implements OnInit {
  readonly usersStore = inject(UsersStore);
  ngOnInit() {
    // console.log('setAll', this.usersStore.setAll);
  }
}
