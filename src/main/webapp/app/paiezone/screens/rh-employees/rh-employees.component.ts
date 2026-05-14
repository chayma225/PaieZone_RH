import { Component, ChangeDetectionStrategy, inject, signal, computed, viewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import IconComponent from '../../core/icon/icon.component';
import { DataService } from '../../core/data.service';
import { ApiService } from '../../core/api.service';
import type { Employee } from '../../core/types';

interface DocItem {
  id: number;
  name: string;
  type: string;
  size: string;
  date: string;
  icon: string;
  isNew?: boolean;
}

interface UploadingItem {
  id: number;
  name: string;
  size: number;
  progress: number;
}

@Component({
  selector: 'pz-rh-employees',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './rh-employees.component.html',
  styleUrl: './rh-employees.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RhEmployeesComponent {
  protected readonly data = inject(DataService);
  protected readonly api = inject(ApiService);

  protected readonly dept = signal('Tous');
  protected readonly searchQ = signal('');
  protected readonly depts = computed(() => [
    'Tous',
    ...new Set(
      this.data
        .employees()
        .map(e => e.dept)
        .filter(Boolean),
    ),
  ]);

  protected readonly filtered = computed(() => {
    const d = this.dept();
    const q = this.searchQ().toLowerCase().trim();
    return this.data.employees().filter(e => {
      if (d !== 'Tous' && e.dept !== d) return false;
      if (q && !this.data.fullName(e).toLowerCase().includes(q) && !e.matricule.toLowerCase().includes(q)) return false;
      return true;
    });
  });

  protected readonly selected = signal<Employee | null>(null);
  protected readonly tab = signal<'infos' | 'contract' | 'docs' | 'pay'>('infos');

  // ── Nouvel employé modal ──────────────────────────────────────────────────
  protected readonly showCreate = signal(false);
  protected readonly busy = signal(false);
  protected readonly errMsg = signal('');

  protected createForm = {
    matricule: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    gender: 'MALE',
    maritalStatus: 'SINGLE',
    numberOfChildren: 0,
    chefDeFamille: false,
    nationalId: '',
    hireDate: '',
    category: 'EMPLOYEE',
    departmentId: '',
    positionTitle: '',
    professionalEmail: '',
    phoneNumber: '',
    city: '',
    cnssNumber: '',
  };

  protected readonly genders = [
    { value: 'MALE', label: 'Homme' },
    { value: 'FEMALE', label: 'Femme' },
  ];

  protected readonly maritalStatuses = [
    { value: 'SINGLE', label: 'Célibataire' },
    { value: 'MARRIED', label: 'Marié(e)' },
    { value: 'DIVORCED', label: 'Divorcé(e)' },
    { value: 'WIDOWED', label: 'Veuf / Veuve' },
  ];

  protected readonly categories = [
    { value: 'EMPLOYEE', label: 'Employé' },
    { value: 'WORKER', label: 'Ouvrier' },
    { value: 'TECHNICIAN', label: 'Technicien' },
    { value: 'SUPERVISOR', label: 'Agent de maîtrise' },
    { value: 'MANAGER', label: 'Cadre' },
    { value: 'EXECUTIVE', label: 'Cadre supérieur' },
    { value: 'DIRECTOR', label: 'Directeur' },
  ];

  openCreate(): void {
    this.createForm = {
      matricule: '',
      firstName: '',
      lastName: '',
      birthDate: '',
      gender: 'MALE',
      maritalStatus: 'SINGLE',
      numberOfChildren: 0,
      chefDeFamille: false,
      nationalId: '',
      hireDate: '',
      category: 'EMPLOYEE',
      departmentId: '',
      positionTitle: '',
      professionalEmail: '',
      phoneNumber: '',
      city: '',
      cnssNumber: '',
    };
    this.errMsg.set('');
    this.showCreate.set(true);
  }

  closeCreate(): void {
    this.showCreate.set(false);
  }

  submitCreate(): void {
    const f = this.createForm;
    if (!f.matricule.trim() || !f.firstName.trim() || !f.lastName.trim() || !f.birthDate || !f.nationalId.trim() || !f.hireDate) {
      this.errMsg.set('Veuillez remplir tous les champs obligatoires (*).');
      return;
    }
    this.busy.set(true);
    this.errMsg.set('');
    const body: Record<string, any> = {
      matricule: f.matricule.trim(),
      firstName: f.firstName.trim(),
      lastName: f.lastName.trim(),
      birthDate: f.birthDate,
      gender: f.gender,
      maritalStatus: f.maritalStatus,
      numberOfChildren: f.numberOfChildren,
      chefDeFamille: f.chefDeFamille,
      nationalId: f.nationalId.trim(),
      hireDate: f.hireDate,
      category: f.category,
    };
    if (f.departmentId) body['departmentId'] = +f.departmentId;
    if (f.positionTitle.trim()) body['positionTitle'] = f.positionTitle.trim();
    if (f.professionalEmail.trim()) body['professionalEmail'] = f.professionalEmail.trim();
    if (f.phoneNumber.trim()) body['phoneNumber'] = f.phoneNumber.trim();
    if (f.city.trim()) body['city'] = f.city.trim();
    if (f.cnssNumber.trim()) body['cnssNumber'] = f.cnssNumber.trim();

    this.api.createEmployeeSimple(body).subscribe({
      next: emp => {
        this.data.employees.update(list => [...list, emp]);
        this.closeCreate();
        this.busy.set(false);
      },
      error: err => {
        this.errMsg.set(err?.error?.detail ?? err?.error?.title ?? 'Erreur lors de la création.');
        this.busy.set(false);
      },
    });
  }

  // ── Documents ─────────────────────────────────────────────────────────────
  protected readonly docs = signal<DocItem[]>([
    { id: 1, name: 'Contrat de travail signé', type: 'Contrat', size: 'PDF · 2.1 Mo', date: '14/04/2024', icon: 'Pdf' },
    { id: 2, name: "Pièce d'identité (CIN)", type: 'Identité', size: 'PDF · 480 Ko', date: '02/04/2024', icon: 'Pdf' },
    { id: 3, name: 'RIB bancaire', type: 'Bancaire', size: 'PDF · 220 Ko', date: '02/04/2024', icon: 'Pdf' },
    { id: 4, name: 'Diplôme', type: 'Diplôme', size: 'PDF · 1.4 Mo', date: '14/04/2024', icon: 'Pdf' },
    { id: 5, name: 'Certificat médical', type: 'Médical', size: 'PDF · 320 Ko', date: '12/05/2026', icon: 'Pdf' },
    { id: 6, name: 'Attestation CNSS', type: 'CNSS', size: 'PDF · 180 Ko', date: '03/04/2024', icon: 'Pdf' },
  ]);
  protected readonly dragOver = signal(false);
  protected readonly uploading = signal<UploadingItem[]>([]);
  protected readonly docCategory = signal('Contrat');
  protected readonly docCats = ['Contrat', 'Identité', 'Bancaire', 'Diplôme', 'Médical', 'CNSS', 'Attestation', 'Autre'];

  protected readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  openDrawer(e: Employee): void {
    this.selected.set(e);
    this.tab.set('infos');
  }
  closeDrawer(): void {
    this.selected.set(null);
  }

  onDragOver(ev: DragEvent): void {
    ev.preventDefault();
    this.dragOver.set(true);
  }
  onDragLeave(): void {
    this.dragOver.set(false);
  }

  onDrop(ev: DragEvent): void {
    ev.preventDefault();
    this.dragOver.set(false);
    if (ev.dataTransfer?.files?.length) {
      this.handleFiles(ev.dataTransfer.files);
    }
  }

  pickFiles(): void {
    this.fileInput()?.nativeElement.click();
  }

  onFileChange(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    if (input.files) this.handleFiles(input.files);
    input.value = '';
  }

  private handleFiles(files: FileList): void {
    const arr = Array.from(files).slice(0, 5);
    arr.forEach((f, i) => {
      const id = Date.now() + i;
      this.uploading.update(u => [...u, { id, name: f.name, size: f.size, progress: 0 }]);

      let p = 0;
      const tick = setInterval(() => {
        p += 12 + Math.random() * 18;
        if (p >= 100) {
          clearInterval(tick);
          this.uploading.update(u => u.filter(x => x.id !== id));
          this.docs.update(d => [
            {
              id,
              name: f.name,
              type: this.docCategory(),
              size: `${(f.type.split('/')[1] || 'FILE').toUpperCase()} · ${this.fmtSize(f.size)}`,
              date: new Date().toLocaleDateString('fr-FR'),
              icon: f.type === 'application/pdf' ? 'Pdf' : 'Doc',
              isNew: true,
            },
            ...d,
          ]);
        } else {
          this.uploading.update(u => u.map(x => (x.id === id ? { ...x, progress: Math.min(100, p) } : x)));
        }
      }, 120);
    });
  }

  private fmtSize(b: number): string {
    return b < 1024 * 1024 ? `${Math.round(b / 1024)} Ko` : `${(b / 1024 / 1024).toFixed(1)} Mo`;
  }

  contractClass(c: string): string {
    return c === 'CDI' ? 'pos' : c === 'CDD' ? 'info' : c === 'CIVP' ? 'warn' : '';
  }
}
