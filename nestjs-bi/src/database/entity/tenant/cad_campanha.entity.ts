import {IsInt, IsISO8601, IsNumber, IsOptional, IsString} from "class-validator";
import {Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";
import {CadFabricaEntity} from './cad_fabrica.entity'
import {CadVendedorEntity} from './cad_vendedor.entity'

@Entity('cad_campanha')
export class CadCampanhaEntity {
  @PrimaryColumn('int')
  @IsInt()
  cd: number

  @Column({ length: 50 })
  @IsString()
  nmCampanha: string

  @Column('int', { name: 'cdvendedor', nullable: true })
  @IsOptional()
  @IsNumber()
  cdVendedor: number

  @Column('int', { nullable: true })
  @Index('IDX_CADCAMPANHA_CDFABRICA')
  @IsOptional()
  @IsNumber()
  cdFabrica: number

  @Column('timestamp without time zone')
  @IsISO8601()
  dtInicio: string

  @Column('timestamp without time zone')
  @IsISO8601()
  dtFinal: string

  @Column('smallint')
  @IsInt()
  fgAtivo: number

  @Column('numeric', { precision: 10, scale: 2 })
  @IsNumber()
  vlCampanha: number

  @Column('smallint')
  @IsInt()
  qtPositivacao: number

  @Column('numeric', { precision: 10, scale: 2 })
  @IsNumber()
  vlBonus: number

  // Getters para compatibilidade com o serviço
  get dtFim(): string {
    return this.dtFinal;
  }

  get fgSituacao(): number {
    return this.fgAtivo;
  }

  // Opcional: Adicionar getter para vlMeta e vlRealizado se necessário
  get vlMeta(): number {
    return this.vlCampanha;
  }

  get vlRealizado(): number {
    // Você pode implementar uma lógica para calcular o valor realizado
    // Por ora, retornando um valor fixo ou null
    return null;
  }

  // Relacionamento com fabricante
  @ManyToOne(() => CadFabricaEntity)
  @JoinColumn({ name: 'cdFabrica' })
  fabrica: CadFabricaEntity;

  // Relacionamento com vendedor
  @ManyToOne(() => CadVendedorEntity)
  @JoinColumn({ name: 'cdvendedor' })
  vendedor: CadVendedorEntity;
}