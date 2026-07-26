import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { VeiculosComponent } from './pages/telas-admin/veiculos/veiculos';
import { ClientesComponent } from './pages/telas-admin/clientes/clientes';
import { ReservasComponent } from './pages/telas-admin/reservas/reservas';
import { CategoriasComponent } from './pages/telas-admin/categorias/categorias';
import { FinanceiroComponent } from './pages/telas-admin/financeiro/financeiro';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'admin/veiculos', component: VeiculosComponent },
    { path: 'admin/clientes', component: ClientesComponent },
    { path: 'admin/reservas', component: ReservasComponent },
    { path: 'admin/categorias', component: CategoriasComponent },
    { path: 'admin/financeiro', component: FinanceiroComponent },

    
    
];