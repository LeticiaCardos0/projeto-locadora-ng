import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemaService } from '../../tema/tema';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.html',
})
export class TopbarComponent {
  tema = inject(TemaService);

  toggleTema(): void {
    this.tema.toggle();
  }
}