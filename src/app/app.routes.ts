import { Routes } from '@angular/router';
import { HomeClienteComponent } from './pages/telas-clientes/home/home';
import { AdminHomeComponent } from './pages/telas-admin/admin-home/admin-home';
import { VeiculosComponent } from './pages/telas-admin/veiculos/veiculos';
import { ClientesComponent } from './pages/telas-admin/clientes/clientes';
import { ReservasComponent } from './pages/telas-admin/reservas/reservas';
import { CategoriasComponent } from './pages/telas-admin/categorias/categorias';
import { FinanceiroComponent } from './pages/telas-admin/financeiro/financeiro';
import { ManutencoesComponent } from './pages/telas-admin/manutencoes/manutencoes';
import { DashboardComponent } from './pages/telas-admin/dashboard/dashboard';
import { DashboardFinanceiroComponent } from './pages/telas-admin/financeiro/dashboard-financeiro/dashboard-financeiro';
import { RelatoriosComponent } from './pages/telas-admin/relatorios/relatorios';
import { LoginComponent } from './pages/login/login';
import { CadastroComponent } from './pages/cadastro/cadastro';
import { VeiculosClienteComponent } from './pages/telas-clientes/veiculos/veiculos';
import { PlanosComponent } from './pages/telas-clientes/planos/planos';
import { ReservaDatasComponent } from './pages/telas-clientes/reserva/datas/datas';
import { ReservaDadosComponent } from './pages/telas-clientes/reserva/dados/dados';
import { ReservaRevisarComponent } from './pages/telas-clientes/reserva/revisar/revisar';
import { ReservaPagamentoComponent } from './pages/telas-clientes/reserva/pagamento/pagamento';
import { ReservaConfirmadaComponent } from './pages/telas-clientes/reserva/confirmada/confirmada';
import { MinhasReservasComponent } from './pages/telas-clientes/minhas-reservas/minhas-reservas';
import { MeuFinanceiroComponent } from './pages/telas-clientes/financeiro/financeiro';
import { veiculoSelecionadoGuard, datasDefinidasGuard, clienteLogadoGuard } from './shared/reserva.guard';
import { clienteAutenticadoGuard } from './shared/cliente.guard';

export const routes: Routes = [

    { path: '', component: HomeClienteComponent, pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'cadastro', component: CadastroComponent },
    { path: 'veiculos', component: VeiculosClienteComponent },
    { path: 'planos', component: PlanosComponent },
    { path: 'reserva/datas', component: ReservaDatasComponent, canActivate: [veiculoSelecionadoGuard] },
    { path: 'reserva/dados', component: ReservaDadosComponent, canActivate: [datasDefinidasGuard] },
    { path: 'reserva/revisar', component: ReservaRevisarComponent, canActivate: [clienteLogadoGuard] },
    { path: 'reserva/pagamento', component: ReservaPagamentoComponent, canActivate: [clienteLogadoGuard] },
    { path: 'reserva/confirmada', component: ReservaConfirmadaComponent },
    { path: 'minhas-reservas', component: MinhasReservasComponent, canActivate: [clienteAutenticadoGuard] },
    { path: 'meu-financeiro', component: MeuFinanceiroComponent, canActivate: [clienteAutenticadoGuard] },
    { path: 'admin', component: AdminHomeComponent },
    { path: 'admin/veiculos', component: VeiculosComponent },
    { path: 'admin/clientes', component: ClientesComponent },
    { path: 'admin/reservas', component: ReservasComponent },
    { path: 'admin/categorias', component: CategoriasComponent },
    { path: 'admin/financeiro', component: FinanceiroComponent },
    { path: 'admin/manutencoes', component: ManutencoesComponent },
    { path: 'admin/dashboard', component: DashboardComponent },
    { path: 'admin/financeiro/dashboard', component: DashboardFinanceiroComponent },
    { path: 'admin/relatorios', component: RelatoriosComponent },
];