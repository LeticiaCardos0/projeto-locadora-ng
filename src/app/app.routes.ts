import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { VeiculosComponent } from './pages/telas-admin/veiculos/veiculos';
import { ClientesComponent } from './pages/telas-admin/clientes/clientes';
import { ReservasComponent } from './pages/telas-admin/reservas/reservas';
import { CategoriasComponent } from './pages/telas-admin/categorias/categorias';
import { FinanceiroComponent } from './pages/telas-admin/financeiro/financeiro';
import { ManutencoesComponent } from './pages/telas-admin/manutencoes/manutencoes';
import { DashboardComponent } from './pages/telas-admin/dashboard/dashboard';
import { DashboardFinanceiroComponent } from './pages/telas-admin/financeiro/dashboard-financeiro/dashboard-financeiro';
import { AdminHomeComponent } from './pages/telas-admin/admin-home/admin-home';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'admin', component: AdminHomeComponent },
    { path: 'admin/veiculos', component: VeiculosComponent },
    { path: 'admin/clientes', component: ClientesComponent },
    { path: 'admin/reservas', component: ReservasComponent },
    { path: 'admin/categorias', component: CategoriasComponent },
    { path: 'admin/financeiro', component: FinanceiroComponent },
    { path: 'admin/manutencoes', component: ManutencoesComponent },
    { path: 'admin/dashboard', component: DashboardComponent },
    { path: 'admin/financeiro/dashboard', component: DashboardFinanceiroComponent },
];