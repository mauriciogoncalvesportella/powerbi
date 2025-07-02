import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('cad_campanha')
export class CadCampanhaEntity {
  @PrimaryGeneratedColumn()
  cd: number;

  @Column({ name: 'nmCampanha', length: 255 })
  nmCampanha: string;

  @Column({ name: 'vlCampanha', type: 'decimal', precision: 15, scale: 2, default: 0 })
  vlCampanha: number;

  @Column({ name: 'cdvendedor', nullable: true })
  cdvendedor: number;

  @Column({ name: 'fgAtivo', default: 1 })
  fgAtivo: number;

  @Column({ name: 'dtInicio', type: 'date', nullable: true })
  dtInicio: Date;

  @Column({ name: 'dtFinal', type: 'date', nullable: true })
  dtFinal: Date;

  @Column({ name: 'qtDiasRef', default: 0 })
  qtDiasRef: number;

  @Column({ name: 'vlPercRef', type: 'decimal', precision: 10, scale: 2, default: 0 })
  vlPercRef: number;

  // Campo adicionado para compatibilidade com import-data
  @Column({ name: 'cdFabrica', nullable: true })
  cdFabrica: number;

  // Campos adicionais que podem existir na sua tabela
  @Column({ name: 'dsCampanha', length: 500, nullable: true })
  dsCampanha: string;

  @Column({ name: 'dtCriacao', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dtCriacao: Date;

  @Column({ name: 'dtAlteracao', type: 'timestamp', nullable: true })
  dtAlteracao: Date;

  @Column({ name: 'cdUsuarioCriacao', nullable: true })
  cdUsuarioCriacao: number;

  @Column({ name: 'cdUsuarioAlteracao', nullable: true })
  cdUsuarioAlteracao: number;

  // Campos para bonus e positivação se existirem
  @Column({ name: 'qtPositivacao', default: 0 })
  qtPositivacao: number;

  @Column({ name: 'vlBonus', type: 'decimal', precision: 15, scale: 2, default: 0 })
  vlBonus: number;
}