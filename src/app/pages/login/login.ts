import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { campoPreenchido } from '../../shared/validadores';
import { lerClientes, SessaoCliente } from '../../shared/cliente.model';
import { SessaoClienteService } from '../../shared/sessao-cliente.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
})
export class LoginComponent {
  email = '';
  senha = '';
  lembrarMe = false;
  mostrarSenha = signal(false);
  erro = signal('');
  carregando = signal(false);

  returnUrl: string | null = null;

  private sessaoClienteService = inject(SessaoClienteService);

  constructor(private router: Router, route: ActivatedRoute) {
    this.returnUrl = route.snapshot.queryParamMap.get('returnUrl');
  }

  alternarSenha(): void {
    this.mostrarSenha.update((v) => !v);
  }

  entrar(): void {
    this.erro.set('');

    if (!campoPreenchido(this.email) || !campoPreenchido(this.senha)) {
      this.erro.set('Preencha e-mail e senha para continuar.');
      return;
    }

    this.carregando.set(true);

    // Simula uma pequena latência de autenticação, já que tudo roda em localStorage.
    setTimeout(() => {
      const clientes = lerClientes();
      const cliente = clientes.find(
        (c) => c.email.toLowerCase() === this.email.trim().toLowerCase() && c.senha === this.senha
      );

      this.carregando.set(false);

      if (!cliente) {
        this.erro.set('E-mail ou senha incorretos.');
        return;
      }

      if (cliente.status === 'bloqueado') {
        this.erro.set('Sua conta está bloqueada. Entre em contato com o suporte.');
        return;
      }

      const sessao: SessaoCliente = { id: cliente.id, nome: cliente.nome, email: cliente.email };
      this.sessaoClienteService.definir(sessao, this.lembrarMe);

      this.router.navigateByUrl(this.returnUrl ?? '/planos');
    }, 400);
  }
}