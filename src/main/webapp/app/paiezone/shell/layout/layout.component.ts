import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import TopNavComponent from '../top-nav/top-nav.component';
import ChatbotComponent from '../../components/chatbot/chatbot.component';

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
      <pz-chatbot />
    </div>
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
      }
      main {
        flex: 1;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LayoutComponent {}
