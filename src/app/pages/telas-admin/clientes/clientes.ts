import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { campoPreenchido, contemEmoji, bloquearEmojiKeydown } from '../../../shared/validadores';
import { Cliente, CLIENTES_KEY, lerClientes, salvarClientes } from '../../../shared/cliente.model';

export type { Cliente };

interface ReservaResumo {
  id: string;
  veiculoModelo: string;
  dataInicio: string;
  dataFim: string;
  status: string;
}

const RESERVAS_KEY = 'reservas';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.html',
})
export class ClientesComponent {
  clientes: Cliente[] = [];

  mostrarForm = false;
  editando = false;
  clienteAtual: Cliente = this.clienteVazio();

  mostrarHistorico = false;
  clienteSelecionado: Cliente | null = null;
  historicoReservas: ReservaResumo[] = [];

  bloquearEmojiKeydown = bloquearEmojiKeydown;

  constructor() {
    this.carregar();
  }

  private clienteVazio(): Cliente {
    return {
      id: '',
      nome: '',
      email: '',
      telefone: '',
      cpf: '',
      status: 'ativo',
    };
  }

  private carregar(): void {
    this.clientes = lerClientes();
  }

  private recarregar(): void {
    this.carregar();
  }

  private salvarNoStorage(): void {
    salvarClientes(this.clientes);
  }

  novo(): void {
    this.editando = false;
    this.clienteAtual = this.clienteVazio();
    this.mostrarForm = true;
  }

  editar(id: string): void {
    const encontrado = this.clientes.find((c) => c.id === id);
    if (!encontrado) return;
    this.editando = true;
    this.clienteAtual = { ...encontrado };
    this.mostrarForm = true;
  }

  excluir(id: string): void {
    this.clientes = this.clientes.filter((c) => c.id !== id);
    this.salvarNoStorage();
    this.recarregar();
  }

  fecharForm(): void {
    this.mostrarForm = false;
    this.clienteAtual = this.clienteVazio();
  }

  private validar(): boolean {
    if (!campoPreenchido(this.clienteAtual.nome)) {
      alert('Informe o nome do cliente.');
      return false;
    }
    if (!campoPreenchido(this.clienteAtual.email)) {
      alert('Informe o e-mail do cliente.');
      return false;
    }
    if (!campoPreenchido(this.clienteAtual.telefone)) {
      alert('Informe o telefone do cliente.');
      return false;
    }
    if (contemEmoji(this.clienteAtual.nome) || contemEmoji(this.clienteAtual.email)) {
      alert('Emojis não são permitidos nos campos de texto.');
      return false;
    }
    return true;
  }

  salvar(): void {
    if (!this.validar()) return;

    if (this.editando) {
      const index = this.clientes.findIndex((c) => c.id === this.clienteAtual.id);
      if (index > -1) {
        this.clientes[index] = { ...this.clienteAtual };
      }
    } else {
      this.clienteAtual.id = Date.now().toString();
      this.clientes.push({ ...this.clienteAtual });
    }

    this.salvarNoStorage();
    this.recarregar();
    this.fecharForm();
  }

  verHistorico(clienteId: string): void {
    this.clienteSelecionado = this.clientes.find((c) => c.id === clienteId) ?? null;

    const raw = localStorage.getItem(RESERVAS_KEY);
    const reservas: any[] = raw ? JSON.parse(raw) : [];

    this.historicoReservas = reservas
      .filter((r) => r.clienteId === clienteId)
      .map((r) => ({
        id: r.id,
        veiculoModelo: r.veiculoModelo ?? 'Veículo não identificado',
        dataInicio: r.dataInicio,
        dataFim: r.dataFim,
        status: r.status,
      }));

    this.mostrarHistorico = true;
  }

  fecharHistorico(): void {
    this.mostrarHistorico = false;
    this.clienteSelecionado = null;
    this.historicoReservas = [];
  }
}