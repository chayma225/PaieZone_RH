import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'pz-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <!-- ── Animated mesh background ── -->
    <div class="mesh-bg">
      <div class="b1"></div>
      <div class="b2"></div>
      <div class="b3"></div>
      <div class="b4"></div>
    </div>
    <div class="grid-ov"></div>
    <div class="orb o1"></div>
    <div class="orb o2"></div>
    <div class="orb o3"></div>
    <div class="orb o4"></div>
    <div class="orb o5"></div>
    <div class="orb o6"></div>

    <!-- ── Header ── -->
    <header class="auth-hdr">
      <a class="brand" routerLink="/paiezone">
        <div class="brand-mark">PZ</div>
        <div class="brand-name">paie<span class="it">zone</span></div>
      </a>
      <div class="lang-pill">🇹🇳 Français</div>
    </header>

    <!-- ── Router outlet (login / 2fa / reset) ── -->
    <main class="auth-main">
      <router-outlet />
    </main>

    <!-- ── Footer ── -->
    <footer class="auth-foot">
      <span>© 2026 PaieZone · Tous droits réservés</span>
      <div class="foot-links">
        <a href="#">Mentions légales</a>
        <a href="#">Confidentialité</a>
        <a href="#">Support</a>
      </div>
    </footer>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
        background: #1a0735;
        color: #fafaf7;
        font-family:
          'Plus Jakarta Sans',
          system-ui,
          -apple-system,
          sans-serif;
        -webkit-font-smoothing: antialiased;
        position: relative;
        overflow-x: hidden;
      }

      /* ══ Blobs ══ */
      .mesh-bg {
        position: fixed;
        inset: 0;
        z-index: 0;
        background: #1a0735;
        overflow: hidden;
        pointer-events: none;
      }
      .mesh-bg > div {
        position: absolute;
        border-radius: 50%;
        filter: blur(80px);
        opacity: 0.65;
        will-change: transform;
      }
      .b1 {
        top: -10%;
        left: -10%;
        width: 600px;
        height: 600px;
        background: radial-gradient(circle, #7c3aed, transparent 70%);
        animation: b1 24s ease-in-out infinite;
      }
      .b2 {
        top: 30%;
        right: -10%;
        width: 700px;
        height: 700px;
        background: radial-gradient(circle, #c084fc, transparent 70%);
        animation: b2 28s ease-in-out infinite;
      }
      .b3 {
        bottom: -10%;
        left: 20%;
        width: 550px;
        height: 550px;
        background: radial-gradient(circle, #4f46e5, transparent 70%);
        animation: b3 32s ease-in-out infinite;
      }
      .b4 {
        top: 60%;
        left: 50%;
        width: 400px;
        height: 400px;
        background: radial-gradient(circle, #ec4899, transparent 70%);
        opacity: 0.35;
        animation: b4 36s ease-in-out infinite;
      }
      @keyframes b1 {
        0%,
        100% {
          transform: translate(0, 0) scale(1);
        }
        33% {
          transform: translate(40vw, 20vh) scale(1.15);
        }
        66% {
          transform: translate(20vw, 50vh) scale(0.9);
        }
      }
      @keyframes b2 {
        0%,
        100% {
          transform: translate(0, 0) scale(1);
        }
        50% {
          transform: translate(-40vw, -10vh) scale(1.2);
        }
      }
      @keyframes b3 {
        0%,
        100% {
          transform: translate(0, 0) scale(1);
        }
        50% {
          transform: translate(30vw, -40vh) scale(1.1);
        }
      }
      @keyframes b4 {
        0%,
        100% {
          transform: translate(0, 0) scale(0.9);
        }
        50% {
          transform: translate(-25vw, -25vh) scale(1.2);
        }
      }

      /* ══ Grid overlay ══ */
      .grid-ov {
        position: fixed;
        inset: 0;
        z-index: 1;
        pointer-events: none;
        background-image:
          linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
        background-size: 56px 56px;
        mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
        -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
      }

      /* ══ Floating orbs ══ */
      .orb {
        position: fixed;
        border-radius: 50%;
        background: #c4b5fd;
        box-shadow: 0 0 16px 2px #c4b5fd;
        opacity: 0.7;
        z-index: 2;
        pointer-events: none;
        animation: orb-float 8s ease-in-out infinite;
      }
      .o1 {
        top: 15%;
        left: 8%;
        width: 6px;
        height: 6px;
        animation-delay: 0s;
      }
      .o2 {
        top: 25%;
        right: 12%;
        width: 4px;
        height: 4px;
        animation-delay: 1.5s;
      }
      .o3 {
        bottom: 25%;
        left: 15%;
        width: 5px;
        height: 5px;
        animation-delay: 3s;
      }
      .o4 {
        bottom: 18%;
        right: 10%;
        width: 7px;
        height: 7px;
        animation-delay: 0.7s;
      }
      .o5 {
        top: 45%;
        left: 5%;
        width: 3px;
        height: 3px;
        animation-delay: 2.2s;
      }
      .o6 {
        top: 60%;
        right: 6%;
        width: 5px;
        height: 5px;
        animation-delay: 4s;
      }
      @keyframes orb-float {
        0%,
        100% {
          transform: translateY(0) scale(1);
          opacity: 0.3;
        }
        50% {
          transform: translateY(-20px) scale(1.3);
          opacity: 0.9;
        }
      }

      /* ══ Header ══ */
      .auth-hdr {
        position: relative;
        z-index: 10;
        padding: 28px 36px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .brand {
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 700;
        font-size: 17px;
        letter-spacing: -0.025em;
        color: #fff;
        text-decoration: none;
      }
      .brand-mark {
        width: 38px;
        height: 38px;
        border-radius: 11px;
        background: linear-gradient(135deg, #fff, #ddd6fe);
        color: #0e0420;
        display: grid;
        place-items: center;
        font-weight: 800;
        font-size: 13px;
        box-shadow: 0 8px 24px rgba(196, 181, 253, 0.3);
        position: relative;
        overflow: hidden;
      }
      .brand-mark::after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 14px;
        height: 14px;
        background: #7c3aed;
        border-bottom-left-radius: 9px;
      }
      .it {
        color: #c4b5fd;
        font-weight: 800;
      }
      .lang-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 7px 16px;
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 999px;
        color: rgba(250, 250, 247, 0.7);
        font-size: 12.5px;
        font-weight: 500;
      }

      /* ══ Main ══ */
      .auth-main {
        position: relative;
        z-index: 10;
        min-height: calc(100vh - 200px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px 24px 40px;
      }

      /* ══ Footer ══ */
      .auth-foot {
        position: relative;
        z-index: 10;
        padding: 20px 36px 30px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: rgba(250, 250, 247, 0.4);
        font-size: 12px;
      }
      .foot-links a {
        color: rgba(250, 250, 247, 0.6);
        margin: 0 8px;
        transition: color 0.15s;
      }
      .foot-links a:hover {
        color: #fff;
      }

      @media (max-width: 640px) {
        .auth-hdr {
          padding: 20px;
        }
        .auth-foot {
          flex-direction: column;
          gap: 8px;
          text-align: center;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AuthLayoutComponent {}
