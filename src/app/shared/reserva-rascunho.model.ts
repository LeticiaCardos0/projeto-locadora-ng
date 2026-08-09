// Rascunho da reserva em andamento no fluxo do cliente (planos -> veículo -> datas ->
// dados -> revisão -> pagamento). Cada etapa é uma rota/página separada, então esse
// estado precisa sobreviver à navegação entre elas — por isso vai em sessionStorage
// (dura a aba, some se o cliente fechar e abrir de novo, e é limpo ao confirmar a reserva).

export interface ReservaRascunho {
  planoId: string;
  planoNome: string;
  descontoPercentual: number;
  veiculoId?: string;
  veiculoModelo?: string;
  categoriaId?: string;
  dataInicio?: string;
  dataFim?: string;
  localRetirada?: string;
  localDevolucao?: string;
}

const RASCUNHO_KEY = 'reservaRascunho';

export const LOCAIS: string[] = [
  'Unidade Centro – Rua XV de Novembro, 500',
  'Unidade Aeroporto – Av. Santos Dumont, 1200',
  'Unidade Shopping – Av. Beira-Mar, 850',
];

export function lerRascunho(): ReservaRascunho | null {
  const raw = sessionStorage.getItem(RASCUNHO_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ReservaRascunho;
  } catch {
    return null;
  }
}

export function salvarRascunho(rascunho: ReservaRascunho): void {
  sessionStorage.setItem(RASCUNHO_KEY, JSON.stringify(rascunho));
}

/** Mescla `patch` no rascunho atual (cria um novo se ainda não existir) e persiste. */
export function atualizarRascunho(patch: Partial<ReservaRascunho>): ReservaRascunho {
  const atual = lerRascunho() ?? { planoId: 'flex', planoNome: 'Flex', descontoPercentual: 0 };
  const atualizado = { ...atual, ...patch };
  salvarRascunho(atualizado);
  return atualizado;
}

export function limparRascunho(): void {
  sessionStorage.removeItem(RASCUNHO_KEY);
}

export function numeroDeDias(rascunho: Pick<ReservaRascunho, 'dataInicio' | 'dataFim'>): number {
  if (!rascunho.dataInicio || !rascunho.dataFim) return 0;
  const inicio = new Date(rascunho.dataInicio).getTime();
  const fim = new Date(rascunho.dataFim).getTime();
  const dias = Math.round((fim - inicio) / (1000 * 60 * 60 * 24));
  return dias > 0 ? dias : 0;
}

/** Diária da categoria x nº de dias x desconto do plano escolhido. */
export function calcularValorTotal(rascunho: ReservaRascunho, valorDiaria: number | null): number | null {
  if (valorDiaria === null || isNaN(valorDiaria)) return null;
  const desconto = rascunho.descontoPercentual / 100;
  return valorDiaria * numeroDeDias(rascunho) * (1 - desconto);
}
