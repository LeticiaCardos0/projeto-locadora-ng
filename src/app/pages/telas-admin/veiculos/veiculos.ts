import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Veiculo {
  id: number;
  modelo: string;
  placa: string;
  ano: number | null;
  categoriaId: string;
  combustivel: string;
  status: 'ativo' | 'inativo';
}

@Component({
  selector: 'app-veiculos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './veiculos.html'
})
export class VeiculosComponent implements OnInit {
  mostrarForm = false;

  veiculos: Veiculo[] = [];

  categorias = [
    { id: '1', nome: 'Econômico' },
    { id: '2', nome: 'SUV' },
    { id: '3', nome: 'Executivo' }
  ];

  veiculoAtual: Veiculo = this.veiculoVazio();
  editando = false;

  ngOnInit(): void {
    this.carregarVeiculos();
  }

  private veiculoVazio(): Veiculo {
    return {
      id: 0,
      modelo: '',
      placa: '',
      ano: null,
      categoriaId: '',
      combustivel: '',
      status: 'ativo'
    };
  }

  carregarVeiculos(): void {
    const data = localStorage.getItem('veiculos');
    this.veiculos = data ? JSON.parse(data) : [];
  }

  novo(): void {
    this.veiculoAtual = this.veiculoVazio();
    this.editando = false;
    this.mostrarForm = true;
  }

  editar(id: number): void {
    const veiculo = this.veiculos.find(v => v.id === id);
    if (veiculo) {
      this.veiculoAtual = { ...veiculo };
      this.editando = true;
      this.mostrarForm = true;
    }
  }

  excluir(id: number): void {
    if (confirm('Deseja realmente excluir este veículo?')) {
      this.veiculos = this.veiculos.filter(v => v.id !== id);
      localStorage.setItem('veiculos', JSON.stringify(this.veiculos));
    }
  }

  salvar(): void {
    if (!this.veiculoAtual.modelo || !this.veiculoAtual.ano) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    if (this.editando) {
      const index = this.veiculos.findIndex(v => v.id === this.veiculoAtual.id);
      if (index !== -1) {
        this.veiculos[index] = { ...this.veiculoAtual };
      }
    } else {
      this.veiculoAtual.id = Date.now();
      this.veiculos.push({ ...this.veiculoAtual });
    }

    localStorage.setItem('veiculos', JSON.stringify(this.veiculos));
    this.fecharForm();
  }

  fecharForm(): void {
    this.veiculoAtual = this.veiculoVazio();
    this.editando = false;
    this.mostrarForm = false;
  }
}