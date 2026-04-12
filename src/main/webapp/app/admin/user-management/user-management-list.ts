import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { UserManagementService } from './user-management.service';
import { IUser } from './user-management.model';

@Component({
  standalone: true,
  selector: 'pz-user-mgmt',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2>Gestion des Utilisateurs</h2>
        <a class="btn btn-primary" routerLink="new">
          <span>Créer un utilisateur</span>
        </a>
      </div>

      <table class="table table-striped table-hover">
        <thead>
          <tr>
            <th>ID</th>
            <th>Login</th>
            <th>Email</th>
            <th>Activé</th>
            <th>Rôles</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let user of users">
            <td>{{ user.id }}</td>
            <td>
              <a [routerLink]="[user.login, 'view']">{{ user.login }}</a>
            </td>
            <td>{{ user.email }}</td>
            <td>
              <span class="badge" [class.bg-success]="user.activated" [class.bg-danger]="!user.activated">
                {{ user.activated ? 'Activé' : 'Désactivé' }}
              </span>
            </td>
            <td>
              <span *ngFor="let authority of user.authorities" class="badge bg-info me-1">
                {{ authority }}
              </span>
            </td>
            <td>
              <div class="btn-group">
                <a class="btn btn-sm btn-outline-primary" [routerLink]="[user.login, 'view']">Voir</a>

                <a class="btn btn-sm btn-outline-warning" [routerLink]="[user.login, 'edit']">Éditer</a>

                <button class="btn btn-sm btn-outline-danger" (click)="deleteUser(user)">Supprimer</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
})
export default class UserManagementComponent implements OnInit {
  users: IUser[] = [];

  constructor(private userManagementService: UserManagementService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.userManagementService.query({ page: 0, size: 50, sort: 'id,asc' }).subscribe((res: HttpResponse<IUser[]>) => {
      this.users = res.body ?? [];
    });
  }

  deleteUser(user: IUser): void {
    if (confirm(`Supprimer l'utilisateur ${user.login} ?`)) {
      this.userManagementService.delete(user.login!).subscribe(() => {
        this.loadAll();
      });
    }
  }
}
