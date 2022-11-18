import {IsInt, IsNumber, Matches} from "class-validator";
import {Column, Entity, Index, PrimaryColumn, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity('cad_geral_meta_mensal')
export class CadGeralMetaMensal {
  @PrimaryColumn({ length: 7 })
  @Matches(/^\d{4}-\d{2}$/)
  idMesAno: string

  // Meta de Venda
  @Column('decimal', { precision: 10, scale: 2 })
  @IsNumber()
  vlMetaVenda: number

  @Column('decimal', { precision: 10, scale: 2 })
  @IsNumber()
  vlBonusMetaVenda: number

  @Column('decimal', { precision: 5, scale: 2 })
  @IsNumber()
  pcBonusMetaVenda: number

  // Cliente Novos
  @Column('decimal', { precision: 10, scale: 2 })
  @IsNumber()
  vlBonusMetaClienteNovo: number

  @Column('decimal', { precision: 5, scale: 2 })
  @IsNumber()
  pcBonusMetaClienteNovo: number

  @Column('int')
  @IsNumber()
  qtMetaClienteNovo: number

  // Positivação
  @Column('decimal', { precision: 10, scale: 2 })
  @IsNumber()
  vlBonusPositivacao: number

  @Column('decimal', { precision: 5, scale: 2 })
  @IsNumber()
  pcBonusPositivacao: number

  @Column('int')
  @IsNumber()
  qtBonusPositivacao: number

  // Markup
  @Column('decimal', { precision: 10, scale: 2 })
  @IsNumber()
  vlBonusMarkup: number

  @Column('decimal', { precision: 5, scale: 2 })
  @IsNumber()
  pcBonusMarkup: number

  @Column('int')
  @IsNumber()
  qtBonusMarkup: number

  @Column('numeric', { precision: 5, scale: 2 })
  @IsNumber()
  pcLucroIdeal: number
}
