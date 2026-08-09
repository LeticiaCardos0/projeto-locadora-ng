// Modelo único de Veículo, compartilhado entre a área administrativa (CRUD de veículos)
// e a área do cliente (catálogo/reservas).

export interface Veiculo {
  id: string;
  modelo: string;
  placa: string;
  ano: number | null;
  categoriaId: string;
  combustivel: string;
  status: 'disponivel' | 'alugado' | 'manutencao';
  imagemUrl?: string; // base64 ou URL da imagem, salvo direto no localStorage
}

export const VEICULOS_KEY = 'veiculos';

export function lerVeiculos(): Veiculo[] {
  const raw = localStorage.getItem(VEICULOS_KEY);
  if (!raw) return [];
  try {
    const lista = JSON.parse(raw);
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

export function salvarVeiculos(veiculos: Veiculo[]): void {
  localStorage.setItem(VEICULOS_KEY, JSON.stringify(veiculos));
}

/** Máscara simples de placa pra exibir só uma parte (ex: ABC1***) na área do cliente. */
export function mascararPlaca(placa: string | null | undefined): string {
  if (!placa) return '-';
  const limpa = placa.trim();
  if (limpa.length <= 4) return limpa;
  return `${limpa.slice(0, 4)}${'*'.repeat(limpa.length - 4)}`;
} 