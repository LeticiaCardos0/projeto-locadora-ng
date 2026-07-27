import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type TipoManutencao = 'preventiva' | 'corretiva';
export type StatusManutencao = 'agendada' | 'em_andamento' | 'concluida' | 'cancelada';

export interface Manutencao {
  id: string;
  veiculoId: string;
  veiculoModelo: string;
  tipo: TipoManutencao;
  data: string;
  custo: number | null;
  status: StatusManutencao;
}

interface Veiculo {
  id: string;
  modelo: string;
  ano: number;
  status: 'disponivel' | 'alugado' | 'manutencao';
}

const MANUTENCOES_KEY = 'manutencoes';
const VEICULOS_KEY = 'veiculos';
const FINANCEIRO_KEY = 'financeiro';

// Espelha apenas os campos usados aqui da interface Lancamento já existente em financeiro.ts
interface Lancamento {
  id: string;
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  formaPagamento: '' | 'pix' | 'cartao' | 'dinheiro' | 'transferencia';
  status: 'pendente' | 'pago' | 'estornado' | 'atrasado';
  dataVencimento: string;
  dataPagamento: string;
  categoriaDespesa?: string;
}

@Component({
  selector: 'app-manutencoes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manutencoes.html',
})
export class ManutencoesComponent {
  manutencoes = signal<Manutencao[]>([]);
  veiculos: Veiculo[] = [];

  mostrarForm = false;
  editando = false;
  manutencaoAtual: Manutencao = this.manutencaoVazia();

  constructor() {
    this.carregarTudo();
  }

  private manutencaoVazia(): Manutencao {
    return {
      id: '',
      veiculoId: '',
      veiculoModelo: '',
      tipo: 'preventiva',
      data: '',
      custo: null,
      status: 'agendada',
    };
  }

  private carregarTudo(): void {
    this.manutencoes.set(this.lerStorage<Manutencao[]>(MANUTENCOES_KEY, []));
    this.veiculos = this.lerStorage<Veiculo[]>(VEICULOS_KEY, []);
  }

  private lerStorage<T>(chave: string, fallback: T): T {
    const raw = localStorage.getItem(chave);
    return raw ? JSON.parse(raw) : fallback;
  }

  private salvarManutencoes(): void {
    localStorage.setItem(MANUTENCOES_KEY, JSON.stringify(this.manutencoes()));
  }

  statusLabel(status: StatusManutencao): string {
    const labels: Record<StatusManutencao, string> = {
      agendada: 'Agendada',
      em_andamento: 'Em andamento',
      concluida: 'Concluída',
      cancelada: 'Cancelada',
    };
    return labels[status];
  }

  // ===== CRUD =====

  novo(): void {
    this.editando = false;
    this.manutencaoAtual = this.manutencaoVazia();
    this.mostrarForm = true;
  }

  editar(id: string): void {
    const encontrada = this.manutencoes().find((m) => m.id === id);
    if (!encontrada) return;
    this.editando = true;
    this.manutencaoAtual = { ...encontrada };
    this.mostrarForm = true;
  }

  fecharForm(): void {
    this.mostrarForm = false;
    this.manutencaoAtual = this.manutencaoVazia();
  }

  salvar(): void {
    if (!this.manutencaoAtual.veiculoId) {
      alert('Selecione um veículo.');
      return;
    }
    if (!this.manutencaoAtual.data) {
      alert('Informe a data da manutenção.');
      return;
    }

    const veiculo = this.veiculos.find((v) => v.id === this.manutencaoAtual.veiculoId);
    this.manutencaoAtual.veiculoModelo = veiculo?.modelo ?? '';

    const lista = [...this.manutencoes()];

    if (this.editando) {
      const index = lista.findIndex((m) => m.id === this.manutencaoAtual.id);
      if (index > -1) lista[index] = { ...this.manutencaoAtual };
    } else {
      this.manutencaoAtual.id = Date.now().toString();
      lista.push({ ...this.manutencaoAtual });
    }

    this.manutencoes.set(lista);
    this.salvarManutencoes();
    this.atualizarStatusVeiculo(this.manutencaoAtual);
    this.sincronizarFinanceiro(this.manutencaoAtual);
    this.fecharForm();
  }

  excluir(id: string): void {
    this.manutencoes.set(this.manutencoes().filter((m) => m.id !== id));
    this.salvarManutencoes();
  }

  // ===== ações rápidas na tabela =====

  iniciar(id: string): void {
    this.alterarStatus(id, 'em_andamento');
  }

  concluir(id: string): void {
    this.alterarStatus(id, 'concluida');
  }

  cancelar(id: string): void {
    this.alterarStatus(id, 'cancelada');
  }

  private alterarStatus(id: string, status: StatusManutencao): void {
    const lista = this.manutencoes().map((m) => (m.id === id ? { ...m, status } : m));
    this.manutencoes.set(lista);
    this.salvarManutencoes();

    const manutencao = lista.find((m) => m.id === id);
    if (manutencao) {
      this.atualizarStatusVeiculo(manutencao);
      this.sincronizarFinanceiro(manutencao);
    }
  }

  // Registra (ou remove, se o status deixar de ser "concluida") o custo da
  // manutenção como despesa já paga na tela Financeiro. O id é determinístico
  // (baseado no id da manutenção), então salvar/editar várias vezes nunca
  // duplica o lançamento — sempre substitui o anterior.
  private sincronizarFinanceiro(manutencao: Manutencao): void {
    const raw = localStorage.getItem(FINANCEIRO_KEY);
    const lancamentos: Lancamento[] = raw ? JSON.parse(raw) : [];
    const idLancamento = 'desp-man-' + manutencao.id;
    const semEsteLancamento = lancamentos.filter((l) => l.id !== idLancamento);

    if (manutencao.status === 'concluida' && manutencao.custo) {
      const novoLancamento: Lancamento = {
        id: idLancamento,
        tipo: 'despesa',
        descricao: `Manutenção - ${manutencao.veiculoModelo}`,
        valor: manutencao.custo,
        formaPagamento: '',
        status: 'pago',
        dataVencimento: manutencao.data,
        dataPagamento: manutencao.data,
        categoriaDespesa: manutencao.tipo === 'preventiva' ? 'Manutenção preventiva' : 'Manutenção corretiva',
      };
      semEsteLancamento.push(novoLancamento);
    }

    localStorage.setItem(FINANCEIRO_KEY, JSON.stringify(semEsteLancamento));
  }

  // Sincroniza o status do veículo conforme o status da manutenção:
  // "em_andamento" -> veículo fica indisponível (manutencao), refletindo
  // automaticamente na tela de Veículos e na disponibilidade para o cliente.
  // "concluida"/"cancelada"/"agendada" -> volta a ficar disponível.
  private atualizarStatusVeiculo(manutencao: Manutencao): void {
    const emManutencao = manutencao.status === 'em_andamento';

    const veiculos = this.veiculos.map((v) => {
      if (v.id !== manutencao.veiculoId) return v;
      // não sobrescreve um veículo que está "alugado" por uma reserva ativa;
      // só mexe se ele estava disponível ou já em manutenção
      if (v.status === 'alugado' && emManutencao) return v;
      return { ...v, status: emManutencao ? ('manutencao' as const) : ('disponivel' as const) };
    });

    this.veiculos = veiculos;
    localStorage.setItem(VEICULOS_KEY, JSON.stringify(veiculos));
  }
}