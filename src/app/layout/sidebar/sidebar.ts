import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLinkActive, RouterLink],
  templateUrl: './sidebar.html',
})
export class SidebarComponent {
  private router = inject(Router);

  collapsed = signal(false);

  // Mesmo padrão usado em app.ts pra ROTAS_TELA_CHEIA: acompanha a URL atual via
  // NavigationEnd, sem precisar de estado manual pra saber se é área admin ou cliente.
  private urlAtual = toSignal(
    this.router.events.pipe(
      filter((evento): evento is NavigationEnd => evento instanceof NavigationEnd),
      map((evento) => evento.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  isAdmin = computed(() => this.urlAtual().startsWith('/admin'));

  toggleCollapsed(): void {
    this.collapsed.update((value) => !value);
  }
}