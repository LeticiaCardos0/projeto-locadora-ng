import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TemaService } from '../../tema/tema';
import { campoPreenchido, contemEmoji, bloquearEmojiKeydown } from '../../shared/validadores';
import { lerClientes, salvarClientes } from '../../shared/cliente.model';
import { SessaoClienteService } from '../../shared/sessao-cliente.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './topbar.html',
})
export class TopbarComponent {
  tema = inject(TemaService);
  sessaoCliente = inject(SessaoClienteService);
  private router = inject(Router);

  bloquearEmojiKeydown = bloquearEmojiKeydown;

  // ===== modal "Meu perfil" =====
  mostrarPerfil = signal(false);
  mostrarSenha = signal(false);
  erro = signal('');
  sucesso = signal(false);
  salvando = signal(false);

  nome = '';
  novaSenha = '';
  confirmarNovaSenha = '';

  toggleTema(): void {
    this.tema.toggle();
  }

  abrirPerfil(): void {
    const sessao = this.sessaoCliente.sessao();
    if (!sessao) return;

    this.nome = sessao.nome;
    this.novaSenha = '';
    this.confirmarNovaSenha = '';
    this.erro.set('');
    this.sucesso.set(false);
    this.mostrarSenha.set(false);
    this.mostrarPerfil.set(true);
  }

  fecharPerfil(): void {
    this.mostrarPerfil.set(false);
  }

  alternarSenha(): void {
    this.mostrarSenha.update((v) => !v);
  }

  salvarPerfil(): void {
    this.erro.set('');

    if (!campoPreenchido(this.nome)) {
      this.erro.set('Informe o seu nome.');
      return;
    }
    if (contemEmoji(this.nome)) {
      this.erro.set('Emojis não são permitidos no nome.');
      return;
    }
    if (this.novaSenha && this.novaSenha.length < 6) {
      this.erro.set('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (this.novaSenha && this.novaSenha !== this.confirmarNovaSenha) {
      this.erro.set('As senhas não coincidem.');
      return;
    }

    const sessao = this.sessaoCliente.sessao();
    if (!sessao) return;

    this.salvando.set(true);

    setTimeout(() => {
      const clientes = lerClientes();
      const index = clientes.findIndex((c) => c.id === sessao.id);
      if (index > -1) {
        clientes[index] = {
          ...clientes[index],
          nome: this.nome.trim(),
          ...(this.novaSenha ? { senha: this.novaSenha } : {}),
        };
        salvarClientes(clientes);
      }

      this.sessaoCliente.atualizar({ nome: this.nome.trim() });

      this.salvando.set(false);
      this.sucesso.set(true);
      setTimeout(() => this.fecharPerfil(), 900);
    }, 400);
  }

  sair(): void {
    this.sessaoCliente.sair();
    this.fecharPerfil();
    this.router.navigateByUrl('/login');
  }
}
