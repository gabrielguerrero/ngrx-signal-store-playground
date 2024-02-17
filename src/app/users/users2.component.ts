import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// import { UsersStore } from './users.store';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { Users2Store } from './users2.store';
import { signalStore, withState, type } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatPaginatorModule,
    MatListModule,
    MatCardModule,
    MatTable,
    MatSort,
    MatSortHeader,
    MatHeaderCell,
    MatCell,
    MatColumnDef,
    MatHeaderRow,
    MatRow,
    MatRowDef,
    MatHeaderRowDef,
    MatCellDef,
    MatHeaderCellDef,
    MatProgressSpinner,
  ],
  template: `
    <mat-card [style]="{ margin: '20px' }">
      <mat-card-header>
        <mat-card-title>Users</mat-card-title>
      </mat-card-header>
      <mat-card-content>
                    <mat-form-field [appearance]="'outline'">
                      <mat-label>Search</mat-label>
                      <input
                        matInput
                        placeholder="Name"
                        [ngModel]="usersStore.usersFilter().name"
                        (ngModelChange)="
                      usersStore.filterUsersEntities({ filter: { name: $event } })
                    "
                      />
                    </mat-form-field>

        @if (usersStore.usersLoading()) {
         <mat-spinner/>
        } @else {
        <table
          mat-table
          style="width: 100%"
          [dataSource]=" usersStore.usersCurrentPage().entities"
          matSort
          [matSortActive]="usersStore.usersSort().current.field"
          [matSortDirection]="usersStore.usersSort().current.direction"
          (matSortChange)="usersStore.sortUsersEntities({sort:{field: $event.active.toString(), direction: $event.direction}})"
        >
          <ng-container matColumnDef="id">
            <th mat-header-cell mat-sort-header *matHeaderCellDef>Id</th>
            <td mat-cell *matCellDef="let row">{{ row.id }}</td>
          </ng-container>
          <ng-container matColumnDef="name">
            <th mat-header-cell mat-sort-header *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let row">{{ row.name }}</td>
          </ng-container>


          <tr
            mat-header-row
            *matHeaderRowDef="displayedColumns; sticky: true"
          ></tr>
<!--          <tr-->
<!--            mat-row-->
<!--            *matRowDef="let row; columns: displayedColumns"-->
<!--            [class.selected]="selectedProduct?.id === row.id"-->
<!--            (click)="selectProduct.emit(row)"-->
<!--          ></tr>-->
          <tr
            mat-row
            *matRowDef="let row; columns: displayedColumns"
          ></tr>
        </table>
<!--        <mat-list>-->
<!--          <mat-list-item *ngFor="let user of usersStore.usersCurrentPage().entities">{{-->
<!--              user?.name-->
<!--            }}</mat-list-item>-->
<!--        </mat-list>-->

        <mat-paginator
          [pageSize]="usersStore.usersCurrentPage().pageSize"
          [pageIndex]="usersStore.usersCurrentPage().pageIndex"
          [length]="usersStore.usersCurrentPage().total"
          (page)="usersStore.loadUsersPage({ pageIndex: $event.pageIndex })"
        />
        }
      </mat-card-content>
    </mat-card>
  `,
})
export class Users2Component implements OnInit {
  readonly usersStore = inject(Users2Store);
  displayedColumns = ['id', 'name'];
  filter = signal({
    filter: {
      name: 'wewe',
    },
  });
  // readonly usersStore2 = inject(TestStore);
  ngOnInit() {
    this.usersStore.filterUsersEntities(this.filter());
    console.log('usersStore', this.usersStore);
    // this.usersStore.
    // this.usersStore.
    // console.log('setAll', this.usersStore.setAll);
  }
}
