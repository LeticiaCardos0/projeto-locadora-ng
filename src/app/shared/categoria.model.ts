// Modelo único de Categoria de veículo, compartilhado entre admin e área do cliente.

export interface Categoria {
  id: string;
  nome: string;
  valorDiaria: number | null;
}

export const CATEGORIAS_KEY = 'categorias';

export function lerCategorias(): Categoria[] {
  const raw = localStorage.getItem(CATEGORIAS_KEY);
  if (!raw) return [];
  try {
    const lista = JSON.parse(raw);
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

export function salvarCategorias(categorias: Categoria[]): void {
  localStorage.setItem(CATEGORIAS_KEY, JSON.stringify(categorias));
}