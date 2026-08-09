import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { dataValida, DATA_MINIMA, ANO_MINIMO, formatarDataBr } from '../../../shared/validadores';
import { Reserva, StatusReserva, lerReservas, salvarReservas, statusLabel } from '../../../shared/reserva.model';

export type { Reserva, StatusReserva };

interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
}

interface Veiculo {
  id: string;
  modelo: string;
  ano: number;
  categoriaId: string;
  status: 'disponivel' | 'alugado';
}

interface Categoria {
  id: string;
  nome: string;
}

const CLIENTES_KEY = 'clientes';
const VEICULOS_KEY = 'veiculos';
const CATEGORIAS_KEY = 'categorias';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservas.html',
})
export class ReservasComponent {
  // ===== dados carregados das outras telas (fonte única: localStorage) =====
  reservas = signal<Reserva[]>([]);
  clientes: Cliente[] = [];
  veiculos: Veiculo[] = [];
  categorias: Categoria[] = [];

  // ===== filtros da listagem =====
  filtroStatus = '';
  filtroDataInicio = '';
  filtroDataFim = '';

  // ===== estado do modal =====
  mostrarForm = false;
  editando = false;
  reservaAtual: Reserva = this.reservaVazia();
  categoriaFiltro = '';
  clienteSelecionadoInfo: Cliente | null = null;

  dataMinima = DATA_MINIMA;
  formatarDataBr = formatarDataBr;

  constructor() {
    this.carregarTudo();
  }

  private reservaVazia(): Reserva {
    return {
      id: '',
      clienteId: '',
      clienteNome: '',
      veiculoId: '',
      veiculoModelo: '',
      dataInicio: '',
      dataFim: '',
      status: 'pendente',
    };
  }

  private carregarTudo(): void {
    this.reservas.set(lerReservas());
    this.clientes = this.lerStorage<Cliente[]>(CLIENTES_KEY, []);
    this.veiculos = this.lerStorage<Veiculo[]>(VEICULOS_KEY, []);
    this.categorias = this.lerStorage<Categoria[]>(CATEGORIAS_KEY, []);
  }

  private lerStorage<T>(chave: string, fallback: T): T {
    const raw = localStorage.getItem(chave);
    return raw ? JSON.parse(raw) : fallback;
  }

  private salvarReservas(): void {
    salvarReservas(this.reservas());
  }

  // ===== filtros da tabela =====

  reservasFiltradas = computed(() => {
    return this.reservas().filter((r) => {
      if (this.filtroStatus && r.status !== this.filtroStatus) return false;
      if (this.filtroDataInicio && r.dataInicio < this.filtroDataInicio) return false;
      if (this.filtroDataFim && r.dataFim > this.filtroDataFim) return false;
      return true;
    });
  });

  limparFiltros(): void {
    this.filtroStatus = '';
    this.filtroDataInicio = '';
    this.filtroDataFim = '';
  }

  statusLabel = statusLabel;

  // ===== integração com Clientes: ao selecionar, puxa e-mail/telefone automaticamente =====

  onClienteSelecionado(clienteId: string): void {
    const cliente = this.clientes.find((c) => c.id === clienteId);
    this.clienteSelecionadoInfo = cliente ?? null;
    this.reservaAtual.clienteNome = cliente?.nome ?? '';
  }

  // ===== integração com Veículos/Categorias: lista só o que está disponível na categoria escolhida =====

  onCategoriaAlterada(): void {
    // ao trocar a categoria, invalida o veículo selecionado se ele não pertencer mais à lista filtrada
    const aindaValido = this.veiculosDisponiveis().some((v) => v.id === this.reservaAtual.veiculoId);
    if (!aindaValido) {
      this.reservaAtual.veiculoId = '';
    }
  }

