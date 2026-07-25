import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Veiculo {
  id: string;
  modelo: string;
  placa: string;
  ano: number | null;
  categoriaId: string;
  combustivel: string;
  status: 'disponivel' | 'alugado';
  imagemUrl?: string; // base64 da imagem, salvo direto no localStorage
}

export interface Categoria {
  id: string;
  nome: string;
}

const STORAGE_KEY = 'veiculos';

@Component({
  selector: 'app-veiculos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './veiculos.html',
})
export class VeiculosComponent {
  veiculos: Veiculo[] = [];
  categorias: Categoria[] = [
    { id: '1', nome: 'Hatch' },
    { id: '2', nome: 'Sedan' },
    { id: '3', nome: 'SUV' },
  ];

  mostrarForm = false;
  editando = false;
  veiculoAtual: Veiculo = this.veiculoVazio();

  constructor() {
    this.carregar();
  }

  private veiculoVazio(): Veiculo {
    return {
      id: '',
      modelo: '',
      placa: '',
      ano: null,
      categoriaId: '',
      combustivel: '',
      status: 'disponivel',
      imagemUrl: '',
    };
  }

  private carregar(): void {
    const raw = localStorage.getItem(STORAGE_KEY);
    this.veiculos = raw ? JSON.parse(raw) : [];
  }

  private salvarNoStorage(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.veiculos));
  }

  novo(): void {
    this.editando = false;
    this.veiculoAtual = this.veiculoVazio();
    this.mostrarForm = true;
  }

  editar(id: string): void {
    const encontrado = this.veiculos.find((v) => v.id === id);
    if (!encontrado) return;
    this.editando = true;
    // clona para não editar o objeto da lista diretamente antes de salvar
    this.veiculoAtual = { ...encontrado };
    this.mostrarForm = true;
  }

  excluir(id: string): void {
    this.veiculos = this.veiculos.filter((v) => v.id !== id);
    this.salvarNoStorage();
  }

  fecharForm(): void {
    this.mostrarForm = false;
    this.veiculoAtual = this.veiculoVazio();
  }

  salvar(): void {
    if (this.editando) {
      const index = this.veiculos.findIndex((v) => v.id === this.veiculoAtual.id);
      if (index > -1) {
        this.veiculos[index] = { ...this.veiculoAtual };
      }
    } else {
      this.veiculoAtual.id = Date.now().toString();
      this.veiculos.push({ ...this.veiculoAtual });
    }

    this.salvarNoStorage();
    this.fecharForm();
  }

  // ===== Upload de imagem =====

  onImagemSelecionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    const arquivo = input.files?.[0];
    if (!arquivo) return;

    // Limite simples de tamanho (2MB) já que tudo fica salvo no localStorage,
    // que tem espaço limitado (geralmente 5-10MB no total por domínio)
    const LIMITE_BYTES = 2 * 1024 * 1024;
    if (arquivo.size > LIMITE_BYTES) {
      alert('A imagem deve ter no máximo 2MB.');
      input.value = '';
      return;
    }

    const leitor = new FileReader();
    leitor.onload = () => {
      this.veiculoAtual.imagemUrl = leitor.result as string;
    };
    leitor.readAsDataURL(arquivo);
  }

  removerImagem(): void {
    this.veiculoAtual.imagemUrl = '';
  }
}