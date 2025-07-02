import { IsInt, IsOptional, IsString} from "class-validator";
import { Column, Entity, PrimaryColumn, Unique} from "typeorm";

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

  @Column('int', { nullable: true })
  @IsInt()
  @IsOptional()
  cdEquipePai: number

  @Column('int', { nullable: true })
  @IsInt()
  @IsOptional()
  cdResponsavel: number

  @Column({ length: 256 })
  @IsString()
  @IsOptional()
  nmEquipe: string
}
