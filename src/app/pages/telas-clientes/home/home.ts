import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { formatarDataBr } from '../../../shared/validadores';
import { SessaoCliente, lerSessaoCliente } from '../../../shared/cliente.model';
import { Categoria, lerCategorias } from '../../../shared/categoria.model';
import { Veiculo, lerVeiculos } from '../../../shared/veiculos.model';
import { Reserva, lerReservas } from '../../../shared/reserva.model';
import { atualizarRascunho } from '../../../shared/reserva-rascunho.model';
import {
  Lancamento,
  lerLancamentos,
  statusExibido,
  formatarValor,
  sincronizarReceitasDeReservas,
} from '../../../shared/lancamento.model';
import { SelectCustomComponent, OpcaoSelect } from '../../../shared/ui/select-custom/select-custom';

@Component({
  selector: 'app-home-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SelectCustomComponent],
  templateUrl: './home.html',
})
export class HomeClienteComponent {
  sessao: SessaoCliente | null = null;
  categorias: Categoria[] = [];
  veiculosDestaque: Veiculo[] = [];

  proximaReserva: Reserva | null = null;
  pagamentosPendentes: Lancamento[] = [];

  formatarDataBr = formatarDataBr;
  formatarValor = formatarValor;

  // ===== busca rápida =====
  hoje = new Date().toISOString().slice(0, 10);
  dataInicio = '';
  dataFim = '';
  categoriaId = '';

  constructor(private router: Router) {
    this.sessao = lerSessaoCliente();
    this.categorias = lerCategorias().filter((c) => c.valorDiaria !== null);

    this.veiculosDestaque = lerVeiculos()
      .filter((v) => v.status === 'disponivel')
      .sort((a, b) => b.id.localeCompare(a.id))
      .slice(0, 4);

    if (this.sessao) {
      this.carregarResumoConta(this.sessao);
    }
  }

  get primeiroNome(): string {
    return this.sessao?.nome.trim().split(' ')[0] ?? '';
  }

  private carregarResumoConta(sessao: SessaoCliente): void {
    const hoje = this.hoje;
    const minhasReservas = lerReservas().filter((r) => r.clienteId === sessao.id);
    this.proximaReserva =
      minhasReservas
        .filter((r) => (r.status === 'confirmada' || r.status === 'em_andamento') && r.dataFim >= hoje)
        .sort((a, b) => a.dataInicio.localeCompare(b.dataInicio))[0] ?? null;

    sincronizarReceitasDeReservas();
    const meusLancamentos = lerLancamentos().filter(
      (l) => l.tipo === 'receita' && l.clienteId === sessao.id && l.status !== 'estornado'
    );
    this.pagamentosPendentes = meusLancamentos.filter((l) => {
      const status = statusExibido(l);
      return status === 'pendente' || status === 'atrasado';
    });
  }

  get totalPendente(): number {
    return this.pagamentosPendentes.reduce((soma, l) => soma + l.valor, 0);
  }

  get temPagamentoAtrasado(): boolean {
    return this.pagamentosPendentes.some((l) => statusExibido(l) === 'atrasado');
  }

  categoriaNome(categoriaId: string): string {
    return this.categorias.find((c) => c.id === categoriaId)?.nome ?? 'Sem categoria';
  }

  valorDiaria(categoriaId: string): number | null {
    return this.categorias.find((c) => c.id === categoriaId)?.valorDiaria ?? null;
  }

  get opcoesCategorias(): OpcaoSelect[] {
    return [{ value: '', label: 'Todas' }, ...this.categorias.map((c) => ({ value: c.id, label: c.nome }))];
  }

  iconeCategoria(nome: string): string {
    const chave = nome.toLowerCase();
    if (chave.includes('econ')) return 'ti-tag';
    if (chave.includes('util')) return 'ti-truck';
    if (chave.includes('esport')) return 'ti-bolt';
    return 'ti-car';
  }

  irParaVeiculos(categoriaId?: string): void {
    const queryParams = categoriaId ? { categoria: categoriaId } : {};
    this.router.navigate(['/veiculos'], { queryParams });
  }

  buscar(): void {
    if (this.dataInicio || this.dataFim) {
      atualizarRascunho({
        ...(this.dataInicio ? { dataInicio: this.dataInicio } : {}),
        ...(this.dataFim ? { dataFim: this.dataFim } : {}),
      });
    }
    this.irParaVeiculos(this.categoriaId || undefined);
  }
}
