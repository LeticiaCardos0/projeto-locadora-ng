import { Injectable, signal, effect } from '@angular/core';

export type Tema = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class TemaService {
  tema = signal<Tema>('dark');

  constructor() {
    // Aplica a classe 'dark' no <html> sempre que o tema mudar
    effect(() => {
      const root = document.documentElement;
      if (this.tema() === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    });
  }

  toggle(): void {
    this.tema.update((current) => (current === 'light' ? 'dark' : 'light'));
  }
}