  veiculosDisponiveis(): Veiculo[] {
    return this.veiculos.filter((v) => {
      const disponivel = v.status === 'disponivel';
      const naCategoria = !this.categoriaFiltro || v.categoriaId === this.categoriaFiltro;

      // ao editar uma reserva existente, o próprio veículo já vinculado a ela
      // continua aparecendo na lista mesmo estando "alugado" por causa dela mesma
      const eODoAtual = this.editando && v.id === this.reservaAtual.veiculoId;

      return (disponivel || eODoAtual) && naCategoria;
    });
  }

  // ===== CRUD =====

  novo(): void {
    this.editando = false;
    this.reservaAtual = this.reservaVazia();
    this.categoriaFiltro = '';
    this.clienteSelecionadoInfo = null;
    this.mostrarForm = true;
  }

  editar(id: string): void {
    const encontrada = this.reservas().find((r) => r.id === id);
    if (!encontrada) return;

    this.editando = true;
    this.reservaAtual = { ...encontrada };
    this.categoriaFiltro = this.veiculos.find((v) => v.id === encontrada.veiculoId)?.categoriaId ?? '';
    this.onClienteSelecionado(encontrada.clienteId);
    this.mostrarForm = true;
  }

  fecharForm(): void {
    this.mostrarForm = false;
    this.reservaAtual = this.reservaVazia();
    this.categoriaFiltro = '';
    this.clienteSelecionadoInfo = null;
  }

  salvar(): void {
    if (!this.reservaAtual.clienteId || !this.reservaAtual.veiculoId) {
      alert('Selecione um cliente e um veículo disponível.');
      return;
    }
    if (!dataValida(this.reservaAtual.dataInicio) || !dataValida(this.reservaAtual.dataFim)) {
      alert(`Informe datas de início e fim válidas (${ANO_MINIMO} ou posterior).`);
      return;
    }
    if (this.reservaAtual.dataFim < this.reservaAtual.dataInicio) {
      alert('A data de fim não pode ser anterior à data de início.');
      return;
    }

    const veiculo = this.veiculos.find((v) => v.id === this.reservaAtual.veiculoId);
    this.reservaAtual.veiculoModelo = veiculo?.modelo ?? '';

    const lista = [...this.reservas()];

    if (this.editando) {
      const index = lista.findIndex((r) => r.id === this.reservaAtual.id);
      if (index > -1) lista[index] = { ...this.reservaAtual };
    } else {
      this.reservaAtual.id = Date.now().toString();
      lista.push({ ...this.reservaAtual });
    }

    this.reservas.set(lista);
    this.salvarReservas();
    this.atualizarStatusVeiculo(this.reservaAtual);
    this.fecharForm();
  }

  excluir(id: string): void {
    this.reservas.set(this.reservas().filter((r) => r.id !== id));
    this.salvarReservas();
  }

  // ===== ações rápidas na tabela =====

  confirmar(id: string): void {
    this.alterarStatus(id, 'confirmada');
  }

  cancelar(id: string): void {
    this.alterarStatus(id, 'cancelada');
  }

  private alterarStatus(id: string, status: StatusReserva): void {
    const lista = this.reservas().map((r) => (r.id === id ? { ...r, status } : r));
    this.reservas.set(lista);
    this.salvarReservas();

    const reserva = lista.find((r) => r.id === id);
    if (reserva) this.atualizarStatusVeiculo(reserva);
  }

  // Reflete o status da reserva no cadastro do veículo (disponível/alugado),
  // mantendo as telas de Veículos e Reservas sincronizadas.
  private atualizarStatusVeiculo(reserva: Reserva): void {
    const emUso = reserva.status === 'confirmada' || reserva.status === 'em_andamento';
    const veiculos = this.veiculos.map((v) =>
      v.id === reserva.veiculoId ? { ...v, status: emUso ? ('alugado' as const) : ('disponivel' as const) } : v
    );
    this.veiculos = veiculos;
    localStorage.setItem(VEICULOS_KEY, JSON.stringify(veiculos));
  }
}