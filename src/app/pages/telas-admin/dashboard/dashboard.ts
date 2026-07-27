import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Veiculo {
  id: string;
  modelo: string;
  categoriaId: string;
  status: 'disponivel' | 'alugado' | 'manutencao';
}

interface Cliente {
  id: string;
  status: 'ativo' | 'bloqueado';
}

interface Categoria {
  id: string;
  nome: string;
}

interface Reserva {
  id: string;
  clienteNome: string;
  veiculoModelo: string;
  dataInicio: string;
  dataFim: string;
  status: 'pendente' | 'confirmada' | 'em_andamento' | 'finalizada' | 'cancelada';
}

interface Manutencao {
  id: string;
  veiculoModelo: string;
  tipo: 'preventiva' | 'corretiva';
  status: 'agendada' | 'em_andamento' | 'concluida' | 'cancelada';
}

interface Lancamento {
  tipo: 'receita' | 'despesa';
  valor: number;
  status: 'pendente' | 'pago' | 'estornado' | 'atrasado';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
})
export class DashboardComponent {
  veiculos = signal<Veiculo[]>([]);
  clientes = signal<Cliente[]>([]);
  categorias = signal<Categoria[]>([]);
  reservas = signal<Reserva[]>([]);
  manutencoes = signal<Manutencao[]>([]);
  lancamentos = signal<Lancamento[]>([]);

  constructor() {
    this.veiculos.set(this.ler<Veiculo[]>('veiculos', []));
    this.clientes.set(this.ler<Cliente[]>('clientes', []));
    this.categorias.set(this.ler<Categoria[]>('categorias', []));
    this.reservas.set(this.ler<Reserva[]>('reservas', []));
    this.manutencoes.set(this.ler<Manutencao[]>('manutencoes', []));
    this.lancamentos.set(this.ler<Lancamento[]>('financeiro', []));
  }

  private ler<T>(chave: string, fallback: T): T {
    const raw = localStorage.getItem(chave);
    return raw ? JSON.parse(raw) : fallback;
  }

  formatarValor(valor: number): string {
    return (valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  // ===== Veículos =====
  totalVeiculos = computed(() => this.veiculos().length);
  veiculosDisponiveis = computed(() => this.veiculos().filter((v) => v.status === 'disponivel').length);
  veiculosAlugados = computed(() => this.veiculos().filter((v) => v.status === 'alugado').length);
  veiculosEmManutencao = computed(() => this.veiculos().filter((v) => v.status === 'manutencao').length);

  distribuicaoPorCategoria = computed(() => {
    const cats = this.categorias();
    const veic = this.veiculos();
    const total = veic.length || 1;

    return cats
      .map((c) => {
        const qtd = veic.filter((v) => v.categoriaId === c.id).length;
        return { nome: c.nome, qtd, percentual: (qtd / total) * 100 };
      })
      .filter((c) => c.qtd > 0)
      .sort((a, b) => b.qtd - a.qtd);
  });

  // ===== Clientes =====
  totalClientes = computed(() => this.clientes().length);
  clientesAtivos = computed(() => this.clientes().filter((c) => c.status === 'ativo').length);
  clientesBloqueados = computed(() => this.clientes().filter((c) => c.status === 'bloqueado').length);

  // ===== Categorias =====
  totalCategorias = computed(() => this.categorias().length);

  // ===== Reservas =====
  reservasAtivas = computed(
    () => this.reservas().filter((r) => r.status === 'confirmada' || r.status === 'em_andamento').length
  );
  reservasPendentes = computed(() => this.reservas().filter((r) => r.status === 'pendente').length);

  ultimasReservas = computed(() =>
    [...this.reservas()]
      .filter((r) => r.status !== 'cancelada')
      .sort((a, b) => (b.dataInicio || '').localeCompare(a.dataInicio || ''))
      .slice(0, 5)
  );

  reservaStatusLabel(status: Reserva['status']): string {
    const labels: Record<Reserva['status'], string> = {
      pendente: 'Pendente',
      confirmada: 'Confirmada',
      em_andamento: 'Em andamento',
      finalizada: 'Finalizada',
      cancelada: 'Cancelada',
    };
    return labels[status];
  }

  // ===== Manutenções =====
  manutencoesAgendadas = computed(() => this.manutencoes().filter((m) => m.status === 'agendada').length);
  manutencoesEmAndamento = computed(
    () => this.manutencoes().filter((m) => m.status === 'em_andamento').length
  );

  veiculosEmManutencaoLista = computed(() =>
    this.manutencoes().filter((m) => m.status === 'em_andamento')
  );

  // ===== Financeiro (resumo, o detalhe fica no Dashboard Financeiro) =====
  totalRecebido = computed(() =>
    this.lancamentos()
      .filter((l) => l.tipo === 'receita' && l.status === 'pago')
      .reduce((s, l) => s + l.valor, 0)
  );

  totalDespesasPagas = computed(() =>
    this.lancamentos()
      .filter((l) => l.tipo === 'despesa' && l.status === 'pago')
      .reduce((s, l) => s + l.valor, 0)
  );

  saldo = computed(() => this.totalRecebido() - this.totalDespesasPagas());

  // ===== Financeiro (gráfico simples: barras Recebido x Despesas) =====
  maiorValorFinanceiro = computed(() =>
    Math.max(this.totalRecebido(), this.totalDespesasPagas(), 1)
  );

  percReceita = computed(() => (this.totalRecebido() / this.maiorValorFinanceiro()) * 100);
  percDespesa = computed(() => (this.totalDespesasPagas() / this.maiorValorFinanceiro()) * 100);
}