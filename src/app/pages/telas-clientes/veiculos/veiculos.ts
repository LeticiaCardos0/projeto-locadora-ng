import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Veiculo, lerVeiculos, mascararPlaca } from '../../../shared/veiculos.model';
import { Categoria, lerCategorias } from '../../../shared/categoria.model';
import { atualizarRascunho } from '../../../shared/reserva-rascunho.model';
import { ActivatedRoute, Router } from '@angular/router';


type Ordenacao = 'recentes' | 'menor-preco' | 'maior-preco';

@Component({
  selector: 'app-veiculos-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './veiculos.html',
})
export class VeiculosClienteComponent {
  veiculos: Veiculo[] = [];
  categorias: Categoria[] = [];

  // ===== filtros =====
  busca = '';
  filtroCategoriaId = '';
  filtroCombustivel = '';
  precoMax: number | null = null;
  ordenacao: Ordenacao = 'recentes';

  // ===== tela de detalhes (modal) =====
  veiculoSelecionado: Veiculo | null = null;

  mascararPlaca = mascararPlaca;

  constructor(private route: ActivatedRoute, private router: Router) {
    this.veiculos = lerVeiculos();
    this.categorias = lerCategorias();

    const categoriaDaUrl = this.route.snapshot.queryParamMap.get('categoria');
    if (categoriaDaUrl) {
      this.filtroCategoriaId = categoriaDaUrl;
    }
  }

  categoriaNome(categoriaId: string): string {
    return this.categorias.find((c) => c.id === categoriaId)?.nome ?? 'Sem categoria';
  }

  valorDiaria(categoriaId: string): number | null {
    return this.categorias.find((c) => c.id === categoriaId)?.valorDiaria ?? null;
  }

  iconeCombustivel(combustivel: string): string {
    switch (combustivel) {
      case 'flex':
        return 'ti-gas-station';
      case 'gasolina':
        return 'ti-droplet';
      case 'diesel':
        return 'ti-engine';
      case 'eletrico':
        return 'ti-bolt';
      default:
        return 'ti-gas-station';
    }
  }

  combustivelDisponiveis(): string[] {
    const disponiveis = this.veiculos.filter((v) => v.status === 'disponivel');
    return [...new Set(disponiveis.map((v) => v.combustivel).filter(Boolean))];
  }

  veiculosFiltrados(): Veiculo[] {
    let lista = this.veiculos.filter((v) => v.status === 'disponivel');

    if (this.filtroCategoriaId) {
      lista = lista.filter((v) => v.categoriaId === this.filtroCategoriaId);
    }
    if (this.filtroCombustivel) {
      lista = lista.filter((v) => v.combustivel === this.filtroCombustivel);
    }
    if (this.busca.trim()) {
      const termo = this.busca.trim().toLowerCase();
      lista = lista.filter((v) => v.modelo.toLowerCase().includes(termo));
    }
    if (this.precoMax !== null && this.precoMax > 0) {
      lista = lista.filter((v) => {
        const valor = this.valorDiaria(v.categoriaId);
        return valor !== null && valor <= this.precoMax!;
      });
    }

    const ordenada = [...lista];
    if (this.ordenacao === 'menor-preco') {
      ordenada.sort((a, b) => (this.valorDiaria(a.categoriaId) ?? 0) - (this.valorDiaria(b.categoriaId) ?? 0));
    } else if (this.ordenacao === 'maior-preco') {
      ordenada.sort((a, b) => (this.valorDiaria(b.categoriaId) ?? 0) - (this.valorDiaria(a.categoriaId) ?? 0));
    } else {
      // "mais recente" = id sequencial mais alto (V0009 é mais novo que V0001)
      ordenada.sort((a, b) => b.id.localeCompare(a.id));
    }

    return ordenada;
  }

  limparFiltros(): void {
    this.busca = '';
    this.filtroCategoriaId = '';
    this.filtroCombustivel = '';
    this.precoMax = null;
    this.ordenacao = 'recentes';
  }

  abrirDetalhes(veiculo: Veiculo): void {
    this.veiculoSelecionado = veiculo;
  }

  fecharDetalhes(): void {
    this.veiculoSelecionado = null;
  }

  reservar(veiculo: Veiculo): void {
    // Se o cliente entrou direto em /veiculos sem passar por /planos, assume o
    // plano "Flex" (diária avulsa, sem desconto) como padrão.
    atualizarRascunho({
      veiculoId: veiculo.id,
      veiculoModelo: veiculo.modelo,
      categoriaId: veiculo.categoriaId,
    });
    this.router.navigateByUrl('/reserva/datas');
  }
}