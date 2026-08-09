import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Categoria, lerCategorias } from '../../../shared/categoria.model';
import { atualizarRascunho } from '../../../shared/reserva-rascunho.model';

interface PacotePlano {
  id: string;
  nome: string;
  periodo: string;
  descricaoPeriodo: string;
  descontoPercentual: number;
  kmIncluidaPorMes: number | null; // null = km livre
  beneficios: string[];
  destaque?: boolean;
  icone: string;
}

const PACOTES: PacotePlano[] = [
  {
    id: 'flex',
    nome: 'Flex',
    periodo: 'Diária avulsa',
    descricaoPeriodo: 'Sem fidelidade, pague só os dias que usar',
    descontoPercentual: 0,
    kmIncluidaPorMes: 200,
    beneficios: ['Seguro básico incluso', 'Assistência 24h', 'Cancelamento gratuito até 24h antes'],
    icone: 'ti-calendar-event',
  },
  {
    id: 'mensal',
    nome: 'Mensal',
    periodo: '1 mês',
    descricaoPeriodo: 'Ideal pra quem precisa de um carro fixo no dia a dia',
    descontoPercentual: 15,
    kmIncluidaPorMes: 3000,
    beneficios: ['Seguro completo incluso', 'Assistência 24h', 'Manutenção preventiva inclusa', 'Troca de veículo 1x no período'],
    destaque: true,
    icone: 'ti-calendar-repeat',
  },
  {
    id: 'trimestral',
    nome: 'Trimestral',
    periodo: '3 meses',
    descricaoPeriodo: 'Maior economia pra quem vai usar por mais tempo',
    descontoPercentual: 25,
    kmIncluidaPorMes: null,
    beneficios: [
      'Seguro completo incluso',
      'Assistência 24h',
      'Manutenção preventiva inclusa',
      'Km livre',
      'Troca de veículo ilimitada',
    ],
    icone: 'ti-calendar-stats',
  },
];

@Component({
  selector: 'app-planos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './planos.html',
})
export class PlanosComponent {
  categorias: Categoria[] = [];
  pacotes = PACOTES;

  constructor(private router: Router) {
    this.categorias = lerCategorias().filter((c) => c.valorDiaria !== null);
  }

  escolherPlano(pacote: PacotePlano): void {
    atualizarRascunho({
      planoId: pacote.id,
      planoNome: pacote.nome,
      descontoPercentual: pacote.descontoPercentual,
    });
    this.router.navigateByUrl('/veiculos');
  }

  private menorPrecoBase(): number | null {
    const validos = this.categorias
      .map((c) => c.valorDiaria)
      .filter((v): v is number => v !== null && !isNaN(v) && v > 0);
    if (validos.length === 0) return null;
    return Math.min(...validos);
  }

  precoPacote(pacote: PacotePlano): number | null {
    const base = this.menorPrecoBase();
    if (base === null) return null;
    return base * (1 - pacote.descontoPercentual / 100);
  }
}