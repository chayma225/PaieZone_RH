import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
  signal,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import IconComponent from '../../core/icon/icon.component';
import { DataService } from '../../core/data.service';

const PLAN_FEATURES: Record<string, string[]> = {
  STARTER: ["Jusqu'à 10 employés", 'Paie + congés', 'Bulletins PDF', 'Support email'],
  PME: ["Jusqu'à 30 employés", 'Tout Starter +', 'Avances & primes', 'Multi-utilisateurs', 'Support prioritaire'],
  BUSINESS: ["Jusqu'à 100 employés", 'Tout PME +', 'Assistant IA RH', 'Export CNSS/CNAM', 'API REST'],
  ENTERPRISE: ["Jusqu'à 500 employés", 'Tout Business +', '2FA obligatoire', 'SLA 99.95%', 'Account manager dédié'],
};

const FAQS: { q: string; a: string; open: boolean }[] = [
  {
    q: 'Mes données sont-elles hébergées en Tunisie ?',
    open: true,
    a: "Oui — 100% de vos données (employés, bulletins, contrats) sont stockées sur des serveurs situés en Tunisie, conformément à la loi tunisienne sur la protection des données personnelles. Sauvegardes chiffrées quotidiennes, redondance multi-zones, traçabilité d'accès complète.",
  },
  {
    q: 'PaieZone est-il à jour avec la Loi de Finances 2026 ?',
    open: false,
    a: "Oui — barèmes CNSS (9,18%), CAVIS (1%), CSS (0,5%), IRPP progressif, TFP et FOPROLOS conformes au JORT n°3-2026. Notre équipe juridique met à jour les taux automatiquement, vous n'avez rien à faire.",
  },
  {
    q: 'Combien de temps pour migrer depuis un autre logiciel ?',
    open: false,
    a: 'En moyenne 10 minutes pour 50 employés. Notre import Excel détecte automatiquement les colonnes (matricule, contrat, salaire, RIB…) et propose un mapping intelligent. Un accompagnement humain est disponible sur les formules Business et Enterprise.',
  },
  {
    q: 'Puis-je essayer sans carte bancaire ?',
    open: false,
    a: "Absolument. Les 14 jours d'essai sont totalement gratuits et sans saisie de moyen de paiement. À la fin de la période, vous choisissez votre formule ou votre compte est simplement archivé — vos données restent récupérables 90 jours.",
  },
  {
    q: "Que se passe-t-il si je dépasse mon plafond d'employés ?",
    open: false,
    a: 'Nous vous prévenons en avance par email. Vous pouvez à tout moment passer à la formule supérieure (proratisée sur le mois en cours). Aucune coupure de service, aucune surprise sur la facture.',
  },
  {
    q: "L'assistant IA peut-il remplacer un comptable ?",
    open: false,
    a: "Non — il assiste votre comptable. L'IA répond aux questions sur le Code du Travail tunisien, explique les calculs de paie et aide vos employés en self-service. Toutes les validations restent à la main de votre équipe RH.",
  },
];

