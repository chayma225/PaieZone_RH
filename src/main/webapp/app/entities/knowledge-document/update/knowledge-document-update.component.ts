import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AlertError } from 'app/shared/alert/alert-error.model';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { DataUtils, FileLoadError } from 'app/core/util/data-util.service';
import { ICompany } from 'app/entities/company/company.model';
import { CompanyService } from 'app/entities/company/service/company.service';
import { KnowledgeDocumentService } from '../service/knowledge-document.service';
import { IKnowledgeDocument } from '../knowledge-document.model';
import { KnowledgeDocumentFormGroup, KnowledgeDocumentFormService } from './knowledge-document-form.service';

@Component({
  selector: 'pz-knowledge-document-update',
  templateUrl: './knowledge-document-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class KnowledgeDocumentUpdateComponent implements OnInit {
  isSaving = false;
  knowledgeDocument: IKnowledgeDocument | null = null;

  companiesSharedCollection: ICompany[] = [];

  protected dataUtils = inject(DataUtils);
  protected eventManager = inject(EventManager);
  protected knowledgeDocumentService = inject(KnowledgeDocumentService);
  protected knowledgeDocumentFormService = inject(KnowledgeDocumentFormService);
  protected companyService = inject(CompanyService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: KnowledgeDocumentFormGroup = this.knowledgeDocumentFormService.createKnowledgeDocumentFormGroup();

  compareCompany = (o1: ICompany | null, o2: ICompany | null): boolean => this.companyService.compareCompany(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ knowledgeDocument }) => {
      this.knowledgeDocument = knowledgeDocument;
      if (knowledgeDocument) {
        this.updateForm(knowledgeDocument);
      }

      this.loadRelationshipsOptions();
    });
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    this.dataUtils.openFile(base64String, contentType);
  }

  setFileData(event: Event, field: string, isImage: boolean): void {
    this.dataUtils.loadFileToForm(event, this.editForm, field, isImage).subscribe({
      error: (err: FileLoadError) =>
        this.eventManager.broadcast(new EventWithContent<AlertError>('paieZoneRhApp.error', { ...err, key: `error.file.${err.key}` })),
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const knowledgeDocument = this.knowledgeDocumentFormService.getKnowledgeDocument(this.editForm);
    if (knowledgeDocument.id !== null) {
      this.subscribeToSaveResponse(this.knowledgeDocumentService.update(knowledgeDocument));
    } else {
      this.subscribeToSaveResponse(this.knowledgeDocumentService.create(knowledgeDocument));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IKnowledgeDocument>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(knowledgeDocument: IKnowledgeDocument): void {
    this.knowledgeDocument = knowledgeDocument;
    this.knowledgeDocumentFormService.resetForm(this.editForm, knowledgeDocument);

    this.companiesSharedCollection = this.companyService.addCompanyToCollectionIfMissing<ICompany>(
      this.companiesSharedCollection,
      knowledgeDocument.company,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.companyService
      .query()
      .pipe(map((res: HttpResponse<ICompany[]>) => res.body ?? []))
      .pipe(
        map((companies: ICompany[]) =>
          this.companyService.addCompanyToCollectionIfMissing<ICompany>(companies, this.knowledgeDocument?.company),
        ),
      )
      .subscribe((companies: ICompany[]) => (this.companiesSharedCollection = companies));
  }
}
