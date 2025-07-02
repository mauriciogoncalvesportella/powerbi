// nestjs-bi/src/database/entity/tenant/vd_pedido.entity.ts
import { IsInt, IsISO8601, IsNumber, IsOptional, IsString } from "class-validator";
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { CadVendedorEntity } from "./cad_vendedor.entity";
import { VdPedidoProdutoEntity } from "./vd_pedido_produto.entity";

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

  @Column('int')
  @Index('IDX_VDPEDIDOS_CDTIPOPEDIDO')
  @IsInt()
  cdTipoPedido: number

  @Column('int')
  @Index('IDX_VDPEDIDOS_CDEMPRESA')
  @IsInt()
  cdEmpresa: number

  @Column('int')
  @Index('IDX_VDPEDIDOS_CDVENDEDOR')
  @IsInt()
  cdVendedor: number

  @Column('int', { nullable: true })
  @Index('IDX_VDPEDIDOS_CDVENDEDOR_2')
  @IsOptional()
  cdVendedor2: number

  @Column('int')
  @Index('IDX_VDPEDIDOS_CDCLIENTE')
  @IsInt()
  cdCliente: number

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

  // Adicionar relacionamentos
  @ManyToOne(() => CadVendedorEntity)
  @JoinColumn({ name: 'cdVendedor' })
  vendedor: CadVendedorEntity;

  @OneToMany(() => VdPedidoProdutoEntity, pedidoProduto => pedidoProduto.cdPedido)
  pedidosProdutos: VdPedidoProdutoEntity[];

  // Getter para calcular o valor total do pedido
  get vlTotal(): number {
    return (this.vlProdutos || 0) - (this.vlDesconto || 0) + (this.vlIcmsst || 0) + (this.vlIpi || 0);
  }
}