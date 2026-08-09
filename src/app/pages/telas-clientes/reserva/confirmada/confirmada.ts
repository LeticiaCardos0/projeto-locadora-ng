import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Reserva, lerReservas } from '../../../../shared/reserva.model';

@Component({
  selector: 'app-reserva-confirmada',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './confirmada.html',
})
export class ReservaConfirmadaComponent {
  reserva: Reserva | null = null;

  constructor(route: ActivatedRoute) {
    const id = route.snapshot.queryParamMap.get('id');
    this.reserva = id ? lerReservas().find((r) => r.id === id) ?? null : null;
  }
}
