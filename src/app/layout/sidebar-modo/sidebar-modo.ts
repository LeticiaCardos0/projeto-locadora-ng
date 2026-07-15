import { Injectable, signal } from '@angular/core';

export type SidebarModo = 'cliente' | 'admin';

@Injectable({ providedIn: 'root' })
export class SidebarModeService {
  mode = signal<SidebarModo>('cliente');

  toggle(): void {
    this.mode.update((current) => (current === 'cliente' ? 'admin' : 'cliente'));
  }

  setMode(mode: SidebarModo): void {
    this.mode.set(mode);
  }
}