import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IChatSession } from '../chat-session.model';
import { ChatSessionService } from '../service/chat-session.service';

@Component({
  templateUrl: './chat-session-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class ChatSessionDeleteDialogComponent {
  chatSession?: IChatSession;

  protected chatSessionService = inject(ChatSessionService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.chatSessionService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
