import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('cad_campanha_produto')
export class CadCampanhaProdutoEntity {
  @PrimaryGeneratedColumn()
  cd: number;

  @Column({ name: 'cdCampanha' })
  cdCampanha: number;

  @Column({ name: 'cdProduto' })
  cdProduto: number;

  @Column({ name: 'qtProdutoRef', default: 0 })
  qtProdutoRef: number;

  @Column({ name: 'vlMeta', type: 'decimal', precision: 15, scale: 2, default: 0 })
  vlMeta: number;

  @Column({ name: 'fgAtivo', default: true })
  fgAtivo: boolean;
}