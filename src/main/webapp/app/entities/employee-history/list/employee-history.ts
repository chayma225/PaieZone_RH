import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap/pagination';
import { RouterLink } from '@angular/router';
import { debounceTime, Subject } from 'rxjs';

import { EmployeeHistoryService } from '../service/employee-history.service';
import { IEmployeeHistory } from '../employee-history.model';
import { DepartmentService } from 'app/entities/department/service/department.service';
import { JobPositionService } from 'app/entities/job-position/service/job-position.service';
import { IDepartment } from 'app/entities/department/department.model';
import { IJobPosition } from 'app/entities/job-position/job-position.model';
import { Alert } from 'app/shared/alert/alert';
import { AlertError } from 'app/shared/alert/alert-error';

const FIELD_LABELS: Record<string, string> = {
  firstName: 'Prénom',
  lastName: 'Nom',
  firstNameAr: 'Prénom (Ar)',
  lastNameAr: 'Nom (Ar)',
  matricule: 'Matricule',
  nationalId: 'CIN',
  category: 'Catégorie',
  department: 'Département',
  position: 'Poste',
  active: 'Statut actif',
  maritalStatus: 'État civil',
  address: 'Adresse',
  city: 'Ville',
  phoneNumber: 'Téléphone',
  personalEmail: 'Email perso',
  professionalEmail: 'Email pro',
  numberOfChildren: 'Nb Enfants',
};

@Component({
  selector: 'pz-employee-history',
  templateUrl: './employee-history.html',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, NgbPagination, RouterLink, Alert, AlertError],
})
export class EmployeeHistoryComponent implements OnInit {
  histories = signal<IEmployeeHistory[]>([]);
  departments = signal<IDepartment[]>([]);
  positions = signal<IJobPosition[]>([]);
  totalItems = signal(0);
  page = signal(1);
  itemsPerPage = signal(20);

  // Filtres
  filters = {
    firstName: '' as string | null,
    lastName: '' as string | null,
    departmentId: null as number | null,
    positionId: null as number | null,
    fieldName: null as string | null,
  };

  private filterChanged$ = new Subject<void>();

  private readonly historyService = inject(EmployeeHistoryService);
  private readonly departmentService = inject(DepartmentService);
  private readonly jobPositionService = inject(JobPositionService);

  ngOnInit(): void {
    this.filterChanged$.pipe(debounceTime(400)).subscribe(() => {
      this.page.set(1);
      this.loadHistories();
    });

    this.loadHistories();
    this.loadDepartments();
    this.loadPositions();
  }

  applyFilters(): void {
    this.filterChanged$.next();
  }

  resetFilters(): void {
    this.filters = {
      firstName: null,
      lastName: null,
      departmentId: null,
      positionId: null,
      fieldName: null,
    };
    this.page.set(1);
    this.loadHistories();
  }

  navigateToPage(p: number): void {
    this.page.set(p);
    this.loadHistories();
  }

  getFieldLabel(field: string | null | undefined): string {
    return field ? (FIELD_LABELS[field] ?? field) : '—';
  }

  formatValue(fieldName: string | null | undefined, value: string | null | undefined): string {
    if (!value || value === 'vide') return '—';

    // 1. Statut Actif (Boolean)
    if (fieldName === 'active') {
      return value === 'true' ? 'Activé' : 'Désactivé';
    }

    // 2. État Civil (Traduction de l'Enum)
    if (fieldName === 'maritalStatus') {
      const labels: Record<string, string> = {
        SINGLE: 'Célibataire',
        MARRIED: 'Marié(e)',
        DIVORCED: 'Divorcé(e)',
        WIDOWED: 'Veuf/Veuve',
      };
      return labels[value] ?? value;
    }

    // 3. Département (Recherche par ID)
    if (fieldName === 'department') {
      const dept = this.departments().find(d => String(d.id) === String(value));
      return dept ? (dept.name ?? value) : value;
    }

    // 4. Poste (Recherche par ID)
    if (fieldName === 'position') {
      const pos = this.positions().find(p => String(p.id) === String(value));
      return pos ? (pos.title ?? value) : value;
    }

    return value;
  }

  private loadHistories(): void {
    const params: any = {
      page: this.page() - 1,
      size: this.itemsPerPage(),
      sort: 'changedAt,desc',
    };

    if (this.filters.firstName?.trim()) params['firstName'] = this.filters.firstName.trim();
    if (this.filters.lastName?.trim()) params['lastName'] = this.filters.lastName.trim();
    if (this.filters.departmentId) params['departmentId'] = this.filters.departmentId;
    if (this.filters.positionId) params['positionId'] = this.filters.positionId;
    if (this.filters.fieldName) params['fieldName'] = this.filters.fieldName;

    this.historyService.query(params).subscribe((res: HttpResponse<IEmployeeHistory[]>) => {
      this.histories.set(res.body ?? []);
      this.totalItems.set(Number(res.headers.get('X-Total-Count') ?? 0));
    });
  }

  private loadDepartments(): void {
    this.departmentService.query({ size: 200 }).subscribe((res: HttpResponse<IDepartment[]>) => this.departments.set(res.body ?? []));
  }

  private loadPositions(): void {
    this.jobPositionService.query({ size: 200 }).subscribe((res: HttpResponse<IJobPosition[]>) => this.positions.set(res.body ?? []));
  }
}
