import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemaService } from '../../tema/tema';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './topbar.html',
})
export class TopbarComponent {
  tema = inject(TemaService);

  toggleTema(): void {
    this.tema.toggle();
  }
}