import {IsInt, IsNumber, IsOptional, Matches} from "class-validator";
import {Column, Entity, Index, PrimaryColumn, PrimaryGeneratedColumn, Unique} from "typeorm";

@Entity('cad_equipe_meta_mensal')
@Unique('UQ_IDMESANO_CDEQUIPE', ['idMesAno', 'cdEquipe'])
export class CadEquipeMetaMensalEntity {
  @PrimaryColumn({ length: 7 })
  @Index('IDX_CADEQUIPE_IDMESANO')
  @Matches(/^\d{4}-\d{2}$/)
  idMesAno: string

  @PrimaryColumn('int')
  @Index('IDX_CADEQUIPE_CDEQUIPE')
  @IsInt()
  cdEquipe: number

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

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  @IsNumber()
  pcMetaMarkup: number

  @Column('int')
  @IsNumber()
  qtBonusMarkup: number

  // Lucro
  @Column('numeric', { precision: 5, scale: 2, default: 0 })
  @IsNumber()
  pcLucro: number
}
