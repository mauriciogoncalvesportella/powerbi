import {Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";
import {CadTabelaPrecoEntity} from "./cad_tabela_preco.entity";

@Entity('cad_subtabela')
export class CadSubtabelaEntity {
  @PrimaryColumn('int')
  cd: number

//  @ManyToOne(() => CadTabelaPrecoEntity, cadTabelaPreco => cadTabelaPreco.cd)
//  @JoinColumn({ name: 'cdTabelaPreco' })
//  cadTabelaPreco: CadTabelaPrecoEntity
  @Column('int')
  @Index('IDX_CADSUBTABELA_CDTABELAPRECO')
  cdTabelaPreco: number

  @Column({ length: 50 })
  idTabela: string

  @Column('numeric', { precision: 5, scale: 2 })
  pcDesconto: number

  @Column('numeric', { precision: 5, scale: 2 })
  pcComissao: number

  @Column('numeric', { precision: 5, scale: 2 })
  pcMinimoVolume: number
}
