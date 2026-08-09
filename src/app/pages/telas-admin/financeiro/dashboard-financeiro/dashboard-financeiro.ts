import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Lancamento, lerLancamentos, formatarValor, isAtrasado as ehAtrasado } from '../../../../shared/lancamento.model';

interface MesResumo {
  chave: string; // yyyy-mm
  label: string; // "jan/26"
  receita: number;
  despesa: number;
}

const MESES_ABREV = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

@Component({
  selector: 'app-dashboard-financeiro',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-financeiro.html',
})
export class DashboardFinanceiroComponent {
  lancamentos = signal<Lancamento[]>([]);
  formatarValor = formatarValor;

  constructor() {
    this.lancamentos.set(lerLancamentos());
  }

  // ===== indicadores gerais =====

  totalRecebido = computed(() =>
    this.lancamentos()
      .filter((l) => l.tipo === 'receita' && l.status === 'pago')
      .reduce((s, l) => s + l.valor, 0)
  );

  totalAReceber = computed(() =>
    this.lancamentos()
      .filter((l) => l.tipo === 'receita' && (l.status === 'pendente' || l.status === 'atrasado'))
      .reduce((s, l) => s + l.valor, 0)
  );

  totalDespesasPagas = computed(() =>
    this.lancamentos()
      .filter((l) => l.tipo === 'despesa' && l.status === 'pago')
      .reduce((s, l) => s + l.valor, 0)
  );

  saldo = computed(() => this.totalRecebido() - this.totalDespesasPagas());

  qtdRecebimentosPagos = computed(
    () => this.lancamentos().filter((l) => l.tipo === 'receita' && l.status === 'pago').length
  );

  ticketMedio = computed(() =>
    this.qtdRecebimentosPagos() > 0 ? this.totalRecebido() / this.qtdRecebimentosPagos() : 0
  );

  qtdInadimplentes = computed(
    () => this.lancamentos().filter((l) => l.tipo === 'receita' && ehAtrasado(l)).length
  );

  // ===== receita x despesa nos últimos 6 meses (por data de pagamento) =====

  private ultimosSeisMeses(): { chave: string; label: string }[] {
    const hoje = new Date();
    const meses: { chave: string; label: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `${MESES_ABREV[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;
      meses.push({ chave, label });
    }
    return meses;
  }

  resumoMensal = computed<MesResumo[]>(() => {
    const base = this.ultimosSeisMeses();
    const pagos = this.lancamentos().filter((l) => l.status === 'pago' && l.dataPagamento);

    return base.map(({ chave, label }) => {
      const doMes = pagos.filter((l) => l.dataPagamento.startsWith(chave));
      const receita = doMes.filter((l) => l.tipo === 'receita').reduce((s, l) => s + l.valor, 0);
      const despesa = doMes.filter((l) => l.tipo === 'despesa').reduce((s, l) => s + l.valor, 0);
      return { chave, label, receita, despesa };
    });
  });

  maiorValorMensal = computed(() => {
    const valores = this.resumoMensal().flatMap((m) => [m.receita, m.despesa]);
    return Math.max(1, ...valores);
  });

  variacaoMesAtual = computed(() => {
    const meses = this.resumoMensal();
    const atual = meses[meses.length - 1]?.receita ?? 0;
    const anterior = meses[meses.length - 2]?.receita ?? 0;
    if (anterior === 0) return atual > 0 ? 100 : 0;
    return ((atual - anterior) / anterior) * 100;
  });

  // ===== despesas por categoria =====

  despesasPorCategoria = computed(() => {
    const despesas = this.lancamentos().filter((l) => l.tipo === 'despesa' && l.status === 'pago');
    const mapa = new Map<string, number>();

    for (const d of despesas) {
      const chave = d.categoriaDespesa || 'Outras';
      mapa.set(chave, (mapa.get(chave) ?? 0) + d.valor);
    }

    const total = [...mapa.values()].reduce((a, b) => a + b, 0) || 1;

    return [...mapa.entries()]
      .map(([nome, valor]) => ({ nome, valor, percentual: (valor / total) * 100 }))
      .sort((a, b) => b.valor - a.valor);
  });

  // ===== últimos lançamentos =====

  ultimosLancamentos = computed(() =>
    [...this.lancamentos()]
      .sort((a, b) => {
        const dataA = a.dataPagamento || a.dataVencimento || '';
        const dataB = b.dataPagamento || b.dataVencimento || '';
        return dataB.localeCompare(dataA);
      })
      .slice(0, 6)
  );
}