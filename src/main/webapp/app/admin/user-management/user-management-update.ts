import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserManagementService } from './user-management.service';
import { IUser, User } from './user-management.model';

@Component({
  standalone: true,
  selector: 'pz-user-mgmt-update',
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container">
      <h2>{{ isNew ? 'Créer' : 'Modifier' }} un utilisateur</h2>

      <form (ngSubmit)="save()">
        <div class="mb-3">
          <label class="form-label">Login *</label>
          <input type="text" class="form-control" [(ngModel)]="user.login" name="login" required [disabled]="!isNew" />
        </div>

        <div class="mb-3">
          <label class="form-label">Prénom</label>
          <input type="text" class="form-control" [(ngModel)]="user.firstName" name="firstName" />
        </div>

        <div class="mb-3">
          <label class="form-label">Nom</label>
          <input type="text" class="form-control" [(ngModel)]="user.lastName" name="lastName" />
        </div>

        <div class="mb-3">
          <label class="form-label">Email *</label>
          <input type="email" class="form-control" [(ngModel)]="user.email" name="email" required />
        </div>

        <div class="mb-3 form-check">
          <input type="checkbox" class="form-check-input" [(ngModel)]="user.activated" name="activated" id="activated" />
          <label class="form-check-label" for="activated">Activé</label>
        </div>

        <div class="mb-3">
          <label class="form-label">Langue</label>
          <select class="form-select" [(ngModel)]="user.langKey" name="langKey">
            <option value="fr">Français</option>
            <option value="ar-ly">العربية</option>
          </select>
        </div>

        <div class="mb-3">
          <label class="form-label">Rôle</label>
          <div *ngFor="let authority of allAuthorities" class="form-check">
            <input
              type="checkbox"
              class="form-check-input"
              [id]="authority"
              [value]="authority"
              [checked]="hasAuthority(authority)"
              (change)="toggleAuthority(authority, $event)"
            />
            <label class="form-check-label" [for]="authority">
              {{ authority }}
            </label>
          </div>
        </div>

        <div class="d-flex gap-2">
          <button type="submit" class="btn btn-primary">Sauvegarder</button>
          <a class="btn btn-secondary" routerLink="/admin/user-management">Annuler</a>
        </div>
      </form>
    </div>
  `,
})
export default class UserManagementUpdateComponent implements OnInit {
  user: IUser = new User();
  isNew = true;

  // ← Tous nos rôles métier ici
  allAuthorities: string[] = ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_RH_COMPTABLE', 'ROLE_MANAGER', 'ROLE_EMPLOYE', 'ROLE_USER'];

  constructor(
    private userManagementService: UserManagementService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const login = this.route.snapshot.paramMap.get('login');
    if (login) {
      this.isNew = false;
      this.userManagementService.find(login).subscribe(user => {
        this.user = user;
      });
    } else {
      this.user = new User();
      this.user.activated = true;
      this.user.langKey = 'fr';
      this.user.authorities = ['ROLE_USER'];
    }
  }

  hasAuthority(authority: string): boolean {
    return this.user.authorities?.includes(authority) ?? false;
  }

  toggleAuthority(authority: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (!this.user.authorities) this.user.authorities = [];

    if (checked) {
      this.user.authorities = [...this.user.authorities, authority];
    } else {
      this.user.authorities = this.user.authorities.filter(a => a !== authority);
    }
  }

  save(): void {
    if (this.isNew) {
      this.userManagementService.create(this.user).subscribe(() => {
        this.router.navigate(['/admin/user-management']);
      });
    } else {
      this.userManagementService.update(this.user).subscribe(() => {
        this.router.navigate(['/admin/user-management']);
      });
    }
  }
}