@Component({
  selector: 'pz-welcome',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  templateUrl: './welcome.component.html',
  styles: [
    `
      /* ══ Reset & base ══ */
      :host {
        display: block;
      }
      *,
      *::before,
      *::after {
        box-sizing: border-box;
      }
      .wl-page {
        font-family:
          'Plus Jakarta Sans',
          system-ui,
          -apple-system,
          sans-serif;
        color: #0a0a0f;
        background: #fafaf7;
        -webkit-font-smoothing: antialiased;
        line-height: 1.5;
      }
      /* Neutralise les overrides Bootstrap/JHipster globaux */
      .wl-page a {
        text-decoration: none;
        color: inherit;
        font-weight: inherit;
      }
      .wl-page h1,
      .wl-page h2,
      .wl-page h3,
      .wl-page h4 {
        line-height: inherit;
        color: inherit;
      }
      a {
        text-decoration: none;
        color: inherit;
      }
      .serif {
        font-family: 'Instrument Serif', 'Times New Roman', serif;
        font-weight: 400;
        font-style: italic;
        letter-spacing: -0.005em;
      }

      /* ══ Topbar ══ */
      .topbar {
        height: 72px;
        padding: 0 48px;
        display: flex;
        align-items: center;
        gap: 36px;
        border-bottom: 1px solid #ececea;
        background: rgba(250, 250, 247, 0.82);
        backdrop-filter: blur(18px) saturate(160%);
        position: sticky;
        top: 0;
        z-index: 100;
      }
      .brand {
        display: flex;
        align-items: center;
        gap: 11px;
        font-weight: 700;
        font-size: 17px;
        letter-spacing: -0.025em;
      }
      .brand-mark {
        width: 34px;
        height: 34px;
        border-radius: 10px;
        background: #0a0a0f;
        color: #fafaf7;
        display: grid;
        place-items: center;
        font-weight: 800;
        font-size: 13px;
        position: relative;
        overflow: hidden;
      }
      .brand-mark::after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 12px;
        height: 12px;
        background: #5b21b6;
        border-bottom-left-radius: 8px;
      }
      .it {
        color: #5b21b6;
        font-weight: 800;
      }
      .nav-links {
        display: flex;
        gap: 32px;
        margin: 0 auto;
      }
      .nav-links a {
        color: #3a3d47;
        font-size: 14px;
        font-weight: 500;
        transition: color 0.15s;
        position: relative;
      }
      .nav-links a::after {
        content: '';
        position: absolute;
        bottom: -4px;
        left: 0;
        right: 0;
        height: 2px;
        background: #0a0a0f;
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 0.22s ease;
        border-radius: 2px;
      }
      .nav-links a:hover {
        color: #0a0a0f;
      }
      .nav-links a:hover::after {
        transform: scaleX(1);
      }
      .topbar-actions {
        display: flex;
        gap: 12px;
        align-items: center;
      }

      /* ══ Buttons ══ */
      .btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        height: 42px;
        padding: 0 20px;
        border-radius: 999px;
        border: 1px solid #dcdcd6;
        background: #fff;
        color: #1f2128;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.18s ease;
        white-space: nowrap;
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      }
      .btn:hover {
        background: #0a0a0f;
        color: #fafaf7;
        border-color: #0a0a0f;
      }
      .btn.primary {
        background: #5b21b6;
        color: #fff !important;
        border-color: #5b21b6;
      }
      .btn.primary:hover {
        background: #4c1d95;
        border-color: #4c1d95;
        color: #fff !important;
        transform: translateY(-1px);
      }
      .btn.ghost {
        background: transparent;
        border-color: transparent;
      }
      .btn.ghost:hover {
        background: #fff;
        border-color: #ececea;
        color: #0a0a0f;
      }
      .btn.lg {
        height: 52px;
        padding: 0 28px;
        font-size: 15px;
        font-weight: 600;
      }
      .btn.light {
        background: #fafaf7;
        color: #0a0a0f;
        border-color: #fafaf7;
      }
      .btn.light:hover {
        background: #fff;
      }
      .btn.outline {
        background: rgba(255, 255, 255, 0.12);
        color: #fff;
        border-color: rgba(255, 255, 255, 0.4);
      }
      .btn.outline:hover {
        background: rgba(255, 255, 255, 0.22);
        border-color: rgba(255, 255, 255, 0.7);
      }
      .arrow {
        transition: transform 0.18s;
      }
      .btn:hover .arrow {
        transform: translateX(3px);
      }

      /* ══ Hero ══ */
      /* ── Hero orbes animés ── */
      @keyframes orbDrift1 {
        0%,
        100% {
          transform: translate(0, 0) scale(1);
        }
        33% {
          transform: translate(45px, -28px) scale(1.07);
        }
        66% {
          transform: translate(-22px, 32px) scale(0.96);
        }
      }
      @keyframes orbDrift2 {
        0%,
        100% {
          transform: translate(0, 0) scale(1);
        }
        40% {
          transform: translate(-38px, 24px) scale(1.09);
        }
        70% {
          transform: translate(28px, -18px) scale(0.97);
        }
      }
      @keyframes orbDrift3 {
        0%,
        100% {
          transform: translate(0, 0) scale(1);
        }
        50% {
          transform: translate(20px, 38px) scale(1.05);
        }
      }
      /* Hero entry animations */
      @keyframes heroUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes heroRight {
        from {
          opacity: 0;
          transform: translateX(42px) scale(0.97);
        }
        to {
          opacity: 1;
          transform: translateX(0) scale(1);
        }
      }
      @keyframes heroCurtain {
        from {
          clip-path: inset(0 100% 0 0);
        }
        to {
          clip-path: inset(0 0% 0 0);
        }
      }
      @keyframes floatUp {
        0%,
        100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-10px);
        }
      }
      @keyframes floatAlt {
        0%,
        100% {
          transform: translateY(0) rotate(-1deg);
        }
        50% {
          transform: translateY(-7px) rotate(1.2deg);
        }
      }
      /* Hero showcase shimmer line */
      @keyframes showcaseScan {
        0% {
          top: -2px;
          opacity: 0;
        }
        10% {
          opacity: 0.6;
        }
        90% {
          opacity: 0.4;
        }
        100% {
          top: 102%;
          opacity: 0;
        }
      }

      .hero {
        position: relative;
        padding: 90px 48px 100px;
        max-width: 1440px;
        margin: 0 auto;
        overflow: hidden;
      }

      /* ── Orbes flottants ── */
      .hero-orb {
        position: absolute;
        border-radius: 50%;
        filter: blur(72px);
        pointer-events: none;
        z-index: 0;
        will-change: transform;
      }
      .hero-orb-1 {
        width: 520px;
        height: 520px;
        top: -80px;
        right: -60px;
        background: radial-gradient(circle, rgba(91, 33, 182, 0.22) 0%, transparent 70%);
        animation: orbDrift1 22s ease-in-out infinite;
      }
      .hero-orb-2 {
        width: 380px;
        height: 380px;
        bottom: -40px;
        left: -80px;
        background: radial-gradient(circle, rgba(126, 34, 206, 0.14) 0%, transparent 70%);
        animation: orbDrift2 28s ease-in-out infinite;
      }
      .hero-orb-3 {
        width: 260px;
        height: 260px;
        top: 40%;
        left: 40%;
        background: radial-gradient(circle, rgba(79, 70, 229, 0.1) 0%, transparent 70%);
        animation: orbDrift3 17s ease-in-out infinite;
      }

      .hero-inner {
        position: relative;
        display: grid;
        grid-template-columns: 1.15fr 1fr;
        gap: 60px;
        align-items: center;
        z-index: 1;
        overflow: visible;
      }

      /* ── Entrée Hero (stagger) ── */
      .hero-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 32px;
        font-size: 13px;
        font-weight: 600;
        color: #3a3d47;
        animation: heroUp 0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.05s both;
      }
      .hero-inner h1 {
        animation: heroUp 0.75s cubic-bezier(0.22, 1, 0.36, 1) 0.15s both;
      }
      .hero-lead {
        animation: heroUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.28s both;
      }
      .hero-actions {
        animation: heroUp 0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.4s both;
      }
      .hero-stats {
        animation: heroUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.52s both;
      }
      /* Showcase slide depuis la droite */
      .hero-showcase {
        animation: heroRight 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both;
      }

      /* Scan line sur le showcase */
      .hero-showcase .showcase-main {
        position: relative;
        overflow: hidden;
      }
      .hero-showcase .showcase-main::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, transparent, rgba(167, 139, 250, 0.7), transparent);
        animation: showcaseScan 4.5s ease-in-out 1.2s infinite;
        pointer-events: none;
        z-index: 10;
      }

      /* Float chips */
      .float-ai {
        animation: floatUp 3.8s ease-in-out infinite;
      }
      .float-cnss {
        animation: floatAlt 4.6s ease-in-out 0.8s infinite;
      }
      .dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #10b981;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.18);
        animation: livepulse 2s ease-in-out infinite;
      }
      @keyframes livepulse {
        0%,
        100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.15);
        }
      }
      .pin {
        padding: 3px 10px;
        border-radius: 999px;
        background: #0a0a0f;
        color: #fafaf7;
        font-size: 10.5px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      h1 {
        font-size: 84px;
        font-weight: 700;
        line-height: 0.95;
        letter-spacing: -0.045em;
        margin: 0 0 30px;
        color: #0a0a0f;
      }
      h1 .serif {
        color: #5b21b6;
      }
      h1 .underline {
        position: relative;
        display: inline-block;
      }
      h1 .underline::after {
        content: '';
        position: absolute;
        bottom: 4px;
        left: -2%;
        right: -2%;
        height: 11px;
        background: #5b21b6;
        z-index: -1;
        border-radius: 4px;
        opacity: 0.85;
      }
      .hero-lead {
        font-size: 19px;
        line-height: 1.55;
        color: #3a3d47;
        max-width: 540px;
        margin: 0 0 40px;
      }
      .hero-lead strong {
        color: #0a0a0f;
        font-weight: 600;
      }
      .hero-actions {
        display: flex;
        gap: 14px;
        margin-bottom: 36px;
        align-items: center;
      }
      .hero-stats {
        display: flex;
        gap: 36px;
        padding-top: 32px;
        border-top: 1px solid #ececea;
      }
      .hero-stat-num {
        font-size: 32px;
        font-weight: 700;
        letter-spacing: -0.025em;
        line-height: 1;
        color: #0a0a0f;
      }
      .hero-stat-lbl {
        font-size: 12.5px;
        color: #6b7280;
        margin-top: 6px;
      }

      /* ══ Showcase ══ */
      .hero-showcase {
        position: relative;
        height: 620px;
        overflow: visible;
      }
      .showcase-main {
        position: absolute;
        top: 20px;
        right: -20px;
        width: 540px;
        background: #2a0f56;
        border-radius: 22px;
        padding: 22px;
        box-shadow:
          0 30px 80px -20px rgba(45, 15, 90, 0.5),
          0 8px 24px rgba(45, 15, 90, 0.18);
        transform: rotate(-1.5deg);
      }
      .showcase-chrome {
        display: flex;
        align-items: center;
        gap: 7px;
        padding-bottom: 14px;
        margin-bottom: 14px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }
      .light {
        width: 11px;
        height: 11px;
        border-radius: 50%;
      }
      .r {
        background: #ff5f57;
      }
      .y {
        background: #febc2e;
      }
      .g {
        background: #28c840;
      }
      .url {
        margin-left: auto;
        background: rgba(255, 255, 255, 0.06);
        color: rgba(255, 255, 255, 0.45);
        padding: 4px 14px;
        border-radius: 999px;
        font-size: 11px;
        font-family: 'JetBrains Mono', monospace;
      }
      .showcase-body {
        color: #fafaf7;
      }
      .showcase-title-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 18px;
      }
      .showcase-title {
        font-size: 15px;
        font-weight: 600;
        letter-spacing: -0.015em;
      }
      .showcase-title small {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.5);
        display: block;
        margin-top: 2px;
        font-weight: 400;
      }
      .showcase-cta {
        padding: 7px 14px;
        background: #5b21b6;
        color: #fff;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 600;
      }
      .showcase-stats {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 10px;
        margin-bottom: 16px;
      }
      .showcase-stat {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.06);
        padding: 12px 14px;
        border-radius: 12px;
      }
      .showcase-stat-lbl {
        font-size: 10.5px;
        color: rgba(255, 255, 255, 0.5);
        text-transform: uppercase;
        letter-spacing: 0.06em;
        font-weight: 600;
      }
      .showcase-stat-val {
        font-size: 20px;
        font-weight: 700;
        font-family: 'JetBrains Mono', monospace;
        margin-top: 4px;
        letter-spacing: -0.02em;
      }
      .showcase-stat-val small {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.4);
        margin-left: 3px;
        font-weight: 500;
      }
      .showcase-stat-delta {
        font-size: 10.5px;
        color: #4ade80;
        margin-top: 4px;
      }
      .showcase-chart {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 12px;
        padding: 14px;
        margin-bottom: 14px;
      }
      .showcase-chart-h {
        display: flex;
        justify-content: space-between;
        font-size: 11.5px;
        color: rgba(255, 255, 255, 0.65);
        margin-bottom: 10px;
      }
      .showcase-chart-h strong {
        color: #fff;
        font-weight: 600;
      }
      .showcase-svg {
        width: 100%;
        height: 90px;
        display: block;
      }
      .showcase-emps {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .showcase-emp {
        display: grid;
        grid-template-columns: 24px 1fr auto;
        gap: 10px;
        align-items: center;
        background: rgba(255, 255, 255, 0.04);
        border-radius: 10px;
        padding: 8px 12px;
        font-size: 12.5px;
      }
      .showcase-emp-av {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        font-size: 9px;
        font-weight: 700;
        color: #0a0a0f;
      }
      .a1 {
        background: #fcd34d;
      }
      .a2 {
        background: #93c5fd;
      }
      .a3 {
        background: #86efac;
      }
      .showcase-emp-meta small {
        color: rgba(255, 255, 255, 0.4);
        font-size: 10.5px;
        display: block;
      }
      .showcase-emp-amt {
        font-family: 'JetBrains Mono', monospace;
        font-weight: 600;
        font-size: 12px;
      }

      /* Float chips */
      .float-ai {
        position: absolute;
        top: 80px;
        left: -40px;
        background: #fafaf7;
        border-radius: 16px;
        padding: 16px 18px;
        display: flex;
        gap: 12px;
        align-items: center;
        box-shadow: 0 16px 40px rgba(10, 10, 15, 0.16);
        z-index: 2;
        transform: rotate(-3deg);
        border: 1px solid #ececea;
        max-width: 280px;
      }
      .float-ai-ico {
        width: 38px;
        height: 38px;
        border-radius: 11px;
        background: linear-gradient(135deg, #5b21b6, #7e22ce);
        display: grid;
        place-items: center;
        color: #fff;
        flex-shrink: 0;
      }
      .float-ai .text {
        font-size: 13px;
        font-weight: 600;
        color: #0a0a0f;
        line-height: 1.35;
      }
      .float-ai .sub {
        font-size: 11px;
        color: #6b7280;
        font-weight: 500;
        margin-top: 2px;
      }
      .float-slip {
        position: absolute;
        bottom: 80px;
        left: 20px;
        background: #5b21b6;
        color: #fff;
        border-radius: 16px;
        padding: 18px 22px;
        box-shadow: 0 16px 40px rgba(91, 33, 182, 0.4);
        z-index: 2;
        transform: rotate(4deg);
        min-width: 220px;
      }
      .float-slip .lbl {
        font-size: 11px;
        opacity: 0.85;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-weight: 700;
      }
      .float-slip .val {
        font-size: 30px;
        font-weight: 700;
        font-family: 'JetBrains Mono', monospace;
        margin-top: 4px;
        letter-spacing: -0.025em;
      }
      .float-slip .sub {
        font-size: 11.5px;
        opacity: 0.85;
        margin-top: 4px;
        font-weight: 500;
      }
      .float-slip .arrow-line {
        position: absolute;
        top: -32px;
        right: 30px;
        color: #0a0a0f;
        font-size: 14px;
        font-family: 'Instrument Serif', serif;
        font-style: italic;
        transform: rotate(-15deg);
      }
      .float-slip .arrow-line svg {
        position: absolute;
        bottom: -22px;
        right: -8px;
      }

      /* ══ Marquee ══ */
      .marquee {
        padding: 28px 0;
        background: #2a0f56;
        color: #fafaf7;
        overflow: hidden;
        position: relative;
      }
      .marquee::before,
      .marquee::after {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        width: 120px;
        z-index: 2;
        pointer-events: none;
      }
      .marquee::before {
        left: 0;
        background: linear-gradient(90deg, #2a0f56, transparent);
      }
      .marquee::after {
        right: 0;
        background: linear-gradient(-90deg, #2a0f56, transparent);
      }
      .marquee-track {
        display: flex;
        gap: 64px;
        animation: scroll-mq 35s linear infinite;
        width: max-content;
      }
      .marquee-item {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 22px;
        font-weight: 600;
        letter-spacing: -0.02em;
        color: rgba(250, 250, 247, 0.55);
        white-space: nowrap;
      }
      .star {
        color: #c4b5fd;
        font-size: 16px;
      }
      @keyframes scroll-mq {
        to {
          transform: translateX(-50%);
        }
      }

      /* ══ Sections ══ */
      .section {
        padding: 140px 48px;
        max-width: 1440px;
        margin: 0 auto;
      }
      .section.bg-cream {
        background: #f5f3ee;
        max-width: none;
        padding: 140px 48px;
      }
      .section-inner {
        max-width: 1440px;
        margin: 0 auto;
      }
      .section-head {
        margin-bottom: 72px;
        max-width: 880px;
      }
      .section-head.center {
        margin-left: auto;
        margin-right: auto;
        text-align: center;
      }
      .eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 12.5px;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: #0a0a0f;
        font-weight: 700;
        margin-bottom: 24px;
        padding: 6px 14px 6px 8px;
        background: #fff;
        border: 1px solid #ececea;
        border-radius: 999px;
      }
      .eyebrow-num {
        background: #0a0a0f;
        color: #fafaf7;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        display: inline-grid;
        place-items: center;
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
      }
      .section-head h2 {
        font-size: 64px;
        font-weight: 700;
        letter-spacing: -0.04em;
        margin: 0 0 22px;
        color: #0a0a0f;
        line-height: 1;
      }
      .section-head h2 .serif {
        color: #5b21b6;
      }
      .section-head p {
        font-size: 19px;
        color: #3a3d47;
        line-height: 1.55;
        margin: 0;
        max-width: 600px;
      }
      .section-head.center p {
        margin: 0 auto;
      }

      /* ══ How it works ══ */
      .how-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0;
        border: 1px solid #ececea;
        border-radius: 24px;
        overflow: hidden;
        background: #fff;
      }
      .how-step {
        padding: 48px 40px;
        border-right: 1px solid #ececea;
        position: relative;
        transition:
          background 0.2s,
          opacity 0.7s ease,
          transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        opacity: 0;
        transform: translateY(32px);
      }
      .how-step:last-child {
        border-right: 0;
      }
      .how-step.how-step-2 {
        transition-delay: 0.14s;
      }
      .how-step.how-step-3 {
        transition-delay: 0.28s;
      }
      .how-step.how-step-in {
        opacity: 1;
        transform: translateY(0);
      }
      .how-step:hover {
        background: #fafaf7;
      }
      .how-num {
        font-family: 'JetBrains Mono', monospace;
        font-size: 14px;
        color: #6b7280;
        font-weight: 600;
        margin-bottom: 60px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .how-num::after {
        content: '';
        flex: 1;
        height: 1px;
        background: #dcdcd6;
      }
      .how-step h3 {
        font-size: 28px;
        font-weight: 600;
        letter-spacing: -0.025em;
        margin: 0 0 14px;
        color: #0a0a0f;
        line-height: 1.15;
      }
      .how-step h3 .serif {
        color: #5b21b6;
      }
      .how-step p {
        font-size: 14.5px;
        color: #3a3d47;
        line-height: 1.65;
        margin: 0;
      }

      /* ══ Bento product grid ══ */
      .bento {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: 360px 360px;
        gap: 16px;
      }
      .bento-card {
        background: #fff;
        border: 1px solid #ececea;
        border-radius: 22px;
        padding: 32px;
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        transform-style: preserve-3d;
        will-change: transform, opacity;
        /* état initial — avant animation */
        opacity: 0;
        transform: translateY(28px) scale(0.97);
        transition:
          opacity 0.65s ease,
          transform 0.65s cubic-bezier(0.22, 1, 0.36, 1),
          box-shadow 0.3s ease,
          border-color 0.2s ease;
        transition-delay: var(--d, 0s);
      }
      .bento-card.bento-in {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      .bento-card:hover {
        border-color: #0a0a0f;
        transform: perspective(900px) rotateX(2.5deg) rotateY(-3.5deg) translateY(-6px);
        box-shadow:
          0 24px 48px -12px rgba(10, 10, 15, 0.12),
          8px 12px 28px -8px rgba(91, 33, 182, 0.1);
      }
      /* Lueur intérieure au hover */
      .bento-card::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, transparent 50%);
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
        border-radius: inherit;
      }
      .bento-card:hover::after {
        opacity: 1;
      }
      .bento-card.feat-1 {
        grid-column: span 2;
        background: #2a0f56;
        color: #fafaf7;
        border-color: #2a0f56;
      }
      .bento-card.feat-2 {
        background: #5b21b6;
        color: #fff;
        border-color: #5b21b6;
      }
      .bento-card.feat-4 {
        grid-column: span 2;
        background: #f5f3ee;
      }
      .bento-header {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 12px;
      }
      .bento-card h3 {
        font-size: 26px;
        font-weight: 600;
        letter-spacing: -0.025em;
        margin: 0 0 12px;
        line-height: 1.1;
        max-width: 380px;
      }
      .bento-card.feat-1 h3 .serif {
        color: #c7d2fe;
      }
      .bento-card p {
        font-size: 14px;
        line-height: 1.6;
        margin: 0;
        max-width: 380px;
      }
      .bento-card.feat-1 p {
        color: rgba(250, 250, 247, 0.7);
      }
      .bento-card.feat-2 p {
        color: rgba(255, 255, 255, 0.85);
      }
      .bento-card:not(.feat-1):not(.feat-2) p {
        color: #3a3d47;
      }
      .bento-tag {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        color: rgba(250, 250, 247, 0.7);
      }
      .bento-card:not(.feat-1):not(.feat-2) .bento-tag {
        background: #0a0a0f;
        color: #fafaf7;
      }
      .bento-card.feat-2 .bento-tag {
        background: rgba(255, 255, 255, 0.18);
        color: #fff;
      }
      .bento-illust {
        margin-top: auto;
        align-self: flex-end;
        pointer-events: none;
      }
      .ill-chat {
        display: flex;
        flex-direction: column;
        gap: 8px;
        align-items: flex-end;
        padding-bottom: 8px;
      }
      .chat-bubble {
        padding: 8px 14px;
        border-radius: 14px;
        font-size: 12px;
        max-width: 220px;
      }
      .chat-bubble.them {
        background: rgba(255, 255, 255, 0.1);
        color: rgba(250, 250, 247, 0.9);
      }
      .chat-bubble.me {
        background: #5b21b6;
        color: #fff;
      }
      .ill-cnss {
      }
      .ill-cnss-percent {
        font-family: 'JetBrains Mono', monospace;
        font-size: 96px;
        font-weight: 700;
        letter-spacing: -0.06em;
        color: rgba(255, 255, 255, 0.18);
        line-height: 1;
      }
      .ill-cal {
        background: #fff;
        border: 1px solid #ececea;
        border-radius: 12px;
        padding: 12px;
        width: 200px;
        box-shadow: 0 8px 20px rgba(10, 10, 15, 0.08);
      }
      .ill-cal-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 3px;
        margin-top: 8px;
      }
      .ill-cal-cell {
        aspect-ratio: 1;
        border-radius: 4px;
        background: #f5f3ee;
        display: grid;
        place-items: center;
        font-size: 9px;
        color: #6b7280;
        font-weight: 500;
      }
      .ill-cal-cell.has {
        background: #f3eefe;
        color: #5b21b6;
      }
      .ill-cal-cell.today {
        background: #0a0a0f;
        color: #fff;
        font-weight: 600;
      }
      .ill-doc {
        display: flex;
        gap: 8px;
      }
      .ill-doc-card {
        background: #fff;
        border: 1px solid #ececea;
        border-radius: 8px;
        padding: 10px 12px;
        width: 130px;
        box-shadow: 0 6px 16px rgba(10, 10, 15, 0.06);
      }
      .ill-doc-card.tilt {
        transform: rotate(-3deg);
      }
      .ill-doc-card-h {
        display: flex;
        gap: 6px;
        align-items: center;
        margin-bottom: 8px;
      }
      .ill-doc-card-h .pill {
        background: #ecfdf5;
        color: #10b981;
        font-size: 9px;
        padding: 1px 5px;
        border-radius: 4px;
        font-weight: 600;
      }
      .ill-doc-card-line {
        height: 4px;
        background: #ececea;
        border-radius: 2px;
        margin-bottom: 4px;
      }
      .ill-doc-card-line.s {
        width: 70%;
      }
      .ill-bigstat {
        position: absolute;
        bottom: 28px;
        right: 28px;
        text-align: right;
        pointer-events: none;
      }
      .ill-bigstat-num {
        font-family: 'JetBrains Mono', monospace;
        font-size: 100px;
        font-weight: 700;
        letter-spacing: -0.05em;
        line-height: 1;
        color: #0a0a0f;
      }
      .ill-bigstat-num small {
        font-size: 36px;
        color: #6b7280;
      }
      .ill-bigstat-lbl {
        font-size: 11px;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-weight: 600;
        margin-top: 8px;
      }

      /* ══ Big numbers band ══ */
      .big-numbers {
        background: #2a0f56;
        color: #fafaf7;
        padding: 110px 48px;
        overflow: hidden;
        position: relative;
      }
      .big-numbers::before {
        content: '';
        position: absolute;
        inset: 0;
        background:
          radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.32), transparent 40%),
          radial-gradient(circle at 80% 50%, rgba(192, 132, 252, 0.18), transparent 40%);
        pointer-events: none;
      }
      .big-numbers-inner {
        max-width: 1440px;
        margin: 0 auto;
        position: relative;
      }
      .big-numbers-head {
        text-align: center;
        margin-bottom: 80px;
      }
      .big-numbers-head .eyebrow {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.12);
        color: #fff;
      }
      .big-numbers-head .eyebrow-num {
        background: #fafaf7;
        color: #0a0a0f;
      }
      .big-numbers-head h2 {
        font-size: 56px;
        font-weight: 700;
        letter-spacing: -0.04em;
        line-height: 1.05;
        margin: 0 auto;
        max-width: 880px;
      }
      .big-numbers-head h2 .serif {
        color: #c4b5fd;
      }
      .big-numbers-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 0;
      }
      .big-num {
        padding: 20px 24px;
        border-right: 1px solid rgba(255, 255, 255, 0.1);
        text-align: center;
        opacity: 0;
        transform: translateY(24px);
        transition:
          opacity 0.6s ease,
          transform 0.6s ease;
      }
      .big-num:last-child {
        border-right: 0;
      }
      .big-num:nth-child(1) {
        transition-delay: 0s;
      }
      .big-num:nth-child(2) {
        transition-delay: 0.12s;
      }
      .big-num:nth-child(3) {
        transition-delay: 0.24s;
      }
      .big-num:nth-child(4) {
        transition-delay: 0.36s;
      }
      .big-num.visible {
        opacity: 1;
        transform: translateY(0);
      }
      .big-num-val {
        font-family: 'JetBrains Mono', monospace;
        font-size: 72px;
        font-weight: 700;
        letter-spacing: -0.04em;
        line-height: 0.95;
        color: #fff;
        transition: all 0.1s;
      }
      .big-num-val small {
        font-size: 32px;
        color: rgba(250, 250, 247, 0.55);
      }
      .big-num-lbl {
        font-size: 13px;
        color: rgba(250, 250, 247, 0.65);
        margin-top: 16px;
        font-weight: 500;
        line-height: 1.5;
      }

      /* ══ Testimonial ══ */
      .testimonial-wrap {
        padding: 140px 48px;
        max-width: 1100px;
        margin: 0 auto;
      }
      .testimonial-card {
        background: #f5f3ee;
        border-radius: 32px;
        padding: 80px 64px;
        position: relative;
        overflow: hidden;
      }
      .testimonial-card::before {
        content: '"';
        position: absolute;
        top: 20px;
        left: 40px;
        font-family: 'Instrument Serif', serif;
        font-style: italic;
        font-size: 220px;
        color: #5b21b6;
        line-height: 1;
        opacity: 0.18;
      }
      .testimonial-quote {
        position: relative;
        font-size: 36px;
        font-weight: 500;
        letter-spacing: -0.025em;
        line-height: 1.25;
        color: #0a0a0f;
        margin: 0 0 40px;
        max-width: 880px;
      }
      .testimonial-quote .serif {
        color: #5b21b6;
      }
      .testimonial-author {
        position: relative;
        display: flex;
        align-items: center;
        gap: 16px;
        padding-top: 32px;
        border-top: 1px solid rgba(10, 10, 15, 0.1);
      }
      .testimonial-avatar {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: linear-gradient(135deg, #fcd34d, #f59e0b);
        color: #78350f;
        display: grid;
        place-items: center;
        font-weight: 700;
        font-size: 19px;
      }
      .testimonial-meta-name {
        font-size: 16px;
        font-weight: 600;
        color: #0a0a0f;
      }
      .testimonial-meta-title {
        font-size: 13px;
        color: #6b7280;
        margin-top: 2px;
      }
      .testimonial-rating {
        margin-left: auto;
        display: flex;
        gap: 3px;
        color: #5b21b6;
        font-size: 18px;
      }

      /* ══ Plans ══ */
      .plans-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
      }
      .plan {
        position: relative;
        padding: 36px 30px;
        border-radius: 22px;
        border: 1px solid #ececea;
        background: #fff;
        display: flex;
        flex-direction: column;
        gap: 24px;
        transition: all 0.25s;
      }
      .plan:hover {
        border-color: #0a0a0f;
        transform: translateY(-4px);
        box-shadow: 0 24px 50px -12px rgba(10, 10, 15, 0.1);
      }
      .plan.popular {
        background: #2a0f56;
        color: #fafaf7;
        border-color: #2a0f56;
        transform: scale(1.04);
      }
      .plan.popular:hover {
        transform: scale(1.04) translateY(-4px);
      }
      .popular-badge {
        position: absolute;
        top: -14px;
        left: 50%;
        transform: translateX(-50%);
        background: #5b21b6;
        color: #fff;
        padding: 6px 16px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        white-space: nowrap;
      }
      .plan-head {
        padding-bottom: 24px;
        border-bottom: 1px solid #ececea;
      }
      .plan.popular .plan-head {
        border-bottom-color: rgba(255, 255, 255, 0.1);
      }
      .plan-name {
        font-size: 13px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: 14px;
        color: #6b7280;
      }
      .plan.popular .plan-name {
        color: rgba(250, 250, 247, 0.6);
      }
      .plan-price {
        display: flex;
        align-items: baseline;
        gap: 6px;
      }
      .plan-price .price {
        font-size: 48px;
        font-weight: 700;
        letter-spacing: -0.035em;
        line-height: 1;
        font-family: 'JetBrains Mono', monospace;
        color: #0a0a0f;
      }
      .plan.popular .plan-price .price {
        color: #fff;
      }
      .plan-price .period {
        font-size: 13px;
        color: #6b7280;
      }
      .plan.popular .plan-price .period {
        color: rgba(255, 255, 255, 0.55);
      }
      .plan-max {
        font-size: 13px;
        color: #6b7280;
        margin-top: 10px;
        font-weight: 500;
      }
      .plan.popular .plan-max {
        color: rgba(255, 255, 255, 0.6);
      }
      .plan-features {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 12px;
        flex: 1;
      }
      .plan-features li {
        display: flex;
        gap: 10px;
        align-items: flex-start;
        font-size: 14px;
        line-height: 1.4;
        color: #3a3d47;
      }
      .plan.popular .plan-features li {
        color: rgba(255, 255, 255, 0.85);
      }
      .check {
        color: #10b981;
        flex-shrink: 0;
        margin-top: 3px;
      }
      .plan.popular .check {
        color: #c4b5fd;
      }
      .btn.full {
        width: 100%;
        justify-content: center;
        height: 48px;
        border-radius: 12px;
        background: transparent;
        color: #5b21b6;
        border: 1.5px solid #5b21b6;
        font-weight: 600;
      }
      .btn.full:hover {
        background: #5b21b6;
        color: #fff;
        transform: none;
      }
      .plan.popular .btn.full {
        background: #5b21b6;
        color: #fff;
        border-color: #5b21b6;
      }
      .plan.popular .btn.full:hover {
        background: #4c1d95;
        border-color: #4c1d95;
        transform: none;
      }

      /* ══ FAQ ══ */
      .faq-layout {
        display: grid;
        grid-template-columns: 1fr 1.6fr;
        gap: 80px;
        max-width: 1280px;
        margin: 0 auto;
      }
      .faq-side h2 {
        font-size: 48px;
        font-weight: 700;
        letter-spacing: -0.035em;
        margin: 24px 0 18px;
        line-height: 1.05;
        color: #0a0a0f;
      }
      .faq-side h2 .serif {
        color: #5b21b6;
      }
      .faq-side > p {
        font-size: 15px;
        color: #3a3d47;
        line-height: 1.55;
        margin: 0 0 28px;
      }
      .contact-card {
        padding: 24px;
        background: #2a0f56;
        color: #fafaf7;
        border-radius: 18px;
      }
      .contact-card h4 {
        font-size: 17px;
        font-weight: 600;
        margin: 0 0 8px;
        letter-spacing: -0.015em;
      }
      .contact-card p {
        color: rgba(250, 250, 247, 0.65);
        font-size: 13.5px;
        margin: 0 0 18px;
      }
      .contact-card .btn {
        background: #fafaf7;
        color: #0a0a0f;
        border-color: #fafaf7;
        height: 38px;
      }
      .contact-card .btn:hover {
        background: #5b21b6;
        color: #fff;
        border-color: #5b21b6;
      }
      .faq-list {
        display: flex;
        flex-direction: column;
      }
      .faq-item {
        border-top: 1px solid #ececea;
      }
      .faq-item:last-child {
        border-bottom: 1px solid #ececea;
      }
      .faq-item summary {
        padding: 24px 0;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        list-style: none;
        font-size: 18px;
        font-weight: 600;
        color: #0a0a0f;
        letter-spacing: -0.015em;
        gap: 24px;
        transition: color 0.15s;
      }
      .faq-item summary::-webkit-details-marker {
        display: none;
      }
      .faq-item summary:hover {
        color: #5b21b6;
      }
      .faq-icon {
        flex-shrink: 0;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 1px solid #dcdcd6;
        display: grid;
        place-items: center;
        transition: all 0.2s;
        color: #3a3d47;
      }
      .faq-item[open] .faq-icon {
        background: #0a0a0f;
        color: #fafaf7;
        border-color: #0a0a0f;
        transform: rotate(45deg);
      }
      .faq-answer {
        padding: 0 0 28px;
        font-size: 15px;
        color: #3a3d47;
        line-height: 1.65;
        max-width: 580px;
      }

      /* ══ CTA rounded card ══ */
      .cta-band {
        padding: 60px 48px 100px;
        background: #fafaf7;
      }
      .cta {
        max-width: 1440px;
        margin: 0 auto;
        background: #2a0f56;
        color: #fafaf7;
        border-radius: 32px;
        padding: 100px 80px;
        position: relative;
        overflow: hidden;
      }
      .cta::before {
        content: '';
        position: absolute;
        inset: 0;
        background:
          radial-gradient(circle at 15% 20%, rgba(139, 92, 246, 0.38), transparent 50%),
          radial-gradient(circle at 85% 80%, rgba(192, 132, 252, 0.22), transparent 50%);
        pointer-events: none;
      }
      .cta-inner {
        position: relative;
        max-width: 760px;
        text-align: left;
      }
      .cta-inner h2 {
        font-size: 72px;
        font-weight: 700;
        letter-spacing: -0.04em;
        margin: 0 0 24px;
        line-height: 0.95;
        color: #fafaf7;
      }
      .cta-inner h2 .serif {
        color: #c4b5fd;
      }
      .cta-inner p {
        font-size: 19px;
        color: rgba(250, 250, 247, 0.75);
        margin: 0 0 40px;
        line-height: 1.55;
        max-width: 540px;
      }
      .cta-actions {
        display: flex;
        gap: 14px;
        flex-wrap: wrap;
        align-items: center;
      }
      .cta-create {
        background: #7c3aed !important;
        color: #fff !important;
        border-color: #7c3aed !important;
        font-weight: 800;
        padding: 14px 36px;
        font-size: 16px;
        letter-spacing: -0.01em;
        box-shadow: 0 4px 24px rgba(124, 58, 237, 0.35);
      }
      .cta-create:hover {
        background: #6d28d9 !important;
        color: #fff !important;
        border-color: #6d28d9 !important;
        transform: translateY(-2px);
        box-shadow: 0 10px 36px rgba(124, 58, 237, 0.45);
      }
      .cta-create .arrow {
        color: #c4b5fd;
      }
      .cta-meta {
        position: absolute;
        bottom: 60px;
        right: 80px;
        display: flex;
        gap: 28px;
        color: rgba(250, 250, 247, 0.55);
        font-size: 12.5px;
      }
      .cta-meta .row {
        display: flex;
        gap: 6px;
        align-items: center;
      }
      .cta-check {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        color: #4ade80;
        display: grid;
        place-items: center;
      }
      .cta .btn.light {
        background: #fafaf7;
        color: #0a0a0f;
        border-color: #fafaf7;
      }
      .cta .btn.light:hover {
        background: #5b21b6;
        color: #fff;
        border-color: #5b21b6;
        transform: translateY(-1px);
      }

      /* ══ Footer ══ */
      .footer {
        background: #fafaf7;
        border-top: 1px solid #ececea;
        padding: 60px 48px 32px;
        color: #3a3d47;
      }
      .foot-cols {
        max-width: 1440px;
        margin: 0 auto;
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr;
        gap: 64px;
      }
      .foot-tagline {
        font-size: 14.5px;
        line-height: 1.65;
        max-width: 360px;
        margin: 16px 0 24px;
        color: #3a3d47;
      }
      .foot-social {
        display: flex;
        gap: 8px;
      }
      .foot-social a {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 1px solid #dcdcd6;
        display: grid;
        place-items: center;
        color: #3a3d47;
        transition: all 0.15s;
      }
      .foot-social a:hover {
        background: #0a0a0f;
        color: #fafaf7;
        border-color: #0a0a0f;
      }
      .foot-title {
        color: #0a0a0f;
        font-weight: 600;
        font-size: 13.5px;
        margin-bottom: 18px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }
      .foot-cols a:not(.foot-social a) {
        display: block;
        font-size: 14px;
        padding: 6px 0;
        transition: color 0.12s;
        color: #3a3d47;
      }
      .foot-cols a:not(.foot-social a):hover {
        color: #0a0a0f;
      }
      .foot-bottom {
        max-width: 1440px;
        margin: 56px auto 0;
        padding-top: 28px;
        border-top: 1px solid #ececea;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 13px;
        flex-wrap: wrap;
        gap: 12px;
        color: #6b7280;
      }

      /* ══ Responsive ══ */
      @media (max-width: 1100px) {
        .hero-inner {
          grid-template-columns: 1fr;
        }
        .hero-showcase {
          display: none;
        }
        h1 {
          font-size: 64px;
        }
        .bento {
          grid-template-columns: 1fr;
          grid-template-rows: auto;
        }
        .bento-card.feat-1,
        .bento-card.feat-4 {
          grid-column: span 1;
        }
        .how-grid,
        .plans-grid {
          grid-template-columns: 1fr;
        }
        .how-step {
          border-right: 0;
          border-bottom: 1px solid #ececea;
        }
        .how-step:last-child {
          border-bottom: 0;
        }
        .big-numbers-grid {
          grid-template-columns: 1fr 1fr;
          gap: 32px 0;
        }
        .faq-layout,
        .foot-cols {
          grid-template-columns: 1fr;
          gap: 32px;
        }
        .nav-links {
          display: none;
        }
        .plan.popular {
          transform: none;
        }
        .testimonial-card {
          padding: 48px 32px;
        }
        .cta {
          padding: 64px 32px;
        }
        .cta-meta {
          position: static;
          margin-top: 32px;
        }
      }
      @media (max-width: 640px) {
        .topbar {
          padding: 0 20px;
          height: 64px;
        }
        .nav-links {
          display: none;
        }
        h1 {
          font-size: 44px;
        }
        .section,
        .section.bg-cream,
        .big-numbers,
        .testimonial-wrap,
        .cta-band {
          padding: 80px 20px;
        }
        .hero {
          padding: 60px 20px 80px;
        }
        .plans-grid {
          grid-template-columns: 1fr;
        }
        .footer {
          padding: 40px 20px 24px;
        }
        .cta {
          padding: 48px 24px;
        }
        .cta-inner h2 {
          font-size: 42px;
        }
        .testimonial-quote {
          font-size: 22px;
        }
        .marquee-item {
          font-size: 16px;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class WelcomeComponent implements AfterViewInit, OnDestroy {
  private readonly data = inject(DataService);
  private readonly zone = inject(NgZone);

  @ViewChild('chiffresSection') private chiffresRef!: ElementRef<HTMLElement>;
  @ViewChild('howSection') private howRef!: ElementRef<HTMLElement>;
  @ViewChild('bentoSection') private bentoRef!: ElementRef<HTMLElement>;

  private observers: IntersectionObserver[] = [];

  protected readonly numbersVisible = signal(false);
  protected readonly howVisible = signal(false);
  protected readonly bentoVisible = signal(false);
  protected readonly countedNums = signal({ min: 0, h: 0, uptime: '0', conformity: 0 });

  ngAfterViewInit(): void {
    this.addObserver(this.chiffresRef, () => {
      this.numbersVisible.set(true);
      this.zone.runOutsideAngular(() => this.startCountup());
    });
    this.addObserver(this.howRef, () => this.howVisible.set(true));
    this.addObserver(this.bentoRef, () => this.bentoVisible.set(true));
  }

  private addObserver(ref: ElementRef<HTMLElement> | undefined, cb: () => void, threshold = 0.2): void {
    if (!ref?.nativeElement) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.zone.run(cb);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(ref.nativeElement);
    this.observers.push(obs);
  }

  ngOnDestroy(): void {
    this.observers.forEach(o => o.disconnect());
  }

  private startCountup(): void {
    const duration = 1800;
    const fps = 60;
    const steps = Math.round((duration / 1000) * fps);
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const t = step / steps;
      const ease = 1 - Math.pow(1 - t, 3); // cubic ease-out
      this.zone.run(() => {
        this.countedNums.set({
          min: Math.round(10 * ease),
          h: Math.round(7 * ease),
          uptime: (99.97 * ease).toFixed(ease >= 1 ? 2 : 0),
          conformity: Math.round(100 * ease),
        });
      });
      if (step >= steps) {
        clearInterval(timer);
        this.zone.run(() => this.countedNums.set({ min: 10, h: 7, uptime: '99,97', conformity: 100 }));
      }
    }, 1000 / fps);
  }

  protected scrollTo(id: string, e: Event): void {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  protected readonly FAQS = FAQS;

  protected readonly marqueeItems = [
    'Paie 100% conforme LF 2026',
    'CNSS & CNAM automatisés',
    'Bulletins PDF en un clic',
    'Multi-tenant sécurisé',
    'Assistant IA juridique',
    'Données hébergées en Tunisie',
    'IRPP calculé automatiquement',
    'Congés & avances en ligne',
  ];
  protected readonly currentYear = new Date().getFullYear();

  protected readonly plans = computed(() => {
    const limits = this.data.planLimits;
    return ['STARTER', 'PME', 'BUSINESS', 'ENTERPRISE'].map(code => ({
      code,
      label: (limits[code]?.label ?? code).replace(' (Essai)', ''),
      price: limits[code]?.price ?? 0,
      max: limits[code]?.maxEmployees ?? 10,
      popular: code === 'BUSINESS',
      features: PLAN_FEATURES[code] ?? [],
    }));
  });
}
