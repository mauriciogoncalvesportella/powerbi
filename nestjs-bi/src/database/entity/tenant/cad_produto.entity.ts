import {IsBoolean, IsInt, IsNumber, IsOptional, IsString} from "class-validator";
import { Column, Entity, Index, PrimaryColumn } from "typeorm";

@Entity('cad_produto')
export class CadProdutoEntity {
  @PrimaryColumn('int')
  @IsInt()
  cd: number

  @Column({ length: 20 })
  @IsString()
  idProduto: string

//  @ManyToOne(() => CadCategoriaEntity, cadCategoria => cadCategoria.cd)
//  @JoinColumn({ name: 'cdCategoria' })
//  cadCategoria: CadCategoriaEntity
  @Column('int', { nullable: true })
  @Index('IDX_CADPRODUTO_CDCATEGORIA')
  @IsInt()
  @IsOptional()
  cdCategoria: number

  @Column('int', { nullable: true })
  @Index('IDX_CADPRODUTO_CDFABRICA')
  @IsNumber()
  @IsOptional()
  cdFabrica: number

  @Column({ length: 256 })
  @IsString()
  nmProduto: string

  @Column({ length: 50, nullable: true })
  @IsString()
  @IsOptional()
  idUnidadeVenda: string

  @Column('numeric', { precision: 10, scale: 4, nullable: true })
  @IsNumber()
  @IsOptional()
  qtVenda: number

  @Column({ length: 50, nullable: true })
  @IsString()
  @IsOptional()
  idUnidadeCompra: string

  @Column('numeric', { precision: 10, scale: 4, nullable: true })
  @IsNumber()
  @IsOptional()
  qtUnidadeCompra: number

  @Column('numeric', { precision: 10, scale: 2, nullable: true })
  @IsNumber()
  @IsOptional()
  vlCusto: number

  @Column('numeric', { precision: 10, scale: 2, nullable: true })
  @IsNumber()
  @IsOptional()
  vlVenda: number

  @Column('char', { length: 1, nullable: true })
  @IsString()
  @IsOptional()
  idABC: string

  @Column('numeric', { precision: 10, scale: 2, nullable: true })
  @IsNumber()
  @IsOptional()
  pcCredIcms: number

  @Column('boolean', { default: false })
  @Index('IDX_CADPRODUTO_FGFAVORITO')
  @IsBoolean()
  @IsOptional()
  fgFavorito: boolean
}
