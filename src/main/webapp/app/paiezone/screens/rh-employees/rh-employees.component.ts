import { Component, ChangeDetectionStrategy, inject, signal, computed, viewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import IconComponent from '../../core/icon/icon.component';
import { DataService } from '../../core/data.service';
import { ApiService } from '../../core/api.service';
import type { Employee, HrDocument, Contract } from '../../core/types';

interface DocItem {
  id: number;
  backendId?: number;
  name: string;
  type: string;
  size: string;
  date: string;
  icon: string;
  fileUrl?: string;
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
    contractType: 'CDI',
    contractRef: '',
    contractStartDate: '',
    contractEndDate: '',
    baseSalary: 0,
    workingHoursWeek: 40,
    workingDaysWeek: 5,
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

  protected readonly contractTypes = [
    { value: 'CDI', label: 'CDI – Durée indéterminée' },
    { value: 'CDD', label: 'CDD – Durée déterminée' },
    { value: 'CIVP', label: 'CIVP' },
    { value: 'KARAMA', label: 'Karama' },
    { value: 'INTERIMAIRE', label: 'Intérimaire' },
    { value: 'STAGE', label: 'Stage' },
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

  needsEndDate(): boolean {
    return ['CDD', 'CIVP', 'STAGE', 'KARAMA', 'INTERIMAIRE'].includes(this.createForm.contractType);
  }

  contractStatusLabel(s: string): string {
    const m: Record<string, string> = {
      DRAFT: 'Brouillon',
      ACTIVE: 'Actif',
      SUSPENDED: 'Suspendu',
      TERMINATED: 'Résilié',
      EXPIRED: 'Expiré',
    };
    return m[s] ?? s;
  }

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
      contractType: 'CDI',
      contractRef: '',
      contractStartDate: '',
      contractEndDate: '',
      baseSalary: 0,
      workingHoursWeek: 40,
      workingDaysWeek: 5,
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
        const f = this.createForm;
        const ref = f.contractRef.trim() || `CTR-${emp.id}-${Date.now()}`;
        const contractBody: any = {
          reference: ref,
          contractType: f.contractType,
          status: 'ACTIVE',
          startDate: f.contractStartDate || f.hireDate,
          baseSalary: +f.baseSalary || 0,
          workingHoursWeek: +f.workingHoursWeek || 40,
          workingDaysWeek: +f.workingDaysWeek || 5,
          createdAt: new Date().toISOString(),
          employee: { id: emp.id },
        };
        if (this.needsEndDate() && f.contractEndDate) contractBody['endDate'] = f.contractEndDate;
        this.api.createContract(contractBody).subscribe({ error: () => {} });
        this.data.reloadEmployees();
        this.closeCreate();
        this.busy.set(false);
      },
      error: err => {
        this.errMsg.set(err?.error?.detail ?? err?.error?.title ?? 'Erreur lors de la création.');
        this.busy.set(false);
      },
    });
  }

  // ── Contrats ──────────────────────────────────────────────────────────────
  protected readonly contracts = signal<Contract[]>([]);

  // ── Documents ─────────────────────────────────────────────────────────────
  protected readonly docs = signal<DocItem[]>([]);
  protected readonly dragOver = signal(false);
  protected readonly uploading = signal<UploadingItem[]>([]);
  protected readonly docCategory = signal('Contrat');
  protected readonly docCats = ['Contrat', 'Identité', 'Bancaire', 'Diplôme', 'Médical', 'CNSS', 'Attestation', 'Autre'];

  protected readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  openDrawer(e: Employee): void {
    this.selected.set(e);
    this.tab.set('infos');
    this.docs.set([]);
    this.contracts.set([]);
    this.api.contracts(e.id).subscribe({
      next: list => this.contracts.set(list),
      error: () => {},
    });
    this.api.hrDocuments(e.id).subscribe({
      next: list => {
        const docTypes: Record<string, string> = {
          CONTRACT: 'Contrat',
          CIN_COPY: 'Identité',
          DIPLOMA: 'Diplôme',
          MEDICAL_CERT: 'Médical',
          DISCIPLINARY: 'Disciplinaire',
          PAYSLIP: 'Bulletin',
          ATTESTATION: 'Attestation',
          OTHER: 'Autre',
        };
        this.docs.set(
          list.map(d => ({
            id: d.id,
            backendId: d.id,
            name: d.title,
            type: docTypes[d.documentType] ?? d.documentType,
            size: d.fileSize ? `${Math.round(d.fileSize / 1024)} Ko` : '—',
            date: d.uploadedAt ? new Date(d.uploadedAt).toLocaleDateString('fr-FR') : '—',
            icon: 'Pdf',
            fileUrl: d.fileUrl,
          })),
        );
      },
      error: () => {},
    });
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
    const emp = this.selected();
    if (!emp) return;
    const arr = Array.from(files).slice(0, 5);
    const catToType: Record<string, string> = {
      Contrat: 'CONTRACT',
      Identité: 'CIN_COPY',
      Diplôme: 'DIPLOMA',
      Médical: 'MEDICAL_CERT',
      CNSS: 'ATTESTATION',
      Attestation: 'ATTESTATION',
      Autre: 'OTHER',
    };
    arr.forEach((f, i) => {
      const id = Date.now() + i;
      this.uploading.update(u => [...u, { id, name: f.name, size: f.size, progress: 0 }]);

      let p = 0;
      const tick = setInterval(() => {
        p += 12 + Math.random() * 18;
        if (p >= 100) {
          clearInterval(tick);
          this.uploading.update(u => u.filter(x => x.id !== id));
          const docType = catToType[this.docCategory()] ?? 'OTHER';
          this.api
            .createHrDocument({
              documentType: docType,
              title: f.name,
              description: '',
              active: true,
              employee: { id: emp.id },
            })
            .subscribe({
              next: doc => {
                this.docs.update(d => [
                  {
                    id: doc.id,
                    backendId: doc.id,
                    name: doc.title,
                    type: this.docCategory(),
                    size: `${(f.type.split('/')[1] || 'FILE').toUpperCase()} · ${this.fmtSize(f.size)}`,
                    date: new Date().toLocaleDateString('fr-FR'),
                    icon: f.type === 'application/pdf' ? 'Pdf' : 'Doc',
                    isNew: true,
                  },
                  ...d,
                ]);
              },
              error: () => {
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
              },
            });
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
