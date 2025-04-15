// nestjs-bi/src/database/entity/tenant/vd_pedido_produto.entity.ts
import {IsInt, IsNumber, IsOptional, IsString} from "class-validator";
import {Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import {CadProdutoEntity} from "./cad_produto.entity";
import {VdPedidoEntity} from "./vd_pedido.entity";

@Entity('vd_pedido_produto')
export class VdPedidoProdutoEntity {
  @PrimaryColumn('int')
  @IsInt()
  cd: number

  @Column('char', { length: 7 })
  @Index('IDX_VDPEDIDOPRODUTO_IDMESANO')
  @IsString()
  idMesAno: string

  @PrimaryColumn('int')
  @Index('IDX_VDPEDIDOPRODUTO_CDPEDIDO')
  @IsInt()
  cdPedido: number

  @Column('int')
  @Index('IDX_VDPEDIDOPRODUTO_CDPRODUTO')
  @IsInt()
  cdProduto: number

  @Column('int', { nullable: true })
  @Index('IDX_VDPEDIDOPRODUTO_CDTABELAPRECO')
  @IsInt()
  @IsOptional()
  cdTabelaPreco: number

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

  // Adicionar relacionamentos - estes podem ser comentados se causarem problemas
  @ManyToOne(() => VdPedidoEntity, pedido => pedido.pedidosProdutos)
  @JoinColumn({ name: 'cdPedido' })
  pedido: VdPedidoEntity;

  @ManyToOne(() => CadProdutoEntity)
  @JoinColumn({ name: 'cdProduto' })
  produto: CadProdutoEntity;
}