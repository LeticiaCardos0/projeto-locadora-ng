import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  status: 'ativo' | 'bloqueado';
}

interface ReservaResumo {
  id: string;
  veiculoModelo: string;
  dataInicio: string;
  dataFim: string;
  status: string;
}

const STORAGE_KEY = 'clientes';
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
  const raw = localStorage.getItem(STORAGE_KEY);

  console.log("RAW:", raw);

  this.clientes = raw ? JSON.parse(raw) : [];

  console.log("CLIENTES:", this.clientes);
}

  private recarregar(): void {
    this.carregar();
  }

  private salvarNoStorage(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.clientes));
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

  salvar(): void {
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
