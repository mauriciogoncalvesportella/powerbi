import {Column, Entity, Index, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";
import {CadProdutoEntity} from "./cad_produto.entity";

@Entity('cad_campanha_produto')
export class CadCampanhaProdutoEntity {
  @PrimaryColumn('int')
  cd: number // chave primária

//  @OneToOne(() => CadProdutoEntity, cadProduto => cadProduto.cd)
//  @JoinColumn({ name: 'cdProduto' })
//  cadProduto: CadProdutoEntity
  @Column('int')
  @Index('IDX_CADCAMPANHA_CDPRODUTO')
  cdProduto: number

  @Column('int')
  @Index('IDX_CADCAMPANHA_CDCAMPANHA')
  cdCampanha: number

  @Column('smallint')
  qtProduto: number

  @Column('numeric', { precision: 10, scale: 2 })
  vlUnitario: number

  @Column('numeric', { precision: 10, scale: 2 })
  vlTotal: number
  produto: any;
}
