// Estado reativo da sessão do cliente logado. Existe porque o topbar (fora do
// <router-outlet>, nunca recriado) precisa refletir login/logout/edição de perfil
// na hora, sem esperar uma navegação pra reler o localStorage/sessionStorage.

import { Injectable, signal } from '@angular/core';
import { SessaoCliente, CLIENTE_LOGADO_KEY, lerSessaoCliente } from './cliente.model';

@Injectable({ providedIn: 'root' })
export class SessaoClienteService {
  readonly sessao = signal<SessaoCliente | null>(lerSessaoCliente());

  /** Chamado no login: grava a sessão no storage certo (lembrar-me ou só a aba) e atualiza o estado. */
  definir(sessao: SessaoCliente, lembrar: boolean): void {
    if (lembrar) {
      localStorage.setItem(CLIENTE_LOGADO_KEY, JSON.stringify(sessao));
    } else {
      sessionStorage.setItem(CLIENTE_LOGADO_KEY, JSON.stringify(sessao));
    }
    this.sessao.set(sessao);
  }

  /** Atualiza campos da sessão atual (ex: nome mudou), regravando no mesmo storage onde já estava. */
  atualizar(patch: Partial<SessaoCliente>): void {
    const atual = this.sessao();
    if (!atual) return;
    const atualizado = { ...atual, ...patch };

    if (localStorage.getItem(CLIENTE_LOGADO_KEY)) {
      localStorage.setItem(CLIENTE_LOGADO_KEY, JSON.stringify(atualizado));
    } else {
      sessionStorage.setItem(CLIENTE_LOGADO_KEY, JSON.stringify(atualizado));
    }
    this.sessao.set(atualizado);
  }

  sair(): void {
    localStorage.removeItem(CLIENTE_LOGADO_KEY);
    sessionStorage.removeItem(CLIENTE_LOGADO_KEY);
    this.sessao.set(null);
  }
}
