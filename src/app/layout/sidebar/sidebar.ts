import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
})
export class SidebarComponent {
  navItems: NavItem[] = [
    { label: 'Painel', icon: 'ti-chart-bar', route: '/dashboard' },
    { label: 'Locações', icon: 'ti-steering-wheel', route: '/locacoes' },
    { label: 'Veículos', icon: 'ti-car', route: '/veiculos' },
    { label: 'Clientes', icon: 'ti-users', route: '/clientes' },
    { label: 'Categorias', icon: 'ti-tag', route: '/categorias' },
    { label: 'Seguros', icon: 'ti-shield-check', route: '/seguros' },
    { label: 'Pagamentos', icon: 'ti-credit-card', route: '/pagamentos' },
  ];
}