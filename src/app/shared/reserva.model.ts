// Modelo único de Reserva, compartilhado entre o CRUD do admin e o fluxo de
// reserva da área do cliente (planos -> veículo -> datas -> pagamento).

export type StatusReserva = 'pendente' | 'confirmada' | 'em_andamento' | 'finalizada' | 'cancelada';
export type FormaPagamento = 'cartao' | 'pix' | 'boleto';

export interface Reserva {
  id: string;
  clienteId: string;
  clienteNome: string;
  veiculoId: string;
  veiculoModelo: string;
  dataInicio: string;
  dataFim: string;
  status: StatusReserva;
  /** Campos abaixo só existem em reservas feitas pelo próprio cliente no site. */
  planoId?: string;
  planoNome?: string;
  localRetirada?: string;
  localDevolucao?: string;
  formaPagamento?: FormaPagamento;
  valorTotal?: number;
  /** Data (yyyy-MM-dd) em que o cliente concluiu o checkout — base pro vencimento do boleto. */
  dataPagamento?: string;
}

export const RESERVAS_KEY = 'reservas';

export function lerReservas(): Reserva[] {
  const raw = localStorage.getItem(RESERVAS_KEY);
  if (!raw) return [];
  try {
    const lista = JSON.parse(raw);
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

export function salvarReservas(reservas: Reserva[]): void {
  localStorage.setItem(RESERVAS_KEY, JSON.stringify(reservas));
}

const STATUS_LABELS: Record<StatusReserva, string> = {
  pendente: 'Pendente',
  confirmada: 'Confirmada',
  em_andamento: 'Em andamento',
  finalizada: 'Finalizada',
  cancelada: 'Cancelada',
};

export function statusLabel(status: StatusReserva): string {
  return STATUS_LABELS[status];
}

const STATUS_BADGE_CLASSES: Record<StatusReserva, string> = {
  pendente: 'bg-yellow-500/10 text-yellow-600',
  confirmada: 'bg-blue-500/10 text-blue-500',
  em_andamento: 'bg-[#D9603F]/10 text-[#D9603F]',
  finalizada: 'bg-green-500/10 text-green-500',
  cancelada: 'bg-red-500/10 text-red-500',
};

export function statusBadgeClasses(status: StatusReserva): string {
  return STATUS_BADGE_CLASSES[status];
}
