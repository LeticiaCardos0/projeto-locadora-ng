// Modelo único de Lançamento financeiro, compartilhado entre o financeiro do admin
// (receitas + despesas da locadora) e o "Meu Financeiro" da área do cliente (só as
// receitas das próprias reservas). Cada reserva não cancelada gera 1 receita aqui,
// via sincronizarReceitasDeReservas().

import { lerReservas } from './reserva.model';
import { lerVeiculos } from './veiculos.model';
import { lerCategorias } from './categoria.model';
import { numeroDeDias } from './reserva-rascunho.model';

export type TipoLancamento = 'receita' | 'despesa';
export type StatusLancamento = 'pendente' | 'pago' | 'estornado' | 'atrasado';
export type FormaPagamento = '' | 'pix' | 'cartao' | 'boleto' | 'dinheiro' | 'transferencia';

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
  clienteId?: string;
  clienteNome?: string;
  veiculoModelo?: string;
}

export const FINANCEIRO_KEY = 'financeiro';

export function lerLancamentos(): Lancamento[] {
  const raw = localStorage.getItem(FINANCEIRO_KEY);
  if (!raw) return [];
  try {
    const lista = JSON.parse(raw);
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

export function salvarLancamentos(lancamentos: Lancamento[]): void {
  localStorage.setItem(FINANCEIRO_KEY, JSON.stringify(lancamentos));
}

export function formatarValor(valor: number | null | undefined): string {
  if (valor === null || valor === undefined || isNaN(valor)) return '-';
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const FORMA_PAGAMENTO_LABELS: Record<FormaPagamento, string> = {
  '': '-',
  pix: 'Pix',
  cartao: 'Cartão de crédito',
  boleto: 'Boleto',
  dinheiro: 'Dinheiro',
  transferencia: 'Transferência',
};

export function formaPagamentoLabel(forma: FormaPagamento): string {
  return FORMA_PAGAMENTO_LABELS[forma];
}

export function isAtrasado(l: Lancamento): boolean {
  if (l.status === 'atrasado') return true;
  if (l.status !== 'pendente' || !l.dataVencimento) return false;
  const hoje = new Date().toISOString().slice(0, 10);
  return l.dataVencimento < hoje;
}

export function statusExibido(l: Lancamento): StatusLancamento {
  if (isAtrasado(l)) return 'atrasado';
  return l.status;
}

// rótulo do status adaptado ao tipo: receita usa "Recebido", despesa usa "Pago"
export function statusLabel(l: Lancamento): string {
  const status = statusExibido(l);
  if (status === 'pendente') return 'Pendente';
  if (status === 'atrasado') return 'Em atraso';
  if (status === 'estornado') return 'Estornado';
  return l.tipo === 'receita' ? 'Recebido' : 'Pago';
}

const STATUS_BADGE_CLASSES: Record<StatusLancamento, string> = {
  pendente: 'bg-yellow-500/10 text-yellow-600',
  pago: 'bg-green-500/10 text-green-500',
  atrasado: 'bg-red-500/10 text-red-500',
  estornado: 'bg-gray-500/10 text-gray-500',
};

export function statusBadgeClasses(status: StatusLancamento): string {
  return STATUS_BADGE_CLASSES[status];
}

/** Dias entre compensação do boleto (compensa alguns dias após a confirmação do pedido). */
const DIAS_COMPENSACAO_BOLETO = 3;

function somarDias(data: string, dias: number): string {
  const d = new Date(data);
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

/**
 * Garante 1 receita por reserva não cancelada (id 'rec-'+reserva.id). Reservas pagas
 * com cartão/pix no checkout do cliente já nascem "pagas"; pagas com boleto nascem
 * "pendentes" com vencimento em alguns dias (podendo ficar "atrasadas"); reservas sem
 * forma de pagamento (criadas manualmente pelo admin) mantêm o comportamento antigo:
 * "pendente" vencendo na data de devolução.
 */
export function sincronizarReceitasDeReservas(): void {
  const reservas = lerReservas();
  const veiculos = lerVeiculos();
  const categorias = lerCategorias();
  const lancamentos = lerLancamentos();
  const hoje = new Date().toISOString().slice(0, 10);

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
    const valor = reserva.valorTotal ?? diaria * numeroDeDias({ dataInicio: reserva.dataInicio, dataFim: reserva.dataFim });

    let status: StatusLancamento = 'pendente';
    let dataVencimento = reserva.dataFim;
    let dataPagamento = '';

    if (reserva.formaPagamento === 'cartao' || reserva.formaPagamento === 'pix') {
      status = 'pago';
      dataPagamento = reserva.dataPagamento ?? hoje;
      dataVencimento = dataPagamento;
    } else if (reserva.formaPagamento === 'boleto') {
      dataVencimento = somarDias(reserva.dataPagamento ?? hoje, DIAS_COMPENSACAO_BOLETO);
    }

    lancamentos.push({
      id: 'rec-' + reserva.id,
      tipo: 'receita',
      descricao: `Aluguel - ${reserva.veiculoModelo}`,
      valor,
      formaPagamento: reserva.formaPagamento ?? '',
      status,
      dataVencimento,
      dataPagamento,
      reservaId: reserva.id,
      clienteId: reserva.clienteId,
      clienteNome: reserva.clienteNome,
      veiculoModelo: reserva.veiculoModelo,
    });
    alterou = true;
  }

  if (alterou) {
    salvarLancamentos(lancamentos);
  }
}
