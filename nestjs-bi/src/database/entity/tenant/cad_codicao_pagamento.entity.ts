import {Column, Entity, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";

@Entity('cad_condicao_pagamento')
export class CadCondicaoPagamentoEntity {
  @PrimaryColumn('int')
  cd: number

  @Column({ length: 5 })
  idCondicao: string

  @Column({ length: 50 })
  nmCondicao: string

  @Column('smallint')
  qtParcelas: number

  @Column('smallint')
  nrPrazoMedio: number
}
