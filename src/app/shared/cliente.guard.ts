// Guard simples que exige o cliente logado, sem depender do rascunho de reserva
// (usado em telas como "Minhas reservas" que não fazem parte do fluxo de checkout).

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { lerSessaoCliente } from './cliente.model';

export const clienteAutenticadoGuard: CanActivateFn = (rota) => {
  if (lerSessaoCliente()) return true;
  const router = inject(Router);
  return router.parseUrl(`/login?returnUrl=${encodeURIComponent('/' + rota.url.map((s) => s.path).join('/'))}`);
};
