import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type TipoLancamento = 'receita' | 'despesa';
export type StatusLancamento = 'pendente' | 'pago' | 'estornado';
export type FormaPagamento = '' | 'pix' | 'cartao' | 'dinheiro' | 'transferencia';

export interface Lancamento {
  id: string;
  tipo: TipoLancamento;
  descricao: string;
  valor: number;
  formaPagamento: FormaPagamento;
  status: StatusLancamento;
  dataVencimento: string;
  dataPagamento: string; // vazio se ainda não pago
  categoriaDespesa?: string; // categorização livre: categoria da despesa ou origem do recebimento manual
  reservaId?: string; // só para receitas geradas a partir de reservas
  clienteNome?: string;
  veiculoModelo?: string;
}

interface ReservaResumo {
  id: string;
  clienteId: string;
  clienteNome: string;
  veiculoId: string;
  veiculoModelo: string;
  dataInicio: string;
  dataFim: string;
  status: 'pendente' | 'confirmada' | 'em_andamento' | 'finalizada' | 'cancelada';
}

interface VeiculoResumo {
  id: string;
  categoriaId: string;
}

interface CategoriaResumo {
  id: string;
  nome: string;
  valorDiaria: number | null;
}

const FINANCEIRO_KEY = 'financeiro';
const RESERVAS_KEY = 'reservas';
const VEICULOS_KEY = 'veiculos';
const CATEGORIAS_KEY = 'categorias';

@Component({
  selector: 'app-financeiro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './financeiro.html',
})
export class FinanceiroComponent {
  lancamentos: Lancamento[] = [];
  categorias: CategoriaResumo[] = [];

  // ===== filtros =====
  filtroTipo = '';
  filtroStatus = '';
  filtroDataInicio = '';
  filtroDataFim = '';

  // ===== modal de despesa =====
  mostrarForm = false;
  editando = false;
  lancamentoAtual: Lancamento = this.lancamentoVazio();

  constructor() {
    this.sincronizarReceitasDeReservas();
    this.carregar();
    this.categorias = this.lerStorage<CategoriaResumo[]>(CATEGORIAS_KEY, []);
  }

  private lancamentoVazio(tipo: TipoLancamento = 'despesa'): Lancamento {
    return {
      id: '',
      tipo,
      descricao: '',
      valor: 0,
      formaPagamento: '',
      status: 'pendente',
      dataVencimento: '',
      dataPagamento: '',
      categoriaDespesa: '',
    };
  }

  private lerStorage<T>(chave: string, fallback: T): T {
    const raw = localStorage.getItem(chave);
    return raw ? JSON.parse(raw) : fallback;
  }

  private carregar(): void {
    this.lancamentos = this.lerStorage<Lancamento[]>(FINANCEIRO_KEY, []);
  }

  private salvarNoStorage(): void {
    localStorage.setItem(FINANCEIRO_KEY, JSON.stringify(this.lancamentos));
  }

  // ===== sincronização automática: 1 receita por reserva não cancelada =====

  private diasEntre(inicio: string, fim: string): number {
    if (!inicio || !fim) return 1;
    const ms = new Date(fim).getTime() - new Date(inicio).getTime();
    const dias = Math.round(ms / (1000 * 60 * 60 * 24));
    return dias > 0 ? dias : 1;
  }

