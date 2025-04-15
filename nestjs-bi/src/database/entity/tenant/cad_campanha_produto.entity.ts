// nestjs-bi/src/database/entity/tenant/cad_campanha_produto.entity.ts
import {Column, Entity, Index, JoinColumn, ManyToOne, OneToOne, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";
import {CadProdutoEntity} from "./cad_produto.entity";
import {CadCampanhaEntity} from "./cad_campanha.entity";

@Entity('cad_campanha_produto')
export class CadCampanhaProdutoEntity {
  @PrimaryColumn('int')
  cd: number // chave primária

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

  // Adicionar relacionamentos - estes podem ser comentados se causarem problemas
  @ManyToOne(() => CadProdutoEntity)
  @JoinColumn({ name: 'cdProduto' })
  produto: CadProdutoEntity;

  @ManyToOne(() => CadCampanhaEntity)
  @JoinColumn({ name: 'cdCampanha' })
  campanha: CadCampanhaEntity;
}