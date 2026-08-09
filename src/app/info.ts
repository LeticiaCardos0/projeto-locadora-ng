import { Injectable } from '@angular/core';

const CATEGORIAS_KEY = 'categorias';
const CLIENTES_KEY = 'clientes';
const VEICULOS_KEY = 'veiculos';

@Injectable({ providedIn: 'root' })
export class InfoService {
  carregarInformacoes(): void {
    this.seedCategorias();
    this.seedClientes();
    this.seedVeiculos();
    this.seedManutencoes();
  }

  private seedCategorias(): void {
    if (this.temDados(CATEGORIAS_KEY)) return;

    const categorias = [
      { id: 'cat-1', nome: 'Econômico' },
      { id: 'cat-2', nome: 'Sedan' },
      { id: 'cat-3', nome: 'SUV' },
      { id: 'cat-4', nome: 'Utilitário' },
      { id: 'cat-5', nome: 'Esportivo' },
    ];
    localStorage.setItem(CATEGORIAS_KEY, JSON.stringify(categorias));
  }

  private seedClientes(): void {
    if (this.temDados(CLIENTES_KEY)) return;

    const clientes = [
      { id: 'cli-1', nome: 'Ana Beatriz Souza', email: 'ana.souza@email.com', telefone: '(47) 99123-4567', cpf: '123.456.789-01', status: 'ativo' },
      { id: 'cli-2', nome: 'Carlos Eduardo Lima', email: 'carlos.lima@email.com', telefone: '(47) 99876-5432', cpf: '234.567.890-12', status: 'ativo' },
      { id: 'cli-3', nome: 'Fernanda Oliveira', email: 'fernanda.oliveira@email.com', telefone: '(47) 98765-4321', cpf: '345.678.901-23', status: 'ativo' },
      { id: 'cli-4', nome: 'Ricardo Almeida', email: 'ricardo.almeida@email.com', telefone: '(47) 99654-3210', cpf: '456.789.012-34', status: 'bloqueado' },
    ];
    localStorage.setItem(CLIENTES_KEY, JSON.stringify(clientes));
  }

  // Considera "tem dados" só se a chave existir E o array não estiver vazio.
  // Isso evita que um array vazio salvo em algum teste anterior bloqueie o seed pra sempre.
  private temDados(chave: string): boolean {
    const raw = localStorage.getItem(chave);
    if (!raw) return false;
    try {
      const lista = JSON.parse(raw);
      return Array.isArray(lista) && lista.length > 0;
    } catch {
      return false;
    }
  }

  private seedVeiculos(): void {
    if (this.temDados(VEICULOS_KEY)) return;

    const veiculos = [
      { id: 'vei-1', modelo: 'Chevrolet Onix', placa: 'ABC1D23', ano: 2023, categoriaId: 'cat-1', combustivel: 'flex', status: 'disponivel', imagemUrl: 'https://production.autoforce.com/uploads/version/profile_image/7536/model_main_webp_comprar-1-0-mt-pacote-r7a-rgd_9601d0912e.png.webp' },
      { id: 'vei-2', modelo: 'Volkswagen Polo', placa: 'DEF4G56', ano: 2022, categoriaId: 'cat-1', combustivel: 'flex', status: 'disponivel', imagemUrl: 'https://gandcars.gr/wp-content/uploads/2024/02/polo.webp' },
      { id: 'vei-3', modelo: 'Toyota Corolla', placa: 'GHI7J89', ano: 2023, categoriaId: 'cat-2', combustivel: 'flex', status: 'disponivel', imagemUrl: 'https://production.autoforce.com/uploads/version/profile_image/7010/model_main_webp_comprar-xei_072477d683.png.webp' },
      { id: 'vei-4', modelo: 'Honda Civic', placa: 'JKL0M12', ano: 2022, categoriaId: 'cat-2', combustivel: 'gasolina', status: 'alugado', imagemUrl: 'https://di-uploads-pod16.dealerinspire.com/pattypeckhonda/uploads/2021/10/2022-Civic-Hatchback-Sport-Touring-Trim.png' },
      { id: 'vei-5', modelo: 'Jeep Compass', placa: 'MNO3P45', ano: 2023, categoriaId: 'cat-3', combustivel: 'flex', status: 'disponivel', imagemUrl: 'https://production.autoforce.com/uploads/version/profile_image/8183/model_main_webp_comprar-sport-t270-turbo-flex-at6_ba75718f1a.png.webp' },
      { id: 'vei-6', modelo: 'Hyundai Creta', placa: 'PQR6S78', ano: 2024, categoriaId: 'cat-3', combustivel: 'flex', status: 'disponivel', imagemUrl: 'https://production.autoforce.com/uploads/version/profile_image/9174/comprar-action-1-6-at_8c0bda03d1.png' },
      { id: 'vei-7', modelo: 'Fiat Toro', placa: 'STU9V01', ano: 2022, categoriaId: 'cat-4', combustivel: 'flex', status: 'disponivel', imagemUrl: 'https://production.autoforce.com/uploads/version/profile_image/6190/comprar-ranch-turbo-diesel-at9_cdc67fb425.png' },
      { id: 'vei-8', modelo: 'Ford Ranger', placa: 'VWX2Y34', ano: 2023, categoriaId: 'cat-4', combustivel: 'gasolina', status: 'alugado', imagemUrl: 'https://production.autoforce.com/uploads/version/profile_image/7200/comprar-2-2-diesel-4x2-at_cc692e5486.png' },
      { id: 'vei-9', modelo: 'Ford Mustang', placa: 'YZA5B67', ano: 2024, categoriaId: 'cat-5', combustivel: 'gasolina', status: 'disponivel', imagemUrl: 'https://www.lorenzoford.com/assets/stock/ColorMatched_01/Transparent/640/cc_2024FOC05_01_640/cc_2024FOC051996964_01_640_YZ.png' },
    ];
    localStorage.setItem(VEICULOS_KEY, JSON.stringify(veiculos));
  }

  private seedManutencoes(): void {
    const MANUTENCOES_KEY = 'manutencoes';
    if (this.temDados(MANUTENCOES_KEY)) return;

    const manutencoes = [
      { id: 'man-1', veiculoId: 'vei-2', veiculoModelo: 'Volkswagen Polo', tipo: 'preventiva', data: '2026-07-20', custo: 350, status: 'em_andamento' },
      { id: 'man-2', veiculoId: 'vei-6', veiculoModelo: 'Hyundai Creta', tipo: 'corretiva', data: '2026-06-10', custo: 890, status: 'concluida' },
      { id: 'man-3', veiculoId: 'vei-9', veiculoModelo: 'Ford Mustang', tipo: 'preventiva', data: '2026-08-05', custo: 420, status: 'agendada' },
    ];
    localStorage.setItem(MANUTENCOES_KEY, JSON.stringify(manutencoes));

    // Sincroniza: a manutenção "man-1" está em andamento, então o veículo
    // vei-2 (Polo) já nasce marcado como "manutencao" em vez de "disponivel".
    const raw = localStorage.getItem(VEICULOS_KEY);
    if (raw) {
      const veiculos2 = JSON.parse(raw).map((v: any) =>
        v.id === 'vei-2' ? { ...v, status: 'manutencao' } : v
      );
      localStorage.setItem(VEICULOS_KEY, JSON.stringify(veiculos2));
    }
  }
}