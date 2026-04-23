import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

import { EmployeeService } from 'app/entities/employee/service/employee.service';
import { IEmployee } from 'app/entities/employee/employee.model';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { HrDocumentService } from '../service/hr-document.service';
import { IHrDocument } from '../hr-document.model';
import { HrDocumentFormGroup, HrDocumentFormService } from './hr-document-form.service';

const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

@Component({
  selector: 'pz-hr-document-update',
  templateUrl: './hr-document-update.html',
  imports: [CommonModule, TranslateDirective, FontAwesomeModule, AlertError, ReactiveFormsModule],
})
export class HrDocumentUpdate implements OnInit {
  readonly isSaving = signal(false);
  hrDocument: IHrDocument | null = null;

  // ← Variables upload
  selectedFile: File | null = null;
  filePreview: string | null = null;
  fileError: string | null = null;
  isNewDocument = true;

  employeesSharedCollection = signal<IEmployee[]>([]);

  protected hrDocumentService = inject(HrDocumentService);
  protected hrDocumentFormService = inject(HrDocumentFormService);
  protected employeeService = inject(EmployeeService);
  protected activatedRoute = inject(ActivatedRoute);

  editForm: HrDocumentFormGroup = this.hrDocumentFormService.createHrDocumentFormGroup();

  compareEmployee = (o1: IEmployee | null, o2: IEmployee | null): boolean => this.employeeService.compareEmployee(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ hrDocument }) => {
      this.hrDocument = hrDocument;
      this.isNewDocument = !hrDocument?.id;
      if (hrDocument) {
        this.updateForm(hrDocument);
      }
      this.loadRelationshipsOptions();
    });
  }

  // ── Vérifier si le formulaire est valide pour soumission ─────────────────
  get canSave(): boolean {
    if (this.editForm.invalid) return false;
    if (this.isSaving()) return false;
    // Nouveau document → fichier obligatoire
    if (this.isNewDocument && !this.selectedFile) return false;
    // Erreur fichier
    if (this.fileError) return false;
    return true;
  }

  // ── Sélection fichier ─────────────────────────────────────────────────────
  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.fileError = null;
    this.selectedFile = null;
    this.filePreview = null;

    if (!input.files?.length) return;
    const file = input.files[0];

    if (!ALLOWED_TYPES.includes(file.type)) {
      this.fileError = `Type non autorisé : ${file.name.split('.').pop()?.toUpperCase()}. Formats acceptés : PDF, JPEG, PNG, DOC, DOCX.`;
      return;
    }

    if (file.size > MAX_SIZE) {
      this.fileError = `Fichier trop volumineux : ${(file.size / 1024 / 1024).toFixed(2)} MB. Maximum autorisé : 5 MB.`;
      return;
    }

    this.selectedFile = file;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = e => {
        this.filePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  clearFile(): void {
    this.selectedFile = null;
    this.filePreview = null;
    this.fileError = null;
  }

  isImage(): boolean {
    return this.selectedFile?.type.startsWith('image/') ?? false;
  }

  getFileIcon(type: string): string {
    if (type === 'application/pdf') return '📄';
    if (type.startsWith('image/')) return '🖼️';
    if (type.includes('word')) return '📝';
    return '📎';
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' octets';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  }

  // ── Sauvegarde ────────────────────────────────────────────────────────────
  save(): void {
    if (!this.canSave) return;
    this.isSaving.set(true);

    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = e => {
        const dataUrl = e.target?.result as string;
        // Extraire la partie Base64 sans le préfixe "data:...;base64,"
        const base64 = dataUrl.split(',')[1];

        this.editForm.patchValue({
          fileData: base64,
          fileDataContentType: this.selectedFile!.type,
          fileSize: this.selectedFile!.size,
          mimeType: this.selectedFile!.type,
        });
        this.submitForm();
      };
      reader.onerror = () => {
        this.fileError = 'Erreur lors de la lecture du fichier.';
        this.isSaving.set(false);
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      this.submitForm();
    }
  }

  private submitForm(): void {
    const hrDocument = this.hrDocumentFormService.getHrDocument(this.editForm);
    if (hrDocument.id === null) {
      this.subscribeToSaveResponse(this.hrDocumentService.create(hrDocument as any));
    } else {
      this.subscribeToSaveResponse(this.hrDocumentService.update(hrDocument as any));
    }
  }

  previousState(): void {
    globalThis.history.back();
  }

  protected subscribeToSaveResponse(result: Observable<IHrDocument>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }
  protected onSaveError(): void {}
  protected onSaveFinalize(): void {
    this.isSaving.set(false);
  }

  protected updateForm(hrDocument: IHrDocument): void {
    this.hrDocument = hrDocument;
    this.hrDocumentFormService.resetForm(this.editForm, hrDocument);
    this.employeesSharedCollection.update(employees =>
      this.employeeService.addEmployeeToCollectionIfMissing<IEmployee>(employees, hrDocument.employee as any),
    );
  }

  protected loadRelationshipsOptions(): void {
    this.employeeService
      .query({ size: 1000, sort: ['lastName,asc'] })
      .pipe(map((res: HttpResponse<IEmployee[]>) => res.body ?? []))
      .subscribe(employees => this.employeesSharedCollection.set(employees));
  }
}
