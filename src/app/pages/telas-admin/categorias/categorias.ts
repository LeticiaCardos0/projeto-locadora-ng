import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { campoPreenchido, contemEmoji, bloquearEmojiKeydown, valorValido } from '../../../shared/validadores';

export interface Categoria {
  id: string;
  nome: string;
  valorDiaria: number | null;
}

interface VeiculoResumo {
  id: string;
  modelo: string;
  placa: string;
  status: 'disponivel' | 'alugado';
}

const STORAGE_KEY = 'categorias';
const VEICULOS_KEY = 'veiculos';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categorias.html',
})
export class CategoriasComponent {
  categorias: Categoria[] = [];

  mostrarForm = false;
  editando = false;
  categoriaAtual: Categoria = this.categoriaVazia();

  mostrarVeiculos = false;
  categoriaSelecionada: Categoria | null = null;
  veiculosDaCategoria: VeiculoResumo[] = [];

  bloquearEmojiKeydown = bloquearEmojiKeydown;

  constructor() {
    this.carregar();
  }

  private categoriaVazia(): Categoria {
    return {
      id: '',
      nome: '',
      valorDiaria: null,
    };
  }

  private carregar(): void {
    const raw = localStorage.getItem(STORAGE_KEY);
    this.categorias = raw ? JSON.parse(raw) : [];
  }

  private salvarNoStorage(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.categorias));
  }

  // ===== apoio: veículos vinculados (lidos da tela de Veículos, mesma fonte no localStorage) =====

  private lerVeiculos(): any[] {
    const raw = localStorage.getItem(VEICULOS_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  qtdVeiculos(categoriaId: string): number {
    return this.lerVeiculos().filter((v) => v.categoriaId === categoriaId).length;
  }

  formatarValor(valor: number | null): string {
    if (valor === null || valor === undefined || isNaN(valor)) return '-';
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  // ===== CRUD =====

  novo(): void {
    this.editando = false;
    this.categoriaAtual = this.categoriaVazia();
    this.mostrarForm = true;
  }

  editar(id: string): void {
    const encontrada = this.categorias.find((c) => c.id === id);
    if (!encontrada) return;
    this.editando = true;
    // clona para não editar o objeto da lista diretamente antes de salvar
    this.categoriaAtual = { ...encontrada };
    this.mostrarForm = true;
  }

  excluir(id: string): void {
    if (this.qtdVeiculos(id) > 0) {
      alert('Não é possível excluir: existem veículos vinculados a esta categoria.');
      return;
    }
    this.categorias = this.categorias.filter((c) => c.id !== id);
    this.salvarNoStorage();
  }

  fecharForm(): void {
    this.mostrarForm = false;
    this.categoriaAtual = this.categoriaVazia();
  }

  private validar(): boolean {
    if (!campoPreenchido(this.categoriaAtual.nome)) {
      alert('Informe o nome da categoria.');
      return false;
    }
    if (contemEmoji(this.categoriaAtual.nome)) {
      alert('Emojis não são permitidos no nome da categoria.');
      return false;
    }
    if (!valorValido(this.categoriaAtual.valorDiaria)) {
      alert('Informe um valor de diária válido (não pode ser negativo).');
      return false;
    }
    return true;
  }

  salvar(): void {
    if (!this.validar()) return;

    if (this.editando) {
      const index = this.categorias.findIndex((c) => c.id === this.categoriaAtual.id);
      if (index > -1) {
        this.categorias[index] = { ...this.categoriaAtual };
      }
    } else {
      this.categoriaAtual.id = Date.now().toString();
      this.categorias.push({ ...this.categoriaAtual });
    }

    this.salvarNoStorage();
    this.fecharForm();
  }

  // ===== modal de veículos vinculados =====

  verVeiculos(categoriaId: string): void {
    this.categoriaSelecionada = this.categorias.find((c) => c.id === categoriaId) ?? null;

    this.veiculosDaCategoria = this.lerVeiculos()
      .filter((v) => v.categoriaId === categoriaId)
      .map((v) => ({
        id: v.id,
        modelo: v.modelo,
        placa: v.placa,
        status: v.status,
      }));

    this.mostrarVeiculos = true;
  }

  fecharVeiculos(): void {
    this.mostrarVeiculos = false;
    this.categoriaSelecionada = null;
    this.veiculosDaCategoria = [];
  }
}