import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Veiculo, lerVeiculos } from '../../../../shared/veiculos.model';
import { Categoria, lerCategorias } from '../../../../shared/categoria.model';
import { SessaoCliente, lerSessaoCliente } from '../../../../shared/cliente.model';
import { ReservaRascunho, lerRascunho, numeroDeDias, calcularValorTotal } from '../../../../shared/reserva-rascunho.model';

@Component({
  selector: 'app-reserva-revisar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './revisar.html',
})
export class ReservaRevisarComponent {
  rascunho: ReservaRascunho | null = null;
  veiculo: Veiculo | null = null;
  categoria: Categoria | null = null;
  sessao: SessaoCliente | null = null;

  constructor(private router: Router) {
    this.rascunho = lerRascunho();
    this.sessao = lerSessaoCliente();

    if (this.rascunho?.veiculoId) {
      this.veiculo = lerVeiculos().find((v) => v.id === this.rascunho!.veiculoId) ?? null;
      this.categoria = this.veiculo ? lerCategorias().find((c) => c.id === this.veiculo!.categoriaId) ?? null : null;
    }
  }

  numeroDeDias(): number {
    return this.rascunho ? numeroDeDias(this.rascunho) : 0;
  }

  valorTotal(): number | null {
    if (!this.rascunho) return null;
    return calcularValorTotal(this.rascunho, this.categoria?.valorDiaria ?? null);
  }

  irParaPagamento(): void {
    this.router.navigateByUrl('/reserva/pagamento');
  }
}
