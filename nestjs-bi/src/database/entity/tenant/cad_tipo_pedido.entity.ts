import {Column, Entity, PrimaryColumn} from "typeorm";

@Entity('cad_tipo_pedido')
export class CadTipoPedidoEntity {
  @PrimaryColumn('int')
  cd: number

  @Column({ length: 50 })
  nmTipo: string

  @Column('smallint')
  fgGeraFat: number

  @Column('smallint')
  fgDescontoFlex: number

  @Column('smallint')
  fgComissao: number
}
