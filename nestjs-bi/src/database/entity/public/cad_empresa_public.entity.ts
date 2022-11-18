import {IsNumber, IsOptional} from "class-validator";
import {Column, Entity, PrimaryGeneratedColumn, Unique} from "typeorm";

@Entity({ schema: 'public', name: 'cad_empresa_public' })
@Unique('UQ_IDEMPRESA', ['idEmpresa'])
@Unique('UQ_IDCNPJ', ['idCnpj'])
export class CadEmpresaPublicEntity {
  @PrimaryGeneratedColumn()
  cd: number

  @Column('varchar', { length: 256 })
  idEmpresa: string

  @Column('text', { default: 'unauthorized' })
  idToken: string

  @Column({ length: 50 })
  idFantasia: string

  @Column({ length: 70 })
  nmRazao: string

  @Column({ length: 14 })
  idCnpj: string

  @Column('int', { nullable: true })
  @IsNumber()
  @IsOptional()
  dtFechamento: number
}
