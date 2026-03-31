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
import { IEmployee } from 'app/entities/employee/employee.model';
import { EmployeeService } from 'app/entities/employee/service/employee.service';
import { ChatChannel } from 'app/entities/enumerations/chat-channel.model';
import { ChatSessionStatus } from 'app/entities/enumerations/chat-session-status.model';
import { ChatSessionService } from '../service/chat-session.service';
import { IChatSession } from '../chat-session.model';
import { ChatSessionFormGroup, ChatSessionFormService } from './chat-session-form.service';

@Component({
  selector: 'pz-chat-session-update',
  templateUrl: './chat-session-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class ChatSessionUpdateComponent implements OnInit {
  isSaving = false;
  chatSession: IChatSession | null = null;
  chatChannelValues = Object.keys(ChatChannel);
  chatSessionStatusValues = Object.keys(ChatSessionStatus);

  employeesSharedCollection: IEmployee[] = [];

  protected dataUtils = inject(DataUtils);
  protected eventManager = inject(EventManager);
  protected chatSessionService = inject(ChatSessionService);
  protected chatSessionFormService = inject(ChatSessionFormService);
  protected employeeService = inject(EmployeeService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: ChatSessionFormGroup = this.chatSessionFormService.createChatSessionFormGroup();

  compareEmployee = (o1: IEmployee | null, o2: IEmployee | null): boolean => this.employeeService.compareEmployee(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ chatSession }) => {
      this.chatSession = chatSession;
      if (chatSession) {
        this.updateForm(chatSession);
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
    const chatSession = this.chatSessionFormService.getChatSession(this.editForm);
    if (chatSession.id !== null) {
      this.subscribeToSaveResponse(this.chatSessionService.update(chatSession));
    } else {
      this.subscribeToSaveResponse(this.chatSessionService.create(chatSession));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IChatSession>>): void {
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

  protected updateForm(chatSession: IChatSession): void {
    this.chatSession = chatSession;
    this.chatSessionFormService.resetForm(this.editForm, chatSession);

    this.employeesSharedCollection = this.employeeService.addEmployeeToCollectionIfMissing<IEmployee>(
      this.employeesSharedCollection,
      chatSession.employee,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.employeeService
      .query()
      .pipe(map((res: HttpResponse<IEmployee[]>) => res.body ?? []))
      .pipe(
        map((employees: IEmployee[]) =>
          this.employeeService.addEmployeeToCollectionIfMissing<IEmployee>(employees, this.chatSession?.employee),
        ),
      )
      .subscribe((employees: IEmployee[]) => (this.employeesSharedCollection = employees));
  }
}
