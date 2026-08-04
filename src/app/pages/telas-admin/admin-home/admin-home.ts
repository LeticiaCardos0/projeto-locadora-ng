import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { formatarDataBr } from '../../../shared/validadores';

interface AtalhoRapido {
  titulo: string;
  descricao: string;
  icone: string;
  rota: string;
  cor: 'verde' | 'azul' | 'roxo' | 'laranja';
}

interface EventoAgenda {
  tipo: 'retirada' | 'devolucao';
  data: string;
  dataFormatada: string;
  clienteNome: string;
  veiculoModelo: string;
  urgente: boolean; // hoje ou já atrasado
}

interface Reserva {
  id: string;
  clienteNome: string;
  veiculoModelo: string;
  dataInicio: string;
  dataFim: string;
  status: 'pendente' | 'confirmada' | 'em_andamento' | 'finalizada' | 'cancelada';
}

interface Veiculo {
  id: string;
  status: 'disponivel' | 'alugado' | 'manutencao';
}

const VEICULOS_KEY = 'veiculos';
const RESERVAS_KEY = 'reservas';
const CLIENTES_KEY = 'clientes';
const MANUTENCOES_KEY = 'manutencoes';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-home.html',
})
export class AdminHomeComponent {
  // Troque por um nome vindo de autenticação/serviço de usuário quando existir.
  nomeUsuario = signal('Leticia');

  saudacao = computed(() => {
    const hora = new Date().getHours();
    if (hora < 12) return 'Bom dia';
    if (hora < 18) return 'Boa tarde';
    return 'Boa noite';
  });

  private contar(chave: string): number {
    const raw = localStorage.getItem(chave);
    if (!raw) return 0;
    try {
      const lista = JSON.parse(raw);
      return Array.isArray(lista) ? lista.length : 0;
    } catch {
      return 0;
    }
  }

  private contarReservasAtivas(): number {
    const raw = localStorage.getItem(RESERVAS_KEY);
    if (!raw) return 0;
    try {
      const lista = JSON.parse(raw);
      if (!Array.isArray(lista)) return 0;
      return lista.filter((r: any) => r.status === 'confirmada' || r.status === 'em_andamento' || r.status === 'pendente').length;
    } catch {
      return 0;
    }
  }

  private contarManutencoesAbertas(): number {
    const raw = localStorage.getItem(MANUTENCOES_KEY);
    if (!raw) return 0;
    try {
      const lista = JSON.parse(raw);
      if (!Array.isArray(lista)) return 0;
      return lista.filter((m: any) => m.status === 'agendada' || m.status === 'em_andamento').length;
    } catch {
      return 0;
    }
  }

  atalhos = computed<AtalhoRapido[]>(() => [
    {
      titulo: 'Reservas',
      descricao: `${this.contarReservasAtivas()} reserva(s) em andamento`,
      icone: 'ti-calendar-event',
      rota: '/admin/reservas',
      cor: 'verde',
    },
    {
      titulo: 'Veículos',
      descricao: `${this.contar(VEICULOS_KEY)} veículo(s) na frota`,
      icone: 'ti-car',
      rota: '/admin/veiculos',
      cor: 'azul',
    },
    {
      titulo: 'Clientes',
      descricao: `${this.contar(CLIENTES_KEY)} cliente(s) cadastrado(s)`,
      icone: 'ti-users',
      rota: '/admin/clientes',
      cor: 'roxo',
    },
    {
      titulo: 'Manutenções',
      descricao: `${this.contarManutencoesAbertas()} manutenção(ões) em aberto`,
      icone: 'ti-tool',
      rota: '/admin/manutencoes',
      cor: 'laranja',
    },
  ]);

  // ===== Próximas devoluções e retiradas =====

  private lerReservas(): Reserva[] {
    const raw = localStorage.getItem(RESERVAS_KEY);
    if (!raw) return [];
    try {
      const lista = JSON.parse(raw);
      return Array.isArray(lista) ? lista : [];
    } catch {
      return [];
    }
  }

  private hojeISO(): string {
    return new Date().toISOString().slice(0, 10);
  }

  proximosEventos = computed<EventoAgenda[]>(() => {
    const hoje = this.hojeISO();
    const reservas = this.lerReservas();
    const eventos: EventoAgenda[] = [];

    for (const r of reservas) {
      // retirada: reserva pendente/confirmada com dataInicio próxima
      if ((r.status === 'pendente' || r.status === 'confirmada') && r.dataInicio) {
        eventos.push({
          tipo: 'retirada',
          data: r.dataInicio,
          dataFormatada: formatarDataBr(r.dataInicio),
          clienteNome: r.clienteNome,
          veiculoModelo: r.veiculoModelo,
          urgente: r.dataInicio <= hoje,
        });
      }
      // devolução: reserva confirmada/em andamento com dataFim próxima
      if ((r.status === 'confirmada' || r.status === 'em_andamento') && r.dataFim) {
        eventos.push({
          tipo: 'devolucao',
          data: r.dataFim,
          dataFormatada: formatarDataBr(r.dataFim),
          clienteNome: r.clienteNome,
          veiculoModelo: r.veiculoModelo,
          urgente: r.dataFim <= hoje,
        });
      }
    }

    return eventos.sort((a, b) => a.data.localeCompare(b.data)).slice(0, 6);
  });

  // ===== Status da frota =====

  private lerVeiculos(): Veiculo[] {
    const raw = localStorage.getItem(VEICULOS_KEY);
    if (!raw) return [];
    try {
      const lista = JSON.parse(raw);
      return Array.isArray(lista) ? lista : [];
    } catch {
      return [];
    }
  }

  statusFrota = computed(() => {
    const veiculos = this.lerVeiculos();
    const total = veiculos.length || 1; // evita divisão por zero

    const disponiveis = veiculos.filter((v) => v.status === 'disponivel').length;
    const alugados = veiculos.filter((v) => v.status === 'alugado').length;
    const manutencao = veiculos.filter((v) => v.status === 'manutencao').length;

    const fatias = [
      { label: 'Disponíveis', valor: disponiveis, percentual: (disponiveis / total) * 100, cor: 'bg-emerald-500', corHex: '#10b981' },
      { label: 'Alugados', valor: alugados, percentual: (alugados / total) * 100, cor: 'bg-sky-500', corHex: '#0ea5e9' },
      { label: 'Em manutenção', valor: manutencao, percentual: (manutencao / total) * 100, cor: 'bg-amber-500', corHex: '#f59e0b' },
    ];

    // offset acumulado de cada fatia no donut (em % do perímetro, círculo já desenhado em sentido horário a partir do topo)
    let acumulado = 0;
    return fatias.map((fatia) => {
      const comOffset = { ...fatia, offset: acumulado };
      acumulado += fatia.percentual;
      return comOffset;
    });
  });
}