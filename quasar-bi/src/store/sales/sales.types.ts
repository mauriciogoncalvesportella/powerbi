export interface BaseChart {
  values: number[],
  goalValues: number[],
  meta: any,
}

export interface DailyBarsDTO extends BaseChart {
  goal: number,
  dates: number[] | string[]
}

export interface RevenueDailyBarsDTO extends DailyBarsDTO {
  notBilledValues: number[]
}

export interface ResumeBarsDTO extends BaseChart {
  labels: string[],
  cds: number[],
  types: number[],
}

export interface Team {
  cd: number;
  idEquipe: string;
  cdEquipePai?: number;
  cdResponsavel: number;
  nmEquipe: string;
}

export interface Seller {
  cd: number;
  cdEquipe: number;
  idVendedor: string;
  nmVendedor: string;
  idEmail: string;
  fgAtivo: boolean;
  fgFuncao: number;
  jsMetaMensal: { [id: string]: number };
  vlMetaMensal: number;
}

export interface Order {
  cd: number
  idMesAno: string
  idPedido: string
  idTablet: string
  fgSituacao: number // 1- em aberto, 2- aprovado, 3- cancelado, 4- faturado, 5- gerado nota fiscal
  fgLiberado: number
  cdTipoPedido: number
  cdEmpresa: number
  cdVendedor: number
  cdCliente: number
  cdCondicaoPagamento: number
  dtEmissao: string
  dtEntrega: string
  idNotaFiscal: string
  vlProdutos: number
  vlDesconto: number
  vlRapel: number
  vlIcmsst: number
  vlIpi: number
  vlFrete: number
  fgTipoFrete: number
  pcComissao: number
  vlComissao: number
  vlCusto: number
  pcMarkup: number
  pcLucro: number
  vlLucro: number
  client: {
    cd: number
    idCliente: string
    idCnpjCpf: string
    idFantasia: string
    nmRazao: string
    cdVendedor: number
    nmBairro: string
    nmCidade: string
    idEstado: string
    nmContato: string
    idFone: string
    idFone2: string
    idCelular: string
    vlLimiteCredito: number
    vlDesconto: number
    vlRapel: number
    dtCriacao: string
    dtAtualizacao: string
  }
}

export interface OrderProduct {
  cd: number
  idMesAno: string
  cdPedido: number
  cdProduto: number
  cdTabelaPreco: number
  cdSubtabela: number
  cdFabrica: number
  qtProduto: number
  vlUnitario: number
  vlTotal: number
  vlDesconto: number
  vlIpi: number
  vlIcmsst: number
  vlCusto: number
  pcMarkup: number
  pcLucro: number
  vlLucro: number
  fgSituacao: number
  product: {
    cd: number
    idProduto: string
    cdCategoria: number
    cdFabrica: number
    nmProduto: string
    idUnidadeVenda: string
    qtVenda: number
    idUnidadeCompra: string
    qtUnidadeCompra: number
    vlCusto: number
    vlVenda: number
    idABC: string
    pcCredIcms: number
  }
}

export type TeamTree = Array<Array<Team>>
