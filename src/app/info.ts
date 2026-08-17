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
    this.seedManutencoes();
  }

  private seedCategorias(): void {
    const categorias = [
      {
        id: 'cat-1',
        nome: 'Econômico',
        valorDiaria: 90,
        imagemUrl: '/imagens-categorias/economico.jpeg',
      },
      {
        id: 'cat-2',
        nome: 'Sedan',
        valorDiaria: 150,
        imagemUrl: '/imagens-categorias/sedan.webp',
      },
      {
        id: 'cat-3',
        nome: 'SUV',
        valorDiaria: 220,
        imagemUrl: '/imagens-categorias/suv.jpg',
      },
      {
        id: 'cat-4',
        nome: 'Utilitário',
        valorDiaria: 260,
        imagemUrl: '/imagens-categorias/ultilitario.webp',
      },
      {
        id: 'cat-5',
        nome: 'Esportivo',
        valorDiaria: 480,
        imagemUrl: '/imagens-categorias/esportivo.jpg',
      },
    ];

    if (!this.temDados(CATEGORIAS_KEY)) {
      localStorage.setItem(CATEGORIAS_KEY, JSON.stringify(categorias));
      return;
    }

    // Migração leve: quem já tinha categorias salvas de antes do campo `imagemUrl`
    // existir fica com esse campo faltando pra sempre, já que o seed só roda em
    // localStorage vazio. Completa só o que falta, sem mexer no que já foi editado.
    const salvas = this.lerStorage<any[]>(CATEGORIAS_KEY, []);
    let alterou = false;
    const atualizadas = salvas.map((salva) => {
      if (salva.imagemUrl) return salva;
      const doSeed = categorias.find((c) => c.id === salva.id);
      if (!doSeed) return salva;
      alterou = true;
      return { ...salva, imagemUrl: doSeed.imagemUrl };
    });

    if (alterou) {
      localStorage.setItem(CATEGORIAS_KEY, JSON.stringify(atualizadas));
    }
  }

  private lerStorage<T>(chave: string, fallback: T): T {
    const raw = localStorage.getItem(chave);
    return raw ? JSON.parse(raw) : fallback;
  }

  private seedClientes(): void {
    if (this.temDados(CLIENTES_KEY)) return;

    const clientes = [
      { id: 'cli-1', nome: 'Ana Beatriz Souza', email: 'ana.souza@email.com', telefone: '(47) 99123-4567', cpf: '123.456.789-01', status: 'ativo' },
      { id: 'cli-2', nome: 'Carlos Eduardo Lima', email: 'carlos.lima@email.com', telefone: '(47) 99876-5432', cpf: '234.567.890-12', status: 'ativo' },
      { id: 'cli-3', nome: 'Fernanda Oliveira', email: 'fernanda.oliveira@email.com', telefone: '(47) 98765-4321', cpf: '345.678.901-23', status: 'ativo' },
      { id: 'cli-4', nome: 'Ricardo Almeida', email: 'ricardo.almeida@email.com', telefone: '(47) 99654-3210', cpf: '456.789.012-34', status: 'bloqueado' },
    ];
    localStorage.setItem(CLIENTES_KEY, JSON.stringify(clientes));
  }

  // Considera "tem dados" só se a chave existir E o array não estiver vazio.
  // Isso evita que um array vazio salvo em algum teste anterior bloqueie o seed pra sempre.
  private temDados(chave: string): boolean {
    const raw = localStorage.getItem(chave);
    if (!raw) return false;
    try {
      const lista = JSON.parse(raw);
      return Array.isArray(lista) && lista.length > 0;
    } catch {
      return false;
    }
  }

  private seedVeiculos(): void {
    if (this.temDados(VEICULOS_KEY)) return;

    const veiculos = [
      { id: 'vei-1', modelo: 'Chevrolet Onix', placa: 'ABC1D23', ano: 2023, categoriaId: 'cat-1', combustivel: 'flex', status: 'disponivel', imagemUrl: '/imagens-carros/onix.webp' },
      { id: 'vei-2', modelo: 'Volkswagen Polo', placa: 'DEF4G56', ano: 2022, categoriaId: 'cat-1', combustivel: 'flex', status: 'disponivel', imagemUrl: '/imagens-carros/polo.webp' },
      { id: 'vei-3', modelo: 'Toyota Corolla', placa: 'GHI7J89', ano: 2023, categoriaId: 'cat-2', combustivel: 'flex', status: 'disponivel', imagemUrl: '/imagens-carros/corolla.webp' },
      { id: 'vei-4', modelo: 'Honda Civic', placa: 'JKL0M12', ano: 2022, categoriaId: 'cat-2', combustivel: 'gasolina', status: 'disponivel', imagemUrl: '/imagens-carros/Civic.avif' },
      { id: 'vei-5', modelo: 'Jeep Compass', placa: 'MNO3P45', ano: 2023, categoriaId: 'cat-3', combustivel: 'flex', status: 'disponivel', imagemUrl: '/imagens-carros/compas.webp' },
      { id: 'vei-6', modelo: 'Hyundai Creta', placa: 'PQR6S78', ano: 2024, categoriaId: 'cat-3', combustivel: 'flex', status: 'disponivel', imagemUrl: '/imagens-carros/creta.png' },
      { id: 'vei-7', modelo: 'Fiat Toro', placa: 'STU9V01', ano: 2022, categoriaId: 'cat-4', combustivel: 'flex', status: 'disponivel', imagemUrl: '/imagens-carros/toro.png' },
      { id: 'vei-8', modelo: 'Ford Ranger', placa: 'VWX2Y34', ano: 2023, categoriaId: 'cat-4', combustivel: 'gasolina', status: 'disponivel', imagemUrl: '/imagens-carros/ranger.png' },
      { id: 'vei-9', modelo: 'Ford Mustang', placa: 'YZA5B67', ano: 2024, categoriaId: 'cat-5', combustivel: 'gasolina', status: 'disponivel', imagemUrl: '/imagens-carros/mustang.webp' },
    ];
    localStorage.setItem(VEICULOS_KEY, JSON.stringify(veiculos));
  }

  private seedManutencoes(): void {
    const MANUTENCOES_KEY = 'manutencoes';
    if (this.temDados(MANUTENCOES_KEY)) return;

    const manutencoes = [
      { id: 'man-1', veiculoId: 'vei-2', veiculoModelo: 'Volkswagen Polo', tipo: 'preventiva', data: '2026-07-20', custo: 350, status: 'em_andamento' },
      { id: 'man-2', veiculoId: 'vei-6', veiculoModelo: 'Hyundai Creta', tipo: 'corretiva', data: '2026-06-10', custo: 890, status: 'concluida' },
      { id: 'man-3', veiculoId: 'vei-9', veiculoModelo: 'Ford Mustang', tipo: 'preventiva', data: '2026-08-05', custo: 420, status: 'agendada' },
    ];
    localStorage.setItem(MANUTENCOES_KEY, JSON.stringify(manutencoes));
  }
}