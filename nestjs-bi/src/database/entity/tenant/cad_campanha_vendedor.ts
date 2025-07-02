// nestjs-bi/src/database/entity/tenant/cad_campanha_vendedor.entity.ts
import {Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn} from "typeorm";
import {IsInt, IsNumber, IsOptional} from "class-validator";
import {CadCampanhaEntity} from "./cad_campanha.entity";
import {CadProdutoEntity} from "./cad_produto.entity";
import {CadVendedorEntity} from "./cad_vendedor.entity";

@Entity('cad_campanha_vendedor')
export class CadCampanhaVendedorEntity {
  @PrimaryColumn('int')
  @IsInt()
  cd: number

  @Column('int')
  @Index('IDX_CADCAMPANHAVEND_CDCAMPANHA')
  @IsInt()
  cdCampanha: number

  @Column('int')
  @Index('IDX_CADCAMPANHAVEND_CDPRODUTO')
  @IsInt()
  cdProduto: number

  @Column('int')
  @Index('IDX_CADCAMPANHAVEND_CDVENDEDOR')
  @IsInt()
  cdVendedor: number

  @Column('smallint')
  @IsInt()
  qtProduto: number

  @Column('numeric', { precision: 10, scale: 2 })
  @IsNumber()
  vlMetafat: number

  // Relacionamentos
  @ManyToOne(() => CadCampanhaEntity)
  @JoinColumn({ name: 'cdCampanha' })
  campanha: CadCampanhaEntity;

  @ManyToOne(() => CadProdutoEntity)
  @JoinColumn({ name: 'cdProduto' })
  produto: CadProdutoEntity;

  @ManyToOne(() => CadVendedorEntity)
  @JoinColumn({ name: 'cdVendedor' })
  vendedor: CadVendedorEntity;
}