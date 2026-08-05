import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs';
import { TopbarComponent } from './layout/topbar/topbar';
import { FooterComponent } from './layout/footer/footer';
import { SidebarComponent } from './layout/sidebar/sidebar';
import { InfoService } from './info';

// Rotas que devem ser exibidas em tela cheia, sem topbar/sidebar/footer.
const ROTAS_TELA_CHEIA = ['/login', '/cadastro'];

@Component({
  selector: 'app-root',
  imports: [SidebarComponent, TopbarComponent, FooterComponent, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('trabalho-locadora-ng');

  private router = inject(Router);

  private urlAtual = toSignal(
    this.router.events.pipe(
      filter((evento): evento is NavigationEnd => evento instanceof NavigationEnd),
      map((evento) => evento.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  telaCheia = () => ROTAS_TELA_CHEIA.some((rota) => this.urlAtual().startsWith(rota));

  constructor() {
    inject(InfoService).carregarInformacoes();
  }
}