import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { formatarDataBr } from '../../../shared/validadores';
import { SessaoCliente, lerSessaoCliente } from '../../../shared/cliente.model';
import {
  Lancamento,
  FormaPagamento,
  lerLancamentos,
  formatarValor,
  formaPagamentoLabel,
  statusExibido,
  statusBadgeClasses,
  sincronizarReceitasDeReservas,
} from '../../../shared/lancamento.model';

type PeriodoFiltro = 'mes-atual' | '3-meses' | '6-meses' | 'ano' | 'personalizado';
type StatusFiltro = '' | 'pendente' | 'pago' | 'atrasado';

@Component({
  selector: 'app-meu-financeiro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './financeiro.html',
})
export class MeuFinanceiroComponent {
  sessao: SessaoCliente | null = null;
  lancamentos: Lancamento[] = [];

  carregando = signal(true);
  comprovanteBaixadoId = signal<string | null>(null);

  // ===== período (governa tanto os cards quanto a tabela) =====
  periodo: PeriodoFiltro = 'mes-atual';
  personalizadoDe = '';
  personalizadoAte = '';

  // ===== filtros da tabela =====
  filtroStatus: StatusFiltro = '';
  filtroForma: FormaPagamento = '';
  filtroReservaId = '';

  formatarDataBr = formatarDataBr;
  formatarValor = formatarValor;
  formaPagamentoLabel = formaPagamentoLabel;
  statusExibido = statusExibido;
  statusBadgeClasses = statusBadgeClasses;

  constructor() {
    this.sessao = lerSessaoCliente();
    sincronizarReceitasDeReservas();

    const todos = lerLancamentos();
    this.lancamentos = this.sessao
      ? todos.filter((l) => l.tipo === 'receita' && l.clienteId === this.sessao!.id && l.status !== 'estornado')
      : [];

    setTimeout(() => this.carregando.set(false), 500);
  }

  private paraISO(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  // rótulo do status do jeito que o cliente enxerga (sem a distinção "Recebido" usada no admin)
  statusLabelCliente(l: Lancamento): string {
    const status = statusExibido(l);
    if (status === 'pendente') return 'Pendente';
    if (status === 'atrasado') return 'Atrasado';
    return 'Pago';
  }

  get intervaloPeriodo(): { de: string; ate: string } {
    const hoje = new Date();

    if (this.periodo === 'personalizado') {
      return {
        de: this.personalizadoDe || '0000-01-01',
        ate: this.personalizadoAte || '9999-12-31',
      };
    }

    const ate = this.paraISO(new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0));

    if (this.periodo === 'mes-atual') {
      return { de: this.paraISO(new Date(hoje.getFullYear(), hoje.getMonth(), 1)), ate };
    }
    if (this.periodo === '3-meses') {
      return { de: this.paraISO(new Date(hoje.getFullYear(), hoje.getMonth() - 2, 1)), ate };
    }
    if (this.periodo === '6-meses') {
      return { de: this.paraISO(new Date(hoje.getFullYear(), hoje.getMonth() - 5, 1)), ate };
    }
    // ano
    return { de: `${hoje.getFullYear()}-01-01`, ate: `${hoje.getFullYear()}-12-31` };
  }

  get lancamentosNoPeriodo(): Lancamento[] {
    const { de, ate } = this.intervaloPeriodo;
    return this.lancamentos.filter((l) => l.dataVencimento >= de && l.dataVencimento <= ate);
  }

  get lancamentosFiltrados(): Lancamento[] {
    return this.lancamentosNoPeriodo.filter((l) => {
      if (this.filtroStatus && statusExibido(l) !== this.filtroStatus) return false;
      if (this.filtroForma && l.formaPagamento !== this.filtroForma) return false;
      if (this.filtroReservaId && l.reservaId !== this.filtroReservaId) return false;
      return true;
    });
  }

  get totalPago(): number {
    return this.lancamentosNoPeriodo.filter((l) => statusExibido(l) === 'pago').reduce((s, l) => s + l.valor, 0);
  }

  get totalPendente(): number {
    return this.lancamentosNoPeriodo.filter((l) => statusExibido(l) === 'pendente').reduce((s, l) => s + l.valor, 0);
  }

  get atrasados(): Lancamento[] {
    return this.lancamentosNoPeriodo.filter((l) => statusExibido(l) === 'atrasado');
  }

  get totalAtrasado(): number {
    return this.atrasados.reduce((s, l) => s + l.valor, 0);
  }

  // próximo vencimento é sempre "o próximo de verdade", independente do período selecionado
  get proximoVencimento(): Lancamento | null {
    const hoje = this.paraISO(new Date());
    const pendentes = this.lancamentos
      .filter((l) => statusExibido(l) === 'pendente' && l.dataVencimento >= hoje)
      .sort((a, b) => a.dataVencimento.localeCompare(b.dataVencimento));
    return pendentes[0] ?? null;
  }

  get reservasDisponiveis(): { id: string; label: string }[] {
    const vistos = new Set<string>();
    const opcoes: { id: string; label: string }[] = [];
    for (const l of this.lancamentos) {
      if (!l.reservaId || vistos.has(l.reservaId)) continue;
      vistos.add(l.reservaId);
      opcoes.push({ id: l.reservaId, label: `${l.veiculoModelo ?? 'Reserva'} — #${l.reservaId.slice(-6)}` });
    }
    return opcoes;
  }

  // últimos comprovantes disponíveis (só pagos), pra seção "Faturas e comprovantes"
  get comprovantesDisponiveis(): Lancamento[] {
    return [...this.lancamentosFiltrados]
      .filter((l) => statusExibido(l) === 'pago')
      .sort((a, b) => b.dataPagamento.localeCompare(a.dataPagamento))
      .slice(0, 8);
  }

  limparFiltros(): void {
    this.filtroStatus = '';
    this.filtroForma = '';
    this.filtroReservaId = '';
  }

  baixarComprovante(l: Lancamento): void {
    this.comprovanteBaixadoId.set(l.id);
    setTimeout(() => {
      if (this.comprovanteBaixadoId() === l.id) this.comprovanteBaixadoId.set(null);
    }, 2000);
  }

  pagarAgora(): void {
    alert('Isso é apenas uma demonstração visual — em um sistema real, aqui abriria o checkout para quitar os pagamentos em atraso.');
  }
}
