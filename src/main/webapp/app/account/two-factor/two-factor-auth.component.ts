import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'jhi-two-factor-auth',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './two-factor-auth.component.html',
})
export class TwoFactorAuthComponent implements OnInit {
  qrCodeUri = '';
  enabled = false;

  constructor() {}

  ngOnInit(): void {
    // Logique à venir
  }
}
