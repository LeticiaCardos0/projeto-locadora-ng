import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { formatarDataBr } from '../../../shared/validadores';
import { SessaoCliente, lerSessaoCliente } from '../../../shared/cliente.model';
import { Veiculo, lerVeiculos, salvarVeiculos, mascararPlaca } from '../../../shared/veiculos.model';
import { Categoria, lerCategorias } from '../../../shared/categoria.model';
import {
  Reserva,
  StatusReserva,
  lerReservas,
  salvarReservas,
  statusLabel,
  statusBadgeClasses,
} from '../../../shared/reserva.model';

type AbaReserva = 'todas' | 'em_andamento' | 'confirmadas' | 'finalizadas' | 'canceladas';

const ABAS: { id: AbaReserva; label: string; statuses: StatusReserva[] | null }[] = [
  { id: 'todas', label: 'Todas', statuses: null },
  { id: 'em_andamento', label: 'Em andamento', statuses: ['em_andamento'] },
  { id: 'confirmadas', label: 'Confirmadas', statuses: ['pendente', 'confirmada'] },
  { id: 'finalizadas', label: 'Finalizadas', statuses: ['finalizada'] },
  { id: 'canceladas', label: 'Canceladas', statuses: ['cancelada'] },
];

/** Sequência da linha do tempo — 'cancelada' não faz parte, é tratada à parte. */
const ETAPAS: { status: StatusReserva; label: string; icone: string }[] = [
  { status: 'pendente', label: 'Reservado', icone: 'ti-calendar-plus' },
  { status: 'confirmada', label: 'Confirmado', icone: 'ti-circle-check' },
  { status: 'em_andamento', label: 'Em andamento', icone: 'ti-car' },
  { status: 'finalizada', label: 'Finalizado', icone: 'ti-flag' },
];

const SUPORTE_EMAIL = 'suporte@modularlocadora.com.br';

@Component({
  selector: 'app-minhas-reservas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './minhas-reservas.html',
})
export class MinhasReservasComponent {
  sessao: SessaoCliente | null = null;
  reservas = signal<Reserva[]>([]);
  veiculos: Veiculo[] = [];
  categorias: Categoria[] = [];

  abas = ABAS;
  etapas = ETAPAS;
  abaAtiva = signal<AbaReserva>('todas');

  reservaSelecionada = signal<Reserva | null>(null);

  formatarDataBr = formatarDataBr;
  statusLabel = statusLabel;
  statusBadgeClasses = statusBadgeClasses;
  mascararPlaca = mascararPlaca;
  supporteEmail = SUPORTE_EMAIL;

  constructor() {
    this.sessao = lerSessaoCliente();
    this.veiculos = lerVeiculos();
    this.categorias = lerCategorias();

    const minhas = this.sessao ? lerReservas().filter((r) => r.clienteId === this.sessao!.id) : [];
    this.reservas.set([...minhas].sort((a, b) => b.dataInicio.localeCompare(a.dataInicio)));
  }

  reservasFiltradas = computed(() => {
    const aba = this.abas.find((a) => a.id === this.abaAtiva());
    if (!aba?.statuses) return this.reservas();
    return this.reservas().filter((r) => aba.statuses!.includes(r.status));
  });

  contador(aba: AbaReserva): number {
    const alvo = this.abas.find((a) => a.id === aba);
    if (!alvo?.statuses) return this.reservas().length;
    return this.reservas().filter((r) => alvo.statuses!.includes(r.status)).length;
  }

  veiculoDaReserva(reserva: Reserva): Veiculo | null {
    return this.veiculos.find((v) => v.id === reserva.veiculoId) ?? null;
  }

  categoriaNome(categoriaId: string | undefined): string {
    if (!categoriaId) return '-';
    return this.categorias.find((c) => c.id === categoriaId)?.nome ?? '-';
  }

  /** Índice da etapa atual na linha do tempo, ou -1 se a reserva foi cancelada. */
  etapaAtual(reserva: Reserva): number {
    return ETAPAS.findIndex((e) => e.status === reserva.status);
  }

  podeCancelar(reserva: Reserva): boolean {
    return reserva.status === 'pendente' || reserva.status === 'confirmada';
  }

  abrirDetalhes(reserva: Reserva): void {
    this.reservaSelecionada.set(reserva);
  }

  fecharDetalhes(): void {
    this.reservaSelecionada.set(null);
  }

  cancelarReserva(reserva: Reserva): void {
    if (!confirm(`Tem certeza que deseja cancelar a reserva do ${reserva.veiculoModelo}?`)) return;

    const todasAtualizadas = lerReservas().map((r) => (r.id === reserva.id ? { ...r, status: 'cancelada' as const } : r));
    salvarReservas(todasAtualizadas);
    this.reservas.set(this.reservas().map((r) => (r.id === reserva.id ? { ...r, status: 'cancelada' as const } : r)));

    const veiculos = this.veiculos.map((v) => (v.id === reserva.veiculoId ? { ...v, status: 'disponivel' as const } : v));
    this.veiculos = veiculos;
    salvarVeiculos(veiculos);

    this.fecharDetalhes();
  }
}
