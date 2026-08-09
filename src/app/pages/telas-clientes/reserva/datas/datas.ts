import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Veiculo, lerVeiculos } from '../../../../shared/veiculos.model';
import { Categoria, lerCategorias } from '../../../../shared/categoria.model';
import { LOCAIS, ReservaRascunho, atualizarRascunho, lerRascunho } from '../../../../shared/reserva-rascunho.model';

@Component({
  selector: 'app-reserva-datas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './datas.html',
})
export class ReservaDatasComponent {
  rascunho: ReservaRascunho | null = null;
  veiculo: Veiculo | null = null;
  categoria: Categoria | null = null;

  locais = LOCAIS;
  hoje = new Date().toISOString().slice(0, 10);

  dataInicio = '';
  dataFim = '';
  localRetirada = '';
  localDevolucao = '';

  erro = signal('');

  constructor(private router: Router) {
    this.rascunho = lerRascunho();
    if (this.rascunho?.veiculoId) {
      this.veiculo = lerVeiculos().find((v) => v.id === this.rascunho!.veiculoId) ?? null;
      this.categoria = this.veiculo ? lerCategorias().find((c) => c.id === this.veiculo!.categoriaId) ?? null : null;
    }

    this.dataInicio = this.rascunho?.dataInicio ?? '';
    this.dataFim = this.rascunho?.dataFim ?? '';
    this.localRetirada = this.rascunho?.localRetirada ?? '';
    this.localDevolucao = this.rascunho?.localDevolucao ?? '';
  }

  private validar(): string | null {
    if (!this.dataInicio || !this.dataFim) return 'Selecione a data de retirada e de devolução.';
    if (this.dataInicio < this.hoje) return 'A data de retirada não pode ser no passado.';
    if (this.dataFim <= this.dataInicio) return 'A data de devolução deve ser depois da data de retirada.';
    if (!this.localRetirada) return 'Selecione o local de retirada.';
    if (!this.localDevolucao) return 'Selecione o local de devolução.';
    return null;
  }

  continuar(): void {
    this.erro.set('');
    const mensagemErro = this.validar();
    if (mensagemErro) {
      this.erro.set(mensagemErro);
      return;
    }

    atualizarRascunho({
      dataInicio: this.dataInicio,
      dataFim: this.dataFim,
      localRetirada: this.localRetirada,
      localDevolucao: this.localDevolucao,
    });
    this.router.navigateByUrl('/reserva/dados');
  }
}
