import { IsInt, IsISO8601, IsNumber, IsOptional, IsString } from "class-validator";
import { Column, Entity, Index, PrimaryColumn } from "typeorm";

@Entity('vd_pedidos')
export class VdPedidoEntity {
  @PrimaryColumn('int')
  @IsNumber()
  cd: number

  @Column('char', { length: 7 })
  @Index('IDX_VDPEDIDOS_IDMESANO')
  @IsString()
  idMesAno: string

  @Column({ length: 50 })
  @IsString()
  idPedido: string

  @Column({ length: 50 })
  @IsString()
  idTablet: string

  @Column('smallint')
  @Index('IDX_VDPEDIDOS_FGSITUACAO')
  @IsInt()
  fgSituacao: number // 1- em aberto, 2- aprovado, 3- cancelado, 4- faturado, 5- gerado nota fiscal

  @Column('smallint')
  @IsInt()
  fgLiberado: number

  // @ManyToOne(() => CadTipoPedidoEntity, cadTipoPedidoEntity => cadTipoPedidoEntity.cd)
  // @JoinTable({ name: 'cdTipoPedido' })
  // @Index()
  // cadTipoPedido: CadTipoPedidoEntity
  @Column('int')
  @Index('IDX_VDPEDIDOS_CDTIPOPEDIDO')
  @IsInt()
  cdTipoPedido: number

  // @ManyToOne(() => CadEmpresaEntity, cadEmpresaEntity => cadEmpresaEntity.cd)
  // @JoinTable({ name: 'cdEmpresa' })
  // @Index()
  // cadEmpresa: CadEmpresaEntity
  @Column('int')
  @Index('IDX_VDPEDIDOS_CDEMPRESA')
  @IsInt()
  cdEmpresa: number

  // @ManyToOne(() => CadVendedorEntity, cadVendedorEntity => cadVendedorEntity.cd)
  // @JoinTable({ name: 'cdVendedor' })
  // @Index()
  // cadVendedor: CadVendedorEntity
  @Column('int')
  @Index('IDX_VDPEDIDOS_CDVENDEDOR')
  @IsInt()
  cdVendedor: number

  @Column('int', { nullable: true })
  @Index('IDX_VDPEDIDOS_CDVENDEDOR_2')
  @IsOptional()
  cdVendedor2: number

  // @ManyToOne(() => CadClienteEntity, cadClienteEntity => cadClienteEntity.cd)
  // @JoinTable({ name: 'cdCliente' })
  // @Index()
  // cadCliente: CadClienteEntity
  @Column('int')
  @Index('IDX_VDPEDIDOS_CDCLIENTE')
  @IsInt()
  cdCliente: number

  // @ManyToOne(() => CadCondicaoPagamentoEntity, CadCondicaoPagamento => CadCondicaoPagamento.cd)
  // @JoinTable({ name: 'cdCondicaoPagamento' })
  // @Index()
  // cadCondicaoPagamento: CadCondicaoPagamentoEntity
  @Column('int', { nullable: true })
  @Index('IDX_VDPEDIDOS_CDCONDICAOPAGAMENTO')
  @IsInt()
  @IsOptional()
  cdCondicaoPagamento: number

  @Column('timestamp without time zone')
  @IsISO8601()
  @Index('IDX_VDPEDIDOS_DTEMISSAO')
  dtEmissao: string

  @Column('timestamp without time zone')
  @IsISO8601()
  @Index('IDX_VDPEDIDOS_DTENTREGA')
  dtEntrega: string

  @Column({ length: 50 })
  @IsString()
  idNotaFiscal: string

  @Column('numeric', { precision: 10, scale: 2 })
  @IsNumber()
  vlProdutos: number
  
  @Column('numeric', { precision: 10, scale: 2 })
  @IsNumber()
  vlDesconto: number

  @Column('numeric', { precision: 10, scale: 2 })
  @IsNumber()
  vlRapel: number

  @Column('numeric', { precision: 10, scale: 2 })
  @IsNumber()
  vlIcmsst: number

  @Column('numeric', { precision: 10, scale: 2 })
  @IsNumber()
  vlIpi: number

  @Column('numeric', { precision: 10, scale: 2 })
  @IsNumber()
  vlFrete: number

  @Column('smallint')
  @IsNumber()
  fgTipoFrete: number

  @Column('numeric', { precision: 10, scale: 2 })
  @IsNumber()
  pcComissao: number

  @Column('numeric', { precision: 10, scale: 2 })
  @IsNumber()
  vlComissao: number

  @Column('numeric', { precision: 10, scale: 2 })
  @IsNumber()
  vlCusto: number

  @Column('numeric', { precision: 10, scale: 2 })
  @IsNumber()
  pcMarkup: number

  @Column('numeric', { precision: 10, scale: 2 })
  @IsNumber()
  pcLucro: number

  @Column('numeric', { precision: 10, scale: 2 })
  @IsNumber()
  vlLucro: number
}
