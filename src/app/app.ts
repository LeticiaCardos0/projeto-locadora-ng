import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { TopbarComponent } from './layout/topbar/topbar';
import { FooterComponent } from './layout/footer/footer';
import { SidebarComponent } from './layout/sidebar/sidebar';

@Component({
  selector: 'app-root',
  imports: [SidebarComponent,TopbarComponent, FooterComponent, RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('trabalho-locadora-ng');
}