  private sincronizarReceitasDeReservas(): void {
    const reservas = this.lerStorage<ReservaResumo[]>(RESERVAS_KEY, []);
    const veiculos = this.lerStorage<VeiculoResumo[]>(VEICULOS_KEY, []);
    const categorias = this.lerStorage<CategoriaResumo[]>(CATEGORIAS_KEY, []);
    const lancamentos = this.lerStorage<Lancamento[]>(FINANCEIRO_KEY, []);

    let alterou = false;

    for (const reserva of reservas) {
      const existente = lancamentos.find((l) => l.reservaId === reserva.id);

      // reserva cancelada: estorna a receita gerada (se ainda não tinha sido paga manualmente)
      if (reserva.status === 'cancelada') {
        if (existente && existente.status !== 'estornado') {
          existente.status = 'estornado';
          alterou = true;
        }
        continue;
      }

      if (existente) continue; // já existe lançamento pra essa reserva, não duplica

      const veiculo = veiculos.find((v) => v.id === reserva.veiculoId);
      const categoria = categorias.find((c) => c.id === veiculo?.categoriaId);
      const diaria = categoria?.valorDiaria ?? 0;
      const dias = this.diasEntre(reserva.dataInicio, reserva.dataFim);

      lancamentos.push({
        id: 'rec-' + reserva.id,
        tipo: 'receita',
        descricao: `Aluguel - ${reserva.veiculoModelo}`,
        valor: diaria * dias,
        formaPagamento: '',
        status: 'pendente',
        dataVencimento: reserva.dataFim,
        dataPagamento: '',
        reservaId: reserva.id,
        clienteNome: reserva.clienteNome,
        veiculoModelo: reserva.veiculoModelo,
      });
      alterou = true;
    }

    if (alterou) {
      localStorage.setItem(FINANCEIRO_KEY, JSON.stringify(lancamentos));
    }
  }

  // ===== helpers de exibição =====

