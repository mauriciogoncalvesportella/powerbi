import {IsInt, IsNumber, IsOptional, IsString} from "class-validator";
import {Column, Entity, Index, PrimaryColumn } from "typeorm";

@Entity('vd_pedido_produto')
export class VdPedidoProdutoEntity {
  @PrimaryColumn('int')
  @IsInt()
  cd: number

  @Column('char', { length: 7 })
  @Index('IDX_VDPEDIDOPRODUTO_IDMESANO')
  @IsString()
  idMesAno: string

  //@ManyToOne(() => VdPedidoProdutoEntity, vdPedidoProduto => vdPedidoProduto.cd)
  //@JoinColumn({ name: 'cdPedidoProduto' })
  //cadPedidoProduto: VdPedidoProdutoEntity
  @PrimaryColumn('int')
  @Index('IDX_VDPEDIDOPRODUTO_CDPEDIDO')
  @IsInt()
  cdPedido: number

  //@ManyToOne(() => CadProdutoEntity, cadProdutoEntity => cadProdutoEntity.cd)
  //@JoinColumn({ name: 'cdProduto' })
  //cdProduto: number
  @Column('int')
  @Index('IDX_VDPEDIDOPRODUTO_CDPRODUTO')
  @IsInt()
  cdProduto: number

  //@ManyToOne(() => CadTabelaPrecoEntity, cadTabelaPreco => cadTabelaPreco.cd)
  //@JoinColumn({ name: 'cdTabelaPreco' })  
  //cadTabelaPreco: CadTabelaPrecoEntity
  @Column('int', { nullable: true })
  @Index('IDX_VDPEDIDOPRODUTO_CDTABELAPRECO')
  @IsInt()
  @IsOptional()
  cdTabelaPreco: number

  //@ManyToOne(() => CadSubtabelaEntity, cadSubtabela => cadSubtabela.cd)
  //@JoinColumn({ name: 'cdSubtabela' })  
  //cadSubtabela: CadSubtabelaEntity
  @Column('int', { nullable: true })
  @Index('IDX_VDPEDIDOPRODUTO_CDSUBTABELA')
  @IsInt()
  @IsOptional()
  cdSubtabela: number

  @Column('int', { nullable: true })
  @Index('IDX_VDPEDIDOPRODUTO_CDFABRICA')
  @IsInt()
  @IsOptional()
  cdFabrica: number

  @Column('float')
  @IsNumber()
  qtProduto: number

  @Column('numeric', { precision: 10, scale: 2 })
  @IsNumber()
  vlUnitario: number

  @Column('numeric', { precision: 10, scale: 2 })
  @IsNumber()
  vlTotal: number

  @Column('numeric', { precision: 10, scale: 2 })
  @IsNumber()
  vlDesconto: number

  @Column('numeric', { precision: 10, scale: 2 })
  @IsNumber()
  vlIpi: number

  @Column('numeric', { precision: 10, scale: 2 })
  @IsNumber()
  vlIcmsst: number

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

  @Column('smallint')
  @IsNumber()
  fgSituacao: number
}
