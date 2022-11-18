import {IsInt, IsNumber, IsOptional, IsString} from "class-validator";
import {Column, Entity, PrimaryColumn} from "typeorm";

@Entity('cad_categoria')
export class CadCategoriaEntity {
  @PrimaryColumn('int')
  @IsNumber()
  cd: number

  @Column({ length: 50 })
  @IsString()
  idCategoria: string

  @Column({ length: 50 })
  @IsString()
  nmCategoria: string

  @Column('integer', { nullable: true })
  @IsInt()
  @IsOptional()
  cdCategoriaPai: number
}
