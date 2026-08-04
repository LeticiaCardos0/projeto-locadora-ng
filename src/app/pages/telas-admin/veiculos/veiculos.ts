import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  campoPreenchido,
  contemEmoji,
  gerarProximoId,
  bloquearEmojiKeydown,
  valorValido,
  ANO_MINIMO,
} from '../../../shared/validadores';

export interface Veiculo {
  id: string;
  modelo: string;
  placa: string;
  ano: number | null;
  categoriaId: string;
  combustivel: string;
  status: 'disponivel' | 'alugado' | 'manutencao';
  imagemUrl?: string; // base64 da imagem, salvo direto no localStorage
}

export interface Categoria {
  id: string;
  nome: string;
}

const STORAGE_KEY = 'veiculos';
const CATEGORIAS_KEY = 'categorias';

@Component({
  selector: 'app-veiculos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './veiculos.html',
})
export class VeiculosComponent {
  veiculos: Veiculo[] = [];
  categorias: Categoria[] = [];

  mostrarForm = false;
  editando = false;
  veiculoAtual: Veiculo = this.veiculoVazio();

  // exposto ao template para bloquear emojis na digitação
  bloquearEmojiKeydown = bloquearEmojiKeydown;

  constructor() {
    this.carregar();
    this.carregarCategorias();
  }

  private carregarCategorias(): void {
    const raw = localStorage.getItem(CATEGORIAS_KEY);
    this.categorias = raw ? JSON.parse(raw) : [];
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

  private validar(): boolean {
    if (!campoPreenchido(this.veiculoAtual.modelo)) {
      alert('Informe o modelo do veículo.');
      return false;
    }
    if (contemEmoji(this.veiculoAtual.modelo) || contemEmoji(this.veiculoAtual.placa)) {
      alert('Emojis não são permitidos nos campos de texto.');
      return false;
    }
    if (!valorValido(this.veiculoAtual.ano)) {
      alert('Informe um ano válido (não pode ser negativo).');
      return false;
    }
    if (this.veiculoAtual.ano! < ANO_MINIMO) {
      alert(`O ano do veículo deve ser ${ANO_MINIMO} ou posterior.`);
      return false;
    }
    return true;
  }

  salvar(): void {
    if (!this.validar()) return;

    if (this.editando) {
      const index = this.veiculos.findIndex((v) => v.id === this.veiculoAtual.id);
      if (index > -1) {
        this.veiculos[index] = { ...this.veiculoAtual };
      }
    } else {
      this.veiculoAtual.id = gerarProximoId(
        'V',
        this.veiculos.map((v) => v.id)
      );
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