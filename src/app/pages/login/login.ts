import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { campoPreenchido } from '../../shared/validadores';
import { lerClientes, CLIENTE_LOGADO_KEY, SessaoCliente } from '../../shared/cliente.model';

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

  constructor(private router: Router) {}

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
      if (this.lembrarMe) {
        localStorage.setItem(CLIENTE_LOGADO_KEY, JSON.stringify(sessao));
      } else {
        sessionStorage.setItem(CLIENTE_LOGADO_KEY, JSON.stringify(sessao));
      }

      this.router.navigateByUrl('/admin');
    }, 400);
  }
}