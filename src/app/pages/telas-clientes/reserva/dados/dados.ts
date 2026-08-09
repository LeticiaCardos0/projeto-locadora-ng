import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { SessaoCliente, lerSessaoCliente } from '../../../../shared/cliente.model';

@Component({
  selector: 'app-reserva-dados',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dados.html',
})
export class ReservaDadosComponent {
  sessao: SessaoCliente | null = null;

  constructor(private router: Router) {
    this.sessao = lerSessaoCliente();
  }

  continuar(): void {
    this.router.navigateByUrl('/reserva/revisar');
  }
}
