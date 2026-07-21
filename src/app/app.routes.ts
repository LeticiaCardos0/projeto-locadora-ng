import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { VeiculosComponent } from './pages/telas-admin/veiculos/veiculos';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'admin/veiculos', component: VeiculosComponent },
    
    // { path: 'cadastro', component: CadastroComponent },
    
];
