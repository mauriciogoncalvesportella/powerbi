import {IsNumber, IsOptional, IsString, Matches} from "class-validator";
import {Column, Entity, Index, PrimaryColumn, PrimaryGeneratedColumn, Unique} from "typeorm";

@Entity('cad_empresa')
@Unique('UQ_IDCNPJ', ['idCnpj'])
export class CadEmpresaEntity {
  @PrimaryColumn('int')
  @IsNumber()
  cd: number

  @Column({ length: 50 })
  @IsString()
  idFantasia: string

  @Column({ length: 70 })
  @IsString()
  nmRazao: string

  @Column({ length: 14 })
  @Matches(/^\d{14}$/)
  idCnpj: string
}