  formatarValor(valor: number | null | undefined): string {
    if (valor === null || valor === undefined || isNaN(valor)) return '-';
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formaPagamentoLabel(forma: FormaPagamento): string {
    const labels: Record<FormaPagamento, string> = {
      '': '-',
      pix: 'Pix',
      cartao: 'Cartão',
      dinheiro: 'Dinheiro',
      transferencia: 'Transferência',
    };
    return labels[forma];
  }

  isAtrasado(l: Lancamento): boolean {
    if (l.status !== 'pendente' || !l.dataVencimento) return false;
    const hoje = new Date().toISOString().slice(0, 10);
    return l.dataVencimento < hoje;
  }

  statusExibido(l: Lancamento): 'pendente' | 'pago' | 'estornado' | 'atrasado' {
    if (this.isAtrasado(l)) return 'atrasado';
    return l.status;
  }

  // ===== filtros aplicados =====

  get lancamentosFiltrados(): Lancamento[] {
    return this.lancamentos.filter((l) => {
      if (this.filtroTipo && l.tipo !== this.filtroTipo) return false;
      if (this.filtroStatus && this.statusExibido(l) !== this.filtroStatus) return false;
      if (this.filtroDataInicio && l.dataVencimento < this.filtroDataInicio) return false;
      if (this.filtroDataFim && l.dataVencimento > this.filtroDataFim) return false;
      return true;
    });
  }

  limparFiltros(): void {
    this.filtroTipo = '';
    this.filtroStatus = '';
    this.filtroDataInicio = '';
    this.filtroDataFim = '';
  }

  // ===== indicadores (calculados sobre a lista filtrada) =====

  get totalRecebido(): number {
    return this.lancamentosFiltrados
      .filter((l) => l.tipo === 'receita' && l.status === 'pago')
      .reduce((soma, l) => soma + l.valor, 0);
  }

  get totalAReceber(): number {
    return this.lancamentosFiltrados
      .filter((l) => l.tipo === 'receita' && l.status === 'pendente')
      .reduce((soma, l) => soma + l.valor, 0);
  }

  get totalDespesasPagas(): number {
    return this.lancamentosFiltrados
      .filter((l) => l.tipo === 'despesa' && l.status === 'pago')
      .reduce((soma, l) => soma + l.valor, 0);
  }

  get saldo(): number {
    return this.totalRecebido - this.totalDespesasPagas;
  }

  get qtdInadimplentes(): number {
    return this.lancamentosFiltrados.filter((l) => l.tipo === 'receita' && this.isAtrasado(l)).length;
  }

  // ===== faturamento por categoria (receitas pagas, agrupadas pela categoria do veículo) =====

  get faturamentoPorCategoria(): { nome: string; valor: number; percentual: number }[] {
    const receitasPagas = this.lancamentos.filter((l) => l.tipo === 'receita' && l.status === 'pago');
    const veiculos = this.lerStorage<VeiculoResumo[]>(VEICULOS_KEY, []);

    // agrupamento: casa a receita pelo veículo da reserva (via reservaId -> veiculoId -> categoriaId)
    const reservas = this.lerStorage<ReservaResumo[]>(RESERVAS_KEY, []);
    const categorias = this.categorias;
    const somaPorCategoria = new Map<string, number>();

    for (const l of receitasPagas) {
      const reserva = reservas.find((r) => r.id === l.reservaId);
      const veiculo = veiculos.find((v) => v.id === reserva?.veiculoId);
      const categoria = categorias.find((c) => c.id === veiculo?.categoriaId);
      const nome = categoria?.nome ?? 'Sem categoria';
      somaPorCategoria.set(nome, (somaPorCategoria.get(nome) ?? 0) + l.valor);
    }

    const totalGeral = [...somaPorCategoria.values()].reduce((a, b) => a + b, 0) || 1;

    return [...somaPorCategoria.entries()]
      .map(([nome, valor]) => ({ nome, valor, percentual: (valor / totalGeral) * 100 }))
      .sort((a, b) => b.valor - a.valor);
  }

  // ===== CRUD (despesas e recebimentos avulsos são criados manualmente; =====
  // ===== receitas vinculadas a uma reserva só têm forma/status de pagamento editáveis) =====

  // true quando o lançamento foi gerado automaticamente a partir de uma reserva
  ehVinculadoAReserva(l: Lancamento): boolean {
    return !!l.reservaId;
  }

  novoLancamento(tipo: TipoLancamento): void {
    this.editando = false;
    this.lancamentoAtual = this.lancamentoVazio(tipo);
    this.mostrarForm = true;
  }

  editar(id: string): void {
    const encontrado = this.lancamentos.find((l) => l.id === id);
    if (!encontrado) return;
    this.editando = true;
    this.lancamentoAtual = { ...encontrado };
    this.mostrarForm = true;
  }

  excluir(id: string): void {
    const alvo = this.lancamentos.find((l) => l.id === id);
    if (alvo && this.ehVinculadoAReserva(alvo)) {
      alert('Este recebimento é gerado automaticamente a partir de uma reserva e não pode ser excluído aqui. Cancele a reserva correspondente se necessário.');
      return;
    }
    this.lancamentos = this.lancamentos.filter((l) => l.id !== id);
    this.salvarNoStorage();
  }

  fecharForm(): void {
    this.mostrarForm = false;
    this.lancamentoAtual = this.lancamentoVazio();
  }

  salvar(): void {
    if (!this.lancamentoAtual.descricao || !this.lancamentoAtual.valor) {
      alert(this.lancamentoAtual.tipo === 'receita' ? 'Informe descrição e valor do recebimento.' : 'Informe descrição e valor da despesa.');
      return;
    }

    if (this.lancamentoAtual.status === 'pago' && !this.lancamentoAtual.dataPagamento) {
      this.lancamentoAtual.dataPagamento = new Date().toISOString().slice(0, 10);
    }
    if (this.lancamentoAtual.status !== 'pago') {
      this.lancamentoAtual.dataPagamento = '';
    }

    if (this.editando) {
      const index = this.lancamentos.findIndex((l) => l.id === this.lancamentoAtual.id);
      if (index > -1) {
        this.lancamentos[index] = { ...this.lancamentoAtual };
      }
    } else {
      this.lancamentoAtual.id = (this.lancamentoAtual.tipo === 'receita' ? 'rec-manual-' : 'desp-') + Date.now().toString();
      this.lancamentos.push({ ...this.lancamentoAtual });
    }

    this.salvarNoStorage();
    this.fecharForm();
  }

  // ===== ação rápida: marcar como pago direto na tabela =====

  marcarPago(id: string): void {
    const index = this.lancamentos.findIndex((l) => l.id === id);
    if (index === -1) return;
    this.lancamentos[index] = {
      ...this.lancamentos[index],
      status: 'pago',
      dataPagamento: new Date().toISOString().slice(0, 10),
    };
    this.salvarNoStorage();
  }
}