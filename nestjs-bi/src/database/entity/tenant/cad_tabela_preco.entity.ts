import {Column, Entity, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";

@Entity('cad_tabela_preco')
export class CadTabelaPrecoEntity {
  @PrimaryColumn('int')
  cd: number

  @Column({ length: 50 })
  nmTabelaPreco: string

  @Column('smallint')
  fgPromocao: number

  @Column('timestamp without time zone')
  dtInicio: string

  @Column('timestamp without time zone')
  dtFinal: string
}
