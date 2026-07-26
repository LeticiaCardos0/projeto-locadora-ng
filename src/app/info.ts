import { Injectable } from '@angular/core';

const CATEGORIAS_KEY = 'categorias';
const CLIENTES_KEY = 'clientes';
const VEICULOS_KEY = 'veiculos';

@Injectable({ providedIn: 'root' })
export class InfoService {
  carregarInformacoes(): void {
    this.seedCategorias();
    this.seedClientes();
    this.seedVeiculos();
  }

  private seedCategorias(): void {
    const existing = localStorage.getItem(CATEGORIAS_KEY);
    if (existing && JSON.parse(existing).length > 0) return;

    const categorias = [
      { id: 'cat-1', nome: 'Econômico' },
      { id: 'cat-2', nome: 'Sedan' },
      { id: 'cat-3', nome: 'SUV' },
      { id: 'cat-4', nome: 'Utilitário' },
      { id: 'cat-5', nome: 'Esportivo' },
    ];
    localStorage.setItem(CATEGORIAS_KEY, JSON.stringify(categorias));
  }

  private seedClientes(): void {
    const existing = localStorage.getItem(CLIENTES_KEY);
    if (existing && JSON.parse(existing).length > 0) return;

    const clientes = [
      { id: 'cli-1', nome: 'Ana Beatriz Souza', email: 'ana.souza@email.com', telefone: '(47) 99123-4567', cpf: '123.456.789-01', status: 'ativo' },
      { id: 'cli-2', nome: 'Carlos Eduardo Lima', email: 'carlos.lima@email.com', telefone: '(47) 99876-5432', cpf: '234.567.890-12', status: 'ativo' },
      { id: 'cli-3', nome: 'Fernanda Oliveira', email: 'fernanda.oliveira@email.com', telefone: '(47) 98765-4321', cpf: '345.678.901-23', status: 'ativo' },
      { id: 'cli-4', nome: 'Ricardo Almeida', email: 'ricardo.almeida@email.com', telefone: '(47) 99654-3210', cpf: '456.789.012-34', status: 'bloqueado' },
    ];
    localStorage.setItem(CLIENTES_KEY, JSON.stringify(clientes));
  }

  private seedVeiculos(): void {
    const existing = localStorage.getItem(VEICULOS_KEY);
    if (existing && JSON.parse(existing).length > 0) return;

    const veiculos = [
      { id: 'vei-1', modelo: 'Chevrolet Onix', placa: 'ABC1D23', ano: 2023, categoriaId: 'cat-1', combustivel: 'flex', status: 'disponivel', imagemUrl: '' },
      { id: 'vei-2', modelo: 'Volkswagen Polo', placa: 'DEF4G56', ano: 2022, categoriaId: 'cat-1', combustivel: 'flex', status: 'disponivel', imagemUrl: '' },
      { id: 'vei-3', modelo: 'Toyota Corolla', placa: 'GHI7J89', ano: 2023, categoriaId: 'cat-2', combustivel: 'flex', status: 'disponivel', imagemUrl: '' },
      { id: 'vei-4', modelo: 'Honda Civic', placa: 'JKL0M12', ano: 2022, categoriaId: 'cat-2', combustivel: 'gasolina', status: 'alugado', imagemUrl: '' },
      { id: 'vei-5', modelo: 'Jeep Compass', placa: 'MNO3P45', ano: 2023, categoriaId: 'cat-3', combustivel: 'flex', status: 'disponivel', imagemUrl: '' },
      { id: 'vei-6', modelo: 'Hyundai Creta', placa: 'PQR6S78', ano: 2024, categoriaId: 'cat-3', combustivel: 'flex', status: 'disponivel', imagemUrl: '' },
      { id: 'vei-7', modelo: 'Fiat Toro', placa: 'STU9V01', ano: 2022, categoriaId: 'cat-4', combustivel: 'flex', status: 'disponivel', imagemUrl: '' },
      { id: 'vei-8', modelo: 'Ford Ranger', placa: 'VWX2Y34', ano: 2023, categoriaId: 'cat-4', combustivel: 'gasolina', status: 'alugado', imagemUrl: '' },
      { id: 'vei-9', modelo: 'Ford Mustang', placa: 'YZA5B67', ano: 2024, categoriaId: 'cat-5', combustivel: 'gasolina', status: 'disponivel', imagemUrl: '' },
    ];
    localStorage.setItem(VEICULOS_KEY, JSON.stringify(veiculos));
  }
}