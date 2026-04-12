import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { DataUtils, FileLoadError } from 'app/core/util/data-util.service';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { ICompany } from 'app/entities/company/company.model';
import { CompanyService } from 'app/entities/company/service/company.service';
import { AlertError } from 'app/shared/alert/alert-error';
import { AlertErrorModel } from 'app/shared/alert/alert-error.model';
import { TranslateDirective } from 'app/shared/language';
import { IKnowledgeDocument } from '../knowledge-document.model';
import { KnowledgeDocumentService } from '../service/knowledge-document.service';

import { KnowledgeDocumentFormGroup, KnowledgeDocumentFormService } from './knowledge-document-form.service';

@Component({
  selector: 'pz-knowledge-document-update',
  templateUrl: './knowledge-document-update.html',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule],
})
export class KnowledgeDocumentUpdate implements OnInit {
  readonly isSaving = signal(false);
  knowledgeDocument: IKnowledgeDocument | null = null;

  companiesSharedCollection = signal<ICompany[]>([]);

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
        this.eventManager.broadcast(new EventWithContent<AlertErrorModel>('paieZoneRhApp.error', { ...err, key: `error.file.${err.key}` })),
    });
  }

  previousState(): void {
    globalThis.history.back();
  }

  save(): void {
    this.isSaving.set(true);
    const knowledgeDocument = this.knowledgeDocumentFormService.getKnowledgeDocument(this.editForm);
    if (knowledgeDocument.id === null) {
      this.subscribeToSaveResponse(this.knowledgeDocumentService.create(knowledgeDocument));
    } else {
      this.subscribeToSaveResponse(this.knowledgeDocumentService.update(knowledgeDocument));
    }
  }

  protected subscribeToSaveResponse(result: Observable<IKnowledgeDocument | null>): void {
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
    this.isSaving.set(false);
  }

  protected updateForm(knowledgeDocument: IKnowledgeDocument): void {
    this.knowledgeDocument = knowledgeDocument;
    this.knowledgeDocumentFormService.resetForm(this.editForm, knowledgeDocument);

    this.companiesSharedCollection.update(companies =>
      this.companyService.addCompanyToCollectionIfMissing<ICompany>(companies, knowledgeDocument.company),
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
      .subscribe((companies: ICompany[]) => this.companiesSharedCollection.set(companies));
  }
}
