import { Component, ChangeDetectionStrategy, input, computed, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

const ICONS: Record<string, string> = {
  Home: '<path d="M2 7.5 8 2.5l6 5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.5z"/><path d="M6.5 14V9.5h3V14"/>',
  Building: '<rect x="3" y="2" width="10" height="12" rx="1"/><path d="M5.5 5h1M9.5 5h1M5.5 8h1M9.5 8h1M5.5 11h1M9.5 11h1"/>',
  Shield: '<path d="M8 2 3 4v4.5C3 11.5 8 14 8 14s5-2.5 5-5.5V4L8 2z"/><path d="m6 8 1.5 1.5L10.5 6.5"/>',
  ShieldOff: '<path d="M3 5v4.5C3 11.5 8 14 8 14s5-2.5 5-5.5V4L8 2 5.5 3M2 2l12 12"/>',
  History: '<path d="M3 8a5 5 0 1 0 1.5-3.5"/><path d="M3 2v3h3"/><path d="M8 5v3l2 1.5"/>',
  Users:
    '<circle cx="6" cy="6" r="2.5"/><path d="M2 13c0-2.2 1.8-4 4-4s4 1.8 4 4"/><path d="M11 5c1.4 0 2.5 1.1 2.5 2.5S12.4 10 11 10"/><path d="M11 10.5c1.7 0 3 1.3 3 3"/>',
  User: '<circle cx="8" cy="5.5" r="2.75"/><path d="M2.5 13.5c0-2.5 2.5-4.5 5.5-4.5s5.5 2 5.5 4.5"/>',
  Cash: '<rect x="2" y="4" width="12" height="8" rx="1.5"/><circle cx="8" cy="8" r="1.8"/><path d="M4.5 8h.01M11.5 8h.01"/>',
  Wallet:
    '<path d="M2 5a1.5 1.5 0 0 1 1.5-1.5h9.5V12a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 2 12V5z"/><path d="M13 5H4a2 2 0 0 1-2-2"/><circle cx="11" cy="8.5" r="0.8" fill="currentColor"/>',
  Calendar: '<rect x="2.5" y="3" width="11" height="11" rx="1.4"/><path d="M2.5 6.5h11M5.5 2v2M10.5 2v2"/>',
  Folder: '<path d="M2 5a1 1 0 0 1 1-1h3l1.5 1.5H13a1 1 0 0 1 1 1V12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5z"/>',
  Server:
    '<rect x="2" y="3" width="12" height="4" rx="1"/><rect x="2" y="9" width="12" height="4" rx="1"/><circle cx="5" cy="5" r="0.5" fill="currentColor"/><circle cx="5" cy="11" r="0.5" fill="currentColor"/>',
  Sparkles: '<path d="M8 2v3M8 11v3M2 8h3M11 8h3M4.5 4.5l2 2M9.5 9.5l2 2M4.5 11.5l2-2M9.5 6.5l2-2"/>',
  Bot: '<rect x="3" y="5" width="10" height="8" rx="1.5"/><path d="M8 2v3M5.5 8.5h.01M10.5 8.5h.01M6 11h4"/><path d="M2 9v2M14 9v2"/>',
  Bell: '<path d="M3.5 11.5h9l-1-1.3V7c0-2-1.6-3.7-3.5-3.7S4.5 5 4.5 7v3.2l-1 1.3z"/><path d="M6.5 13.5a1.5 1.5 0 0 0 3 0"/>',
  Search: '<circle cx="7" cy="7" r="4.5"/><path d="m10.5 10.5 3 3"/>',
  Plus: '<path d="M8 3v10M3 8h10"/>',
  Check: '<path d="m3.5 8.5 3 3 6-7"/>',
  X: '<path d="m4 4 8 8M12 4l-8 8"/>',
  More: '<circle cx="3.5" cy="8" r="1.3" fill="currentColor" stroke="none"/><circle cx="8" cy="8" r="1.3" fill="currentColor" stroke="none"/><circle cx="12.5" cy="8" r="1.3" fill="currentColor" stroke="none"/>',
  Caret: '<path d="m4 6 4 4 4-4"/>',
  Filter: '<path d="M2.5 3.5h11l-4 5v4l-3 1.5v-5.5z"/>',
  Download: '<path d="M8 2v8M5 7l3 3 3-3M3 13h10"/>',
  Upload: '<path d="M8 11V3M5 6l3-3 3 3M3 13h10"/>',
  Doc: '<path d="M3.5 2.5h6L12.5 5.5v8a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1z"/><path d="M9.5 2.5v3h3"/>',
  Pdf: '<path d="M3.5 2.5h6L12.5 5.5v8a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1z"/><path d="M9.5 2.5v3h3"/><path d="M5 9h.5M5 11h.5M7 9h.5M7 11h.5M9 9h.5M9 11h.5"/>',
  Send: '<path d="m2.5 8 11-5.5-3 12-3-4.5z"/><path d="m7.5 10 3-4.5"/>',
  Edit: '<path d="M11 2.5 13.5 5 6 12.5l-3 .5.5-3z"/>',
  Trash: '<path d="M3 4.5h10M6.5 4.5V3a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1.5M4.5 4.5l.5 8a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1l.5-8"/>',
  Eye: '<path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8s-2.5 4.5-6.5 4.5S1.5 8 1.5 8z"/><circle cx="8" cy="8" r="2"/>',
  Globe: '<circle cx="8" cy="8" r="6"/><path d="M2 8h12M8 2c2 2 3 3.5 3 6s-1 4-3 6c-2-2-3-3.5-3-6s1-4 3-6z"/>',
  TrendUp: '<path d="M2 12 6 7l3 2 5-6"/><path d="M10 3h4v4"/>',
  Arrow: '<path d="M3 8h10M9 4l4 4-4 4"/>',
  Up: '<path d="m4 10 4-4 4 4"/>',
  Down: '<path d="m4 6 4 4 4-4"/>',
  Lock: '<rect x="3.5" y="7.5" width="9" height="6.5" rx="1.2"/><path d="M5.5 7.5V5.5a2.5 2.5 0 0 1 5 0v2"/>',
  Mail: '<rect x="2" y="3.5" width="12" height="9" rx="1.2"/><path d="m2 5 6 4 6-4"/>',
  Briefcase: '<rect x="2.5" y="5" width="11" height="8" rx="1"/><path d="M6 5V3.5h4V5M2.5 9h11"/>',
  CircleHelp: '<circle cx="8" cy="8" r="6"/><path d="M6.5 6.2c.3-.9 1-1.4 1.9-1.4 1.1 0 1.8.7 1.8 1.6 0 1.5-2.2 1.4-2.2 3.1M8 11.7h.01"/>',
  Beach: '<path d="M8 8v6"/><path d="M3 8c1-3.5 4-5 5-5s4 1.5 5 5z"/><path d="M2 14h12"/>',
  LogOut: '<path d="M6 2.5H3.5A1 1 0 0 0 2.5 3.5v9A1 1 0 0 0 3.5 13.5H6"/><path d="M10.5 11 13.5 8l-3-3"/><path d="M13.5 8H6"/>',
  Gift: '<path d="M2 6h12v2H2zM8 6V3.5a2 2 0 0 0-4 0V6M8 6V3.5a2 2 0 0 1 4 0V6M2 8v5a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8M8 8v6"/>',
  List: '<path d="M3 4h10M3 8h10M3 12h10"/>',
  FileText:
    '<path d="M3.5 2.5h6L12.5 5.5v8a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1z"/><path d="M9.5 2.5v3h3M5.5 7.5h5M5.5 9.5h5M5.5 11.5h3"/>',
  Trash2:
    '<path d="M3 4.5h10M6.5 4.5V3a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1.5M4.5 4.5l.5 8a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1l.5-8M6.5 7v3.5M9.5 7v3.5"/>',
  FileCheck:
    '<path d="M3.5 2.5h6L12.5 5.5v8a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1z"/><path d="M9.5 2.5v3h3M5.5 9.5l1.5 1.5 3-3"/>',
  Receipt:
    '<rect x="3" y="2" width="10" height="13" rx="1"/><path d="M3 15V2l1.5 1L6 2l1.5 1L9 2l1.5 1L12 2v13"/><path d="M5.5 7h5M5.5 9.5h5M5.5 12h3"/>',
  BookOpen:
    '<path d="M2 4.5C2 4 2.5 3.5 3 3.5h4.5v9H3c-.5 0-1-.5-1-1V4.5z"/><path d="M14 4.5C14 4 13.5 3.5 13 3.5H8.5v9H13c.5 0 1-.5 1-1V4.5z"/><path d="M7.5 3.5v9M8.5 3.5v9"/>',
  ClipboardList: '<rect x="4" y="3" width="8" height="11" rx="1"/><path d="M6 3V2h4v1M5.5 7h5M5.5 9h5M5.5 11h3"/><path d="M8 1.5h0"/>',
  Tag: '<path d="M8.5 2.5H13a.5.5 0 0 1 .5.5v4.5L8 13.2a1 1 0 0 1-1.4 0L2.8 9.4a1 1 0 0 1 0-1.4L8.5 2.5z"/><circle cx="11" cy="5" r="1" fill="currentColor" stroke="none"/>',
  PauseCircle: '<circle cx="8" cy="8" r="5.5"/><path d="M6.5 5.8v4.4M9.5 5.8v4.4"/>',
  PlayCircle: '<circle cx="8" cy="8" r="5.5"/><path d="M6.5 5.5l5 2.5-5 2.5z" fill="currentColor" stroke="none"/>',
  XCircle: '<circle cx="8" cy="8" r="5.5"/><path d="M5.5 5.5l5 5M10.5 5.5l-5 5"/>',
  EyeOff:
    '<path d="M2 2l12 12"/><path d="M8.5 5.8A5.5 5.5 0 0 1 14.5 8s-1 2-3 3.3M4.5 4.5C2.8 5.7 1.5 8 1.5 8S4 12.5 8 12.5c1.2 0 2.3-.3 3.2-.8"/><path d="M6.2 6.2a2 2 0 0 0 3.6 3.6"/>',
  Unlock: '<rect x="3.5" y="7.5" width="9" height="6.5" rx="1.2"/><path d="M5.5 7.5V5a2.5 2.5 0 0 1 5 0"/>',
  RotateCcw: '<path d="M3 8a5 5 0 1 0 1-3.2"/><path d="M3 2.5V6h3.5"/>',
  Info: '<circle cx="8" cy="8" r="6"/><path d="M8 7.5v4"/><circle cx="8" cy="5.5" r=".5" fill="currentColor" stroke="none"/>',
  Archive: '<rect x="2" y="2.5" width="12" height="3.5" rx="1"/><path d="M3.5 6v7.5h9V6"/><path d="M6 9.5h4"/>',
  CalendarRange: '<rect x="2.5" y="3" width="11" height="11" rx="1.4"/><path d="M2.5 7h11M5.5 2v2M10.5 2v2M5 10h2M9 10h2"/>',
};

@Component({
  selector: 'pz-icon',
  template: `<svg
    [attr.width]="size()"
    [attr.height]="size()"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    [attr.stroke-width]="strokeWidth()"
    stroke-linecap="round"
    stroke-linejoin="round"
    [innerHTML]="svgContent()"
  ></svg>`,
  styles: [':host { display: inline-flex; line-height: 0; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class IconComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly name = input.required<string>();
  readonly size = input<number>(16);
  readonly strokeWidth = input<number>(1.4);

  readonly svgContent = computed<SafeHtml>(() => {
    const raw = ICONS[this.name()] ?? '';
    return this.sanitizer.bypassSecurityTrustHtml(raw);
  });
}
