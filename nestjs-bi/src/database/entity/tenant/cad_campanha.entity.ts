import {IsInt, IsISO8601, IsNumber, IsOptional, IsString} from "class-validator";
import {Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";
import {CadFabricaEntity} from './cad_fabrica.entity'

@Entity('cad_campanha')
export class CadCampanhaEntity {
  @PrimaryColumn('int')
  @IsInt()
  cd: number

  @Column({ length: 50 })
  @IsString()
  nmCampanha: string

//  @ManyToOne(() => CadFabricaEntity, cadFabricaEntity => cadFabricaEntity.cd)
//  @JoinColumn({ name: 'cdFabrica' })
//  cadFabrica: CadFabricaEntity
  @Column('int', { nullable: true })
  @Index('IDX_CADCAMPANHA_CDFABRICA')
  @IsOptional()
  @IsNumber()
  cdFabrica: number

  @Column('timestamp without time zone')
  @IsISO8601()
  dtInicio: string

  @Column('timestamp without time zone')
  @IsISO8601()
  dtFinal: string

  @Column('smallint')
  @IsInt()
  fgAtivo: number

  @Column('numeric', { precision: 10, scale: 2 })
  @IsNumber()
  vlCampanha: number

  @Column('smallint')
  @IsInt()
  qtPositivacao: number

  @Column('numeric', { precision: 10, scale: 2 })
  @IsNumber()
  vlBonus: number
}
