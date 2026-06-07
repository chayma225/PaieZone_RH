import { Component, ChangeDetectionStrategy, inject, signal, computed, viewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import IconComponent from '../../core/icon/icon.component';
import { DataService } from '../../core/data.service';
import { ApiService } from '../../core/api.service';
import type { Employee, HrDocument, Contract, PaySlip } from '../../core/types';

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
export default class RhEmployeesComponent implements OnInit {
  protected readonly data = inject(DataService);
  protected readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const empId = params['emp'] ? +params['emp'] : null;
      const tabParam = params['tab'];
      if (!empId) return;

      // Attendre que les employés soient chargés (signal peut être vide au démarrage)
      const tryOpen = () => {
        const emp = this.data.employees().find(e => e.id === empId);
        if (emp) {
          this.openDrawer(emp);
          if (tabParam === 'contract') this.tab.set('contract');
        } else {
          // Réessayer après le prochain tick si les données ne sont pas encore chargées
          setTimeout(tryOpen, 300);
        }
      };
      tryOpen();
    });
  }

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

  // ── Modifier employé modal ────────────────────────────────────────────────
  protected readonly showEdit = signal(false);
  protected readonly editBusy = signal(false);
  protected readonly editErr = signal('');

  protected editForm = {
    // Identité
    firstName: '',
    lastName: '',
    birthDate: '',
    gender: 'MALE',
    maritalStatus: 'SINGLE',
    nationalId: '',
    numberOfChildren: 0,
    chefDeFamille: false,
    // Poste
    hireDate: '',
    category: 'EMPLOYEE',
    departmentId: '',
    positionTitle: '',
    // Contact
    professionalEmail: '',
    phoneNumber: '',
    city: '',
    cnssNumber: '',
    // Contrat
    contractType: 'CDI',
    baseSalary: 0,
    contractStartDate: '',
    contractEndDate: '',
    workingHoursWeek: 40,
    workingDaysWeek: 5,
  };

  // ── Supprimer employé ─────────────────────────────────────────────────────
  protected readonly showDeleteConfirm = signal(false);
  protected readonly deleteBusy = signal(false);

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

  // LF 2026 — retourne un message d'erreur si le salaire est sous le SMIG, '' sinon
  private validateSmig(contractType: string, salary: number): string {
    const SMIG_48H = 524.954;
    const STAGE_MIN = 262.477; // 50% SMIG
    const INTERIM_MIN = 577.449; // SMIG + 10% précarité

    if (!salary || salary <= 0) {
      return 'Le salaire de base est obligatoire et doit être positif.';
    }

    if (contractType === 'STAGE') {
      if (salary < STAGE_MIN) {
        return `❌ La gratification d'un stage doit être ≥ ${STAGE_MIN.toFixed(3)} TND (50 % du SMIG 2026). Montant saisi : ${salary.toFixed(3)} TND.`;
      }
    } else if (contractType === 'INTERIMAIRE') {
      if (salary < INTERIM_MIN) {
        return `❌ Le salaire d'un contrat intérimaire doit être ≥ ${INTERIM_MIN.toFixed(3)} TND (SMIG + 10 % précarité). Salaire saisi : ${salary.toFixed(3)} TND.`;
      }
    } else {
      if (salary < SMIG_48H) {
        return `❌ Le salaire d'un ${contractType} doit être ≥ ${SMIG_48H.toFixed(3)} TND (SMIG 48h — LF 2026). Salaire saisi : ${salary.toFixed(3)} TND.`;
      }
    }

    return '';
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

    // Validation SMIG avant appel API
    const smigErr = this.validateSmig(f.contractType, +f.baseSalary);
    if (smigErr) {
      this.errMsg.set(smigErr);
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

        this.api.createContract(contractBody).subscribe({
          next: () => {
            this.data.reloadEmployees();
            this.closeCreate();
            this.busy.set(false);
          },
          error: err => {
            // L'employé est créé, le contrat a échoué → afficher l'erreur
            this.errMsg.set(err?.error?.detail ?? err?.error?.title ?? 'Erreur lors de la création du contrat.');
            this.data.reloadEmployees();
            this.busy.set(false);
          },
        });
      },
      error: err => {
        this.errMsg.set(err?.error?.detail ?? err?.error?.title ?? 'Erreur lors de la création.');
        this.busy.set(false);
      },
    });
  }

  openEdit(): void {
    const e = this.selected();
    if (!e) return;
    const dept = this.data.departments().find(d => d.name === e.dept);
    const c = this.activeContract();
    const genderMap: Record<string, string> = { M: 'MALE', F: 'FEMALE' };
    this.editForm = {
      // Identité
      firstName: e.first,
      lastName: e.last,
      birthDate: e.birthDate ?? '',
      gender: genderMap[e.gender] ?? 'MALE',
      maritalStatus: e.maritalStatus ?? 'SINGLE',
      nationalId: e.nationalId ?? '',
      numberOfChildren: e.children,
      chefDeFamille: e.chefDeFamille ?? false,
      // Poste
      hireDate: e.hireDate ?? '',
      category: e.cat || 'EMPLOYEE',
      departmentId: dept ? String(dept.id) : '',
      positionTitle: e.role,
      // Contact
      professionalEmail: e.email,
      phoneNumber: e.phone,
      city: e.city,
      cnssNumber: e.cnss,
      // Contrat
      contractType: c?.contractType ?? 'CDI',
      baseSalary: c?.baseSalary ?? 0,
      contractStartDate: c?.startDate ?? '',
      contractEndDate: c?.endDate ?? '',
      workingHoursWeek: c?.workingHoursWeek ?? 40,
      workingDaysWeek: c?.workingDaysWeek ?? 5,
    };
    this.editErr.set('');
    this.showEdit.set(true);
  }

  closeEdit(): void {
    this.showEdit.set(false);
  }

  submitEdit(): void {
    const e = this.selected();
    if (!e) return;
    const f = this.editForm;
    if (!f.firstName.trim() || !f.lastName.trim()) {
      this.editErr.set('Le prénom et le nom sont obligatoires.');
      return;
    }

    // Validation SMIG si un contrat existe
    if (this.activeContract()) {
      const smigErr = this.validateSmig(f.contractType, +f.baseSalary);
      if (smigErr) {
        this.editErr.set(smigErr);
        return;
      }
    }

    this.editBusy.set(true);
    this.editErr.set('');

    const patch: Record<string, any> = {
      firstName: f.firstName.trim(),
      lastName: f.lastName.trim(),
      numberOfChildren: f.numberOfChildren,
      chefDeFamille: f.chefDeFamille,
      gender: f.gender,
      maritalStatus: f.maritalStatus,
      category: f.category,
    };
    if (f.birthDate) patch['birthDate'] = f.birthDate;
    if (f.nationalId.trim()) patch['nationalId'] = f.nationalId.trim();
    if (f.hireDate) patch['hireDate'] = f.hireDate;
    if (f.professionalEmail.trim()) patch['professionalEmail'] = f.professionalEmail.trim();
    if (f.phoneNumber.trim()) patch['phoneNumber'] = f.phoneNumber.trim();
    if (f.city.trim()) patch['city'] = f.city.trim();
    if (f.cnssNumber.trim()) patch['cnssNumber'] = f.cnssNumber.trim();
    if (f.departmentId) patch['departmentId'] = +f.departmentId;
    if (f.positionTitle.trim()) patch['positionTitle'] = f.positionTitle.trim();

    this.api.updateEmployeeFields(e.id, patch).subscribe({
      next: () => {
        // Mise à jour du contrat si on en a un
        const contract = this.activeContract();
        if (contract) {
          const needsEnd = ['CDD', 'CIVP', 'STAGE', 'KARAMA', 'INTERIMAIRE'].includes(f.contractType);
          const contractPatch: Record<string, any> = {
            reference: contract.reference,
            contractType: f.contractType,
            status: contract.status,
            startDate: f.contractStartDate || contract.startDate,
            baseSalary: +f.baseSalary,
            workingHoursWeek: +f.workingHoursWeek,
            workingDaysWeek: +f.workingDaysWeek,
            employee: { id: e.id },
          };
          if (needsEnd && f.contractEndDate) contractPatch['endDate'] = f.contractEndDate;
          this.api.updateContract(contract.id, contractPatch).subscribe({
            next: () => {
              this.data.reloadEmployees();
              this.closeEdit();
              this.closeDrawer();
              this.editBusy.set(false);
            },
            error: err => {
              this.editErr.set(err?.error?.detail ?? err?.error?.title ?? 'Erreur lors de la mise à jour du contrat.');
              this.data.reloadEmployees();
              this.editBusy.set(false);
            },
          });
        } else {
          this.data.reloadEmployees();
          this.closeEdit();
          this.closeDrawer();
          this.editBusy.set(false);
        }
      },
      error: err => {
        this.editErr.set(err?.error?.detail ?? err?.error?.title ?? 'Erreur lors de la mise à jour.');
        this.editBusy.set(false);
      },
    });
  }

  openDeleteConfirm(): void {
    this.showDeleteConfirm.set(true);
  }

  closeDeleteConfirm(): void {
    this.showDeleteConfirm.set(false);
  }

  confirmDelete(): void {
    const e = this.selected();
    if (!e) return;
    this.deleteBusy.set(true);
    this.api.deleteEmployee(e.id).subscribe({
      next: () => {
        this.deleteBusy.set(false);
        this.closeDeleteConfirm();
        this.closeDrawer();
        this.data.reloadEmployees();
      },
      error: err => {
        this.deleteBusy.set(false);
        this.editErr.set(err?.error?.detail ?? err?.error?.title ?? 'Erreur lors de la suppression.');
        this.closeDeleteConfirm();
      },
    });
  }

  // ── Import Excel ──────────────────────────────────────────────────────────
  protected readonly showImport = signal(false);
  protected readonly importBusy = signal(false);
  protected readonly importFile = signal<File | null>(null);
  protected readonly importDrop = signal(false);
  protected readonly importResult = signal<{
    imported: number;
    skipped: number;
    errors: number;
    importedNames: string[];
    skippedLines: string[];
    errorLines: string[];
  } | null>(null);
  protected readonly importErr = signal('');

  openImport(): void {
    this.importFile.set(null);
    this.importResult.set(null);
    this.importErr.set('');
    this.showImport.set(true);
  }
  closeImport(): void {
    this.showImport.set(false);
  }

  onImportFilePick(event: Event): void {
    const f = (event.target as HTMLInputElement).files?.[0];
    if (f) {
      this.importFile.set(f);
      this.importResult.set(null);
      this.importErr.set('');
    }
  }

  onImportDrop(event: DragEvent): void {
    event.preventDefault();
    this.importDrop.set(false);
    const f = event.dataTransfer?.files?.[0];
    if (f) {
      this.importFile.set(f);
      this.importResult.set(null);
      this.importErr.set('');
    }
  }

  runImport(): void {
    const f = this.importFile();
    if (!f) return;
    this.importBusy.set(true);
    this.importErr.set('');
    this.api.importEmployeesExcel(f).subscribe({
      next: res => {
        this.importResult.set(res);
        this.importBusy.set(false);
        if (res.imported > 0) this.data.reloadEmployees();
      },
      error: err => {
        this.importErr.set(err?.error?.message ?? err?.error?.detail ?? "Erreur lors de l'import.");
        this.importBusy.set(false);
      },
    });
  }

  downloadTemplate(): void {
    // Génère un CSV modèle téléchargeable côté client
    const headers = [
      'Matricule',
      'Prénom',
      'Nom',
      'Genre (M/F)',
      'Situation familiale',
      'Nb enfants',
      'Chef famille (O/N)',
      'CIN',
      'Date embauche (DD/MM/YYYY)',
      'Département',
      'Poste',
      'Email pro',
      'Téléphone',
      'Ville',
      'N° CNSS',
      'Type contrat (CDI/CDD/CIVP/KARAMA/STAGE)',
      'Salaire base',
      'Date début contrat',
    ].join(';');
    const example =
      'E001;Ahmed;Ben Ali;M;MARRIED;2;O;12345678;01/01/2024;Informatique;Développeur;ahmed@example.com;+216 20 000 000;Tunis;98765432;CDI;1800;01/01/2024';
    const blob = new Blob(['﻿' + headers + '\n' + example], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modele-import-employes.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ── Contrats ──────────────────────────────────────────────────────────────
  protected readonly contracts = signal<Contract[]>([]);
  protected readonly activeContract = computed(() => {
    const list = this.contracts();
    return list.find(c => c.status === 'ACTIVE') ?? list[0] ?? null;
  });

  // ── Bulletins ─────────────────────────────────────────────────────────────
  protected readonly paySlips = signal<PaySlip[]>([]);

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
    this.paySlips.set([]);

    this.api.contracts(e.id).subscribe({
      next: list => {
        this.contracts.set(list);
        const active = list.find(c => c.status === 'ACTIVE') ?? list[0];
        if (active) {
          this.selected.update(emp => (emp ? { ...emp, salary: active.baseSalary, contract: active.contractType as any } : null));
        }
      },
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

    this.api.paySlipsByEmployee(e.id).subscribe({
      next: list => this.paySlips.set(list.sort((a, b) => b.year - a.year || b.month - a.month)),
      error: () => {},
    });
  }

  closeDrawer(): void {
    this.selected.set(null);
  }

  onBackdropClick(ev: MouseEvent): void {
    if (ev.target === ev.currentTarget) this.closeDrawer();
  }

  deleteDoc(id: number): void {
    this.api.deleteHrDocument(id).subscribe({
      next: () => this.docs.update(d => d.filter(x => x.id !== id)),
      error: () => {},
    });
  }

  openFile(url: string | undefined): void {
    if (url) window.open(url, '_blank');
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

  fmtDateLong(date: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  fmtMonthYear(month: number, year: number): string {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    return `${months[(month ?? 1) - 1] ?? ''} ${year}`;
  }

  periodStatusLabel(s: string): string {
    const m: Record<string, string> = {
      DRAFT: 'Brouillon',
      CALCULATED: 'Calculée',
      VALIDATED: 'Validée',
      LOCKED: 'Verrouillée',
      EXPORTED: 'Exportée',
    };
    return m[s] ?? s;
  }

  contractClass(c: string): string {
    return c === 'CDI' ? 'pos' : c === 'CDD' ? 'info' : c === 'CIVP' ? 'warn' : c === 'STAGE' ? 'warn' : c === 'KARAMA' ? 'warn' : '';
  }

  slipStatusClass(s: string): string {
    if (s === 'VALIDATED' || s === 'EXPORTED') return 'pos';
    if (s === 'LOCKED') return 'primary';
    return 'warn';
  }

  dlBulletin(paySlipId: number): void {
    this.api.downloadBulletin(paySlipId).subscribe(blob => this.saveBlob(blob, `bulletin-${paySlipId}.pdf`));
  }

  protected readonly docErr = signal('');

  dlAttestation(employeeId: number): void {
    this.docErr.set('');
    this.api.downloadAttestationTravail(employeeId).subscribe({
      next: blob => this.saveBlob(blob, `attestation-${employeeId}.pdf`),
      error: () => this.docErr.set("Erreur lors de la génération de l'attestation."),
    });
  }

  dlCertificatRI(employeeId: number): void {
    const year = new Date().getFullYear() - 1;
    this.docErr.set('');
    this.api.downloadCertificatRI(employeeId, year).subscribe({
      next: blob => {
        // Le backend retourne du JSON en cas d'erreur (400/500) au lieu d'un PDF
        if (blob.type === 'application/json' || blob.size < 200) {
          blob.text().then(txt => {
            try {
              const msg = JSON.parse(txt)?.error ?? `Aucun bulletin de paie trouvé pour ${year}.`;
              this.docErr.set(msg);
            } catch {
              this.docErr.set(`Aucun bulletin de paie trouvé pour ${year}.`);
            }
          });
          return;
        }
        this.saveBlob(blob, `certificat-ri-${employeeId}-${year}.pdf`);
      },
      error: () => this.docErr.set(`Aucun bulletin de paie trouvé pour ${year}. Générez d'abord la paie.`),
    });
  }

  private saveBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
