// Guards funcionais que impedem o cliente de pular etapas do fluxo de reserva
// digitando a URL direto (ex: ir pra /reserva/pagamento sem ter escolhido veículo).

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { lerRascunho } from './reserva-rascunho.model';
import { lerSessaoCliente } from './cliente.model';

export const veiculoSelecionadoGuard: CanActivateFn = () => {
  const rascunho = lerRascunho();
  if (rascunho?.veiculoId) return true;
  return inject(Router).parseUrl('/veiculos');
};

export const datasDefinidasGuard: CanActivateFn = () => {
  const rascunho = lerRascunho();
  const router = inject(Router);

  if (!rascunho?.veiculoId) return router.parseUrl('/veiculos');
  if (!rascunho.dataInicio || !rascunho.dataFim || !rascunho.localRetirada || !rascunho.localDevolucao) {
    return router.parseUrl('/reserva/datas');
  }
  return true;
};

export const clienteLogadoGuard: CanActivateFn = () => {
  const rascunho = lerRascunho();
  const router = inject(Router);

  if (!rascunho?.veiculoId) return router.parseUrl('/veiculos');
  if (!rascunho.dataInicio || !rascunho.dataFim || !rascunho.localRetirada || !rascunho.localDevolucao) {
    return router.parseUrl('/reserva/datas');
  }
  if (!lerSessaoCliente()) {
    return router.parseUrl('/reserva/dados');
  }
  return true;
};
