import {IsInt, IsNumber, IsOptional, Matches} from "class-validator";
import {Column, Entity, Index, PrimaryColumn, PrimaryGeneratedColumn, Unique} from "typeorm";

@Entity('cad_vendedor_meta_mensal')
@Unique('UQ_VENDEDORMETAMENSAL_IDMESANO_CDEQUIPE', ['idMesAno', 'cdVendedor'])
export class CadVendedorMetaMensalEntity {
  @PrimaryColumn({ length: 7 })
  @Index('IDX_CADVENDEDOR_IDMESANO')
  @Matches(/^\d{4}-\d{2}$/)
  idMesAno: string

  @PrimaryColumn('int')
  @Index('IDX_CADVENDEDOR_CDVENDEDOR')
  @IsInt()
  cdVendedor: number

  // Meta de Venda
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  @IsNumber()
  vlMetaVenda: number

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  @IsNumber()
  @IsOptional()
  vlBonusMetaVenda: number

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  @IsNumber()
  @IsOptional()
  pcBonusMetaVenda: number
}
