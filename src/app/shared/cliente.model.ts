// Modelo único de Cliente, compartilhado entre a área administrativa (CRUD de clientes)
// e a área do cliente (cadastro/login). Um cliente criado pelo admin não tem `senha`
// (não acessa o login) até que ele mesmo se cadastre ou o admin defina uma senha.

export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpf?: string;
  /** Presente somente quando o cliente pode acessar a área do cliente (se cadastrou/tem login). */
  senha?: string;
  status: 'ativo' | 'bloqueado';
}

export const CLIENTES_KEY = 'clientes';
/** Sessão do cliente autenticado no momento (guarda apenas dados não sensíveis). */
export const CLIENTE_LOGADO_KEY = 'clienteLogado';

export interface SessaoCliente {
  id: string;
  nome: string;
  email: string;
}

export function lerClientes(): Cliente[] {
  const raw = localStorage.getItem(CLIENTES_KEY);
  if (!raw) return [];
  try {
    const lista = JSON.parse(raw);
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

export function salvarClientes(clientes: Cliente[]): void {
  localStorage.setItem(CLIENTES_KEY, JSON.stringify(clientes));
}

export function lerSessaoCliente(): SessaoCliente | null {
  const raw = localStorage.getItem(CLIENTE_LOGADO_KEY) ?? sessionStorage.getItem(CLIENTE_LOGADO_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessaoCliente;
  } catch {
    return null;
  }
}