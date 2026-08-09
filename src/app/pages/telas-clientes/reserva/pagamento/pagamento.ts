import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Veiculo, lerVeiculos, salvarVeiculos } from '../../../../shared/veiculos.model';
import { Categoria, lerCategorias } from '../../../../shared/categoria.model';
import { SessaoCliente, lerSessaoCliente } from '../../../../shared/cliente.model';
import {
  ReservaRascunho,
  lerRascunho,
  numeroDeDias,
  calcularValorTotal,
  limparRascunho,
} from '../../../../shared/reserva-rascunho.model';
import { Reserva, FormaPagamento, lerReservas, salvarReservas } from '../../../../shared/reserva.model';

@Component({
  selector: 'app-reserva-pagamento',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './pagamento.html',
})
export class ReservaPagamentoComponent {
  rascunho: ReservaRascunho | null = null;
  veiculo: Veiculo | null = null;
  categoria: Categoria | null = null;
  sessao: SessaoCliente | null = null;

  formaPagamento: FormaPagamento = 'cartao';
  processando = signal(false);

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

  confirmarPagamento(): void {
    if (!this.rascunho || !this.veiculo || !this.sessao) return;

    this.processando.set(true);

    setTimeout(() => {
      const novaReserva: Reserva = {
        id: Date.now().toString(),
        clienteId: this.sessao!.id,
        clienteNome: this.sessao!.nome,
        veiculoId: this.veiculo!.id,
        veiculoModelo: this.veiculo!.modelo,
        dataInicio: this.rascunho!.dataInicio!,
        dataFim: this.rascunho!.dataFim!,
        status: 'confirmada',
        planoId: this.rascunho!.planoId,
        planoNome: this.rascunho!.planoNome,
        localRetirada: this.rascunho!.localRetirada,
        localDevolucao: this.rascunho!.localDevolucao,
        formaPagamento: this.formaPagamento,
        valorTotal: this.valorTotal() ?? undefined,
        dataPagamento: new Date().toISOString().slice(0, 10),
      };

      salvarReservas([...lerReservas(), novaReserva]);

      const veiculos = lerVeiculos().map((v) => (v.id === novaReserva.veiculoId ? { ...v, status: 'alugado' as const } : v));
      salvarVeiculos(veiculos);

      limparRascunho();
      this.processando.set(false);
      this.router.navigate(['/reserva/confirmada'], { queryParams: { id: novaReserva.id } });
    }, 600);
  }
}
