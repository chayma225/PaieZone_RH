import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'pz-password-reset-finish',
  imports: [],
  template: '',
})
export default class PasswordResetFinish implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.router.navigate(['/paiezone/reset-password'], {
        queryParams: params['key'] ? { key: params['key'] } : {},
        replaceUrl: true,
      });
    });
  }
}
