import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  campoPreenchido,
  contemEmoji,
  bloquearEmojiKeydown,
  valorValido,
  dataValida,
  DATA_MINIMA,
  ANO_MINIMO,
  formatarDataBr,
} from '../../../shared/validadores';
import {
  Lancamento,
  TipoLancamento,
  FormaPagamento,
  lerLancamentos,
  salvarLancamentos,
  formatarValor,
  formaPagamentoLabel,
  isAtrasado,
  statusExibido,
  statusLabel,
  sincronizarReceitasDeReservas,
} from '../../../shared/lancamento.model';

export type { Lancamento, TipoLancamento, FormaPagamento };

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

  dataMinima = DATA_MINIMA;
  formatarDataBr = formatarDataBr;
  bloquearEmojiKeydown = bloquearEmojiKeydown;
  formatarValor = formatarValor;
  formaPagamentoLabel = formaPagamentoLabel;
  isAtrasado = isAtrasado;
  statusExibido = statusExibido;
  statusLabel = statusLabel;

  constructor() {
    sincronizarReceitasDeReservas();
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
    this.lancamentos = lerLancamentos();
  }

  private salvarNoStorage(): void {
    salvarLancamentos(this.lancamentos);
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
    if (!campoPreenchido(this.lancamentoAtual.descricao) || !valorValido(this.lancamentoAtual.valor) || !this.lancamentoAtual.valor) {
      alert(
        this.lancamentoAtual.tipo === 'receita'
          ? 'Informe descrição e valor do recebimento (valor não pode ser negativo).'
          : 'Informe descrição e valor da despesa (valor não pode ser negativo).'
      );
      return;
    }
    if (contemEmoji(this.lancamentoAtual.descricao)) {
      alert('Emojis não são permitidos na descrição.');
      return;
    }
    if (this.lancamentoAtual.dataVencimento && !dataValida(this.lancamentoAtual.dataVencimento)) {
      alert(`A data de vencimento deve ser de ${ANO_MINIMO} ou posterior.`);
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