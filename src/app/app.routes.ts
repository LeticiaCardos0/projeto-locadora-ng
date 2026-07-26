import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { VeiculosComponent } from './pages/telas-admin/veiculos/veiculos';
import { ClientesComponent } from './pages/telas-admin/clientes/clientes';
import { ReservasComponent } from './pages/telas-admin/reservas/reservas';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'admin/veiculos', component: VeiculosComponent },
    { path: 'admin/clientes', component: ClientesComponent },
    { path: 'admin/reservas', component: ReservasComponent },

    
    // { path: 'cadastro', component: CadastroComponent },
    
];
