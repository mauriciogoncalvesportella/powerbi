import {IsArray, IsInt, IsNumber, IsOptional, IsString} from "class-validator";
import {AfterInsert, AfterUpdate, Column, Entity, Index, PrimaryColumn, Unique} from "typeorm";

@Entity('cad_equipe')
@Unique('UQ_IDEQUIPE', ['idEquipe'])
export class CadEquipeEntity {
  @PrimaryColumn('int')
  @IsInt()
  cd: number

  @Column('varchar', { length: '50' })
  @IsString()
  @IsOptional()
  idEquipe: string

//  @ManyToOne(() => CadEmpresaEntity, cadEmpresa => cadEmpresa.cd)
//  @JoinColumn({ name: 'cdCadEmpresa' })
//  cadEmpresa: CadEmpresaEntity

  @Column('int', { nullable: true })
  @IsInt()
  @IsOptional()
  cdEquipePai: number

  @Column('int', { nullable: true })
  @IsInt()
  @IsOptional()
  cdResponsavel: number

  @Column({ length: 50 })
  @IsString()
  @IsOptional()
  nmEquipe: string
}
