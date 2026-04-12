import { Component, Injector, OnInit, Signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { TranslateDirective } from 'app/shared/language';

import { ProfileService } from './profile.service';

@Component({
  selector: 'pz-page-ribbon',
  template: `
    @if (ribbonEnvSignal?.(); as ribbonEnv) {
      <div class="ribbon">
        <a href="" [pzTranslate]="'global.ribbon.' + (ribbonEnv ?? '')">{{ { dev: 'Développement' }[ribbonEnv ?? ''] }}</a>
      </div>
    }
  `,
  styleUrl: './page-ribbon.scss',
  imports: [TranslateDirective, TranslateModule],
})
export default class PageRibbon implements OnInit {
  ribbonEnvSignal?: Signal<string | undefined>;
  private readonly injector = inject(Injector);
  private readonly profileService = inject(ProfileService);

  ngOnInit(): void {
    const ribbonEnv$: Observable<string | undefined> = this.profileService.getProfileInfo().pipe(map(profileInfo => profileInfo.ribbonEnv));
    this.ribbonEnvSignal = toSignal(ribbonEnv$, { injector: this.injector });
  }
}
