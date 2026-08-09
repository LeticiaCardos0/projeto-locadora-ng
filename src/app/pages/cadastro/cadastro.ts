import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { campoPreenchido, contemEmoji, bloquearEmojiKeydown } from '../../shared/validadores';
import { Cliente, lerClientes, salvarClientes } from '../../shared/cliente.model';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cadastro.html',
})
export class CadastroComponent {
  nome = '';
  email = '';
  telefone = '';
  senha = '';
  confirmarSenha = '';

  mostrarSenha = signal(false);
  erro = signal('');
  sucesso = signal(false);
  carregando = signal(false);

  bloquearEmojiKeydown = bloquearEmojiKeydown;

  returnUrl: string | null = null;

  constructor(private router: Router, route: ActivatedRoute) {
    this.returnUrl = route.snapshot.queryParamMap.get('returnUrl');
  }

  alternarSenha(): void {
    this.mostrarSenha.update((v) => !v);
  }

  private validar(clientes: Cliente[]): string | null {
    if (!campoPreenchido(this.nome)) return 'Informe o seu nome.';
    if (contemEmoji(this.nome)) return 'Emojis não são permitidos no nome.';
    if (!campoPreenchido(this.email)) return 'Informe o seu e-mail.';
    if (!campoPreenchido(this.telefone)) return 'Informe o seu telefone.';
    if (!campoPreenchido(this.senha)) return 'Crie uma senha.';
    if (this.senha.length < 6) return 'A senha deve ter pelo menos 6 caracteres.';
    if (this.senha !== this.confirmarSenha) return 'As senhas não coincidem.';

    const existente = clientes.find((c) => c.email.toLowerCase() === this.email.trim().toLowerCase());
    if (existente && existente.senha) return 'Já existe uma conta cadastrada com esse e-mail. Faça login.';

    return null;
  }

  cadastrar(): void {
    this.erro.set('');
    const clientes = lerClientes();

    const mensagemErro = this.validar(clientes);
    if (mensagemErro) {
      this.erro.set(mensagemErro);
      return;
    }

    this.carregando.set(true);

    setTimeout(() => {
      // Se o e-mail já existe como cliente cadastrado pelo admin (sem senha ainda),
      // completamos o cadastro dele em vez de criar um registro duplicado.
      const existenteIndex = clientes.findIndex(
        (c) => c.email.toLowerCase() === this.email.trim().toLowerCase()
      );

      if (existenteIndex > -1) {
        clientes[existenteIndex] = {
          ...clientes[existenteIndex],
          nome: this.nome.trim(),
          telefone: this.telefone.trim(),
          senha: this.senha,
          status: 'ativo',
        };
      } else {
        const novoCliente: Cliente = {
          id: Date.now().toString(),
          nome: this.nome.trim(),
          email: this.email.trim(),
          telefone: this.telefone.trim(),
          senha: this.senha,
          status: 'ativo',
        };
        clientes.push(novoCliente);
      }

      salvarClientes(clientes);

      this.carregando.set(false);
      this.sucesso.set(true);

      const loginUrl = this.returnUrl ? `/login?returnUrl=${encodeURIComponent(this.returnUrl)}` : '/login';
      setTimeout(() => this.router.navigateByUrl(loginUrl), 1200);
    }, 400);
  }
}