import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import TopNavComponent from '../top-nav/top-nav.component';
import { ChatbotComponent } from '../../../chatbot/chatbot.component';
import { RoleService } from '../../core/role.service';

@Component({
  selector: 'pz-layout',
  standalone: true,
  imports: [RouterOutlet, TopNavComponent, ChatbotComponent],
  template: `
    <div class="pz-app">
      <pz-top-nav />
      <main>
        <router-outlet />
      </main>
    </div>
    <jhi-chatbot />
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
      }
      .pz-app {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        font-weight: 400;
        color: #0f172a;
      }
      .pz-app h1,
      .pz-app h2,
      .pz-app h3,
      .pz-app h4 {
        font-weight: 600;
      }
      main {
        flex: 1;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LayoutComponent {
  protected readonly roleService = inject(RoleService);
}
